// Сгенерировано scripts/build-tokens.mjs из tokens/tokens.json — не редактировать вручную.
// SwiftUI. Цвета меняются со светлой / тёмной темой системы автоматически (UIColor с dynamicProvider, без asset-каталога).
// Шрифты лежат в ресурсах пакета YeetDesignSystem и регистрируются при первом использовании (YeetFonts.register()).

import CoreText
import SwiftUI
import UIKit

private extension UIColor {
    convenience init(hex: UInt32, alpha: CGFloat = 1) {
        self.init(red: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: alpha)
    }
}

private func dynamic(_ light: UIColor, _ dark: UIColor) -> Color {
    Color(UIColor { $0.userInterfaceStyle == .dark ? dark : light })
}

/// Примитивы палитры. В компонентах не используются — только через семантические `YeetColor`.
public enum YeetPrimitive {
    public static let blue500 = Color(UIColor(hex: 0x0100F4, alpha: 1))
    public static let blue400 = Color(UIColor(hex: 0x4B4BFF, alpha: 1))
    public static let blue200 = Color(UIColor(hex: 0x8A8AFF, alpha: 1))
    public static let red600 = Color(UIColor(hex: 0xCC291B, alpha: 1))
    public static let red500 = Color(UIColor(hex: 0xFF4230, alpha: 1))
    public static let red400 = Color(UIColor(hex: 0xFF6B5C, alpha: 1))
    public static let neutral0 = Color(UIColor(hex: 0xFFFFFF, alpha: 1))
    public static let neutral50 = Color(UIColor(hex: 0xF7F7F7, alpha: 1))
    public static let neutral500 = Color(UIColor(hex: 0x777777, alpha: 1))
    public static let neutral600 = Color(UIColor(hex: 0x6E6E6E, alpha: 1))
    public static let neutral1000 = Color(UIColor(hex: 0x000000, alpha: 1))
    public static let graphite50 = Color(UIColor(hex: 0xF5F5F7, alpha: 1))
    public static let graphite400 = Color(UIColor(hex: 0x8E8E93, alpha: 1))
    public static let graphite850 = Color(UIColor(hex: 0x26262B, alpha: 1))
    public static let graphite900 = Color(UIColor(hex: 0x1A1A1E, alpha: 1))
    public static let graphite950 = Color(UIColor(hex: 0x0F0F11, alpha: 1))
}

