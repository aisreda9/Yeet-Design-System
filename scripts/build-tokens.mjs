// Генератор токенов: tokens/tokens.json → CSS (Storybook), Swift (iOS), Kotlin (Android).
// Плюс Android-модуль native/android: токены, иконки (ImageVector) и шрифты res/font — см. scripts/android.mjs.
// Запуск: npm run tokens. Сгенерированные файлы не правятся руками.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { buildIosPackage } from './build-ios.mjs';
import { ANDROID_MODULE, androidOutputs, copyAndroidFonts } from './android.mjs';

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
/** "{primitive.x}" → "var(--yeet-x)", иначе undefined. */
const primVar = (v) => { const m = /^\{primitive\.([\w-]+)\}$/.exec(v); return m ? `var(--yeet-${m[1]})` : undefined; };
const cssColor = (v) => { const c = rgba(v); return c.a === 1 ? `#${c.hex.toLowerCase()}` : `rgb(${c.r} ${c.g} ${c.b} / ${c.a})`; };
const camel = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const num = (x) => (Number.isInteger(x) ? String(x) : String(+x.toFixed(4)));
/** Имена токенов, совпадающие с ключевыми словами Swift, пишутся в обратных кавычках (`return`). */
const swiftKeywords = new Set(['return', 'default', 'case', 'switch', 'class', 'struct', 'enum', 'func', 'var', 'let', 'in', 'is', 'as', 'if', 'else', 'for', 'while', 'repeat', 'do', 'try', 'throw', 'import', 'init', 'self', 'super', 'protocol', 'extension', 'operator', 'where', 'guard', 'defer', 'break', 'continue', 'fallthrough', 'static', 'public', 'private', 'internal', 'true', 'false', 'nil']);

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
  for (const [k, v] of Object.entries(t.item)) L.push(`  --yeet-item-${k}: ${primVar(v.value) ?? cssColor(v.value)};`, `  --yeet-on-item-${k}: ${cssColor(v.on)}; /* буква / иконка на этом цвете */`);
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
      L.push(`  --color-${k}: ${primVar(v[theme]) ?? cssColor(resolve(v[theme], theme))}; /* ${v.figma} */`);
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
    L.push(`.y-${k} { font: var(--font-weight-${k}) ${s.size}px/${s.lineHeight}px var(--font-${s.font}); letter-spacing: ${s.letterSpacing}px; margin: 0; }`);
  return L.join('\n') + '\n';
}

/* ─── Swift (SwiftUI) ─────────────────────────────────────────────────── */

/** Font.TextStyle, по кривой которого масштабируется стиль при Dynamic Type. */
const iosTextStyle = { h1: 'largeTitle', h2: 'title', h3: 'title3', body: 'body', caption: 'caption' };

/**
 * `bundle` — откуда регистрировать шрифты: `main` для копии tokens/ios (файлы добавлены в приложение),
 * `module` для Swift Package native/ios (шрифты лежат в ресурсах пакета).
 */
