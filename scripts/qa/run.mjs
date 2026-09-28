/**
 * QA-прогон Storybook: каждая история × светлая / тёмная тема.
 *
 *   npm run build-storybook && npm run qa            — проверки + отчёт qa/out/report.md
 *   npm run qa -- --update-baseline                  — принять текущие скриншоты как эталон
 *   npm run qa -- --only=organisms-header            — только истории с этим префиксом
 *
 * Ошибка (exit 1): упавшая история, ошибка в консоли, отклонение от design/figma-specs.json,
 * перекрытая или обрезанная тень, текст вылез из блока, элемент вылез за экран, визуальная
 * разница с эталоном выше порога. Предупреждение: мелкая зона нажатия, замечания axe.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { root, startStorybook, storyIndex } from './lib.mjs';

const outDir = join(root, 'qa/out');
const baseDir = join(root, 'qa/baseline');
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]));
const THEMES = ['light', 'dark'];
const DIFF_LIMIT = 0.001; // 0.1 % пикселей

/* ─── Сервер и браузер (scripts/qa/lib.mjs) ─────────────────────────── */
const { origin, browser, close } = await startStorybook();

const stories = storyIndex().filter((e) => !args.only || e.id.startsWith(args.only));
const specs = JSON.parse(readFileSync(join(root, 'design/figma-specs.json'), 'utf8'));
const axeSource = readFileSync(join(root, 'node_modules/axe-core/axe.min.js'), 'utf8');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(join(outDir, 'screens'), { recursive: true });
mkdirSync(join(outDir, 'diff'), { recursive: true });
if (args['update-baseline']) mkdirSync(baseDir, { recursive: true });

/** @type {{level:'error'|'warn', check:string, story:string, theme:string, detail:string}[]} */
const issues = [];
const add = (level, check, story, theme, detail) => issues.push({ level, check, story, theme, detail });

