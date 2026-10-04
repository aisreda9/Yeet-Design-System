// Трансформы Style Dictionary для Yeet: имена и значения под CSS, Swift (pt) и Kotlin (dp / sp).
// Все трансформы транзитивные: применяются и к токенам-ссылкам после разрешения, поэтому уже
// преобразованное значение (строка) проходит насквозь без изменений.

/** Ключевые слова Swift: имена токенов с ними пишутся в обратных кавычках (`return`). */
export const SWIFT_KEYWORDS = new Set(['return', 'default', 'case', 'switch', 'class', 'struct', 'enum', 'func', 'var', 'let', 'in', 'is', 'as', 'if', 'else', 'for', 'while', 'repeat', 'do', 'try', 'throw', 'import', 'init', 'self', 'super', 'protocol', 'extension', 'operator', 'where', 'guard', 'defer', 'break', 'continue', 'fallthrough', 'static', 'public', 'private', 'internal', 'true', 'false', 'nil']);
/** Ключевые слова Kotlin, которые не могут быть именами без обратных кавычек. */
export const KOTLIN_KEYWORDS = new Set(['return', 'object', 'class', 'fun', 'val', 'var', 'when', 'if', 'else', 'in', 'is', 'as', 'do', 'for', 'while', 'break', 'continue', 'null', 'true', 'false', 'this', 'super', 'throw', 'try', 'typealias', 'typeof', 'package', 'interface']);

export const camel = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
export const pascal = (s) => camel(s).replace(/^\w/, (c) => c.toUpperCase());
export const num = (x) => (Number.isInteger(x) ? String(x) : String(+x.toFixed(4)));
export const swiftName = (s) => (SWIFT_KEYWORDS.has(s) ? `\`${s}\`` : s);
export const kotlinName = (s) => (KOTLIN_KEYWORDS.has(s) ? `\`${s}\`` : s);

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isColor = (v) => isObj(v) && 'colorSpace' in v;
const isDim = (v) => isObj(v) && 'unit' in v && 'value' in v;

/** DTCG-цвет → { r, g, b, a, hex } (hex — RRGGBB в верхнем регистре). */
export function rgba(c) {
  const [r, g, b] = c.hex ? [1, 3, 5].map((i) => parseInt(c.hex.slice(i, i + 2), 16)) : c.components.map((x) => Math.round(x * 255));
  const hex = [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  return { r, g, b, a: c.alpha ?? 1, hex };
}
const ms = (d) => (d.unit === 's' ? d.value * 1000 : d.value);

/** Смещение пружины из 0 в 1 за s секунд: недодемпфированная (ζ < 1), критическая (ζ = 1, damping 2·√(k·m) с точностью до округления) и передемпфированная. */
export function springAt({ mass, stiffness, damping }, s) {
  const w0 = Math.sqrt(stiffness / mass), z = damping / (2 * Math.sqrt(stiffness * mass));
  if (Math.abs(1 - z) < 1e-4) return 1 - (1 + w0 * s) * Math.exp(-w0 * s);
  if (z > 1) { const wd = w0 * Math.sqrt(z * z - 1); return 1 - Math.exp(-z * w0 * s) * (Math.cosh(wd * s) + ((z * w0) / wd) * Math.sinh(wd * s)); }
  const wd = w0 * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w0 * s) * (Math.cos(wd * s) + ((z * w0) / wd) * Math.sin(wd * s));
}

/** Пружина (mass, stiffness, damping) → CSS linear() по 37 точкам за её длительность. */
export function springLinear({ mass, stiffness, damping, duration }) {
  const pts = Array.from({ length: 37 }, (_, i) => springAt({ mass, stiffness, damping }, ((i / 36) * duration) / 1000));
  pts[0] = 0; pts[36] = 1;
  return `linear(${pts.map((p) => +p.toFixed(3)).join(', ')})`;
}
export const dampingRatio = ({ mass, stiffness, damping }) => damping / (2 * Math.sqrt(stiffness * mass));

/* ─── Значения по платформам ──────────────────────────────────────────── */

const css = {
  color: (v) => { if (!isColor(v)) return v; const c = rgba(v); return c.a === 0 ? 'transparent' : c.a === 1 ? `#${c.hex.toLowerCase()}` : `rgb(${c.r} ${c.g} ${c.b} / ${c.a})`; },
  dimension: (v) => (isDim(v) ? `${v.value}${v.unit}` : v),
  duration: (v) => (isDim(v) ? `${ms(v)}ms` : v),
  cubicBezier: (v) => (Array.isArray(v) ? `cubic-bezier(${v.join(', ')})` : v),
  fontWeight: (v) => (typeof v === 'number' ? String(v) : v),
  fontFamily: (v) => (Array.isArray(v) ? v.map((f, i) => (i === 0 || /\s/.test(f) ? `'${f}'` : f)).join(', ') : v),
  shadow: (v) => (isObj(v) ? [v.offsetX, v.offsetY, v.blur, ...(v.spread && css.dimension(v.spread) !== '0px' ? [v.spread] : [])].map(css.dimension).concat(css.color(v.color)).join(' ') : v),
  spring: (v) => (isObj(v) ? springLinear({ ...v, duration: ms(v.duration) }) : v),
  typography: (v) => (isObj(v) ? `${v.fontWeight} ${css.dimension(v.fontSize)}/${lineHeightPx(v)}px ${css.fontFamily(v.fontFamily)}` : v),
};
const lineHeightPx = (v) => Math.round((isDim(v.fontSize) ? v.fontSize.value : parseFloat(v.fontSize)) * v.lineHeight);

