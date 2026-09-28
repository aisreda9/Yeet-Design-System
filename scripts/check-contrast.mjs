// Проверка контраста WCAG 2.x для базовой темы и всех бренд-палитр из tokens/tokens.json.
// Запуск: npm run contrast. Код выхода 1, если хоть одна пара ниже порога.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const t = JSON.parse(readFileSync(join(root, 'tokens/tokens.json'), 'utf8'));

const MIN = 4.5;

// Плоская карта семантических цветов базовой темы: { key: { light, dark } }
const base = {};
for (const group of Object.values(t.color)) {
  if (!group || typeof group !== 'object') continue;
  for (const [k, v] of Object.entries(group)) if (v && typeof v === 'object' && 'light' in v) base[k] = v;
}

function resolve(value) {
  const m = /^\{primitive\.([\w-]+)\}$/.exec(value);
  if (m) {
    const p = t.primitive[m[1]];
    if (!p) throw new Error(`Нет примитива ${m[1]}`);
    return resolve(p);
  }
  return value;
}

/** '#RRGGBB' | '#RRGGBB@a' → { r, g, b, a } (0–255, a 0–1) */
function parse(value) {
  const [hex, alpha] = resolve(value).split('@');
  const h = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Неверный цвет: ${value}`);
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: alpha === undefined ? 1 : Number(alpha) };
}

function over(fg, bg) {
  const a = fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

function lum({ r, g, b }) {
  const ch = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

function ratio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Пары: [текст, фон, фон-под-фоном (для полупрозрачного фона)] */
const pairs = [
  ['text-primary', 'bg-canvas'],
  ['text-primary', 'bg-elevated'],
  ['text-primary', 'bg-subtle'],
  ['text-secondary', 'bg-canvas'],
  ['text-secondary', 'bg-elevated'],
  ['text-secondary', 'bg-subtle'],
  ['text-accent', 'bg-canvas'],
  ['text-accent', 'bg-subtle'],
  ['text-accent', 'accent-soft', 'bg-canvas'],
  ['text-on-accent', 'accent'],
  ['text-inverse', 'bg-inverse'],
  ['text-on-danger', 'danger'],
];

const sets = [];
for (const theme of ['light', 'dark']) {
  const get = (k) => base[k]?.[theme];
  sets.push({ label: `base · ${theme}`, get });
}
for (const [id, b] of Object.entries(t.brand ?? {})) {
  for (const theme of ['light', 'dark']) {
    // Бренд переопределяет только часть ключей; остальное (danger, text-on-danger) — из базы
    const get = (k) => b[theme]?.[k] ?? base[k]?.[theme];
    sets.push({ label: `${id} · ${theme}`, get });
  }
}

const rows = [];
let failures = 0;
for (const s of sets) {
  for (const [fgKey, bgKey, underKey] of pairs) {
    const fgRaw = s.get(fgKey);
    const bgRaw = s.get(bgKey);
    if (!fgRaw || !bgRaw) throw new Error(`${s.label}: нет ${!fgRaw ? fgKey : bgKey}`);
    let bg = parse(bgRaw);
    if (bg.a < 1) {
      const under = parse(s.get(underKey ?? 'bg-canvas'));
      bg = over(bg, under);
    }
    const fg = over(parse(fgRaw), bg);
    const r = ratio(fg, bg);
    const ok = r >= MIN;
    if (!ok) failures++;
    rows.push({ set: s.label, pair: `${fgKey} / ${bgKey}${underKey ? ` над ${underKey}` : ''}`, ratio: r.toFixed(2), ok: ok ? 'ok' : 'FAIL' });
  }
}

// Цвета аккаунтов: буква on-item на фоне цвета вещи (аватары), не зависит от темы
for (const [k, v] of Object.entries(t.item)) {
  if (!v.on) throw new Error(`item.${k}: нет on`);
  const r = ratio(parse(v.on), parse(v.value));
  const ok = r >= MIN;
  if (!ok) failures++;
  rows.push({ set: 'item · буква', pair: `on-item-${k} / item-${k}`, ratio: r.toFixed(2), ok: ok ? 'ok' : 'FAIL' });
}

const w = { set: Math.max(...rows.map((r) => r.set.length), 5), pair: Math.max(...rows.map((r) => r.pair.length), 4) };
console.log(`${'Набор'.padEnd(w.set)}  ${'Пара'.padEnd(w.pair)}  Контраст  Итог`);
console.log(`${'-'.repeat(w.set)}  ${'-'.repeat(w.pair)}  --------  ----`);
let prev = '';
for (const r of rows) {
  console.log(`${(r.set === prev ? '' : r.set).padEnd(w.set)}  ${r.pair.padEnd(w.pair)}  ${r.ratio.padStart(8)}  ${r.ok}`);
  prev = r.set;
}
console.log('');
if (failures) {
  console.error(`Контраст: ${failures} из ${rows.length} пар ниже ${MIN}:1`);
  process.exit(1);
}
console.log(`Контраст: все ${rows.length} пар ≥ ${MIN}:1`);