/* ─── Проверки внутри страницы ───────────────────────────────────────── */
function audit() {
  const out = [];
  const root = document.querySelector('#storybook-root');
  const all = [...root.querySelectorAll('*')].filter((el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    if (!(r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none')) return false;
    if (el.closest('[aria-hidden="true"], [inert]')) return false;
    for (let a = el; a && a !== root; a = a.parentElement) if (+getComputedStyle(a).opacity === 0) return false;
    return true;
  });
  const name = (el) => {
    const cls = [...el.classList].filter((c) => c.startsWith('y-')).slice(0, 2).join('.');
    return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}`;
  };
  const inScroller = (el, axis) => {
    for (let a = el.parentElement; a && a !== root; a = a.parentElement) {
      const o = getComputedStyle(a)[axis === 'x' ? 'overflowX' : 'overflowY'];
      if (o === 'auto' || o === 'scroll') return a;
    }
    return null;
  };
  const opaque = (s) => {
    const bg = s.backgroundColor.match(/[\d.]+/g);
    return s.backgroundImage !== 'none' || (bg && (bg.length < 4 || +bg[3] > 0.05));
  };
  const frames = '.y-screen, .y-motion-phone';
  const clipper = (el, frame) => {
    for (let a = el.parentElement; a && a !== frame; a = a.parentElement) {
      const o = getComputedStyle(a);
      if (o.overflowX !== 'visible') return a;
    }
    return null;
  };
  const reported = new Set();
  const moved = (el, frame) => { for (let a = el; a && a !== frame; a = a.parentElement) if (getComputedStyle(a).transform !== 'none') return true; return false; };

  for (const el of all) {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();

    // 1–2. Тени: перекрытие позиционированным соседом и обрезка overflow предка
    if (s.boxShadow !== 'none') {
      const m = s.boxShadow.match(/(-?[\d.]+)px (-?[\d.]+)px ([\d.]+)px/);
      if (m) {
        const [, dx, dy, blur] = m.map(Number);
        const reach = blur / 2; // видимая часть размытия
        const floating = blur >= 16;
        const halo = { l: r.left + dx - reach, r: r.right + dx + reach, t: r.top + dy - reach, b: r.bottom + dy + reach };
        const probes = [
          [(r.left + r.right) / 2 + dx, r.bottom + Math.max(4, dy)],
          [r.left - 4 + dx, (r.top + r.bottom) / 2 + dy],
          [r.right + 4 + dx, (r.top + r.bottom) / 2 + dy],
        ];
        for (const [x, y] of floating ? probes : []) {
          if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
          const hit = document.elementFromPoint(x, y);
          if (!hit || hit === el || el.contains(hit) || hit.contains(el) || !root.contains(hit)) continue;
          // модальный слой нарочно закрывает экран вместе с тенями навигации под ним
          if (hit.closest('.y-overlay') && !el.closest('.y-overlay')) continue;
          for (let h = hit; h && h !== root && !h.contains(el); h = h.parentElement) {
            const hs = getComputedStyle(h);
            // соседняя «плавающая» поверхность с собственной тенью (поле над таб-баром в панели) — так задумано
          if (hs.position !== 'static' && opaque(hs) && !/px/.test(hs.boxShadow)) {
              out.push(['error', 'тень перекрыта', `${name(el)} ← ${name(h)}`]);
              break;
            }
          }
        }
        for (let a = el.parentElement; a && a !== root; a = a.parentElement) {
          const as = getComputedStyle(a);
          if (as.overflowX === 'visible' && as.overflowY === 'visible') continue;
          if (a.matches(frames)) break;
          const ar = a.getBoundingClientRect();
          // прокручиваемый контент, уехавший за край, — не обрезка тени
          if (r.left < ar.left - 1 || r.right > ar.right + 1 || r.top < ar.top - 1 || r.bottom > ar.bottom + 1) break;
          const gaps = [r.left - ar.left, ar.right - r.right, r.top - ar.top, ar.bottom - r.bottom];
          const cuts = [ar.left - halo.l, halo.r - ar.right, ar.top - halo.t, halo.b - ar.bottom];
          // сторона контейнера совпадает с краем экрана устройства — тень и так уходит за экран
          const dev = el.closest('.y-screen')?.getBoundingClientRect();
          if (dev) [ar.left - dev.left, dev.right - ar.right, ar.top - dev.top, dev.bottom - ar.bottom].forEach((d, i) => { if (Math.abs(d) <= 1) cuts[i] = 0; });
          // поверхность, прижатая к краю (панель у низа экрана), — тень с этой стороны не видна по замыслу
          if (cuts.every((c, i) => c <= 2 || gaps[i] < 1)) break;
          const gap = Math.min(...gaps.filter((g, i) => cuts[i] > 2));
          const cut = Math.max(...cuts);
          if (cut > 2) out.push([gap < blur / 5 - 1 ? 'error' : 'warn', 'тень обрезана', `${name(el)} внутри ${name(a)} (overflow ${as.overflowX}/${as.overflowY}), зазор ${Math.round(gap)}px при blur ${blur}`]);
          break;
        }
      }
    }

    // 3. Текст вылез из блока
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (ownText && s.overflowX !== 'auto' && s.overflowX !== 'scroll' && s.textOverflow !== 'ellipsis' && el.scrollWidth > el.clientWidth + 1 && s.display !== 'inline') {
      out.push(['error', 'текст вылез', `${name(el)} «${el.textContent.trim().slice(0, 30)}» ${el.scrollWidth}>${el.clientWidth}px`]);
    }

    // 4. Элемент вылез за край экрана
    const frame = el.closest(frames);
    if (frame && frame !== el && !inScroller(el, 'x') && !clipper(el, frame) && !moved(el, frame) /* сдвиг анимацией — намеренно */ && ![...reported].some((p) => p.contains(el))) {
      const fr = frame.getBoundingClientRect();
      if (r.left < fr.left - 1 || r.right > fr.right + 1) {
        reported.add(el);
        out.push(['error', 'за краем экрана', `${name(el)} ${Math.round(r.left - fr.left)}…${Math.round(r.right - fr.left)} из ${Math.round(fr.width)}px`]);
      }
    }

    // 5. Зона нажатия
    if (el.matches('button, a[href], input:not([type=hidden]), [role=button], [role=tab], [role=switch], [role=radio], [role=checkbox], [role=slider]') && !el.closest('[aria-hidden="true"]')) {
      // поле ввода нажимается всей обёрткой
      const hit = el.matches('input') ? (el.closest('label, .y-field, .y-input-group, .y-input-bar__field') ?? el).getBoundingClientRect() : r;
      // невидимое расширение зоны нажатия через ::after (atoms.css)
      const after = getComputedStyle(el, '::after');
      const grow = after.content !== 'none' && after.position === 'absolute' ? { w: -parseFloat(after.left) - parseFloat(after.right), h: -parseFloat(after.top) - parseFloat(after.bottom) } : { w: 0, h: 0 };
      const size = Math.min(hit.width + Math.max(0, grow.w || 0), hit.height + Math.max(0, grow.h || 0));
      if (size < 24) out.push(['error', 'зона нажатия', `${name(el)} ${Math.round(r.width)}×${Math.round(r.height)} < 24`]);
      else if (size < 40) out.push(['warn', 'зона нажатия', `${name(el)} ${Math.round(r.width)}×${Math.round(r.height)} < 40 — расширить hit-area в нативе`]);
    }
  }
  return out;
}

function measure(list) {
  return list.map(({ selector, expect }) => {
    const el = document.querySelector(`#storybook-root ${selector}`);
    if (!el) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const parent = el.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const px = (v) => (v === 'normal' ? 0 : parseFloat(v));
    const got = { __half: Math.min(r.width, r.height) / 2 };
    for (const k of Object.keys(expect)) {
      if (k === 'width') got[k] = r.width;
      else if (k === 'height') got[k] = r.height;
      else if (k === 'top') got[k] = r.top - parent.top;
      else if (k === 'left') got[k] = r.left - parent.left;
      else if (k === 'borderRadius') got[k] = Math.min(px(s.borderTopLeftRadius), r.height / 2, r.width / 2);
      else if (k === 'gap') got[k] = px(s.columnGap) || px(s.rowGap);
      else if (k === 'fontFamily') got[k] = s.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      else if (/Radius$/.test(k)) got[k] = Math.min(px(s[k]), r.height / 2);
      else got[k] = px(s[k]);
    }
    return got;
  });
}

