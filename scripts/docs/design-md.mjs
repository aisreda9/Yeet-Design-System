// Таблицы DESIGN.md из tokens/tokens.json: цвета, контраст, цвета вещей, типографика, отступы, радиусы, тень, анимации.
// Блоки размечены в DESIGN.md комментариями <!-- gen:имя --> … <!-- /gen:имя -->, всё между ними перезаписывается.
// Запуск: npm run docs-tokens — обновить DESIGN.md; npm run docs-tokens -- --check — только сверить (код выхода 1, если отстал).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const { tokens: t } = await import('../../src/tokens/model.js'); // tokens/tokens.json (DTCG) → удобная форма
const designPath = join(root, 'DESIGN.md');
const check = process.argv.includes('--check');

// ── Цвета ──────────────────────────────────────────────────────────────────

/** Семантические цвета базовой темы: [{ key, group, light, dark, role, figma }] */
const colors = Object.entries(t.color).flatMap(([group, tokens]) =>
  Object.entries(tokens).map(([key, v]) => ({ key, group, ...v })),
);
const byKey = Object.fromEntries(colors.map((c) => [c.key, c]));

function resolve(value) {
  const m = /^\{primitive\.([\w-]+)\}$/.exec(value);
  if (!m) return value;
  if (!(m[1] in t.primitive)) throw new Error(`Нет примитива ${m[1]}`);
  return resolve(t.primitive[m[1]]);
}

/** '#RRGGBB@0.4' → '`#RRGGBB` @ 40%' */
function show(value) {
  const [hex, alpha] = resolve(value).split('@');
  return alpha === undefined ? `\`${hex.toUpperCase()}\`` : `\`${hex.toUpperCase()}\` @ ${Math.round(Number(alpha) * 100)}%`;
}

