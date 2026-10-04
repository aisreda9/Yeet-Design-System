// Проверка контраста WCAG 2.x по tokens/tokens.json: светлая и тёмная темы.
//
//   npm run contrast                    — код выхода 1, если провалена пара
//   npm run contrast -- --all           — показать все пары, а не только провалы и итог
//
// Пары не перечисляются руками, а собираются из токенов:
//   · текст 4.5:1 — каждая пара component `*-fg` × `*-bg` и каждый `text-*` × каждая поверхность;
//   · не-текст 3:1 (WCAG 1.4.11) — фокус-кольцо, индикаторы выбранного (accent), ошибки (danger) × поверхности.
//   · декоративный не-текст — в коридоре (хэндл шторки ≈ 1,5:1, D8): заметно, но не громко.
// Полупрозрачный фон кладётся на каждую поверхность, где компонент может стоять; берётся худший случай.
const { tokens: t } = await import('../src/tokens/model.js'); // tokens/tokens.json (DTCG) → удобная форма
const args = new Set(process.argv.slice(2));

const TEXT = 4.5;
const UI = 3;

/** Поверхности, на которых стоят компоненты и текст. */
const SURFACES = ['bg-canvas', 'bg-elevated', 'bg-subtle'];

/** Текст, у которого своя подложка (не обычные поверхности). Остальные text-* проверяются на всех SURFACES. */
const TEXT_ON = {
  'text-inverse': ['bg-inverse'],
  'text-inverse-secondary': ['bg-inverse'],
  'text-on-accent': ['accent'],
  'text-on-danger': ['danger'],
  'text-on-photo': null, // поверх фото и камеры — токеном не проверить
};
/** Дополнительные текстовые пары вне компонентных токенов. */
const EXTRA_TEXT = [['text-accent', 'accent-soft']];

/**
 * Не-текст 3:1. Первый ключ, который есть в токенах, — тот, что проверяется:
 * отдельного `focus-ring` пока нет (issue #13), фокус рисуется `accent`. Как только токен появится, проверка перейдёт на него.
 */
const NON_TEXT = [
  { what: 'фокус-кольцо', keys: ['focus-ring', 'accent'] },
  { what: 'индикатор выбранного', keys: ['accent'] },
];
// danger не в списке: бейдж и Destructive-кнопка опознаются по тексту (4.5:1 проверен выше), иконки ошибки — text-danger.

/**
 * Декоративный не-текст: видно, но не громко — контраст в коридоре [min, max], а не «не ниже 3:1».
 * Хэндл шторки (D8, #58): ≈ 1,5:1 к фону шторки; жест дублируется затемнением, «×» и Escape.
 */
const DECOR = [{ what: 'хэндл шторки', fg: 'component.sheet-handle', bg: 'component.sheet-bg', min: 1.4, max: 1.8 }];

/**
 * Известные нарушения базовой темы: [набор, пара] → ссылка. Не валят CI, но печатаются.
 * Добавлять только с issue; как только пара проходит — скрипт попросит убрать запись.
 */
const ISSUE = 'https://github.com/indiekola/Yeet-Design-System/issues/13';
const KNOWN = {
  'base · light|button-destructive-fg / button-destructive-bg над bg-subtle': ISSUE,
  'base · dark|button-destructive-fg / button-destructive-bg над bg-subtle': ISSUE,
  'base · dark|button-soft-fg / button-soft-bg над bg-subtle': ISSUE,
  'base · dark|text-accent / accent-soft над bg-subtle': ISSUE,
  'base · dark|accent / bg-subtle': ISSUE, // фокус-кольцо и индикатор выбранного на карточке: нужен токен focus-ring
};

/* ─── Цвета ─────────────────────────────────────────────────────────── */
const base = {};
for (const group of Object.values(t.color)) {
  if (!group || typeof group !== 'object') continue;
  for (const [k, v] of Object.entries(group)) if (v && typeof v === 'object' && 'light' in v) base[k] = v;
}

function resolve(value, get) {
  const m = /^\{(primitive|color)\.([\w-]+)\}$/.exec(value);
  if (!m) return value;
  if (m[1] === 'primitive') {
    if (!t.primitive[m[2]]) throw new Error(`Нет примитива ${m[2]}`);
    return resolve(t.primitive[m[2]], get);
  }
  const v = get(m[2]);
  if (!v) throw new Error(`Нет цвета ${m[2]}`);
  return resolve(v, get);
}

/** '#RRGGBB' | '#RRGGBB@a' → { r, g, b, a } (0–255, a 0–1) */
function parse(value) {
  const [hex, alpha] = value.split('@');
  const h = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Неверный цвет: ${value}`);
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: alpha === undefined ? 1 : Number(alpha) };
}

const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });

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

/* ─── Пары ──────────────────────────────────────────────────────────── */
/** @type {{fg:string, bg:string, min:number, kind:string}[]} fg/bg — ключи color.* или component.* */
const pairs = [];
const seen = new Set();
const push = (fg, bg, min, kind) => {
  const k = `${fg}|${bg}|${min}`;
  if (!seen.has(k)) { seen.add(k); pairs.push({ fg, bg, min, kind }); }
};

// 1. Компонентные токены: button-primary-fg × button-primary-bg …
const comp = t.component ?? {};
for (const key of Object.keys(comp)) {
  const m = /^(.*)-fg$/.exec(key);
  if (!m) continue;
  if (!comp[`${m[1]}-bg`]) throw new Error(`component.${key}: нет пары ${m[1]}-bg`);
  push(`component.${key}`, `component.${m[1]}-bg`, TEXT, m[1]);
}
// 2. Текст на поверхностях
for (const k of Object.keys(base).filter((k) => k.startsWith('text-'))) {
  const on = k in TEXT_ON ? TEXT_ON[k] : SURFACES;
  for (const bg of on ?? []) push(k, bg, TEXT, 'текст');
}
for (const [fg, bg] of EXTRA_TEXT) push(fg, bg, TEXT, 'текст');
// 3. Не-текст
const nonTextSkipped = [];
for (const { what, keys } of NON_TEXT) {
  const key = keys.find((k) => base[k]);
  if (!key) throw new Error(`${what}: нет ни одного из токенов ${keys.join(', ')}`);
  if (key !== keys[0]) nonTextSkipped.push(`${what}: токена \`${keys[0]}\` нет, проверяется \`${key}\``);
  for (const bg of SURFACES) push(key, bg, UI, what);
}
for (const d of DECOR) {
  if (!comp[d.fg.slice(10)] || !comp[d.bg.slice(10)]) throw new Error(`${d.what}: нет ${d.fg} или ${d.bg}`);
  push(d.fg, d.bg, d.min, d.what);
  pairs.at(-1).max = d.max;
}