public enum YeetColor {
    // Поверхности
    /// Фон экрана · Figma ui-colors/white
    public static let bgCanvas = dynamic(UIColor(hex: 0xFFFFFF, alpha: 1), UIColor(hex: 0x0F0F11, alpha: 1))
    /// Поднятые поверхности: tab-bar, sheet, dialog, hint · Figma ui-colors/elevated
    public static let bgElevated = dynamic(UIColor(hex: 0xFFFFFF, alpha: 1), UIColor(hex: 0x1A1A1E, alpha: 1))
    /// Карточки, поля, tertiary-кнопки · Figma ui-colors/light-grey
    public static let bgSubtle = dynamic(UIColor(hex: 0xF7F7F7, alpha: 1), UIColor(hex: 0x26262B, alpha: 1))
    /// Snackbar, Secondary-кнопка, погода · Figma ui-colors/black
    public static let bgInverse = dynamic(UIColor(hex: 0x000000, alpha: 1), UIColor(hex: 0xF5F5F7, alpha: 1))
    /// Затемнение под модальным sheet · Figma ui-colors/overlay
    public static let bgOverlay = dynamic(UIColor(hex: 0x000000, alpha: 0.4), UIColor(hex: 0x000000, alpha: 0.6))
    // Контент
    /// Основной текст и иконки · Figma ui-colors/black
    public static let textPrimary = dynamic(UIColor(hex: 0x000000, alpha: 1), UIColor(hex: 0xF5F5F7, alpha: 1))
    /// Вторичный текст, лейблы, подписи · Figma ui-colors/grey
    public static let textSecondary = dynamic(UIColor(hex: 0x6E6E6E, alpha: 1), UIColor(hex: 0x8E8E93, alpha: 1))
    /// Текст на inverse-поверхности · Figma ui-colors/white
    public static let textInverse = dynamic(UIColor(hex: 0xFFFFFF, alpha: 1), UIColor(hex: 0x0F0F11, alpha: 1))
    /// Текст и иконки на accent / danger · Figma ui-colors/on-accent
    public static let textOnAccent = dynamic(UIColor(hex: 0xFFFFFF, alpha: 1), UIColor(hex: 0xFFFFFF, alpha: 1))
    /// Вторичный текст на inverse-поверхности: подпись в карточке погоды · Figma ui-colors/inverse-secondary
    public static let textInverseSecondary = dynamic(UIColor(hex: 0xA7B3BF, alpha: 1), UIColor(hex: 0x5B6470, alpha: 1))
    /// Текст на danger (бейдж скидки) — белый в любом бренде · Figma ui-colors/on-accent
    public static let textOnDanger = dynamic(UIColor(hex: 0xFFFFFF, alpha: 1), UIColor(hex: 0xFFFFFF, alpha: 1))
    /// Статус-бар, логотип, подсказка и иконки поверх фото и тёмной камеры (Splash, Search / Photo / Crop) — белый в любой теме и бренде · Figma ui-colors/white
    public static let textOnPhoto = dynamic(UIColor(hex: 0xFFFFFF, alpha: 1), UIColor(hex: 0xFFFFFF, alpha: 1))
    /// Акцентный текст, выбранное · Figma ui-colors/blue-text
    public static let textAccent = dynamic(UIColor(hex: 0x0100F4, alpha: 1), UIColor(hex: 0x8A8AFF, alpha: 1))
    /// Ошибки, деструктивные действия · Figma ui-colors/red-text
    public static let textDanger = dynamic(UIColor(hex: 0xCC291B, alpha: 1), UIColor(hex: 0xFF6B5C, alpha: 1))
    // Акцент, обратная связь, линии
    /// Главное действие, выбранное, фокус · Figma ui-colors/blue
    public static let accent = dynamic(UIColor(hex: 0x0100F4, alpha: 1), UIColor(hex: 0x4B4BFF, alpha: 1))
    /// Фон выбранного чипса (Soft) и сообщения пользователя. Light — сплошной #F1F4FF, как во флоу New app design (не прозрачный: на сером фоне не темнеет) · Figma ui-colors/blue-10%
    public static let accentSoft = dynamic(UIColor(hex: 0xF1F4FF, alpha: 1), UIColor(hex: 0x4B4BFF, alpha: 0.2))
    /// Удаление, ошибка, бейдж скидки · Figma ui-colors/red
    public static let danger = dynamic(UIColor(hex: 0xCC291B, alpha: 1), UIColor(hex: 0xCC291B, alpha: 1))
    /// Фон Destructive-кнопки · Figma ui-colors/red-10%
    public static let dangerSoft = dynamic(UIColor(hex: 0xFF4230, alpha: 0.1), UIColor(hex: 0xFF6B5C, alpha: 0.18))
    /// Обводки свотчей, гистограмма, фон неактивных точек · Figma ui-colors/black-10%
    public static let borderSubtle = dynamic(UIColor(hex: 0x000000, alpha: 0.1), UIColor(hex: 0xF5F5F7, alpha: 0.12))
    /// Разделители строк в input-group и list-group · Figma ui-colors/divider
    public static let divider = dynamic(UIColor(hex: 0x000000, alpha: 0.05), UIColor(hex: 0xF5F5F7, alpha: 0.08))
    /// Точки фона коллажа и холста (2 px, шаг 10) · Figma ui-colors/pattern-dot
    public static let patternDot = dynamic(UIColor(hex: 0x000000, alpha: 0.23), UIColor(hex: 0xF5F5F7, alpha: 0.23))
    /// Хэндл шторки: декоративный, ≈ 1,5:1 к bg-elevated (D8, #58) · Figma ui-colors/handle
    public static let handle = dynamic(UIColor(hex: 0x000000, alpha: 0.17), UIColor(hex: 0xF5F5F7, alpha: 0.14))
}