/** Swift: цвет → "0xRRGGBB, alpha: A" (аргументы UIColor(hex:)), размеры → pt (CGFloat), время → секунды. */
const swift = {
  color: (v) => { if (!isColor(v)) return v; const c = rgba(v); return `0x${c.hex}, alpha: ${num(c.a)}`; },
  dimension: (v) => (isDim(v) ? num(v.value) : v),
  duration: (v) => (isDim(v) ? num(ms(v) / 1000) : v),
  cubicBezier: (v) => (Array.isArray(v) ? v.join(', ') : v),
  fontWeight: (v) => (typeof v === 'number' ? num(v) : v), // вес CSS как CGFloat: YeetTextStyle.withWeight(_:) / Font.Weight(css:)
  shadow: (v) => (isObj(v) ? { color: swift.color(v.color), x: v.offsetX.value, y: v.offsetY.value, blur: v.blur.value } : v),
  spring: (v) => (isObj(v) && isDim(v.duration) ? { ...v, duration: ms(v.duration) / 1000 } : v),
  typography: (v) => (isObj(v) && isDim(v.fontSize) ? { weight: v.fontWeight, size: v.fontSize.value, lineHeight: lineHeightPx(v), tracking: v.letterSpacing.value } : v),
};

/** Kotlin: цвет → Color(0xAARRGGBB), размеры → dp, шрифт → sp, время → мс. */
const kotlin = {
  color: (v) => { if (!isColor(v)) return v; const c = rgba(v); return c.a === 0 ? 'Color.Transparent' : `Color(0x${Math.round(c.a * 255).toString(16).padStart(2, '0').toUpperCase()}${c.hex})`; },
  dimension: (v) => (isDim(v) ? `${v.value}.dp` : v),
  duration: (v) => (isDim(v) ? ms(v) : v),
  fontWeight: (v) => (typeof v === 'number' ? `FontWeight(${v})` : v),
  cubicBezier: (v) => (Array.isArray(v) ? `CubicBezierEasing(${v.map((x) => num(x) + 'f').join(', ')})` : v),
  shadow: (v) => (isObj(v) ? { color: kotlin.color(v.color), x: v.offsetX.value, y: v.offsetY.value, blur: v.blur.value } : v),
  spring: (v) => (isObj(v) && 'mass' in v ? { dampingRatio: `${num(dampingRatio(v))}f`, stiffness: `${v.stiffness}f` } : v),
  typography: (v) => (isObj(v) && isDim(v.fontSize) ? { weight: `FontWeight(${v.fontWeight})`, size: `${v.fontSize.value}.sp`, lineHeight: `${lineHeightPx(v)}.sp`, tracking: `(${v.letterSpacing.value}).sp` } : v),
};

/* ─── Имена ───────────────────────────────────────────────────────────── */

/** CSS-переменная (без "--") по пути токена. Двойники тем `mode.<тема>.*` получают имя с префиксом контекста. */
export function cssName(path) {
  if (path[0] === 'mode') return `${path[1]}:${cssName(path.slice(2))}`;
  const [g, ...rest] = path, k = path.at(-1);
  switch (g) {
    case 'primitive': return `yeet-${k}`;
    case 'item': return `yeet-item-${k}`;
    case 'on-item': return `yeet-on-item-${k}`;
    case 'color': return `color-${k}`;
    case 'component': return k;
    case 'layout': return k;
    case 'motion': return { duration: `motion-${k}`, easing: `ease-${k}`, spring: `spring-${k}`, transition: `motion-${k}`, gesture: `gesture-${k}`, haptic: `haptic-${k}` }[rest[0]];
    default: return path.join('-');
  }
}

const name = (fn) => (token) => fn(token.path);
// Swift/Kotlin: имя не может начинаться с цифры — radius.8 → r8 (как YeetSpace.s32).
const leaf = (p) => (/^\d/.test(p.at(-1)) ? `${p[0][0]}${p.at(-1)}` : camel(p.at(-1)));
const value = (platform, type) => ({
  type: 'value', transitive: true,
  filter: (token) => token.$type === type,
  transform: (token) => platform[type](token.$value),
});

/** Регистрирует трансформы и группы `yeet/css`, `yeet/swift`, `yeet/kotlin`. */
export function registerTransforms(StyleDictionary) {
  const groups = {};
  for (const [id, platform] of Object.entries({ css, swift, kotlin })) {
    const names = [];
    for (const type of Object.keys(platform)) {
      const n = `yeet/${id}/${type}`;
      StyleDictionary.registerTransform({ name: n, ...value(platform, type) });
      names.push(n);
    }
    groups[id] = names;
  }
  StyleDictionary.registerTransform({ name: 'yeet/name/css', type: 'name', transform: name(cssName) });
  StyleDictionary.registerTransform({ name: 'yeet/name/swift', type: 'name', transform: name((p) => swiftName(leaf(p))) });
  StyleDictionary.registerTransform({ name: 'yeet/name/kotlin', type: 'name', transform: name((p) => kotlinName(leaf(p))) });
  StyleDictionary.registerTransformGroup({ name: 'yeet/css', transforms: ['yeet/name/css', ...groups.css] });
  StyleDictionary.registerTransformGroup({ name: 'yeet/swift', transforms: ['yeet/name/swift', ...groups.swift] });
  StyleDictionary.registerTransformGroup({ name: 'yeet/kotlin', transforms: ['yeet/name/kotlin', ...groups.kotlin] });
}
