// Токены в удобной для кода форме: tokens/tokens.json (DTCG) → { primitive, item, color, motion, … }.
// Один модуль для браузера (Storybook, утилиты) и Node-скриптов (контраст, DESIGN.md): без node:*, JSON — через import.
// Цвета — "#RRGGBB" или "#RRGGBB@alpha", ссылки — короткие "{primitive.x}" / "{color.x}" / "{radius.x}".
// Типы — model.d.ts. Значения токенов правятся только в tokens/tokens.json.
import source from '../../tokens/tokens.json' with { type: 'json' };

const EXT = 'com.yeet';
const ext = (node) => node?.$extensions?.[EXT] ?? {};
const isRef = (v) => typeof v === 'string' && /^\{[^{}]+\}$/.test(v);
const entries = (group) => Object.entries(group).filter(([k]) => !k.startsWith('$'));
const map = (group, fn) => Object.fromEntries(entries(group).map(([k, v]) => [k, fn(v, k)]));

/** Преобразует DTCG-дерево в модель. Экспортируется для проверок; обычно нужен готовый `tokens`. */
export function toModel(t) {
  const byId = new Map();
  const walk = (node, path) => {
    if ('$value' in node) { byId.set(path.join('.'), node); return; }
    for (const [k, v] of entries(node)) walk(v, [...path, k]);
  };
  walk(t, []);
  /** "{color.surface.bg-canvas}" → "{color.bg-canvas}": семантические цвета адресуются по имени, без группы. */
  const shortRef = (v) => v.replace(/^\{color\.[\w-]+\.([\w-]+)\}$/, '{color.$1}');
  const color = (v) => {
    if (isRef(v)) return shortRef(v);
    if (v.alpha === 0) return 'transparent';
    return v.alpha === undefined ? v.hex : `${v.hex}@${v.alpha}`;
  };
  const deref = (v) => (isRef(v) ? deref(byId.get(v.slice(1, -1)).$value) : v);
  const refKey = (v) => v.slice(1, -1).split('.').at(-1);
  const px = (v) => deref(v).value;
  const quote = (s) => (/\s/.test(s) ? `'${s}'` : s);
  const m = t.motion;

  return {
    primitive: map(t.primitive, (v) => color(v.$value)),
    item: map(t.item, (v, k) => ({ value: color(v.$value), name: ext(v).name, on: color(t['on-item'][k].$value) })),
    avatar: { $description: t.avatar.$description, palette: ext(t.avatar).palette },
    color: Object.fromEntries(entries(t.color).map(([, g]) => [g.$description, map(g, (v) => ({
      light: color(v.$value), dark: color(ext(v).modes?.dark ?? v.$value), role: v.$description, figma: ext(v).figma,
    }))])),
    component: map(t.component, (v) => (v.$type === 'color' ? color(v.$value) : v.$value)),
    space: entries(t.space).map(([, v]) => v.$value.value),
    radius: map(t.radius, (v) => ({ value: v.$value.value, use: v.$description })),
    font: map(t.font, (v) => {
      const [family, ...fallback] = v.$value;
      const x = ext(v);
      return { family, fallback: fallback.map(quote).join(', '), file: x.file, android: x.android, weights: x.weights, source: v.$description };
    }),
    typography: map(t.typography, (v) => {
      const s = v.$value, size = px(s.fontSize);
      return { font: refKey(s.fontFamily), weight: deref(s.fontWeight), size, lineHeight: Math.round(size * deref(s.lineHeight)), letterSpacing: px(s.letterSpacing), use: v.$description };
    }),
    shadow: map(t.shadow, (v) => {
      const sh = (x) => ({ x: px(x.offsetX), y: px(x.offsetY), blur: px(x.blur), color: color(deref(x.color)) });
      return { light: sh(v.$value), dark: sh(ext(v).modes?.dark ?? v.$value), use: v.$description };
    }),
    layout: map(t.layout, (v) => px(v.$value)),
    motion: {
      duration: map(m.duration, (v) => v.$value.value),
      easing: map(m.easing, (v) => v.$value),
      spring: map(m.spring, (v) => ({ mass: v.$value.mass, stiffness: v.$value.stiffness, damping: v.$value.damping, duration: px(v.$value.duration), figma: ext(v).figma })),
      transition: map(m.transition, (v) => (v.$type === 'spring'
        ? { spring: refKey(v.$value), use: v.$description }
        : { duration: refKey(v.$value.duration), easing: refKey(v.$value.timingFunction), use: v.$description })),
      haptic: map(m.haptic, (v) => ({ ...v.$value, when: v.$description, use: ext(v).use })),
      gesture: map(m.gesture, (v) => ({
        value: typeof v.$value === 'number' ? v.$value : v.$value.value,
        unit: ext(v).unit ?? (v.$type === 'duration' ? 'ms' : v.$type === 'dimension' ? 'px' : ''),
        use: v.$description,
      })),
    },
  };
}

export const tokens = toModel(source);
export default tokens;