/// Цвет вещи — атрибут одежды, не интерфейс.
public enum YeetItemColor: String, CaseIterable, Identifiable {
    case black
    case grey
    case white
    case purple
    case pink
    case green
    case blue
    case yellow
    case orange
    case red
    case beige
    case brown
    public var id: String { rawValue }
    public var color: Color {
        switch self {
        case .black: return Color(UIColor(hex: 0x1A1A2E, alpha: 1))
        case .grey: return Color(UIColor(hex: 0x777777, alpha: 1))
        case .white: return Color(UIColor(hex: 0xFFFFFF, alpha: 1))
        case .purple: return Color(UIColor(hex: 0x6A00FF, alpha: 1))
        case .pink: return Color(UIColor(hex: 0xD900FF, alpha: 1))
        case .green: return Color(UIColor(hex: 0x00D08B, alpha: 1))
        case .blue: return Color(UIColor(hex: 0x0100F4, alpha: 1))
        case .yellow: return Color(UIColor(hex: 0xFFD000, alpha: 1))
        case .orange: return Color(UIColor(hex: 0xFF8800, alpha: 1))
        case .red: return Color(UIColor(hex: 0xFF4230, alpha: 1))
        case .beige: return Color(UIColor(hex: 0xFFE1C7, alpha: 1))
        case .brown: return Color(UIColor(hex: 0xC26547, alpha: 1))
        }
    }
    /// Цвет буквы / иконки на этом цвете (контраст ≥ 4.5 : 1).
    public var onColor: Color {
        switch self {
        case .black: return Color(UIColor(hex: 0xFFFFFF, alpha: 1))
        case .grey: return Color(UIColor(hex: 0x000000, alpha: 1))
        case .white: return Color(UIColor(hex: 0x000000, alpha: 1))
        case .purple: return Color(UIColor(hex: 0xFFFFFF, alpha: 1))
        case .pink: return Color(UIColor(hex: 0x000000, alpha: 1))
        case .green: return Color(UIColor(hex: 0x000000, alpha: 1))
        case .blue: return Color(UIColor(hex: 0xFFFFFF, alpha: 1))
        case .yellow: return Color(UIColor(hex: 0x000000, alpha: 1))
        case .orange: return Color(UIColor(hex: 0x000000, alpha: 1))
        case .red: return Color(UIColor(hex: 0x000000, alpha: 1))
        case .beige: return Color(UIColor(hex: 0x000000, alpha: 1))
        case .brown: return Color(UIColor(hex: 0x000000, alpha: 1))
        }
    }
    public var title: String {
        switch self {
        case .black: return "Черный"
        case .grey: return "Серый"
        case .white: return "Белый"
        case .purple: return "Фиолетовый"
        case .pink: return "Розовый"
        case .green: return "Зеленый"
        case .blue: return "Синий"
        case .yellow: return "Желтый"
        case .orange: return "Оранжевый"
        case .red: return "Красный"
        case .beige: return "Бежевый"
        case .brown: return "Коричневый"
        }
    }
}

