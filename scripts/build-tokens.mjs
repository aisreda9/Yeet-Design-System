// Генератор токенов: tokens/tokens.json → CSS (Storybook), Swift (iOS), Kotlin (Android).
// Запуск: npm run tokens. Сгенерированные файлы не правятся руками.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const t = JSON.parse(readFileSync(new URL('tokens/tokens.json', root), 'utf8'));
const HEADER = 'Сгенерировано scripts/build-tokens.mjs из tokens/tokens.json — не редактировать вручную.';

/* ─── Разбор значений ─────────────────────────────────────────────────── */

const colors = Object.fromEntries(Object.values(t.color).flatMap((g) => Object.entries(g)));

/** Ссылка "{group.name}" → конечное значение для темы. */
function resolve(ref, theme) {
  const m = /^\{(\w+)\.([\w-]+)\}$/.exec(ref);
  if (!m) return ref;
  const [, group, name] = m;
  if (group === 'primitive') return t.primitive[name];
  if (group === 'color') return resolve(colors[name][theme], theme);
  if (group === 'radius') return t.radius[name].value;
  throw new Error(`Unknown reference ${ref}`);
}

/** "#RRGGBB@0.4" → { r, g, b, a } */
function rgba(value) {
  const [hex, alpha] = value.split('@');
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: alpha === undefined ? 1 : Number(alpha), hex: hex.slice(1).toUpperCase() };
}
const cssColor = (v) => { const c = rgba(v); return c.a === 1 ? `#${c.hex.toLowerCase()}` : `rgb(${c.r} ${c.g} ${c.b} / ${c.a})`; };
const camel = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
/** Имена токенов, совпадающие с ключевыми словами языка, оборачиваются в обратные кавычки. */
const swiftKeywords = new Set(['associatedtype', 'as', 'break', 'case', 'catch', 'class', 'continue', 'default', 'defer', 'deinit', 'do', 'else', 'enum', 'extension', 'fallthrough', 'false', 'fileprivate', 'for', 'func', 'guard', 'if', 'import', 'in', 'init', 'inout', 'internal', 'is', 'let', 'nil', 'open', 'operator', 'precedencegroup', 'private', 'protocol', 'public', 'repeat', 'rethrows', 'return', 'self', 'Self', 'static', 'struct', 'subscript', 'super', 'switch', 'throw', 'throws', 'true', 'try', 'typealias', 'var', 'where', 'while']);
const kotlinKeywords = new Set(['as', 'break', 'class', 'continue', 'do', 'else', 'false', 'for', 'fun', 'if', 'in', 'interface', 'is', 'null', 'object', 'package', 'return', 'super', 'this', 'throw', 'true', 'try', 'typealias', 'typeof', 'val', 'var', 'when', 'while']);
const swiftId = (s) => (swiftKeywords.has(s) ? `\`${s}\`` : s);
const kotlinId = (s) => (kotlinKeywords.has(s) ? `\`${s}\`` : s);
const num = (x) => (Number.isInteger(x) ? String(x) : String(+x.toFixed(4)));

/** Пружина (mass, stiffness, damping) → CSS linear() по 37 точкам за её длительность. */
function springLinear({ mass, stiffness, damping, duration }) {
  const w0 = Math.sqrt(stiffness / mass), z = damping / (2 * Math.sqrt(stiffness * mass)), wd = w0 * Math.sqrt(1 - z * z);
  const pts = Array.from({ length: 37 }, (_, i) => {
    const s = ((i / 36) * duration) / 1000;
    return 1 - Math.exp(-z * w0 * s) * (Math.cos(wd * s) + ((z * w0) / wd) * Math.sin(wd * s));
  });
  pts[0] = 0; pts[36] = 1;
  return `linear(${pts.map((p) => +p.toFixed(3)).join(', ')})`;
}
const dampingRatio = ({ mass, stiffness, damping }) => damping / (2 * Math.sqrt(stiffness * mass));

/* ─── CSS ─────────────────────────────────────────────────────────────── */