function swift({ bundle = 'main' } = {}) {
  const hexA = (v) => { const c = rgba(v); return `0x${c.hex}, alpha: ${num(c.a)}`; };
  const fontFiles = Object.values(t.font).map((f) => f.file);
  const L = [`// ${HEADER}`, '// SwiftUI. Цвета меняются со светлой / тёмной темой системы автоматически (UIColor с dynamicProvider, без asset-каталога).'];
  L.push(bundle === 'module'
    ? '// Шрифты лежат в ресурсах пакета YeetDesignSystem и регистрируются при первом использовании (YeetFonts.register()).'
    : `// Шрифты: добавьте в приложение tokens/fonts/${fontFiles.join(', ')} — они регистрируются из Bundle.main при первом использовании (или перечислите их в Info.plist → UIAppFonts).`);
  L.push('', 'import CoreText', 'import SwiftUI', 'import UIKit', '');
  L.push('private extension UIColor {', '    convenience init(hex: UInt32, alpha: CGFloat = 1) {', '        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: alpha)', '    }', '}', '');
  L.push('private func dynamic(_ light: UIColor, _ dark: UIColor) -> Color {', '    Color(UIColor { $0.userInterfaceStyle == .dark ? dark : light })', '}', '');

  L.push('/// Примитивы палитры. В компонентах не используются — только через семантические `YeetColor`.', 'public enum YeetPrimitive {');
  for (const [k, v] of Object.entries(t.primitive)) L.push(`    public static let ${camel(k)} = Color(UIColor(hex: ${hexA(v)}))`);
  L.push('}', '');

  L.push('public enum YeetColor {');
  for (const [group, entries] of Object.entries(t.color)) {
    L.push(`    // ${group}`);
    for (const [k, v] of Object.entries(entries))
      L.push(`    /// ${v.role} · Figma ${v.figma}`, `    public static let ${camel(k)} = dynamic(UIColor(hex: ${hexA(resolve(v.light, 'light'))}), UIColor(hex: ${hexA(resolve(v.dark, 'dark'))}))`);
  }
  L.push('}', '', '/// Цвет вещи — атрибут одежды, не интерфейс.', 'public enum YeetItemColor: String, CaseIterable, Identifiable {');
  for (const k of Object.keys(t.item)) L.push(`    case ${k}`);
  L.push('    public var id: String { rawValue }', '    public var color: Color {', '        switch self {');
  for (const [k, v] of Object.entries(t.item)) L.push(`        case .${k}: return Color(UIColor(hex: ${hexA(resolve(v.value))}))`);
  L.push('        }', '    }', '    /// Цвет буквы / иконки на этом цвете (контраст ≥ 4.5 : 1).', '    public var onColor: Color {', '        switch self {');
  for (const [k, v] of Object.entries(t.item)) L.push(`        case .${k}: return Color(UIColor(hex: ${hexA(v.on)}))`);
  L.push('        }', '    }', '    public var title: String {', '        switch self {');
  for (const [k, v] of Object.entries(t.item)) L.push(`        case .${k}: return "${v.name}"`);
  L.push('        }', '    }', '}', '');

  L.push('/// Компонентные токены: ссылки на семантические цвета и радиусы (tokens.json → component).', 'public enum YeetComponent {');
  for (const [k, v] of Object.entries(t.component)) {
    const m = /^\{(\w+)\.([\w-]+)\}$/.exec(v);
    if (v === 'transparent') L.push(`    public static let ${camel(k)}: Color = .clear`);
    else if (m?.[1] === 'color') L.push(`    public static let ${camel(k)}: Color = YeetColor.${camel(m[2])}`);
    else if (m?.[1] === 'radius') L.push(`    public static let ${camel(k)}: CGFloat = YeetRadius.${m[2]}`);
    else throw new Error(`Unsupported component token ${k}: ${v}`);
  }
  L.push('}', '');

  L.push('public enum YeetSpace {');
  for (const s of t.space) L.push(`    public static let s${s}: CGFloat = ${s}`);
  L.push(`    public static let screenGutter: CGFloat = ${t.layout['screen-gutter']}`, '}', '', 'public enum YeetRadius {');
  for (const [k, v] of Object.entries(t.radius)) L.push(`    /// ${v.use}`, `    public static let ${k}: CGFloat = ${v.value}`);
  L.push('}', '', '/// Макет: iPhone 393 × 852, поля 20.', 'public enum YeetLayout {');
  for (const [k, v] of Object.entries(t.layout)) L.push(`    public static let ${camel(k)}: CGFloat = ${v}`);
  L.push('}', '');

  // Шрифты
  L.push('/// Семейства и регистрация переменных шрифтов (Inter, Roboto Slab).', 'public enum YeetFonts {');
  for (const [k, f] of Object.entries(t.font)) L.push(`    /// ${f.source}`, `    public static let ${k} = "${f.family}"`);
  L.push(`    private static let files = [${fontFiles.map((f) => `"${f.replace(/\.ttf$/, '')}"`).join(', ')}]`);
  L.push(`    private static var bundle: Bundle { .${bundle} }`);
  L.push('    private static let registration: Void = {', '        for name in files {', '            guard let url = bundle.url(forResource: name, withExtension: "ttf") ?? bundle.url(forResource: name, withExtension: "ttf", subdirectory: "Fonts") else { continue }', '            // Уже зарегистрирован (UIAppFonts) — ошибка игнорируется.', '            _ = CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)', '        }', '    }()');
  L.push('    /// Регистрирует шрифты один раз за процесс. Вызывается автоматически из `yeetText` и `YeetTextStyle.font`.', '    public static func register() { _ = registration }', '}', '');

  // Типографика
  L.push('/// Текстовый стиль. `weight` — значение оси wght переменного шрифта (как font-weight в CSS).', 'public struct YeetTextStyle {',
    '    public let family: String', '    public let size: CGFloat', '    public let lineHeight: CGFloat', '    public let tracking: CGFloat', '    public let weight: CGFloat', '    /// Кривая Dynamic Type, по которой масштабируется стиль.', '    public let textStyle: Font.TextStyle', '',
    '    public init(family: String, size: CGFloat, lineHeight: CGFloat, tracking: CGFloat, weight: CGFloat, textStyle: Font.TextStyle) {',
    '        self.family = family', '        self.size = size', '        self.lineHeight = lineHeight', '        self.tracking = tracking', '        self.weight = weight', '        self.textStyle = textStyle', '    }', '',
    '    /// Тот же стиль с другим весом (например, Caption 460 в карточке погоды).', '    public func withWeight(_ weight: CGFloat) -> YeetTextStyle {', '        YeetTextStyle(family: family, size: size, lineHeight: lineHeight, tracking: tracking, weight: weight, textStyle: textStyle)', '    }', '',
    '    /// SwiftUI-шрифт с Dynamic Type; вес округлён до ближайшего системного. Точный вес и межстрочный интервал — `yeetText(_:)`.', '    public var font: Font {', '        YeetFonts.register()', '        return .custom(family, size: size, relativeTo: textStyle).weight(Font.Weight(css: weight))', '    }', '',
    '    /// UIFont с точным значением оси wght.', '    public func uiFont(size pointSize: CGFloat? = nil) -> UIFont {', '        YeetFonts.register()',
    "        let wght = NSNumber(value: 0x7767_6874 as UInt32) // 'wght'",
    '        let variation = UIFontDescriptor.AttributeName(rawValue: kCTFontVariationAttribute as String)',
    '        let descriptor = UIFontDescriptor(fontAttributes: [.family: family, variation: [wght: weight] as [NSNumber: CGFloat]])',
    '        return UIFont(descriptor: descriptor, size: pointSize ?? size)', '    }', '}', '');
  L.push('public enum YeetType {');
  for (const [k, s] of Object.entries(t.typography)) {
    const f = t.font[s.font];
    L.push(`    /// ${s.use}`, `    public static let ${k} = YeetTextStyle(family: "${f.family}", size: ${s.size}, lineHeight: ${s.lineHeight}, tracking: ${s.letterSpacing}, weight: ${s.weight}, textStyle: .${iosTextStyle[k] ?? 'body'})`);
  }
  L.push('}', '', 'extension Font.Weight {', '    init(css: CGFloat) {', '        switch css {', '        case ..<350: self = .light', '        case ..<450: self = .regular', '        case ..<550: self = .medium', '        default: self = .semibold', '        }', '    }', '}', '');
  L.push('/// Шрифт, трекинг и межстрочный интервал стиля; размер масштабируется Dynamic Type по `textStyle`.', 'public struct YeetTextModifier: ViewModifier {', '    private let style: YeetTextStyle', '    @ScaledMetric private var scaledSize: CGFloat', '',
    '    public init(_ style: YeetTextStyle) {', '        self.style = style', '        _scaledSize = ScaledMetric(wrappedValue: style.size, relativeTo: style.textStyle)', '    }', '',
    '    public func body(content: Content) -> some View {', '        let ratio = scaledSize / style.size', '        let uiFont = style.uiFont(size: scaledSize)', '        let extra = max(0, style.lineHeight * ratio - uiFont.lineHeight)',
    '        return content', '            .font(Font(uiFont as CTFont))', '            .tracking(style.tracking * ratio)', '            .lineSpacing(extra)', '            .padding(.vertical, extra / 2)', '    }', '}', '');
  L.push('public extension View {', '    /// Применяет текстовый стиль: шрифт (точный вес), межстрочный интервал и трекинг, с Dynamic Type.', '    func yeetText(_ style: YeetTextStyle) -> some View {', '        modifier(YeetTextModifier(style))', '    }', '}', '');

  // Анимации
  L.push('/// Пружина Figma Smart Animate: та же физика (масса, жёсткость, демпфирование), что в прототипе и в CSS linear().', 'public struct YeetSpring {', '    public let mass: Double', '    public let stiffness: Double', '    public let damping: Double', '    /// Время успокоения, с (для web linear()).', '    public let duration: TimeInterval', '',
    '    public var dampingRatio: Double { damping / (2 * (stiffness * mass).squareRoot()) }', '    public var animation: Animation { .interpolatingSpring(mass: mass, stiffness: stiffness, damping: damping, initialVelocity: 0) }',
    '    /// SwiftUI.Spring с той же физикой (iOS 17+).', '    @available(iOS 17.0, *)', '    public var spring: Spring { Spring(mass: mass, stiffness: stiffness, damping: damping) }', '');
  for (const [k, s] of Object.entries(t.motion.spring)) L.push(`    /// Figma ${s.figma}`, `    public static let ${k} = YeetSpring(mass: ${s.mass}, stiffness: ${s.stiffness}, damping: ${s.damping}, duration: ${s.duration / 1000})`);
  L.push('}', '', 'public enum YeetMotion {');
  for (const [k, tr] of Object.entries(t.motion.transition)) {
    const name = swiftKeywords.has(k) ? `\`${k}\`` : k;
    if (tr.spring) { const s = t.motion.spring[tr.spring]; L.push(`    /// ${tr.use} · Figma Smart Animate ${s.figma}`, `    public static let ${name} = YeetSpring.${tr.spring}.animation`); }
    else { const e = t.motion.easing[tr.easing], d = t.motion.duration[tr.duration]; L.push(`    /// ${tr.use}`, `    public static let ${name} = Animation.timingCurve(${e.join(', ')}, duration: ${d / 1000})`); }
  }
  L.push('}', '', '/// Параметры жестов и микро-анимаций (Storybook → Foundations/Анимации → Микро-анимации).', 'public enum YeetGesture {');
  for (const [k, g] of Object.entries(t.motion.gesture))
    L.push(`    /// ${g.use}`, g.unit === 'ms' ? `    public static let ${camel(k)}: TimeInterval = ${g.value / 1000}` : `    public static let ${camel(k)}: CGFloat = ${g.value}`);
  L.push('}', '', '/// Хаптика: вызывать при смене состояния, не на каждое касание. Безопасно из любого потока: генератор отклика создаётся на главном.', 'public enum YeetHaptic {');
  for (const [k, h] of Object.entries(t.motion.haptic)) {
    const [kind, style] = h.ios.split(':');
    const call = kind === 'selection' ? 'UISelectionFeedbackGenerator().selectionChanged()' : kind === 'impact' ? `UIImpactFeedbackGenerator(style: .${style}).impactOccurred()` : `UINotificationFeedbackGenerator().notificationOccurred(.${style})`;
    L.push(`    /// ${h.when}. ${h.use}`, `    public static func ${swiftKeywords.has(k) ? `\`${k}\`` : k}() { DispatchQueue.main.async { ${call} } }`);
  }
  L.push('}', '');
  const sh = t.shadow.floating;
  L.push('public enum YeetShadow {', `    /// ${sh.use}`, `    public static let floatingColor = dynamic(UIColor(hex: ${hexA(sh.light.color)}), UIColor(hex: ${hexA(sh.dark.color)}))`, `    public static let floatingRadius: CGFloat = ${sh.light.blur / 2}`, `    public static let floatingX: CGFloat = ${sh.light.x}`, `    public static let floatingY: CGFloat = ${sh.light.y}`, '}', '');
  L.push('public extension View {', `    /// ${sh.use}`, '    func yeetFloatingShadow() -> some View {', '        shadow(color: YeetShadow.floatingColor, radius: YeetShadow.floatingRadius, x: YeetShadow.floatingX, y: YeetShadow.floatingY)', '    }', '}');
  return L.join('\n') + '\n';
}

/* ─── Kotlin (Jetpack Compose) ────────────────────────────────────────── */

/** Ключевые слова Kotlin, которые не могут быть именами без обратных кавычек (transition `return`). */
const KT_KEYWORDS = new Set(['return', 'object', 'class', 'fun', 'val', 'var', 'when', 'if', 'else', 'in', 'is', 'as', 'do', 'for', 'while', 'break', 'continue', 'null', 'true', 'false', 'this', 'super', 'throw', 'try', 'typealias', 'typeof', 'package', 'interface']);
const kt = (s) => (KT_KEYWORDS.has(s) ? `\`${s}\`` : s);
const pascal = (s) => camel(s).replace(/^\w/, (c) => c.toUpperCase());

function kotlin() {
  const argb = (v) => { if (v === 'transparent') return 'Color.Transparent'; const c = rgba(v); return `Color(0x${Math.round(c.a * 255).toString(16).padStart(2, '0').toUpperCase()}${c.hex})`; };
  const names = Object.keys(colors).map(camel);
  const L = [`// ${HEADER}`, '// Jetpack Compose. Схемы light / dark — выбирать по isSystemInDarkTheme(); в модуле native/android — через YeetTheme.', '', 'package design.yeet.tokens', '',
    'import androidx.compose.animation.core.CubicBezierEasing', 'import androidx.compose.animation.core.FiniteAnimationSpec', 'import androidx.compose.animation.core.snap', 'import androidx.compose.animation.core.spring', 'import androidx.compose.animation.core.tween',
    'import android.os.Build', 'import android.view.HapticFeedbackConstants', 'import android.view.View',
    'import androidx.annotation.FontRes', 'import androidx.compose.runtime.Immutable', 'import androidx.compose.ui.graphics.Color', 'import androidx.compose.ui.text.ExperimentalTextApi', 'import androidx.compose.ui.text.TextStyle', 'import androidx.compose.ui.text.font.Font', 'import androidx.compose.ui.text.font.FontFamily', 'import androidx.compose.ui.text.font.FontVariation', 'import androidx.compose.ui.text.font.FontWeight', 'import androidx.compose.ui.unit.dp', 'import androidx.compose.ui.unit.sp', ''];
  L.push('@Immutable', 'data class YeetColorScheme(');
  for (const [group, entries] of Object.entries(t.color)) { L.push(`    // ${group}`); for (const [k, v] of Object.entries(entries)) L.push(`    /** ${v.role} · Figma ${v.figma} */`, `    val ${camel(k)}: Color,`); }
  L.push(')', '');
  for (const theme of ['light', 'dark']) {
    L.push(`val Yeet${theme === 'light' ? 'Light' : 'Dark'}Colors = YeetColorScheme(`);
    Object.entries(colors).forEach(([k, v], i) => L.push(`    ${names[i]} = ${argb(resolve(v[theme], theme))},`));
    L.push(')', '');
  }
  // Бренды: переопределяют часть семантических цветов поверх темы (как data-brand в CSS)
  L.push('/** Бренд-варианты: переопределяют семантические цвета поверх светлой / тёмной темы (web: data-brand). */', 'enum class YeetBrand(val title: String, val light: YeetColorScheme, val dark: YeetColorScheme) {');
  for (const [id, b] of Object.entries(t.brand ?? {})) {
    const over = (theme) => Object.entries(b[theme]).map(([k, v]) => `${camel(k)} = ${argb(v)}`).join(', ');
    L.push(`    /** ${b.about} */`, `    ${pascal(id)}(`, `        title = "${b.name}",`, `        light = YeetLightColors.copy(${over('light')}),`, `        dark = YeetDarkColors.copy(${over('dark')}),`, '    ),');
  }
  L.push('}', '');
  // Компонентный слой: решения конкретного компонента из семантики
  L.push('// Компонентные токены (web: --button-*, --card-*, --sheet-*, --tab-bar-*, --input-*)');
  for (const [k, v] of Object.entries(t.component)) {
    const m2 = /^\{(\w+)\.([\w-]+)\}$/.exec(v);
    if (m2?.[1] === 'radius') continue;
    L.push(`val YeetColorScheme.${camel(k)}: Color get() = ${m2 ? camel(m2[2]) : argb(v)}`);
  }
  L.push('', 'object YeetComponent {');
  for (const [k, v] of Object.entries(t.component)) {
    const m2 = /^\{(\w+)\.([\w-]+)\}$/.exec(v);
    if (m2?.[1] === 'radius') L.push(`    val ${camel(k)} = YeetRadius.${m2[2]}`);
  }
  L.push('}', '');
  L.push('/** Цвет вещи — атрибут одежды, не интерфейс. */', 'enum class YeetItemColor(val color: Color, val title: String, /** Буква / иконка на этом цвете (≥ 4.5 : 1) */ val onColor: Color) {');
  Object.entries(t.item).forEach(([k, v]) => L.push(`    ${k.toUpperCase()}(${argb(resolve(v.value))}, "${v.name}", ${argb(v.on)}),`));
  L.push('}', '', 'object YeetSpace {');
  for (const s of t.space) L.push(`    val s${s} = ${s}.dp`);
  L.push(`    val screenGutter = ${t.layout['screen-gutter']}.dp`, '}', '', 'object YeetRadius {');
  for (const [k, v] of Object.entries(t.radius)) L.push(`    /** ${v.use} */`, `    val ${k} = ${v.value}.dp`);
  L.push('}', '', '/** Базовый экран макетов (iPhone 15/16), боковые поля. */', 'object YeetLayout {');
  for (const [k, v] of Object.entries(t.layout)) L.push(`    val ${camel(k)} = ${v}.dp`);
  L.push('}', '');
  L.push('/** Семейство из переменного шрифта (Google Fonts): по одному Font на каждый нужный вес. */', '@OptIn(ExperimentalTextApi::class)', 'fun yeetFontFamily(@FontRes res: Int, vararg weights: Int) = FontFamily(', '    weights.map { Font(res, FontWeight(it), variationSettings = FontVariation.Settings(FontVariation.weight(it))) }', ')', '');
  const fontRes = Object.values(t.font).map((f) => `res/font/${f.android}.ttf ← tokens/fonts/${f.file}`).join(', ');
  L.push(`/** Шрифты: ${fontRes}. */`, '@Immutable', 'class YeetTypography(val display: FontFamily, val text: FontFamily) {');
  for (const [k, s] of Object.entries(t.typography))
    L.push(`    /** ${s.use} */`, `    val ${k} = TextStyle(fontFamily = ${s.font}, fontWeight = FontWeight(${s.weight}), fontSize = ${s.size}.sp, lineHeight = ${s.lineHeight}.sp, letterSpacing = (${s.letterSpacing}).sp)`);
  L.push('', '    companion object {', '        /** YeetTypography.fromResources(R.font.' + t.font.display.android + ', R.font.' + t.font.text.android + ') */', '        fun fromResources(@FontRes display: Int, @FontRes text: Int) = YeetTypography(', `            display = yeetFontFamily(display, ${t.font.display.weights.join(', ')}),`, `            text = yeetFontFamily(text, ${t.font.text.weights.join(', ')}),`, '        )', '    }');
  L.push('}', '', 'object YeetDuration {');
  for (const [k, v] of Object.entries(t.motion.duration)) L.push(`    const val ${/^\d/.test(k) ? `ms${k}` : k} = ${v}`);
  L.push('}', '', 'object YeetEasing {');
  for (const [k, v] of Object.entries(t.motion.easing)) L.push(`    val ${kt(k)} = CubicBezierEasing(${v.map((x) => num(x) + 'f').join(', ')})`);
  L.push('}', '', '/** Пружины Figma Smart Animate (mass 1): stiffness и доля затухания для spring(). */', 'object YeetSpring {');
  for (const [k, s] of Object.entries(t.motion.spring)) L.push(`    /** Figma ${s.figma}: k ${s.stiffness}, c ${s.damping}, ~${s.duration} мс */`, `    const val ${k}DampingRatio = ${num(dampingRatio(s))}f`, `    const val ${k}Stiffness = ${s.stiffness}f`);
  L.push('}', '', 'object YeetMotion {');
  const specOf = (tr) => {
    if (tr.spring) return `spring(dampingRatio = YeetSpring.${tr.spring}DampingRatio, stiffness = YeetSpring.${tr.spring}Stiffness)`;
    return `tween(durationMillis = ${t.motion.duration[tr.duration]}, easing = YeetEasing.${kt(tr.easing)})`;
  };
  for (const [k, tr] of Object.entries(t.motion.transition)) {
    const note = tr.spring ? ` · Figma Smart Animate ${t.motion.spring[tr.spring].figma}` : '';
    L.push(`    /** ${tr.use}${note} */`, `    fun <T> ${kt(k)}(): FiniteAnimationSpec<T> = ${specOf(tr)}`);
  }
  L.push('}', '');
  L.push('/**', ' * Переходы с учётом «уменьшить движение» (web: prefers-reduced-motion; Android: animator duration scale = 0).', ' * `reduced` — все переходы мгновенные, подъём и цель без увеличения.', ' */', '@Immutable', 'class YeetMotionScheme(val reduced: Boolean = false) {');
  for (const [k, tr] of Object.entries(t.motion.transition)) L.push(`    /** ${tr.use} */`, `    fun <T> ${kt(k)}(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.${kt(k)}()`);
  L.push(`    val liftScale: Float get() = if (reduced) 1f else YeetGesture.liftScale`, `    val targetScale: Float get() = if (reduced) 1f else YeetGesture.targetScale`, '}', '');
  L.push('/** Параметры жестов и микро-анимаций (Storybook → Foundations/Анимации → Микро-анимации). */', 'object YeetGesture {');
  for (const [k, g] of Object.entries(t.motion.gesture)) {
    const name = camel(k);
    L.push(`    /** ${g.use}${g.unit === 'px/s' ? ' (dp/с)' : ''} */`, g.unit === 'ms' ? `    const val ${name}Millis = ${g.value}L` : g.unit === 'px' ? `    val ${name} = ${g.value}.dp` : `    const val ${name} = ${g.value}f`);
  }
  L.push('}', '', '/** Хаптика: вызывать при смене состояния, не на каждое касание. view.yeetHaptic(YeetHaptic.drop); в Compose — LocalView.current. */', 'object YeetHaptic {');
  const hc = (n) => `HapticFeedbackConstants.${n}`;
  for (const [k, h] of Object.entries(t.motion.haptic)) {
    L.push(`    /** ${h.when}. ${h.use} */`, h.androidMin ? `    val ${kt(k)}: Int get() = if (Build.VERSION.SDK_INT >= ${h.androidMin}) ${hc(h.android)} else ${hc(h.androidFallback)}` : `    val ${kt(k)}: Int get() = ${hc(h.android)}`);
  }
  L.push('}', '', 'fun View.yeetHaptic(type: Int): Boolean = performHapticFeedback(type)', '');
  L.push('/** Событие хаптики (tokens.motion.haptic) — для YeetTheme.haptics.perform(...). */', 'enum class YeetHapticEvent(val ios: String) {');
  for (const [k, h] of Object.entries(t.motion.haptic)) L.push(`    /** ${h.when} */`, `    ${pascal(k)}("${h.ios}"),`);
  L.push('    ;', '', '    /** HapticFeedbackConstants с запасным вариантом для старых API (androidMin / androidFallback). */', '    val feedbackConstant: Int', '        get() = when (this) {');
  for (const k of Object.keys(t.motion.haptic)) L.push(`            ${pascal(k)} -> YeetHaptic.${kt(k)}`);
  L.push('        }', '}', '');
  const sh = t.shadow.floating;
  L.push(`/** ${sh.use}: y ${sh.light.y}, blur ${sh.light.blur}. В Compose — Modifier.yeetFloatingShadow() из модуля native/android (или Modifier.shadow(elevation = ${sh.light.blur / 4}.dp)). */`, 'object YeetShadow {', `    val floatingLight = ${argb(sh.light.color)}`, `    val floatingDark = ${argb(sh.dark.color)}`, `    val floatingElevation = ${sh.light.blur / 4}.dp`, `    val floatingOffsetX = ${sh.light.x}.dp`, `    val floatingOffsetY = ${sh.light.y}.dp`, `    /** Размытие как в CSS / Figma (blur radius). */`, `    val floatingBlur = ${sh.light.blur}.dp`, '}');
  return L.join('\n') + '\n';
}

/* ─── Запись ──────────────────────────────────────────────────────────── */

const out = {
  'src/tokens/tokens.generated.css': css(),
  'tokens/ios/YeetTokens.swift': swift(),
  'tokens/android/YeetTokens.kt': kotlin(),
  // Swift Package native/ios: те же токены, шрифты регистрируются из ресурсов пакета (Bundle.module)
  'native/ios/Sources/YeetDesignSystem/Generated/YeetTokens.swift': swift({ bundle: 'module' }),
  [`${ANDROID_MODULE}/java/design/yeet/tokens/YeetTokens.kt`]: kotlin(),
  ...androidOutputs(root),
};
for (const [path, body] of Object.entries(out)) {
  const url = new URL(path, root);
  mkdirSync(new URL('.', url), { recursive: true });
  writeFileSync(url, body);
  console.log(`✓ ${path}`);
}

// Swift Package native/ios: иконки → SwiftUI Path, шрифты и погодные иконки → ресурсы пакета
buildIosPackage(root, { header: HEADER, swiftKeywords });
copyAndroidFonts(root, t.font);
