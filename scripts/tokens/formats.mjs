// Форматы Style Dictionary для Yeet: CSS-переменные (Storybook), Swift (SwiftUI), Kotlin (Jetpack Compose).
// Значения берутся уже преобразованными трансформами платформы (scripts/tokens/transforms.mjs),
// структура (группы, бренды, метаданные) — из исходного DTCG-дерева.
import { EXT, isRef, refPath } from './dtcg.mjs';
import { camel, kotlinName, pascal, swiftName } from './transforms.mjs';

export const HEADER = 'Сгенерировано scripts/build-tokens.mjs из tokens/tokens.json — не редактировать вручную.';

/** Доступ к токенам словаря SD по пути: преобразованное значение, исходное, темы, метаданные. */
function view(dictionary, source) {
  const by = new Map(dictionary.allTokens.map((t) => [t.path.join('.'), t]));
  const get = (id) => { const t = by.get(id); if (!t) throw new Error(`Нет токена ${id}`); return t; };
  const keys = (node) => Object.keys(node).filter((k) => !k.startsWith('$'));
  /** Токены группы в порядке файла. */
  const list = (id) => { const node = id.split('.').reduce((n, k) => n[k], source); return keys(node).map((k) => get(`${id}.${k}`)); };
  const x = (t) => t.$extensions?.[EXT] ?? {};
  /** Токен в теме: двойник mode.<тема>.<путь> (его значение прошло те же трансформы), иначе сам токен. */
  const inMode = (t, mode) => by.get(`mode.${mode}.${t.path.join('.')}`) ?? t;
  const orig = (t) => t.original.$value;
  /** Ключ цели ссылки: "{motion.easing.standard}" → "standard". */
  const refKey = (v) => refPath(v).split('.').at(-1);
  const key = (t) => t.path.at(-1);
  const groupNode = (id) => id.split('.').reduce((n, k) => n[k], source);
  return { get, list, x, inMode, orig, refKey, key, keys, groupNode, source };
}

/** Категории токенов 2.0 (фаза 2): выводятся отдельным блоком в конце каждого файла, существующий вывод не меняется. */
const EXTRA_GROUPS = ['opacity', 'layer', 'size', 'focus-ring', 'border-width', 'breakpoint'];
/** Все токены группы с вложенными подгруппами, в порядке файла. */
function deep(v, id) {
  const node = v.groupNode(id);
  return v.keys(node).flatMap((k) => ('$value' in node[k] ? [v.get(`${id}.${k}`)] : deep(v, `${id}.${k}`)));
}
/** Имя члена enum/object: путь без группы в camelCase ("size.control.s" → "controlS"). */
const member = (t) => camel(t.path.slice(1).join('-'));

const colorGroups = (v) => v.keys(v.source.color).map((g) => ({ title: v.groupNode(`color.${g}`).$description, tokens: v.list(`color.${g}`) }));
const brands = (v) => v.keys(v.source.brand).map((id) => ({ id, ...v.x(v.groupNode(`brand.${id}`)).brand, tokens: v.list(`brand.${id}`) }));
const fontMeta = (v) => v.list('font').map((t) => ({ key: v.key(t), family: v.orig(t)[0], ...v.x(t), source: t.$description }));

/* ─── CSS ─────────────────────────────────────────────────────────────── */