function css() {
  const L = [`/* ${HEADER} */`, ''];
  for (const f of Object.values(t.font))
    L.push(`@font-face { font-family: '${f.family}'; src: url('../../tokens/fonts/${f.file.replace(/\.ttf$/, '.woff2')}') format('woff2'), url('../../tokens/fonts/${f.file}') format('truetype'); font-weight: 100 900; font-style: normal; font-display: swap; }`);
  L.push('', ':root {');
  for (const [k, v] of Object.entries(t.primitive)) L.push(`  --yeet-${k}: ${cssColor(v)};`);
  for (const [k, v] of Object.entries(t.item)) L.push(`  --yeet-item-${k}: ${cssColor(v.value)};`);
  L.push('');
  for (const s of t.space) L.push(`  --space-${s}: ${s}px;`);
  for (const [k, v] of Object.entries(t.radius)) L.push(`  --radius-${k}: ${v.value}px;`);
  L.push('');
  for (const [k, f] of Object.entries(t.font)) L.push(`  --font-${k}: '${f.family}', ${f.fallback};`);
  for (const [k, s] of Object.entries(t.typography)) L.push(`  --font-weight-${k}: ${s.weight};`);
  L.push(`  --screen-width: ${t.layout['screen-width']}px;`, `  --screen-height: ${t.layout['screen-height']}px;`, `  --screen-gutter: var(--space-${t.layout['screen-gutter']});`, `  --status-bar-height: ${t.layout['status-bar-height']}px;`, '');
  const m = t.motion;
  const durVar = { fast: '--motion-fast', base: '--motion-base', 300: '--motion-300' };
  for (const [k, v] of Object.entries(m.duration)) L.push(`  ${durVar[k]}: ${v}ms;`);
  for (const [k, v] of Object.entries(m.easing)) L.push(`  --ease-${k}: cubic-bezier(${v.join(', ')});`);
  for (const [k, s] of Object.entries(m.spring)) L.push(`  --spring-${k}: ${springLinear(s)};`, `  --spring-${k}-duration: ${s.duration}ms;`);
  for (const [k, tr] of Object.entries(m.transition))
    L.push(`  --motion-${k}: ${tr.spring ? `var(--spring-${tr.spring}-duration) var(--spring-${tr.spring})` : `var(${durVar[tr.duration]}) var(--ease-${tr.easing})`}; /* ${tr.use} */`);
  for (const [k, g] of Object.entries(m.gesture)) L.push(`  --gesture-${k}: ${g.value}${g.unit === 'ms' || g.unit === 'px' ? g.unit : ''}; /* ${g.use} */`);
  L.push('}', '', '@media (prefers-reduced-motion: reduce) {', '  :root {');
  L.push('    ' + Object.keys(m.transition).map((k) => `--motion-${k}: 1ms linear;`).join(' '));
  L.push('    --gesture-lift-scale: 1; --gesture-target-scale: 1;');
  L.push('  }', '}', '');
  for (const theme of ['light', 'dark']) {
    L.push(theme === 'light' ? ":root,\n[data-theme='light'] {" : "[data-theme='dark'] {", `  color-scheme: ${theme};`);
    for (const [k, v] of Object.entries(colors)) {
      const prim = /^\{primitive\.([\w-]+)\}$/.exec(v[theme]);
      L.push(`  --color-${k}: ${prim ? `var(--yeet-${prim[1]})` : cssColor(resolve(v[theme], theme))}; /* ${v.figma} */`);
    }
    for (const [k, s] of Object.entries(t.shadow)) { const x = s[theme]; L.push(`  --shadow-${k}: ${x.x}px ${x.y}px ${x.blur}px ${cssColor(x.color)};`); }
    L.push('}', '');
  }
  // Бренд-варианты: переопределяют семантические цвета поверх темы (data-brand на <html> или на обёртке)
  for (const [id, b] of Object.entries(t.brand ?? {}))
    for (const theme of ['light', 'dark']) {
      L.push(`/* Бренд «${b.name}»: ${theme} */`, theme === 'light' ? `[data-brand='${id}']:not([data-theme='dark']) {` : `[data-brand='${id}'][data-theme='dark'] {`);
      for (const [k, v] of Object.entries(b[theme])) L.push(`  --color-${k}: ${cssColor(v)};`);
      L.push('}', '');
    }
  // Компонентные токены пересчитываются там, где меняется тема или бренд, а не только на :root
  L.push(':root,\n[data-theme],\n[data-brand] {');
  for (const [k, v] of Object.entries(t.component)) {
    const m2 = /^\{(\w+)\.([\w-]+)\}$/.exec(v);
    L.push(`  --${k}: ${m2 ? `var(--${m2[1] === 'radius' ? 'radius' : 'color'}-${m2[2]})` : v};`);
  }
  L.push('}', '');
  for (const [k, s] of Object.entries(t.typography))
    L.push(`.y-${k} { font: ${s.weight} ${s.size}px/${s.lineHeight}px var(--font-${s.font}); letter-spacing: ${s.letterSpacing}px; margin: 0; }`);
  return L.join('\n') + '\n';
}

/* ─── Swift (SwiftUI) ─────────────────────────────────────────────────── */

