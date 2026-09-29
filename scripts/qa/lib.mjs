/**
 * Общее для QA-скриптов: статический сервер собранного Storybook, запуск Chromium, открытие истории.
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright-core';

export const root = resolve(import.meta.dirname, '../..');
export const staticDir = join(root, 'storybook-static');

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };

/** Истории из собранного index.json. */
export const storyIndex = () => Object.values(JSON.parse(readFileSync(join(staticDir, 'index.json'), 'utf8')).entries).filter((e) => e.type === 'story');

/** Поднимает сервер storybook-static и Chromium. Возвращает { origin, browser, close }. */
export async function startStorybook() {
  if (!existsSync(join(staticDir, 'iframe.html'))) { console.error('Нет storybook-static: сначала `npm run build-storybook`.'); process.exit(2); }
  const server = createServer((req, res) => {
    const path = join(staticDir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!path.startsWith(staticDir) || !existsSync(path)) return res.writeHead(404).end();
    const file = path.endsWith('/') ? join(path, 'index.html') : path;
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, r));
  let browser;
  for (const executablePath of [process.env.CHROME_PATH, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium', undefined]) {
    if (executablePath && !existsSync(executablePath)) continue;
    try { browser = await chromium.launch(executablePath ? { executablePath } : {}); break; } catch { /* следующий */ }
  }
  if (!browser) { server.close(); console.error('Chromium не найден: `npx playwright-core install chromium` или CHROME_PATH.'); process.exit(2); }
  return { origin: `http://localhost:${server.address().port}`, browser, close: async () => { await browser.close(); server.close(); } };
}

/** Открывает историю: шрифты загружены, анимации выключены. device — размер экрана из тулбара (s320, a360, s375, i393, m430). */
export async function openStory(page, origin, id, theme = 'light', device = 'i393') {
  await page.goto(`${origin}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&globals=theme:${theme};device:${device}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
}

/* ─── Закреплённое окружение для скриншотов ───────────────────────────
 * Пиксели зависят от сборки Chromium, шрифтов и библиотек ОС. Эталоны qa/baseline снимаются только
 * в этом образе — локально и в CI одинаково. Тег образа = версия playwright-core из package-lock:
 * обновили playwright-core — обновите IMAGE (тег и digest) и перегенерируйте эталоны.
 */
export const IMAGE = 'mcr.microsoft.com/playwright:v1.63.0-noble@sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27';
export const inImage = () => process.env.QA_IMAGE === IMAGE;

/** Версия playwright-core в node_modules совпадает с тегом образа? */
export function imageMatchesPlaywright() {
  const v = JSON.parse(readFileSync(join(root, 'node_modules/playwright-core/package.json'), 'utf8')).version;
  return { ok: IMAGE.includes(`:v${v}-`), version: v };
}

/** Docker доступен? */
export function hasDocker() {
  return spawnSync('docker', ['info'], { stdio: 'ignore' }).status === 0;
}

/** Перезапускает текущий скрипт внутри IMAGE (репозиторий смонтирован в /work). Возвращает код выхода. */
export function rerunInImage(script, argv) {
  const uid = typeof process.getuid === 'function' ? `${process.getuid()}:${process.getgid()}` : null;
  const cmd = ['run', '--rm', '--init', '--ipc=host', ...(uid ? ['--user', uid] : []), '-e', 'HOME=/tmp', '-e', `QA_IMAGE=${IMAGE}`, '-e', 'CI', '-v', `${root}:/work`, '-w', '/work', IMAGE, 'node', script, ...argv];
  console.log(`Запуск в закреплённом образе: ${IMAGE.split('@')[0]}`);
  const r = spawnSync('docker', cmd, { stdio: 'inherit' });
  if (r.error) throw r.error;
  return r.status ?? 1;
}
