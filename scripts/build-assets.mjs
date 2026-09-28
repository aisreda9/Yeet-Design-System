// Раздел «Ресурсы» в Storybook: собирает файлы для скачивания в .downloads/ (раздаётся Storybook как /downloads).
// Запуск: npm run assets (входит в build-storybook и storybook). Сгенерированное не коммитится.
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const out = join(root, '.downloads');
rmSync(out, { recursive: true, force: true });

const put = (path, data) => { mkdirSync(join(out, path, '..'), { recursive: true }); writeFileSync(join(out, path), data); };
const copy = (from, to) => { mkdirSync(join(out, to, '..'), { recursive: true }); copyFileSync(join(root, from), join(out, to)); };

/* Токены: исходник и платформенные файлы */
copy('tokens/tokens.json', 'tokens/tokens.json');
copy('src/tokens/tokens.generated.css', 'tokens/tokens.css');
copy('tokens/ios/YeetTokens.swift', 'tokens/ios/YeetTokens.swift');
copy('tokens/android/YeetTokens.kt', 'tokens/android/YeetTokens.kt');

/* Линейные иконки: из src/icons/icons.ts в отдельные SVG 24×24 (stroke 1.3, currentColor) и спрайт */
const src = readFileSync(join(root, 'src/icons/icons.ts'), 'utf8');
const icons = [...src.matchAll(/^\s+'([\w-]+)':\s*"((?:[^"\\]|\\.)*)"/gm)].map(([, name, body]) => [name, body.replace(/\\"/g, '"')]);
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">${body}</svg>\n`;
for (const [name, body] of icons) put(`icons/ui/${name}.svg`, svg(body));
put('icons/ui-sprite.svg', `<svg xmlns="http://www.w3.org/2000/svg">${icons.map(([n, b]) => `<symbol id="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">${b}</symbol>`).join('')}</svg>\n`);

/* Цветные иконки погоды, флаги, иллюстрации, шрифты */
for (const dir of ['weather', 'flags']) for (const f of readdirSync(join(root, 'src/icons', dir))) copy(`src/icons/${dir}/${f}`, `icons/${dir}/${f}`);
for (const f of readdirSync(join(root, 'src/icons/art'))) copy(`src/icons/art/${f}`, `images/${f}`);
for (const f of readdirSync(join(root, 'tokens/fonts'))) copy(`tokens/fonts/${f}`, `fonts/${f}`);

/* Всё одним архивом (ZIP без сжатия — без зависимостей) */
const files = [];
const walk = (dir) => { for (const f of readdirSync(dir)) { const p = join(dir, f); statSync(p).isDirectory() ? walk(p) : files.push(p); } };
walk(out);
put('yeet-design-system.zip', zip(files.map((p) => ['yeet-design-system/' + relative(out, p), readFileSync(p)])));

const manifest = files.map((p) => ({ path: relative(out, p), size: statSync(p).size }));
put('manifest.json', JSON.stringify({ icons: icons.map(([n]) => n), files: manifest }, null, 2));
console.log(`✓ .downloads: ${files.length} файлов, иконок ${icons.length}`);

function zip(entries) {
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const locals = [], centrals = []; let offset = 0;
  for (const [name, data] of entries) {
    const n = Buffer.from(name), crc = crc32(data);
    const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(n.length, 26);
    const central = Buffer.alloc(46); central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x0800, 8);
    central.writeUInt32LE(crc, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(n.length, 28); central.writeUInt32LE(offset, 42);
    locals.push(local, n, data); centrals.push(central, n); offset += 30 + n.length + data.length;
  }
  const cd = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}