function swift() {
  const hexA = (v) => { const c = rgba(v); return `0x${c.hex}, alpha: ${num(c.a)}`; };
  const L = [`// ${HEADER}`, '// SwiftUI. Цвета меняются со светлой / тёмной темой системы автоматически.', `// Шрифты: добавьте в проект tokens/fonts/${Object.values(t.font).map((f) => f.file).join(', ')} и перечислите их в Info.plist → UIAppFonts.`, '', 'import SwiftUI', 'import UIKit', ''];
  L.push('private extension UIColor {', '    convenience init(hex: UInt32, alpha: CGFloat = 1) {', '        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: alpha)', '    }', '}', '');
  L.push('private func dynamic(_ light: UIColor, _ dark: UIColor) -> Color {', '    Color(UIColor { $0.userInterfaceStyle == .dark ? dark : light })', '}', '');
  L.push('public enum YeetColor {');
  for (const [group, entries] of Object.entries(t.color)) {
    L.push(`    // ${group}`);
    for (const [k, v] of Object.entries(entries))
      L.push(`    /// ${v.role} · Figma ${v.figma}`, `    public static let ${swiftId(camel(k))} = dynamic(UIColor(hex: ${hexA(resolve(v.light, 'light'))}), UIColor(hex: ${hexA(resolve(v.dark, 'dark'))}))`);
  }
  L.push('}', '', '/// Цвет вещи — атрибут одежды, не интерфейс.', 'public enum YeetItemColor: String, CaseIterable {');
  for (const k of Object.keys(t.item)) L.push(`    case ${swiftId(k)}`);
  L.push('    public var color: Color {', '        switch self {');
  for (const [k, v] of Object.entries(t.item)) L.push(`        case .${k}: return Color(UIColor(hex: ${hexA(v.value)}))`);
  L.push('        }', '    }', '    public var title: String {', '        switch self {');
  for (const [k, v] of Object.entries(t.item)) L.push(`        case .${k}: return "${v.name}"`);
  L.push('        }', '    }', '}', '');
  L.push('public enum YeetSpace {');
  for (const s of t.space) L.push(`    public static let s${s}: CGFloat = ${s}`);
  L.push(`    public static let screenGutter: CGFloat = ${t.layout['screen-gutter']}`, '}', '', 'public enum YeetRadius {');
  for (const [k, v] of Object.entries(t.radius)) L.push(`    /// ${v.use}`, `    public static let ${swiftId(k)}: CGFloat = ${v.value}`);
  L.push('}', '');
  L.push('public struct YeetTextStyle {', '    public let font: Font', '    public let lineHeight: CGFloat', '    public let tracking: CGFloat', '    public let size: CGFloat', '}', '', 'public enum YeetType {');
  for (const [k, s] of Object.entries(t.typography)) {
    const f = t.font[s.font];
    L.push(`    /// ${s.use}`, `    public static let ${swiftId(k)} = YeetTextStyle(font: .custom("${f.family}", size: ${s.size}).weight(Font.Weight(${s.weight})), lineHeight: ${s.lineHeight}, tracking: ${s.letterSpacing}, size: ${s.size})`);
  }
  L.push('}', '', 'private extension Font.Weight {', '    init(_ css: Int) {', '        switch css {', '        case ..<350: self = .light', '        case ..<450: self = .regular', '        case ..<550: self = .medium', '        default: self = .semibold', '        }', '    }', '}', '');
  L.push('public extension View {', '    /// Применяет текстовый стиль: шрифт, межстрочный интервал и трекинг.', '    func yeetText(_ style: YeetTextStyle) -> some View {', '        font(style.font).lineSpacing(style.lineHeight - style.size).tracking(style.tracking)', '    }', '}', '');
  L.push('public enum YeetMotion {');
  for (const [k, tr] of Object.entries(t.motion.transition)) {
    if (tr.spring) { const s = t.motion.spring[tr.spring]; L.push(`    /// ${tr.use} · Figma Smart Animate ${s.figma}`, `    public static let ${swiftId(k)} = Animation.interpolatingSpring(mass: ${s.mass}, stiffness: ${s.stiffness}, damping: ${s.damping})`); }
    else { const e = t.motion.easing[tr.easing], d = t.motion.duration[tr.duration]; L.push(`    /// ${tr.use}`, `    public static let ${swiftId(k)} = Animation.timingCurve(${e.join(', ')}, duration: ${d / 1000})`); }
  }
  L.push('}', '', '/// Параметры жестов и микро-анимаций (Storybook → Foundations/Анимации → Микро-анимации).', 'public enum YeetGesture {');
  for (const [k, g] of Object.entries(t.motion.gesture))
    L.push(`    /// ${g.use}`, g.unit === 'ms' ? `    public static let ${swiftId(camel(k))}: TimeInterval = ${g.value / 1000}` : `    public static let ${swiftId(camel(k))}: CGFloat = ${g.value}`);
  L.push('}', '', '/// Хаптика: вызывать при смене состояния, не на каждое касание. Для подъёма вызывать prepare() на touch-down.', 'public enum YeetHaptic {');
  for (const [k, h] of Object.entries(t.motion.haptic)) {
    const [kind, style] = h.ios.split(':');
    const call = kind === 'selection' ? 'UISelectionFeedbackGenerator().selectionChanged()' : kind === 'impact' ? `UIImpactFeedbackGenerator(style: .${style}).impactOccurred()` : `UINotificationFeedbackGenerator().notificationOccurred(.${style})`;
    L.push(`    /// ${h.when}. ${h.use}`, `    public static func ${swiftId(k)}() { ${call} }`);
  }
  L.push('}', '');
  const sh = t.shadow.floating;
  L.push('public extension View {', `    /// ${sh.use}`, '    func yeetFloatingShadow() -> some View {', `        shadow(color: dynamic(UIColor(hex: ${hexA(sh.light.color)}), UIColor(hex: ${hexA(sh.dark.color)})), radius: ${sh.light.blur / 2}, x: ${sh.light.x}, y: ${sh.light.y})`, '    }', '}');
  return L.join('\n') + '\n';
}