export function css({ dictionary }, source) {
  const v = view(dictionary, source);
  /** "{primitive.x}" → "var(--yeet-x)", иначе преобразованное значение. */
  const colorOut = (t) => { const o = v.orig(t); return isRef(o) && refPath(o).startsWith('primitive.') ? `var(--${v.get(refPath(o)).name})` : t.$value; };
  const L = [`/* ${HEADER} */`, ''];
  for (const f of fontMeta(v))
    L.push(`@font-face { font-family: '${f.family}'; src: url('../../tokens/fonts/${f.file.replace(/\.ttf$/, '.woff2')}') format('woff2'), url('../../tokens/fonts/${f.file}') format('truetype'); font-weight: 100 900; font-style: normal; font-display: swap; }`);
  L.push('', ':root {');
  for (const t of v.list('primitive')) L.push(`  --${t.name}: ${t.$value};`);
  for (const t of v.list('item')) { const on = v.get(`on-item.${v.key(t)}`); L.push(`  --${t.name}: ${colorOut(t)};`, `  --${on.name}: ${on.$value}; /* буква / иконка на этом цвете */`); }
  L.push('');
  for (const t of v.list('space')) L.push(`  --${t.name}: ${t.$value};`);
  for (const t of v.list('radius')) L.push(`  --${t.name}: ${t.$value};`);
  L.push('');
  for (const t of v.list('font')) L.push(`  --${t.name}: ${t.$value};`);
  for (const t of v.list('typography')) L.push(`  --font-weight-${v.key(t)}: ${v.orig(t).fontWeight};`);
  for (const t of v.list('layout')) { const o = v.orig(t); L.push(`  --${t.name}: ${isRef(o) ? `var(--${v.get(refPath(o)).name})` : t.$value};`); }
  L.push('');
  for (const t of v.list('motion.duration')) L.push(`  --${t.name}: ${t.$value};`);
  for (const t of v.list('motion.easing')) L.push(`  --${t.name}: ${t.$value};`);
  for (const t of v.list('motion.spring')) L.push(`  --${t.name}: ${t.$value};`, `  --${t.name}-duration: ${v.orig(t).duration.value}ms;`);
  for (const t of v.list('motion.transition')) {
    const o = v.orig(t);
    const val = t.$type === 'spring' ? `var(--${v.get(refPath(o)).name}-duration) var(--${v.get(refPath(o)).name})` : `var(--${v.get(refPath(o.duration)).name}) var(--${v.get(refPath(o.timingFunction)).name})`;
    L.push(`  --${t.name}: ${val}; /* ${t.$description} */`);
  }
  for (const t of v.list('motion.gesture')) L.push(`  --${t.name}: ${t.$value}; /* ${t.$description} */`);
  L.push('}', '', '@media (prefers-reduced-motion: reduce) {', '  :root {');
  L.push('    ' + v.list('motion.transition').map((t) => `--${t.name}: 1ms linear;`).join(' '));
  L.push('    --gesture-lift-scale: 1; --gesture-target-scale: 1;');
  L.push('  }', '}', '');
  const colors = colorGroups(v).flatMap((g) => g.tokens);
  for (const theme of ['light', 'dark']) {
    L.push(theme === 'light' ? ":root,\n[data-theme='light'] {" : "[data-theme='dark'] {", `  color-scheme: ${theme};`);
    for (const t of colors) L.push(`  --${t.name}: ${colorOut(v.inMode(t, theme))}; /* ${v.x(t).figma} */`);
    for (const t of v.list('shadow')) L.push(`  --${t.name}: ${v.inMode(t, theme).$value};`);
    L.push('}', '');
  }
  // Бренд-варианты: переопределяют семантические цвета поверх темы (data-brand на <html> или на обёртке)
  for (const b of brands(v))
    for (const theme of ['light', 'dark']) {
      L.push(`/* Бренд «${b.name}»: ${theme} */`, theme === 'light' ? `[data-brand='${b.id}']:not([data-theme='dark']) {` : `[data-brand='${b.id}'][data-theme='dark'] {`);
      for (const t of b.tokens) L.push(`  --color-${v.key(t)}: ${v.inMode(t, theme).$value};`);
      L.push('}', '');
    }
  // Компонентные токены пересчитываются там, где меняется тема или бренд, а не только на :root
  L.push(':root,\n[data-theme],\n[data-brand] {');
  for (const t of v.list('component')) {
    const o = v.orig(t), after = v.x(v.groupNode(t.path.join('.'))).after; // из исходника: SD раскрывает ссылки в $extensions
    const val = isRef(o) ? `var(--${v.get(refPath(o)).name})` : t.$value;
    // after — отступ отсчитывается от другого размера (верх шторки — от статус-бара)
    L.push(`  --${t.name}: ${after ? `calc(var(--${v.get(refPath(after)).name}) + ${val})` : val};${t.$description ? ` /* ${t.$description} */` : ''}`);
  }
  L.push('}', '');
  for (const t of v.list('typography')) {
    const o = v.orig(t);
    L.push(`.y-${v.key(t)} { font: var(--font-weight-${v.key(t)}) ${o.fontSize.value}px/${Math.round(o.fontSize.value * o.lineHeight)}px var(--${v.get(refPath(o.fontFamily)).name}); letter-spacing: ${o.letterSpacing.value}px; margin: 0; }`);
  }
  // Токены 2.0: только новые переменные. Ссылки на семантические цвета — в блоке, который пересчитывается с темой и брендом.
  const extra = EXTRA_GROUPS.flatMap((g) => deep(v, g));
  L.push('', '/* Токены 2.0: прозрачность, слои, размеры контролов, фокус, толщина линий, составная типографика, брейкпоинты */', ':root {');
  for (const t of extra) if (t.$type !== 'color') { const o = v.orig(t); L.push(`  --${t.name}: ${isRef(o) ? `var(--${v.get(refPath(o)).name})` : t.$value}; /* ${t.$description} */`); }
  for (const t of v.list('typography')) {
    const o = v.orig(t);
    L.push(`  --typography-${v.key(t)}: var(--font-weight-${v.key(t)}) ${o.fontSize.value}px/${Math.round(o.fontSize.value * o.lineHeight)}px var(--${v.get(refPath(o.fontFamily)).name});`, `  --typography-${v.key(t)}-letter-spacing: ${o.letterSpacing.value}px;`);
  }
  L.push('}', '', ':root,\n[data-theme],\n[data-brand] {');
  for (const t of extra) if (t.$type === 'color') L.push(`  --${t.name}: var(--${v.get(refPath(v.orig(t))).name}); /* ${t.$description} */`);
  L.push('}');
  return L.join('\n') + '\n';
}