/// Компонентные токены: ссылки на семантические цвета и радиусы (tokens.json → component).
public enum YeetComponent {
    public static let buttonPrimaryBg: Color = YeetColor.accent
    public static let buttonPrimaryFg: Color = YeetColor.textOnAccent
    public static let buttonSecondaryBg: Color = YeetColor.bgInverse
    public static let buttonSecondaryFg: Color = YeetColor.textInverse
    public static let buttonTertiaryBg: Color = YeetColor.bgSubtle
    public static let buttonTertiaryFg: Color = YeetColor.textPrimary
    public static let buttonInverseBg: Color = YeetColor.bgElevated
    public static let buttonInverseFg: Color = YeetColor.textPrimary
    public static let buttonGhostBg: Color = .clear
    public static let buttonGhostFg: Color = YeetColor.textPrimary
    public static let buttonSoftBg: Color = YeetColor.accentSoft
    public static let buttonSoftFg: Color = YeetColor.textAccent
    public static let buttonDestructiveBg: Color = YeetColor.dangerSoft
    public static let buttonDestructiveFg: Color = YeetColor.textDanger
    public static let cardBg: Color = YeetColor.bgSubtle
    public static let cardRadius: CGFloat = YeetRadius.lg
    public static let sheetBg: Color = YeetColor.bgElevated
    public static let sheetRadius: CGFloat = YeetRadius.xl
    public static let sheetRadiusBottom: CGFloat = YeetRadius.bar
    public static let tabBarBg: Color = YeetColor.bgElevated
    public static let inputBg: Color = YeetColor.bgSubtle
    /// Верх высокой шторки: 8 под статус-баром (D2). Web — статус-бар + 8, натив — 8 от safe area top
    public static let sheetTopGap: CGFloat = YeetSpace.s8
    /// Хэндл шторки, 48 × 4 (D8)
    public static let sheetHandle: Color = YeetColor.handle
    /// Заголовок → контент и заголовок → описание (решение владельца 29.09, #58)
    public static let sheetTitleGap: CGFloat = YeetSpace.s16
}

public enum YeetSpace {
    public static let s0: CGFloat = 0
    public static let s2: CGFloat = 2
    public static let s4: CGFloat = 4
    public static let s8: CGFloat = 8
    public static let s12: CGFloat = 12
    public static let s16: CGFloat = 16
    public static let s20: CGFloat = 20
    public static let s24: CGFloat = 24
    public static let s28: CGFloat = 28
    public static let s32: CGFloat = 32
    public static let s40: CGFloat = 40
    public static let s48: CGFloat = 48
    public static let s52: CGFloat = 52
    public static let s56: CGFloat = 56
    public static let screenGutter: CGFloat = 20
}

public enum YeetRadius {
    /// Хэндл sheet
    public static let xs: CGFloat = 4
    /// Badge
    public static let sm: CGFloat = 12
    /// Snackbar, cap столбца графика
    public static let md: CGFloat = 16
    /// Карточки, поля, фото
    public static let lg: CGFloat = 20
    /// Кнопки-капсулы, верх sheet, подсказка стилиста
    public static let xl: CGFloat = 32
    /// Tab-bar, низ плавающего sheet (концентрично углу экрана)
    public static let bar: CGFloat = 48
    /// Аватар, радио
    public static let full: CGFloat = 999
    /// Все 4 угла bottom sheet и dialog: концентрично экрану 56 при отступе 8 (#58)
    public static let overlay: CGFloat = 48
}

/// Макет: iPhone 393 × 852, поля 20.
public enum YeetLayout {
    public static let screenWidth: CGFloat = 393
    public static let screenHeight: CGFloat = 852
    public static let screenGutter: CGFloat = 20
    public static let statusBarHeight: CGFloat = 62
}

/// Семейства и регистрация переменных шрифтов (Inter, Roboto Slab).
public enum YeetFonts {
    /// Google Fonts · apache/robotoslab
    public static let display = "Roboto Slab"
    /// Google Fonts · ofl/inter
    public static let text = "Inter"
    private static let files = ["RobotoSlab-Variable", "Inter-Variable"]
    private static var bundle: Bundle { .module }
    private static let registration: Void = {
        for name in files {
            guard let url = bundle.url(forResource: name, withExtension: "ttf") ?? bundle.url(forResource: name, withExtension: "ttf", subdirectory: "Fonts") else { continue }
            // Уже зарегистрирован (UIAppFonts) — ошибка игнорируется.
            _ = CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil)
        }
    }()
    /// Регистрирует шрифты один раз за процесс. Вызывается автоматически из `yeetText` и `YeetTextStyle.font`.
    public static func register() { _ = registration }
}