/* ─── Прогон ─────────────────────────────────────────────────────────── */
const page = await browser.newPage({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 1 });
let current = { story: '', theme: '' };
page.on('pageerror', (e) => add('error', 'ошибка JS', current.story, current.theme, e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) add('error', 'console.error', current.story, current.theme, m.text().slice(0, 200)); });
page.on('response', (r) => { if (r.status() >= 400 && !/favicon/.test(r.url())) add('error', `HTTP ${r.status()}`, current.story, current.theme, r.url().replace(origin, '')); });

const specResults = [];
let screens = 0, diffs = 0;
for (const story of stories) {
  for (const theme of THEMES) {
    current = { story: story.id, theme };
    await page.goto(`${origin}/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story&globals=theme:${theme}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
    await page.waitForTimeout(80);
    const state = await page.evaluate(() => ({
      error: document.body.classList.contains('sb-show-errordisplay') ? document.querySelector('#error-message')?.textContent : null,
      empty: (document.querySelector('#storybook-root')?.innerHTML.trim().length ?? 0) < 20,
    }));
    if (state.error) { add('error', 'история упала', story.id, theme, state.error.slice(0, 200)); continue; }
    if (state.empty) { add('error', 'пустая история', story.id, theme, ''); continue; }

    for (const [level, check, detail] of await page.evaluate(audit)) add(level, check, story.id, theme, detail);

    if (!args['no-axe']) {
      await page.addScriptTag({ content: axeSource });
      // Витрина из нескольких экранов (шапки, таб-бары рядом) — уникальность ориентиров проверяется только на одиночном экране
      const axe = await page.evaluate(async () => { const many = document.querySelectorAll('#storybook-root header, #storybook-root nav').length > 1 && document.querySelectorAll('#storybook-root .y-screen').length !== 1; return (await window.axe.run('#storybook-root', { resultTypes: ['violations'], rules: { region: { enabled: false }, 'page-has-heading-one': { enabled: false }, 'landmark-one-main': { enabled: false }, 'landmark-unique': { enabled: !many }, 'landmark-no-duplicate-banner': { enabled: !many } } })).violations.map((v) => [v.id, v.impact, v.nodes.length, v.nodes[0]?.target.join(' ')]); });
      for (const [id, impact, n, target] of axe) add(impact === 'critical' ? 'error' : 'warn', `axe: ${id}`, story.id, theme, `${impact} ×${n} ${target}`);
    }

    if (theme === 'light') {
      const own = specs.specs.filter((sp) => sp.story === story.id);
      if (own.length) {
        const got = await page.evaluate(measure, own);
        own.forEach((sp, i) => {
          if (!got[i]) { add('error', 'спека: нет элемента', story.id, theme, `${sp.figma} → ${sp.selector}`); specResults.push({ ...sp, ok: false, got: null }); return; }
          // радиус больше половины стороны рисуется как капсула — и в Figma, и в CSS
          const norm = (k, v) => (/[rR]adius$/.test(k) ? Math.min(v, got[i].__half) : v);
          const bad = Object.entries(sp.expect).filter(([k, v]) => (typeof v === 'number' ? Math.abs(got[i][k] - norm(k, v)) > specs.tolerance : got[i][k] !== v));
          specResults.push({ ...sp, ok: !bad.length, got: got[i] });
          for (const [k, v] of bad) add('error', 'спека Figma', story.id, theme, `${sp.figma}: ${k} ${typeof got[i][k] === 'number' ? Math.round(got[i][k] * 10) / 10 : got[i][k]} ≠ ${v}`);
        });
      }
    }

    const file = `${story.id}--${theme}.png`;
    const target = (await page.$('#storybook-root > *')) ?? (await page.$('#storybook-root'));
    const shot = await target.screenshot();
    writeFileSync(join(outDir, 'screens', file), shot);
    screens++;
    if (args['update-baseline']) writeFileSync(join(baseDir, file), shot);
    else if (existsSync(join(baseDir, file))) {
      const a = PNG.sync.read(readFileSync(join(baseDir, file)));
      const b = PNG.sync.read(shot);
      if (a.width !== b.width || a.height !== b.height) { add('error', 'визуальная разница', story.id, theme, `размер ${a.width}×${a.height} → ${b.width}×${b.height}`); diffs++; continue; }
      const diff = new PNG({ width: a.width, height: a.height });
      const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
      if (n / (a.width * a.height) > DIFF_LIMIT) {
        writeFileSync(join(outDir, 'diff', file), PNG.sync.write(diff));
        add('error', 'визуальная разница', story.id, theme, `${(100 * n / (a.width * a.height)).toFixed(2)} % пикселей`);
        diffs++;
      }
    }
  }
}

/* ─── Резиновая вёрстка: экраны на 320 и 430 (края, вылезший текст, зоны нажатия; без эталона и спек) ── */
const DEVICES = { s320: '320', m430: '430' };
if (!args['no-devices']) {
  for (const story of stories.filter((s) => s.id.startsWith('pages-'))) {
    for (const [device, label] of Object.entries(DEVICES)) {
      current = { story: story.id, theme: `light · ${label}` };
      await page.goto(`${origin}/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story&globals=theme:light;device:${device}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
      await page.waitForTimeout(80);
      for (const [level, check, detail] of await page.evaluate(audit)) add(level, check, story.id, current.theme, detail);
    }
  }
}
await close();