/* ─── Swift (SwiftUI) ─────────────────────────────────────────────────── */

/** Font.TextStyle, по кривой которого масштабируется стиль при Dynamic Type. */
const iosTextStyle = { h1: 'largeTitle', h2: 'title', h3: 'title3', body: 'body', caption: 'caption' };

/**
 * `bundle` — откуда регистрировать шрифты: `main` для копии tokens/ios (файлы добавлены в приложение),
 * `module` для Swift Package native/ios (шрифты лежат в ресурсах пакета).
 */
export function swift({ dictionary, options }, source) {
  const bundle = options?.bundle ?? 'main';
  const v = view(dictionary, source);
  const fonts = fontMeta(v);
  const fontFiles = fonts.map((f) => f.file);
  const L = [`// ${HEADER}`, '// SwiftUI. Цвета меняются со светлой / тёмной темой системы автоматически (UIColor с dynamicProvider, без asset-каталога).'];
  L.push(bundle === 'module'
    ? '// Шрифты лежат в ресурсах пакета YeetDesignSystem и регистрируются при первом использовании (YeetFonts.register()).'
    : `// Шрифты: добавьте в приложение tokens/fonts/${fontFiles.join(', ')} — они регистрируются из Bundle.main при первом использовании (или перечислите их в Info.plist → UIAppFonts).`);
  L.push('', 'import CoreText', 'import SwiftUI', 'import UIKit', '');
  L.push('private extension UIColor {', '    convenience init(hex: UInt32, alpha: CGFloat = 1) {', '        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: alpha)', '    }', '}', '');
  L.push('private func dynamic(_ light: UIColor, _ dark: UIColor) -> Color {', '    Color(UIColor { $0.userInterfaceStyle == .dark ? dark : light })', '}', '');

  L.push('/// Примитивы палитры. В компонентах не используются — только через семантические `YeetColor`.', 'public enum YeetPrimitive {');
  for (const t of v.list('primitive')) L.push(`    public static let ${t.name} = Color(UIColor(hex: ${t.$value}))`);
  L.push('}', '');

  L.push('public enum YeetColor {');
  for (const g of colorGroups(v)) {
    L.push(`    // ${g.title}`);
    for (const t of g.tokens)
      L.push(`    /// ${t.$description} · Figma ${v.x(t).figma}`, `    public static let ${t.name} = dynamic(UIColor(hex: ${t.$value}), UIColor(hex: ${v.inMode(t, 'dark').$value}))`);
  }
  const items = v.list('item');
  L.push('}', '', '/// Цвет вещи — атрибут одежды, не интерфейс.', 'public enum YeetItemColor: String, CaseIterable, Identifiable {');
  for (const t of items) L.push(`    case ${v.key(t)}`);
  L.push('    public var id: String { rawValue }', '    public var color: Color {', '        switch self {');
  for (const t of items) L.push(`        case .${v.key(t)}: return Color(UIColor(hex: ${t.$value}))`);
  L.push('        }', '    }', '    /// Цвет буквы / иконки на этом цвете (контраст ≥ 4.5 : 1).', '    public var onColor: Color {', '        switch self {');
  for (const t of items) L.push(`        case .${v.key(t)}: return Color(UIColor(hex: ${v.get(`on-item.${v.key(t)}`).$value}))`);
  L.push('        }', '    }', '    public var title: String {', '        switch self {');
  for (const t of items) L.push(`        case .${v.key(t)}: return "${v.x(t).name}"`);
  L.push('        }', '    }', '}', '');

  L.push('/// Компонентные токены: ссылки на семантические цвета и радиусы (tokens.json → component).', 'public enum YeetComponent {');
  for (const t of v.list('component')) {
    const o = v.orig(t);
    if (t.$description) L.push(`    /// ${t.$description}`);
    if (!isRef(o) && o.alpha === 0) L.push(`    public static let ${t.name}: Color = .clear`);
    else if (isRef(o) && o.startsWith('{color.')) L.push(`    public static let ${t.name}: Color = YeetColor.${v.get(refPath(o)).name}`);
    else if (isRef(o) && o.startsWith('{radius.')) L.push(`    public static let ${t.name}: CGFloat = YeetRadius.${v.get(refPath(o)).name}`);
    else if (isRef(o) && o.startsWith('{space.')) L.push(`    public static let ${t.name}: CGFloat = YeetSpace.s${v.refKey(o)}`);
    else throw new Error(`Unsupported component token ${t.path.join('.')}`);
  }
  L.push('}', '');

  L.push('public enum YeetSpace {');
  for (const t of v.list('space')) L.push(`    public static let s${v.key(t)}: CGFloat = ${t.$value}`);
  L.push(`    public static let screenGutter: CGFloat = ${v.get('layout.screen-gutter').$value}`, '}', '', 'public enum YeetRadius {');
  for (const t of v.list('radius')) L.push(`    /// ${t.$description}`, `    public static let ${t.name}: CGFloat = ${t.$value}`);
  L.push('}', '', '/// Макет: iPhone 393 × 852, поля 20.', 'public enum YeetLayout {');
  for (const t of v.list('layout')) L.push(`    public static let ${t.name}: CGFloat = ${t.$value}`);
  L.push('}', '');

  // Шрифты
  L.push('/// Семейства и регистрация переменных шрифтов (Inter, Roboto Slab).', 'public enum YeetFonts {');
  for (const f of fonts) L.push(`    /// ${f.source}`, `    public static let ${f.key} = "${f.family}"`);
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
  for (const t of v.list('typography')) {
    const s = t.$value, k = v.key(t);
    const family = v.orig(v.get(refPath(v.orig(t).fontFamily)))[0];
    L.push(`    /// ${t.$description}`, `    public static let ${t.name} = YeetTextStyle(family: "${family}", size: ${s.size}, lineHeight: ${s.lineHeight}, tracking: ${s.tracking}, weight: ${s.weight}, textStyle: .${iosTextStyle[k] ?? 'body'})`);
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
  for (const t of v.list('motion.spring')) { const s = t.$value; L.push(`    /// Figma ${v.x(t).figma}`, `    public static let ${t.name} = YeetSpring(mass: ${s.mass}, stiffness: ${s.stiffness}, damping: ${s.damping}, duration: ${s.duration})`); }
  L.push('}', '', 'public enum YeetMotion {');
  for (const t of v.list('motion.transition')) {
    const o = v.orig(t);
    if (t.$type === 'spring') { const s = v.get(refPath(o)); L.push(`    /// ${t.$description} · Figma Smart Animate ${v.x(s).figma}`, `    public static let ${t.name} = YeetSpring.${s.name}.animation`); }
    else { const e = v.get(refPath(o.timingFunction)), d = v.get(refPath(o.duration)); L.push(`    /// ${t.$description}`, `    public static let ${t.name} = Animation.timingCurve(${e.$value}, duration: ${d.$value})`); }
  }
  L.push('}', '', '/// Параметры жестов и микро-анимаций (Storybook → Foundations/Анимации → Микро-анимации).', 'public enum YeetGesture {');
  for (const t of v.list('motion.gesture'))
    L.push(`    /// ${t.$description}`, t.$type === 'duration' ? `    public static let ${t.name}: TimeInterval = ${t.$value}` : `    public static let ${t.name}: CGFloat = ${t.$value}`);
  L.push('}', '', '/// Хаптика: вызывать при смене состояния, не на каждое касание. Безопасно из любого потока: генератор отклика создаётся на главном.', 'public enum YeetHaptic {');
  for (const t of v.list('motion.haptic')) {
    const [kind, style] = t.$value.ios.split(':');
    const call = kind === 'selection' ? 'UISelectionFeedbackGenerator().selectionChanged()' : kind === 'impact' ? `UIImpactFeedbackGenerator(style: .${style}).impactOccurred()` : `UINotificationFeedbackGenerator().notificationOccurred(.${style})`;
    L.push(`    /// ${t.$description}. ${v.x(t).use}`, `    public static func ${t.name}() { DispatchQueue.main.async { ${call} } }`);
  }
  L.push('}', '');
  const shT = v.get('shadow.floating'), sh = shT.$value, shDark = v.inMode(shT, 'dark').$value;
  L.push('public enum YeetShadow {', `    /// ${shT.$description}`, `    public static let floatingColor = dynamic(UIColor(hex: ${sh.color}), UIColor(hex: ${shDark.color}))`, `    public static let floatingRadius: CGFloat = ${sh.blur / 2}`, `    public static let floatingX: CGFloat = ${sh.x}`, `    public static let floatingY: CGFloat = ${sh.y}`, '}', '');
  L.push('public extension View {', `    /// ${shT.$description}`, '    func yeetFloatingShadow() -> some View {', '        shadow(color: YeetShadow.floatingColor, radius: YeetShadow.floatingRadius, x: YeetShadow.floatingX, y: YeetShadow.floatingY)', '    }', '}');
  // Токены 2.0
  for (const g of EXTRA_GROUPS) {
    const node = v.groupNode(g);
    L.push('', ...(node.$description ? [`/// ${node.$description}`] : []), `public enum Yeet${pascal(g)} {`);
    for (const t of deep(v, g)) {
      const o = v.orig(t), name = swiftName(member(t));
      const decl = t.$type === 'color' ? `Color = YeetColor.${v.get(refPath(o)).name}`
        : t.$type === 'number' ? `Double = ${t.$value}`
        : `CGFloat = ${isRef(o) ? v.get(refPath(o)).$value : t.$value}`;
      L.push(`    /// ${t.$description}`, `    public static let ${name}: ${decl}`);
    }
    L.push('}');
  }
  return L.join('\n') + '\n';
}

/* ─── Kotlin (Jetpack Compose) ────────────────────────────────────────── */

export function kotlin({ dictionary }, source) {
  const v = view(dictionary, source);
  const groups = colorGroups(v);
  const colors = groups.flatMap((g) => g.tokens);
  const L = [`// ${HEADER}`, '// Jetpack Compose. Схемы light / dark — выбирать по isSystemInDarkTheme(); в модуле native/android — через YeetTheme.', '', 'package design.yeet.tokens', '',
    'import androidx.compose.animation.core.CubicBezierEasing', 'import androidx.compose.animation.core.FiniteAnimationSpec', 'import androidx.compose.animation.core.snap', 'import androidx.compose.animation.core.spring', 'import androidx.compose.animation.core.tween',
    'import android.os.Build', 'import android.view.HapticFeedbackConstants', 'import android.view.View',
    'import androidx.annotation.FontRes', 'import androidx.compose.runtime.Immutable', 'import androidx.compose.ui.graphics.Color', 'import androidx.compose.ui.text.ExperimentalTextApi', 'import androidx.compose.ui.text.TextStyle', 'import androidx.compose.ui.text.font.Font', 'import androidx.compose.ui.text.font.FontFamily', 'import androidx.compose.ui.text.font.FontVariation', 'import androidx.compose.ui.text.font.FontWeight', 'import androidx.compose.ui.unit.dp', 'import androidx.compose.ui.unit.sp', ''];
  L.push('@Immutable', 'data class YeetColorScheme(');
  for (const g of groups) { L.push(`    // ${g.title}`); for (const t of g.tokens) L.push(`    /** ${t.$description} · Figma ${v.x(t).figma} */`, `    val ${t.name}: Color,`); }
  L.push(')', '');
  for (const theme of ['light', 'dark']) {
    L.push(`val Yeet${theme === 'light' ? 'Light' : 'Dark'}Colors = YeetColorScheme(`);
    for (const t of colors) L.push(`    ${t.name} = ${v.inMode(t, theme).$value},`);
    L.push(')', '');
  }
  // Бренды: переопределяют часть семантических цветов поверх темы (как data-brand в CSS)
  L.push('/** Бренд-варианты: переопределяют семантические цвета поверх светлой / тёмной темы (web: data-brand). */', 'enum class YeetBrand(val title: String, val light: YeetColorScheme, val dark: YeetColorScheme) {');
  for (const b of brands(v)) {
    const over = (theme) => b.tokens.map((t) => `${t.name} = ${v.inMode(t, theme).$value}`).join(', ');
    L.push(`    /** ${b.about} */`, `    ${pascal(b.id)}(`, `        title = "${b.name}",`, `        light = YeetLightColors.copy(${over('light')}),`, `        dark = YeetDarkColors.copy(${over('dark')}),`, '    ),');
  }
  L.push('}', '');
  // Компонентный слой: решения конкретного компонента из семантики
  L.push('// Компонентные токены (web: --button-*, --card-*, --sheet-*, --tab-bar-*, --input-*)');
  const components = v.list('component');
  for (const t of components) {
    if (t.$type !== 'color') continue;
    const o = v.orig(t);
    if (t.$description) L.push(`/** ${t.$description} */`);
    L.push(`val YeetColorScheme.${t.name}: Color get() = ${isRef(o) ? v.get(refPath(o)).name : t.$value}`);
  }
  L.push('', 'object YeetComponent {');
  for (const t of components) {
    if (t.$type !== 'dimension') continue;
    const o = v.orig(t);
    if (t.$description) L.push(`    /** ${t.$description} */`);
    if (o.startsWith('{radius.')) L.push(`    val ${t.name} = YeetRadius.${v.get(refPath(o)).name}`);
    else if (o.startsWith('{space.')) L.push(`    val ${t.name} = YeetSpace.s${v.refKey(o)}`);
    else throw new Error(`Unsupported component token ${t.path.join('.')}`);
  }
  L.push('}', '');
  L.push('/** Цвет вещи — атрибут одежды, не интерфейс. */', 'enum class YeetItemColor(val color: Color, val title: String, /** Буква / иконка на этом цвете (≥ 4.5 : 1) */ val onColor: Color) {');
  for (const t of v.list('item')) L.push(`    ${v.key(t).toUpperCase()}(${t.$value}, "${v.x(t).name}", ${v.get(`on-item.${v.key(t)}`).$value}),`);
  L.push('}', '', 'object YeetSpace {');
  for (const t of v.list('space')) L.push(`    val s${v.key(t)} = ${t.$value}`);
  L.push(`    val screenGutter = ${v.get('layout.screen-gutter').$value}`, '}', '', 'object YeetRadius {');
  for (const t of v.list('radius')) L.push(`    /** ${t.$description} */`, `    val ${t.name} = ${t.$value}`);
  L.push('}', '', '/** Базовый экран макетов (iPhone 15/16), боковые поля. */', 'object YeetLayout {');
  for (const t of v.list('layout')) L.push(`    val ${t.name} = ${t.$value}`);
  L.push('}', '');
  L.push('/** Семейство из переменного шрифта (Google Fonts): по одному Font на каждый нужный вес. */', '@OptIn(ExperimentalTextApi::class)', 'fun yeetFontFamily(@FontRes res: Int, vararg weights: Int) = FontFamily(', '    weights.map { Font(res, FontWeight(it), variationSettings = FontVariation.Settings(FontVariation.weight(it))) }', ')', '');
  const fonts = Object.fromEntries(fontMeta(v).map((f) => [f.key, f]));
  const fontRes = Object.values(fonts).map((f) => `res/font/${f.android}.ttf ← tokens/fonts/${f.file}`).join(', ');
  L.push(`/** Шрифты: ${fontRes}. */`, '@Immutable', 'class YeetTypography(val display: FontFamily, val text: FontFamily) {');
  for (const t of v.list('typography')) {
    const s = t.$value;
    L.push(`    /** ${t.$description} */`, `    val ${t.name} = TextStyle(fontFamily = ${v.refKey(v.orig(t).fontFamily)}, fontWeight = ${s.weight}, fontSize = ${s.size}, lineHeight = ${s.lineHeight}, letterSpacing = ${s.tracking})`);
  }
  L.push('', '    companion object {', '        /** YeetTypography.fromResources(R.font.' + fonts.display.android + ', R.font.' + fonts.text.android + ') */', '        fun fromResources(@FontRes display: Int, @FontRes text: Int) = YeetTypography(', `            display = yeetFontFamily(display, ${fonts.display.weights.join(', ')}),`, `            text = yeetFontFamily(text, ${fonts.text.weights.join(', ')}),`, '        )', '    }');
  L.push('}', '', 'object YeetDuration {');
  for (const t of v.list('motion.duration')) L.push(`    const val ${/^\d/.test(v.key(t)) ? `ms${v.key(t)}` : t.name} = ${t.$value}`);
  L.push('}', '', 'object YeetEasing {');
  for (const t of v.list('motion.easing')) L.push(`    val ${t.name} = ${t.$value}`);
  L.push('}', '', '/** Пружины Figma Smart Animate (mass 1): stiffness и доля затухания для spring(). */', 'object YeetSpring {');
  for (const t of v.list('motion.spring')) {
    const o = v.orig(t);
    L.push(`    /** Figma ${v.x(t).figma}: k ${o.stiffness}, c ${o.damping}, ~${o.duration.value} мс */`, `    const val ${v.key(t)}DampingRatio = ${t.$value.dampingRatio}`, `    const val ${v.key(t)}Stiffness = ${t.$value.stiffness}`);
  }
  L.push('}', '', 'object YeetMotion {');
  const transitions = v.list('motion.transition');
  const specOf = (t) => {
    const o = v.orig(t);
    if (t.$type === 'spring') { const k = v.refKey(o); return `spring(dampingRatio = YeetSpring.${k}DampingRatio, stiffness = YeetSpring.${k}Stiffness)`; }
    return `tween(durationMillis = ${v.get(refPath(o.duration)).$value}, easing = YeetEasing.${v.get(refPath(o.timingFunction)).name})`;
  };
  for (const t of transitions) {
    const note = t.$type === 'spring' ? ` · Figma Smart Animate ${v.x(v.get(refPath(v.orig(t)))).figma}` : '';
    L.push(`    /** ${t.$description}${note} */`, `    fun <T> ${t.name}(): FiniteAnimationSpec<T> = ${specOf(t)}`);
  }
  L.push('}', '');
  L.push('/**', ' * Переходы с учётом «уменьшить движение» (web: prefers-reduced-motion; Android: animator duration scale = 0).', ' * `reduced` — все переходы мгновенные, подъём и цель без увеличения.', ' */', '@Immutable', 'class YeetMotionScheme(val reduced: Boolean = false) {');
  for (const t of transitions) L.push(`    /** ${t.$description} */`, `    fun <T> ${t.name}(): FiniteAnimationSpec<T> = if (reduced) snap() else YeetMotion.${t.name}()`);
  L.push(`    val liftScale: Float get() = if (reduced) 1f else YeetGesture.liftScale`, `    val targetScale: Float get() = if (reduced) 1f else YeetGesture.targetScale`, '}', '');
  L.push('/** Параметры жестов и микро-анимаций (Storybook → Foundations/Анимации → Микро-анимации). */', 'object YeetGesture {');
  for (const t of v.list('motion.gesture')) {
    const unit = v.x(t).unit;
    L.push(`    /** ${t.$description}${unit === 'px/s' ? ' (dp/с)' : ''} */`, t.$type === 'duration' ? `    const val ${t.name}Millis = ${t.$value}L` : t.$type === 'dimension' ? `    val ${t.name} = ${t.$value}` : `    const val ${t.name} = ${t.$value}f`);
  }
  L.push('}', '', '/** Хаптика: вызывать при смене состояния, не на каждое касание. view.yeetHaptic(YeetHaptic.drop); в Compose — LocalView.current. */', 'object YeetHaptic {');
  const hc = (n) => `HapticFeedbackConstants.${n}`;
  const haptics = v.list('motion.haptic');
  for (const t of haptics) {
    const h = t.$value;
    L.push(`    /** ${t.$description}. ${v.x(t).use} */`, h.androidMin ? `    val ${t.name}: Int get() = if (Build.VERSION.SDK_INT >= ${h.androidMin}) ${hc(h.android)} else ${hc(h.androidFallback)}` : `    val ${t.name}: Int get() = ${hc(h.android)}`);
  }
  L.push('}', '', 'fun View.yeetHaptic(type: Int): Boolean = performHapticFeedback(type)', '');
  L.push('/** Событие хаптики (tokens.motion.haptic) — для YeetTheme.haptics.perform(...). */', 'enum class YeetHapticEvent(val ios: String) {');
  for (const t of haptics) L.push(`    /** ${t.$description} */`, `    ${pascal(v.key(t))}("${t.$value.ios}"),`);
  L.push('    ;', '', '    /** HapticFeedbackConstants с запасным вариантом для старых API (androidMin / androidFallback). */', '    val feedbackConstant: Int', '        get() = when (this) {');
  for (const t of haptics) L.push(`            ${pascal(v.key(t))} -> YeetHaptic.${t.name}`);
  L.push('        }', '}', '');
  const shT = v.get('shadow.floating'), sh = shT.$value, shDark = v.inMode(shT, 'dark').$value;
  L.push(`/** ${shT.$description}: y ${sh.y}, blur ${sh.blur}. В Compose — Modifier.yeetFloatingShadow() из модуля native/android (или Modifier.shadow(elevation = ${sh.blur / 4}.dp)). */`, 'object YeetShadow {', `    val floatingLight = ${sh.color}`, `    val floatingDark = ${shDark.color}`, `    val floatingElevation = ${sh.blur / 4}.dp`, `    val floatingOffsetX = ${sh.x}.dp`, `    val floatingOffsetY = ${sh.y}.dp`, `    /** Размытие как в CSS / Figma (blur radius). */`, `    val floatingBlur = ${sh.blur}.dp`, '}');
  // Токены 2.0
  for (const g of EXTRA_GROUPS) {
    const node = v.groupNode(g), tokens = deep(v, g);
    L.push('');
    for (const t of tokens.filter((x) => x.$type === 'color'))
      L.push(`/** ${t.$description} */`, `val YeetColorScheme.${camel(t.path.join('-'))}: Color get() = ${v.get(refPath(v.orig(t))).name}`);
    L.push(...(node.$description ? [`/** ${node.$description} */`] : []), `object Yeet${pascal(g)} {`);
    for (const t of tokens) {
      if (t.$type === 'color') continue;
      const o = v.orig(t), name = kotlinName(member(t));
      L.push(`    /** ${t.$description} */`, t.$type === 'number' ? `    const val ${name} = ${t.$value}f` : `    val ${name} = ${isRef(o) ? v.get(refPath(o)).$value : t.$value}`);
    }
    L.push('}');
  }
  return L.join('\n') + '\n';
}