/// Текстовый стиль. `weight` — значение оси wght переменного шрифта (как font-weight в CSS).
public struct YeetTextStyle {
    public let family: String
    public let size: CGFloat
    public let lineHeight: CGFloat
    public let tracking: CGFloat
    public let weight: CGFloat
    /// Кривая Dynamic Type, по которой масштабируется стиль.
    public let textStyle: Font.TextStyle

    public init(family: String, size: CGFloat, lineHeight: CGFloat, tracking: CGFloat, weight: CGFloat, textStyle: Font.TextStyle) {
        self.family = family
        self.size = size
        self.lineHeight = lineHeight
        self.tracking = tracking
        self.weight = weight
        self.textStyle = textStyle
    }

    /// Тот же стиль с другим весом (например, Caption 460 в карточке погоды).
    public func withWeight(_ weight: CGFloat) -> YeetTextStyle {
        YeetTextStyle(family: family, size: size, lineHeight: lineHeight, tracking: tracking, weight: weight, textStyle: textStyle)
    }

    /// SwiftUI-шрифт с Dynamic Type; вес округлён до ближайшего системного. Точный вес и межстрочный интервал — `yeetText(_:)`.
    public var font: Font {
        YeetFonts.register()
        return .custom(family, size: size, relativeTo: textStyle).weight(Font.Weight(css: weight))
    }

    /// UIFont с точным значением оси wght.
    public func uiFont(size pointSize: CGFloat? = nil) -> UIFont {
        YeetFonts.register()
        let wght = NSNumber(value: 0x7767_6874 as UInt32) // 'wght'
        let variation = UIFontDescriptor.AttributeName(rawValue: kCTFontVariationAttribute as String)
        let descriptor = UIFontDescriptor(fontAttributes: [.family: family, variation: [wght: weight] as [NSNumber: CGFloat]])
        return UIFont(descriptor: descriptor, size: pointSize ?? size)
    }
}

public enum YeetType {
    /// Заголовки экранов
    public static let h1 = YeetTextStyle(family: "Roboto Slab", size: 32, lineHeight: 36, tracking: -1, weight: 380, textStyle: .largeTitle)
    /// Секции, пустые состояния, числа
    public static let h2 = YeetTextStyle(family: "Roboto Slab", size: 24, lineHeight: 28, tracking: -0.4, weight: 400, textStyle: .title)
    /// Заголовки sheet, диалогов, карточек
    public static let h3 = YeetTextStyle(family: "Roboto Slab", size: 19, lineHeight: 24, tracking: -0.3, weight: 400, textStyle: .title3)
    /// Текст, кнопки, пункты списков
    public static let body = YeetTextStyle(family: "Inter", size: 14, lineHeight: 20, tracking: 0, weight: 460, textStyle: .body)
    /// Подписи, мета-данные, бейджи
    public static let caption = YeetTextStyle(family: "Inter", size: 12, lineHeight: 16, tracking: 0, weight: 400, textStyle: .caption)
}

extension Font.Weight {
    init(css: CGFloat) {
        switch css {
        case ..<350: self = .light
        case ..<450: self = .regular
        case ..<550: self = .medium
        default: self = .semibold
        }
    }
}

/// Шрифт, трекинг и межстрочный интервал стиля; размер масштабируется Dynamic Type по `textStyle`.
public struct YeetTextModifier: ViewModifier {
    private let style: YeetTextStyle
    @ScaledMetric private var scaledSize: CGFloat

    public init(_ style: YeetTextStyle) {
        self.style = style
        _scaledSize = ScaledMetric(wrappedValue: style.size, relativeTo: style.textStyle)
    }

    public func body(content: Content) -> some View {
        let ratio = scaledSize / style.size
        let uiFont = style.uiFont(size: scaledSize)
        let extra = max(0, style.lineHeight * ratio - uiFont.lineHeight)
        return content
            .font(Font(uiFont as CTFont))
            .tracking(style.tracking * ratio)
            .lineSpacing(extra)
            .padding(.vertical, extra / 2)
    }
}