/* ─── Отчёт ──────────────────────────────────────────────────────────── */
// одинаковые замечания в светлой и тёмной теме сливаем
const merged = new Map();
for (const i of issues) {
  const key = `${i.level}|${i.check}|${i.story}|${i.detail}`;
  merged.set(key, merged.has(key) ? { ...i, theme: 'обе' } : i);
}
const list = [...merged.values()];
const errors = list.filter((i) => i.level === 'error');
const warns = list.filter((i) => i.level === 'warn');
const specOk = specResults.filter((s) => s.ok).length;
const byCheck = (arr) => Object.entries(arr.reduce((m, i) => ((m[i.check] = (m[i.check] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);

const md = [
  `# QA Storybook`,
  ``,
  `Историй: **${stories.length}** × ${THEMES.length} темы · скриншотов: ${screens} · спеки Figma: **${specOk}/${specResults.length}** · визуальных расхождений: ${diffs}`,
  ``,
  `**Ошибок: ${errors.length}** · предупреждений: ${warns.length}`,
  ``,
  ...(errors.length ? [`## Ошибки`, ``, `| Проверка | История | Тема | Детали |`, `|---|---|---|---|`, ...errors.map((i) => `| ${i.check} | \`${i.story}\` | ${i.theme} | ${i.detail.replace(/\|/g, '\\|')} |`), ``] : []),
  `## Предупреждения по типам`,
  ``,
  ...byCheck(warns).map(([k, n]) => `- ${k}: ${n}`),
  ``,
  `<details><summary>Все предупреждения</summary>`,
  ``,
  `| Проверка | История | Тема | Детали |`, `|---|---|---|---|`,
  ...warns.map((i) => `| ${i.check} | \`${i.story}\` | ${i.theme} | ${i.detail.replace(/\|/g, '\\|')} |`),
  ``,
  `</details>`,
].join('\n');
writeFileSync(join(outDir, 'report.md'), md);
writeFileSync(join(outDir, 'report.json'), JSON.stringify({ stories: stories.length, specs: specResults, issues: list }, null, 2));

console.log(`Историй ${stories.length} · спеки ${specOk}/${specResults.length} · ошибок ${errors.length} · предупреждений ${warns.length}`);
for (const [k, n] of byCheck(errors)) console.log(`  ✗ ${k}: ${n}`);
for (const [k, n] of byCheck(warns)) console.log(`  · ${k}: ${n}`);
console.log(`Отчёт: qa/out/report.md`);
process.exit(errors.length ? 1 : 0);
