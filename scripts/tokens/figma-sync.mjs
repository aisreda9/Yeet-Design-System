#!/usr/bin/env node
/**
 * Сверка переменных Figma «Yeet DS 2.0» с токенами кода (#225 п. 5).
 *   node scripts/tokens/figma-sync.mjs        — отчёт и код выхода 1 при расхождениях
 * Снимок переменных — design/figma-variables.json: обновляет координатор через Figma MCP (use_figma, чтение коллекции).
 * Сравнивается по code syntax (WEB: var(--x)) каждой переменной:
 *   — у переменной есть code syntax и такое CSS-свойство есть в src/tokens/tokens.generated.css;
 *   — значение в Light и Dark совпадает (цвета — с альфой, размеры — в px); motion — только наличие (в коде пружины, в Figma длительность).
 */
import { readFileSync } from 'node:fs';

const snap = JSON.parse(readFileSync(new URL('../../design/figma-variables.json', import.meta.url), 'utf8'));
const css = readFileSync(new URL('../../src/tokens/tokens.generated.css', import.meta.url), 'utf8');

/** Свойства всех блоков с этим селектором (в файле несколько `:root`). */
function block(sel) {
  const out = {};
  for (let i = css.indexOf(sel + ' {'); i >= 0; i = css.indexOf(sel + ' {', i + 1)) {
    if (i > 0 && css[i - 1] !== '\n') continue;
    const body = css.slice(css.indexOf('{', i) + 1, css.indexOf('\n}', i));
    for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  }
  return out;
}
const root = block(':root');
const themes = {
  Light: { ...root, ...block("[data-theme='light']") },
  Dark: { ...root, ...block("[data-theme='dark']") },
};

function resolve(v, scope, depth = 0) {
  if (depth > 10 || v == null) return v;
  return v.replace(/var\((--[\w-]+)\)/g, (_, n) => resolve(scope[n], scope, depth + 1) ?? `var(${n})`);
}
const hex2 = (n) => Math.round(n).toString(16).padStart(2, '0');
function color(v) {
  if (!v) return null;
  v = v.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(v)) v = '#' + [...v.slice(1)].map((c) => c + c).join('');
  if (/^#[0-9a-f]{8}$/.test(v) && v.endsWith('ff')) v = v.slice(0, 7);
  if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/.test(v)) return v;
  const m = v.match(/^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)\s*(?:[/,]\s*([\d.]+%?))?\s*\)$/);
  if (!m) return v;
  let a = m[4] == null ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  return '#' + hex2(m[1]) + hex2(m[2]) + hex2(m[3]) + (a < 1 ? hex2(a * 255) : '');
}
const near = (a, b) =>
  a === b ||
  (a &&
    b &&
    a.length === b.length &&
    a.match(/../g).every((x, i) => Math.abs(parseInt(x, 16) - parseInt(b.match(/../g)[i], 16)) <= 1));

/** Известные расхождения: переменная → причина (issue). Решённое не красит проверку. */
const KNOWN = {
  'spaces/1': 'есть только в Figma, в коде шаг не используется — ревизия шкалы, #225',
  'spaces/36': 'есть только в Figma — ревизия шкалы, #225',
  'spaces/60': 'есть только в Figma — ревизия шкалы, #225',
  'spaces/64': 'есть только в Figma — ревизия шкалы, #225',
  'spaces/68': 'есть только в Figma — ревизия шкалы, #225',
  'spaces/72': 'есть только в Figma — ревизия шкалы, #225',
};
const byName = Object.fromEntries(snap.variables.map((v) => [v.name, v]));
const rows = [];
for (const v of snap.variables) {
  if (!v.web) {
    rows.push([v.name, 'нет code syntax в Figma', '', '']);
    continue;
  }
  const prop = v.web.match(/var\((--[\w-]+)\)/)?.[1];
  if (!prop || !(prop in themes.Light)) {
    rows.push([v.name, `${prop ?? v.web} нет в tokens.generated.css`, '', '']);
    continue;
  }
  if (v.name.startsWith('motion/')) continue;
  for (const mode of ['Light', 'Dark']) {
    let fv = v.values[mode];
    if (fv && typeof fv === 'object' && fv.alias) fv = byName[fv.alias]?.values[mode];
    const cv = resolve(themes[mode][prop], themes[mode]);
    if (v.type === 'COLOR') {
      const a = color(fv),
        b = color(cv);
      if (!near(a.replace('#', ''), (b ?? '').replace('#', ''))) rows.push([v.name, `${prop} ${mode}`, a, b]);
    } else {
      const b = parseFloat(cv);
      if (fv !== b) rows.push([v.name, `${prop} ${mode}`, String(fv), cv]);
    }
  }
}
const bad = rows.filter((r) => !KNOWN[r[0]]);
console.log(
  `Figma «${snap.collection}» (снимок ${snap.exported}): переменных ${snap.variables.length}, расхождений ${bad.length}, известных ${rows.length - bad.length}`,
);
for (const r of rows)
  console.log(
    `  ${KNOWN[r[0]] ? '·' : '✗'} ${r[0]} — ${r[1]}${r[2] ? `: Figma ${r[2]} ≠ код ${r[3]}` : ''}${KNOWN[r[0]] ? ` (известно: ${KNOWN[r[0]]})` : ''}`,
  );
process.exit(bad.length ? 1 : 0);