public extension View {
    /// Применяет текстовый стиль: шрифт (точный вес), межстрочный интервал и трекинг, с Dynamic Type.
    func yeetText(_ style: YeetTextStyle) -> some View {
        modifier(YeetTextModifier(style))
    }
}

/// Пружина Figma Smart Animate: та же физика (масса, жёсткость, демпфирование), что в прототипе и в CSS linear().
public struct YeetSpring {
    public let mass: Double
    public let stiffness: Double
    public let damping: Double
    /// Время успокоения, с (для web linear()).
    public let duration: TimeInterval

    public var dampingRatio: Double { damping / (2 * (stiffness * mass).squareRoot()) }
    public var animation: Animation { .interpolatingSpring(mass: mass, stiffness: stiffness, damping: damping, initialVelocity: 0) }
    /// SwiftUI.Spring с той же физикой (iOS 17+).
    @available(iOS 17.0, *)
    public var spring: Spring { Spring(mass: mass, stiffness: stiffness, damping: damping) }

    /// Figma Gentle
    public static let gentle = YeetSpring(mass: 1, stiffness: 100, damping: 15, duration: 1.022)
    /// Figma Quick
    public static let quick = YeetSpring(mass: 1, stiffness: 300, damping: 20, duration: 0.744)
    /// Figma Bouncy
    public static let bouncy = YeetSpring(mass: 1, stiffness: 600, damping: 15, duration: 0.958)
}

public enum YeetMotion {
    /// Нажатие кнопки, scale 0.97
    public static let press = Animation.timingCurve(0.2, 0, 0, 1, duration: 0.15)
    /// Затухание краёв, тосты
    public static let fade = Animation.timingCurve(0.2, 0, 0, 1, duration: 0.24)
    /// Фото сворачивается в шапку при скролле
    public static let collapse = Animation.timingCurve(0, 0, 0.58, 1, duration: 0.3)
    /// Листание образов и поводов по свайпу
    public static let page = Animation.timingCurve(0, 0, 0.58, 1, duration: 0.3)
    /// Таб-бар уступает место FAB · Figma Smart Animate Quick
    public static let nav = YeetSpring.quick.animation
    /// Штамп «Надеть» → отмечено · Figma Smart Animate Bouncy
    public static let stamp = YeetSpring.bouncy.animation
    /// Смена образа: превью ↔ коллаж · Figma Smart Animate Gentle
    public static let swap = YeetSpring.gentle.animation
    /// Выбор: фон чипса, вкладки, строки, цвет лайка
    public static let select = Animation.timingCurve(0.2, 0, 0, 1, duration: 0.15)
    /// Подъём под пальцем: вещь на холсте, карточка при перетаскивании · Figma Smart Animate Quick
    public static let lift = YeetSpring.quick.animation
    /// Бросок в цель: вещь встаёт на место, соседи раздвигаются · Figma Smart Animate Quick
    public static let drop = YeetSpring.quick.animation
    /// Отмена перетаскивания: вещь возвращается туда, откуда взяли · Figma Smart Animate Gentle
    public static let `return` = YeetSpring.gentle.animation
    /// Появление: snackbar, подсказка, диалог
    public static let appear = Animation.timingCurve(0.2, 0, 0, 1, duration: 0.24)
    /// Исчезновение: быстрее появления, чтобы не мешать
    public static let exit = Animation.timingCurve(0.2, 0, 0, 1, duration: 0.15)
}