function rgba(value) {
  const [hex, alpha] = resolve(value).split('@');
  const h = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Неверный цвет: ${value}`);
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: alpha === undefined ? 1 : Number(alpha) };
}

const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });

function lum({ r, g, b }) {
  const ch = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

/** Контраст WCAG: полупрозрачный фон кладётся на bg-canvas той же темы. */
function contrast(fg, bg, theme) {
  const canvas = rgba(byKey['bg-canvas'][theme]);
  const b = over(rgba(byKey[bg][theme]), canvas);
  const f = over(rgba(byKey[fg][theme]), b);
  const [l1, l2] = [lum(f), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const table = (head, rows) =>
  [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');

const blocks = {
  colors: () =>
    table(
      ['Figma', 'Код', 'Light', 'Dark', 'Роль'],
      colors.map((c) => [`\`${c.figma}\``, `\`--color-${c.key}\``, show(c.light), show(c.dark), c.role]),
    ),

  contrast: () => {
    const pairs = [
      ['text-primary', 'bg-canvas', 'Основной текст на фоне', 4.5],
      ['text-secondary', 'bg-canvas', 'Вторичный текст на фоне', 4.5],
      ['text-secondary', 'bg-subtle', 'Вторичный текст на карточке', 4.5],
      ['text-accent', 'bg-canvas', 'Акцентный текст на фоне', 4.5],
      ['text-danger', 'bg-canvas', 'Текст ошибки на фоне', 4.5],
      ['text-on-accent', 'accent', 'Текст на Primary-кнопке', 4.5],
      ['text-on-danger', 'danger', 'Текст на бейдже скидки', 4.5],
      ['text-danger', 'danger-soft', 'Текст Destructive-кнопки', 4.5],
      ['accent', 'bg-canvas', 'Заливка `accent` (фокус, выбранное) на фоне', 3],
    ];
    const cell = (fg, bg, theme, min) => {
      const r = contrast(fg, bg, theme);
      return `${r.toFixed(1)} : 1${r < min ? ' ⚠️' : ''}`;
    };
    return table(
      ['Пара', 'Текст / знак', 'Фон', 'Light', 'Dark', 'Норма WCAG'],
      pairs.map(([fg, bg, label, min]) => [label, `\`${fg}\``, `\`${bg}\``, cell(fg, bg, 'light', min), cell(fg, bg, 'dark', min), `${min} : 1`]),
    );
  },

  items: () =>
    table(
      ['Токен', 'Значение', 'Подпись в UI', 'Текст на свотче'],
      Object.entries(t.item).map(([k, v]) => [`\`item-colors/${k}\``, show(v.value), v.name, show(v.on)]),
    ),

  typography: () =>
    table(
      ['Стиль', 'Шрифт', 'Вес', 'Размер / интерлиньяж', 'Трекинг', 'Применение'],
      Object.entries(t.typography).map(([k, s]) => [
        `\`${k}\``,
        t.font[s.font].family,
        s.weight,
        `${s.size} / ${s.lineHeight}`,
        s.letterSpacing ? `${String(s.letterSpacing).replace('-', '−')} px` : '0',
        s.use,
      ]),
    ),

  space: () => `Шкала — ${t.space.length} шагов: \`${t.space.join(', ')}\` (\`--space-<значение>\`).`,

  radius: () => {
    const refs = Object.entries(t.component)
      .filter(([k]) => k.includes('radius'))
      .map(([k, v]) => `\`--${k}\` → \`${String(v).replace(/^\{radius\.([\w-]+)\}$/, '$1')}\``);
    return (
      table(['Токен', 'Значение', 'Где'], Object.entries(t.radius).map(([k, v]) => [`\`--radius-${k}\``, v.value, v.use])) +
      `\n\nКомпонентные радиусы ссылаются на эти: ${refs.join(', ')}.`
    );
  },

  shadow: () =>
    table(
      ['Токен', 'Light', 'Dark', 'Где'],
      Object.entries(t.shadow).map(([k, v]) => {
        const s = (x) => `${x.x} / ${x.y}, blur ${x.blur}, ${show(x.color)}`;
        return [`\`shadow/${k}\``, s(v.light), s(v.dark), v.use];
      }),
    ),

  motion: () => {
    const m = t.motion;
    const curve = (tr) => {
      if (tr.spring) {
        const s = m.spring[tr.spring];
        return `${s.duration} мс · spring ${tr.spring} (k${s.stiffness} c${s.damping})`;
      }
      const easing = { standard: 'standard', out: 'ease-out' }[tr.easing] ?? tr.easing;
      return `${m.duration[tr.duration]} мс · ${easing}`;
    };
    return (
      `Переходов — ${Object.keys(m.transition).length}.\n\n` +
      table(['Токен', 'Кривая', 'Что происходит'], Object.entries(m.transition).map(([k, tr]) => [`\`--motion-${k}\``, curve(tr), tr.use]))
    );
  },

  screens: () => {
    // экраны разложены по разделам: src/pages/<Раздел>.stories.tsx
    const dir = join(root, 'src/pages');
    const src = readdirSync(dir).filter((f) => f.endsWith('.stories.tsx')).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
    return String((src.match(/^export const \w+: Story\b/gm) ?? []).length);
  },
};

// ── Подстановка ────────────────────────────────────────────────────────────

const before = readFileSync(designPath, 'utf8');
const seen = new Set();
const after = before.replace(/(<!-- gen:([\w-]+) -->)([\s\S]*?)(<!-- \/gen:\2 -->)/g, (_, open, name, body, close) => {
  if (!blocks[name]) throw new Error(`DESIGN.md: неизвестный блок gen:${name}`);
  seen.add(name);
  const inline = !body.includes('\n');
  const out = blocks[name]();
  return inline ? `${open}${out}${close}` : `${open}\n${out}\n${close}`;
});

const missing = Object.keys(blocks).filter((b) => !seen.has(b));
if (missing.length) {
  console.error(`DESIGN.md: нет блоков ${missing.map((b) => `gen:${b}`).join(', ')}`);
  process.exit(1);
}

if (after === before) {
  console.log(`DESIGN.md совпадает с tokens.json (${seen.size} блоков).`);
} else if (check) {
  const stale = [...seen].filter((name) => {
    const re = new RegExp(`<!-- gen:${name} -->([\\s\\S]*?)<!-- /gen:${name} -->`);
    return re.exec(before)[1] !== re.exec(after)[1];
  });
  console.error(`DESIGN.md отстал от tokens.json: ${stale.map((b) => `gen:${b}`).join(', ')}. Запусти npm run docs-tokens.`);
  process.exit(1);
} else {
  writeFileSync(designPath, after);
  console.log('DESIGN.md обновлён из tokens.json.');
}