/* ─── Наборы: светлая и тёмная тема ─────────────────────────────────── */
const sets = [];
for (const theme of ['light', 'dark']) sets.push({ label: `base · ${theme}`, get: (k) => base[k]?.[theme] });

/** Значение ключа как список непрозрачных вариантов (полупрозрачное — поверх каждой поверхности). */
function solid(set, key, under) {
  const raw = key.startsWith('component.') ? comp[key.slice(10)] : set.get(key);
  if (raw === 'transparent') return SURFACES.map((s) => ({ c: parse(resolve(set.get(s), set.get)), on: s }));
  if (!raw) throw new Error(`${set.label}: нет ${key}`);
  const c = parse(resolve(raw, set.get));
  if (c.a >= 1) return [{ c, on: null }];
  return (under ? [under] : SURFACES).map((s) => ({ c: over(c, parse(resolve(set.get(s), set.get))), on: s }));
}

const rows = [];
for (const s of sets) {
  for (const p of pairs) {
    // худший случай по всем подложкам полупрозрачного фона
    let worst = null;
    for (const bg of solid(s, p.bg)) {
      const fg = parse(resolve(p.fg.startsWith('component.') ? comp[p.fg.slice(10)] : s.get(p.fg), s.get));
      const r = ratio(over(fg, bg.c), bg.c);
      if (!worst || r < worst.r) worst = { r, on: bg.on };
    }
    const name = `${p.fg.replace('component.', '')} / ${p.bg.replace('component.', '')}${worst.on ? ` над ${worst.on}` : ''}`;
    const ok = worst.r >= p.min && (p.max === undefined || worst.r <= p.max);
    const known = KNOWN[`${s.label}|${name}`];
    const level = ok ? 'ok' : known ? 'known' : 'error';
    rows.push({ set: s.label, kind: p.kind, pair: name, min: p.min, max: p.max, ratio: worst.r, level, known });
  }
}

// Цвета аккаунтов: буква on-item на фоне цвета вещи (аватары), не зависит от темы
for (const [k, v] of Object.entries(t.item)) {
  if (!v.on) throw new Error(`item.${k}: нет on`);
  const pick = (x) => parse(resolve(x, (c) => base[c]?.light)); // item-цвета ссылаются на примитивы
  const r = ratio(pick(v.on), pick(v.value));
  rows.push({ set: 'item · буква', kind: 'аватар', pair: `on-item-${k} / item-${k}`, min: TEXT, ratio: r, level: r >= TEXT ? 'ok' : 'error' });
}

/* ─── Вывод ─────────────────────────────────────────────────────────── */
const LABEL = { ok: 'ok', known: 'известно', error: 'FAIL' };
const shown = args.has('--all') ? rows : rows.filter((r) => r.level !== 'ok');
if (shown.length) {
  const w = { set: Math.max(...shown.map((r) => r.set.length), 5), pair: Math.max(...shown.map((r) => r.pair.length), 4), kind: Math.max(...shown.map((r) => r.kind.length), 3) };
  console.log(`${'Набор'.padEnd(w.set)}  ${'Что'.padEnd(w.kind)}  ${'Пара'.padEnd(w.pair)}  Контраст  Норма  Итог`);
  console.log(`${'-'.repeat(w.set)}  ${'-'.repeat(w.kind)}  ${'-'.repeat(w.pair)}  --------  -----  ----`);
  let prev = '';
  for (const r of shown) {
    console.log(`${(r.set === prev ? '' : r.set).padEnd(w.set)}  ${r.kind.padEnd(w.kind)}  ${r.pair.padEnd(w.pair)}  ${r.ratio.toFixed(2).padStart(8)}  ${(r.max ? `${r.min}–${r.max}` : `${r.min}:1`).padStart(5)}  ${LABEL[r.level]}${r.known ? ` ${r.known}` : ''}`);
    prev = r.set;
  }
  console.log('');
}
for (const note of nonTextSkipped) console.log(`ℹ ${note}`);

const count = (l) => rows.filter((r) => r.level === l).length;
const stale = Object.keys(KNOWN).filter((k) => !rows.some((r) => `${r.set}|${r.pair}` === k && r.level === 'known'));
for (const k of stale) console.error(`✗ Известное исключение больше не нужно или не найдено — уберите из KNOWN: ${k}`);

console.log(`Контраст: ${rows.length} пар (${pairs.length} на набор × ${sets.length} наборов + аватары) · ошибок ${count('error')} · известных ${count('known')}`);
process.exit(count('error') || stale.length ? 1 : 0);