/// Параметры жестов и микро-анимаций (Storybook → Foundations/Анимации → Микро-анимации).
public enum YeetGesture {
    /// Нажатие кнопки, чипса, иконки
    public static let pressScale: CGFloat = 0.97
    /// Нажатие карточки: чем больше объект, тем меньше сжатие
    public static let pressScaleCard: CGFloat = 0.98
    /// Нажатие штампа
    public static let pressScaleStamp: CGFloat = 0.94
    /// Поднятый предмет при перетаскивании
    public static let liftScale: CGFloat = 1.04
    /// Цель под перетаскиваемым предметом
    public static let targetScale: CGFloat = 1.02
    /// Долгое нажатие до подъёма (перетаскивание в сетке)
    public static let longPress: TimeInterval = 0.4
    /// Задержка нажатого состояния внутри скролла, чтобы скролл не мигал кнопками
    public static let pressDelay: TimeInterval = 0.08
    /// Сдвиг пальца, после которого нажатие отменяется и начинается жест
    public static let touchSlop: CGFloat = 10
    /// Доля ширины: свайп дальше — страница перелистывается
    public static let swipeDistance: CGFloat = 0.3
    /// Скорость броска, после которой свайп засчитан при любой дистанции
    public static let swipeVelocity: CGFloat = 500
    /// Сопротивление за границей: скролл, масштаб 40–300 на холсте
    public static let rubberBand: CGFloat = 0.55
    /// Время показа snackbar без действия (с действием — 6000)
    public static let snackbar: TimeInterval = 4
}

/// Хаптика: вызывать при смене состояния, не на каждое касание. Безопасно из любого потока: генератор отклика создаётся на главном.
public enum YeetHaptic {
    /// Смена выбора: чипс, сегмент, вкладка, радио, шаг слайдера цены. Каждый шаг — один тик, не чаще 1 раза в 50 мс
    public static func select() { DispatchQueue.main.async { UISelectionFeedbackGenerator().selectionChanged() } }
    /// Переключатель, лайк, галочка вещи в режиме выбора. И при включении, и при выключении
    public static func toggle() { DispatchQueue.main.async { UIImpactFeedbackGenerator(style: .light).impactOccurred() } }
    /// Подъём: долгое нажатие сработало, вещь на холсте взята. В момент подъёма, одновременно с scale 1.04
    public static func lift() { DispatchQueue.main.async { UIImpactFeedbackGenerator(style: .medium).impactOccurred() } }
    /// Перетаскиваемая вещь зашла на новую цель или корзину. Только при входе в цель, не при движении внутри
    public static func target() { DispatchQueue.main.async { UISelectionFeedbackGenerator().selectionChanged() } }
    /// Бросок в цель: вещь встала на место. На отпускании пальца
    public static func drop() { DispatchQueue.main.async { UIImpactFeedbackGenerator(style: .light).impactOccurred() } }
    /// Жест перешёл порог: свайп перелистнёт, sheet закроется, pull-to-refresh, масштаб упёрся в 40 / 300 %. Один раз при пересечении порога; обратно — без вибрации
    public static func threshold() { DispatchQueue.main.async { UIImpactFeedbackGenerator(style: .rigid).impactOccurred() } }
    /// Штамп «Надеть» — образ отмечен. В пик пружины bouncy (~120 мс после нажатия)
    public static func stamp() { DispatchQueue.main.async { UINotificationFeedbackGenerator().notificationOccurred(.success) } }
    /// «Не нравится» (малый штамп), смена образа свайпом. На нажатии штампа или при перелистывании образа
    public static func skip() { DispatchQueue.main.async { UIImpactFeedbackGenerator(style: .soft).impactOccurred() } }
    /// Вещь брошена в корзину, подтверждено удаление. На отпускании над корзиной
    public static func delete() { DispatchQueue.main.async { UINotificationFeedbackGenerator().notificationOccurred(.warning) } }
    /// Ошибка: неверный пароль, не загрузилось фото. Вместе с появлением текста ошибки
    public static func error() { DispatchQueue.main.async { UINotificationFeedbackGenerator().notificationOccurred(.error) } }
    /// Долгая операция завершилась по действию пользователя: вещь распознана, образ сохранён. Не для фоновых событий
    public static func success() { DispatchQueue.main.async { UINotificationFeedbackGenerator().notificationOccurred(.success) } }
}

public enum YeetShadow {
    /// Tab-bar, FAB, hint, панель sheet. Figma: стиль shadow/floating, цвет — переменная ui-colors/shadow
    public static let floatingColor = dynamic(UIColor(hex: 0x000000, alpha: 0.12), UIColor(hex: 0x000000, alpha: 0.5))
    public static let floatingRadius: CGFloat = 20
    public static let floatingX: CGFloat = 0
    public static let floatingY: CGFloat = 8
}