/* ─── Kotlin (Jetpack Compose) ────────────────────────────────────────── */

function kotlin() {
  const argb = (v) => { const c = rgba(v); return `Color(0x${Math.round(c.a * 255).toString(16).padStart(2, '0').toUpperCase()}${c.hex})`; };
  const names = Object.keys(colors).map((k) => kotlinId(camel(k)));
  const L = [`// ${HEADER}`, '// Jetpack Compose. Схемы light / dark — выбирать по isSystemInDarkTheme().', '', 'package design.yeet.tokens', '',
    'import androidx.compose.animation.core.CubicBezierEasing', 'import androidx.compose.animation.core.FiniteAnimationSpec', 'import androidx.compose.animation.core.spring', 'import androidx.compose.animation.core.tween',
    'import android.os.Build', 'import android.view.HapticFeedbackConstants', 'import android.view.View',
    'import androidx.annotation.FontRes', 'import androidx.compose.ui.graphics.Color', 'import androidx.compose.ui.text.ExperimentalTextApi', 'import androidx.compose.ui.text.TextStyle', 'import androidx.compose.ui.text.font.Font', 'import androidx.compose.ui.text.font.FontFamily', 'import androidx.compose.ui.text.font.FontVariation', 'import androidx.compose.ui.text.font.FontWeight', 'import androidx.compose.ui.unit.dp', 'import androidx.compose.ui.unit.sp', ''];
  L.push('data class YeetColorScheme(');
  for (const [group, entries] of Object.entries(t.color)) { L.push(`    // ${group}`); for (const [k, v] of Object.entries(entries)) L.push(`    /** ${v.role} · Figma ${v.figma} */`, `    val ${kotlinId(camel(k))}: Color,`); }
  L.push(')', '');
  for (const theme of ['light', 'dark']) {
    L.push(`val Yeet${theme === 'light' ? 'Light' : 'Dark'}Colors = YeetColorScheme(`);
    Object.entries(colors).forEach(([k, v], i) => L.push(`    ${names[i]} = ${argb(resolve(v[theme], theme))},`));
    L.push(')', '');
  }
  L.push('/** Цвет вещи — атрибут одежды, не интерфейс. */', 'enum class YeetItemColor(val color: Color, val title: String) {');
  Object.entries(t.item).forEach(([k, v]) => L.push(`    ${k.toUpperCase()}(${argb(v.value)}, "${v.name}"),`));
  L.push('}', '', 'object YeetSpace {');
  for (const s of t.space) L.push(`    val s${s} = ${s}.dp`);
  L.push(`    val screenGutter = ${t.layout['screen-gutter']}.dp`, '}', '', 'object YeetRadius {');
  for (const [k, v] of Object.entries(t.radius)) L.push(`    /** ${v.use} */`, `    val ${kotlinId(k)} = ${v.value}.dp`);
  L.push('}', '');
  L.push('/** Семейство из переменного шрифта (Google Fonts): по одному Font на каждый нужный вес. */', '@OptIn(ExperimentalTextApi::class)', 'fun yeetFontFamily(@FontRes res: Int, vararg weights: Int) = FontFamily(', '    weights.map { Font(res, FontWeight(it), variationSettings = FontVariation.Settings(FontVariation.weight(it))) }', ')', '');
  const fontRes = Object.values(t.font).map((f) => `res/font/${f.android}.ttf ← tokens/fonts/${f.file}`).join(', ');
  L.push(`/** Шрифты: ${fontRes}. */`, 'class YeetTypography(display: FontFamily, text: FontFamily) {');
  for (const [k, s] of Object.entries(t.typography))
    L.push(`    /** ${s.use} */`, `    val ${kotlinId(k)} = TextStyle(fontFamily = ${s.font}, fontWeight = FontWeight(${s.weight}), fontSize = ${s.size}.sp, lineHeight = ${s.lineHeight}.sp, letterSpacing = (${s.letterSpacing}).sp)`);
  L.push('', '    companion object {', '        /** YeetTypography.fromResources(R.font.' + t.font.display.android + ', R.font.' + t.font.text.android + ') */', '        fun fromResources(@FontRes display: Int, @FontRes text: Int) = YeetTypography(', `            display = yeetFontFamily(display, ${t.font.display.weights.join(', ')}),`, `            text = yeetFontFamily(text, ${t.font.text.weights.join(', ')}),`, '        )', '    }');
  L.push('}', '', 'object YeetMotion {');
  for (const [k, tr] of Object.entries(t.motion.transition)) {
    if (tr.spring) { const s = t.motion.spring[tr.spring]; L.push(`    /** ${tr.use} · Figma Smart Animate ${s.figma} */`, `    fun <T> ${kotlinId(k)}(): FiniteAnimationSpec<T> = spring(dampingRatio = ${num(dampingRatio(s))}f, stiffness = ${s.stiffness}f)`); }
    else { const e = t.motion.easing[tr.easing], d = t.motion.duration[tr.duration]; L.push(`    /** ${tr.use} */`, `    fun <T> ${kotlinId(k)}(): FiniteAnimationSpec<T> = tween(durationMillis = ${d}, easing = CubicBezierEasing(${e.map((x) => num(x) + 'f').join(', ')}))`); }
  }
  L.push('}', '', '/** Параметры жестов и микро-анимаций (Storybook → Foundations/Анимации → Микро-анимации). */', 'object YeetGesture {');
  for (const [k, g] of Object.entries(t.motion.gesture)) {
    const name = camel(k);
    L.push(`    /** ${g.use}${g.unit === 'px/s' ? ' (dp/с)' : ''} */`, g.unit === 'ms' ? `    const val ${kotlinId(name + 'Millis')} = ${g.value}L` : g.unit === 'px' ? `    val ${kotlinId(name)} = ${g.value}.dp` : `    const val ${kotlinId(name)} = ${g.value}f`);
  }
  L.push('}', '', '/** Хаптика: вызывать при смене состояния, не на каждое касание. view.yeetHaptic(YeetHaptic.drop); в Compose — LocalView.current. */', 'object YeetHaptic {');
  for (const [k, h] of Object.entries(t.motion.haptic)) {
    const c = (n) => `HapticFeedbackConstants.${n}`;
    L.push(`    /** ${h.when}. ${h.use} */`, h.androidMin ? `    val ${kotlinId(k)}: Int get() = if (Build.VERSION.SDK_INT >= ${h.androidMin}) ${c(h.android)} else ${c(h.androidFallback)}` : `    val ${kotlinId(k)}: Int get() = ${c(h.android)}`);
  }
  L.push('}', '', 'fun View.yeetHaptic(type: Int): Boolean = performHapticFeedback(type)', '');
  const sh = t.shadow.floating;
  L.push(`/** ${sh.use}: y ${sh.light.y}, blur ${sh.light.blur}. В Compose — Modifier.shadow(elevation = ${sh.light.blur / 4}.dp, shape, ambientColor / spotColor = цвет ниже). */`, 'object YeetShadow {', `    val floatingLight = ${argb(sh.light.color)}`, `    val floatingDark = ${argb(sh.dark.color)}`, `    val floatingElevation = ${sh.light.blur / 4}.dp`, '}');
  return L.join('\n') + '\n';
}

/* ─── Запись ──────────────────────────────────────────────────────────── */

const out = {
  'src/tokens/tokens.generated.css': css(),
  'tokens/ios/YeetTokens.swift': swift(),
  'tokens/android/YeetTokens.kt': kotlin(),
};
for (const [path, body] of Object.entries(out)) {
  const url = new URL(path, root);
  mkdirSync(new URL('.', url), { recursive: true });
  writeFileSync(url, body);
  console.log(`✓ ${path}`);
}