public extension View {
    /// Tab-bar, FAB, hint, панель sheet. Figma: стиль shadow/floating, цвет — переменная ui-colors/shadow
    func yeetFloatingShadow() -> some View {
        shadow(color: YeetShadow.floatingColor, radius: YeetShadow.floatingRadius, x: YeetShadow.floatingX, y: YeetShadow.floatingY)
    }
}

/// Прозрачность состояний элемента целиком (не цвета: прозрачные цвета — в color.*).
public enum YeetOpacity {
    /// Недоступная кнопка, иконка, стрелка пейджера
    public static let disabled: Double = 0.4
    /// Нажатая строка списка
    public static let pressed: Double = 0.64
}

/// Слои (z-index) внутри экрана: чем выше, тем ближе к пользователю. Web — z-index, iOS — .zIndex, Android — Modifier.zIndex.
public enum YeetLayer {
    /// Подложка: медиа под сворачивающейся шапкой
    public static let base: Double = 0
    /// Над соседями: вкладка таб-бара, подпись коллажа, текущий образ
    public static let raised: Double = 1
    /// Поверх контента: погода и штамп на «Сегодня», подсказка кропа, перетаскиваемая вещь
    public static let float: Double = 2
    /// Шапка, таб-бар, нижняя панель, стрелки пейджера
    public static let bar: Double = 3
    /// Плавающие и прилипающие элементы экрана, штамп в деталях
    public static let sticky: Double = 4
    /// Затемнение и модальные sheet / dialog
    public static let overlay: Double = 5
}

public enum YeetSize {
    /// S: чипсы, компактные кнопки, свёрнутая шапка
    public static let controlS: CGFloat = 40
    /// M: поле ввода в панели, заголовок-чипс, сегмент M
    public static let controlM: CGFloat = 48
    /// L: snackbar, чат, строка списка без группы
    public static let controlL: CGFloat = 52
    /// XL: главная кнопка, поле, таб-бар, строка в группе
    public static let controlXl: CGFloat = 56
}

/// Кольцо фокуса клавиатуры (:focus-visible). Цвет — text-accent: держит ≥ 3 : 1 во всех брендах, accent в светлых брендах падает до 1.4 : 1.
public enum YeetFocusRing {
    /// Цвет кольца
    public static let color: Color = YeetColor.textAccent
    /// Толщина outline
    public static let width: CGFloat = 2
    /// Отступ снаружи: кнопки, чипсы, ссылки
    public static let offset: CGFloat = 2
    /// Кольцо внутри: элемент у края экрана или внутри карточки
    public static let offsetInset: CGFloat = -2
}

/// Толщина линий: обводки, разделители, кольца.
public enum YeetBorderWidth {
    /// Разделители, обводка свотча, волосяная рамка кропа
    public static let thin: CGFloat = 1
    /// Линия иконок ui-icons (24 × 24) и кольцо аватара в таб-баре
    public static let icon: CGFloat = 1.3
    /// Кольцо фокуса поля ввода, выделение вещи на холсте
    public static let medium: CGFloat = 1.5
    /// Уголки кропа, кольцо стопки аватаров, цель перетаскивания
    public static let thick: CGFloat = 2
}

/// Ширины, под которые проверяется вёрстка. CSS-переменные нельзя подставить в @media / @container — значения для сверки и JS (matchMedia).
public enum YeetBreakpoint {
    /// Контейнер таб-бара (CSS @container): уже — на экране 320 с кнопкой «+» вкладки идут без зазора
    public static let containerCompact: CGFloat = 300
    /// Самый узкий экран (iPhone SE)
    public static let compact: CGFloat = 320
    /// Базовый экран макетов (iPhone 15/16)
    public static let regular: CGFloat = 393
    /// Широкий экран (Pro Max)
    public static let large: CGFloat = 430
}
