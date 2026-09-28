// Сгенерировано scripts/build-tokens.mjs из tokens/tokens.json — не редактировать вручную.
// SwiftUI. Цвета меняются со светлой / тёмной темой системы автоматически.
// Шрифты: добавьте в проект tokens/fonts/RobotoSlab-Variable.ttf, Inter-Variable.ttf и перечислите их в Info.plist → UIAppFonts.

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
}

/// Цвет вещи — атрибут одежды, не интерфейс.
public enum YeetItemColor: String, CaseIterable {
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

public enum YeetSpace {
    public static let s0: CGFloat = 0
    public static let s1: CGFloat = 1
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
    public static let s64: CGFloat = 64
    public static let s72: CGFloat = 72
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
}

public struct YeetTextStyle {
    public let font: Font
    public let lineHeight: CGFloat
    public let tracking: CGFloat
    public let size: CGFloat
}

public enum YeetType {
    /// Заголовки экранов
    public static let h1 = YeetTextStyle(font: .custom("Roboto Slab", size: 32).weight(Font.Weight(380)), lineHeight: 36, tracking: -1, size: 32)
    /// Секции, пустые состояния, числа
    public static let h2 = YeetTextStyle(font: .custom("Roboto Slab", size: 24).weight(Font.Weight(400)), lineHeight: 28, tracking: -0.4, size: 24)
    /// Заголовки sheet, диалогов, карточек
    public static let h3 = YeetTextStyle(font: .custom("Roboto Slab", size: 19).weight(Font.Weight(400)), lineHeight: 24, tracking: -0.3, size: 19)
    /// Текст, кнопки, пункты списков
    public static let body = YeetTextStyle(font: .custom("Inter", size: 14).weight(Font.Weight(460)), lineHeight: 20, tracking: 0, size: 14)
    /// Подписи, мета-данные, бейджи
    public static let caption = YeetTextStyle(font: .custom("Inter", size: 12).weight(Font.Weight(400)), lineHeight: 16, tracking: 0, size: 12)
}

private extension Font.Weight {
    init(_ css: Int) {
        switch css {
        case ..<350: self = .light
        case ..<450: self = .regular
        case ..<550: self = .medium
        default: self = .semibold
        }
    }
}

public extension View {
    /// Применяет текстовый стиль: шрифт, межстрочный интервал и трекинг.
    func yeetText(_ style: YeetTextStyle) -> some View {
        font(style.font).lineSpacing(style.lineHeight - style.size).tracking(style.tracking)
    }
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
    public static let nav = Animation.interpolatingSpring(mass: 1, stiffness: 300, damping: 20)
    /// Штамп «Надеть» → отмечено · Figma Smart Animate Bouncy
    public static let stamp = Animation.interpolatingSpring(mass: 1, stiffness: 600, damping: 15)
    /// Смена образа: превью ↔ коллаж · Figma Smart Animate Gentle
    public static let swap = Animation.interpolatingSpring(mass: 1, stiffness: 100, damping: 15)
    /// Выбор: фон чипса, вкладки, строки, цвет лайка
    public static let select = Animation.timingCurve(0.2, 0, 0, 1, duration: 0.15)
    /// Подъём под пальцем: вещь на холсте, карточка при перетаскивании · Figma Smart Animate Quick
    public static let lift = Animation.interpolatingSpring(mass: 1, stiffness: 300, damping: 20)
    /// Бросок в цель: вещь встаёт на место, соседи раздвигаются · Figma Smart Animate Quick
    public static let drop = Animation.interpolatingSpring(mass: 1, stiffness: 300, damping: 20)
    /// Отмена перетаскивания: вещь возвращается туда, откуда взяли · Figma Smart Animate Gentle
    public static let return = Animation.interpolatingSpring(mass: 1, stiffness: 100, damping: 15)
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

/// Хаптика: вызывать при смене состояния, не на каждое касание. Для подъёма вызывать prepare() на touch-down.
public enum YeetHaptic {
    /// Смена выбора: чипс, сегмент, вкладка, радио, шаг слайдера цены. Каждый шаг — один тик, не чаще 1 раза в 50 мс
    public static func select() { UISelectionFeedbackGenerator().selectionChanged() }
    /// Переключатель, лайк, галочка вещи в режиме выбора. И при включении, и при выключении
    public static func toggle() { UIImpactFeedbackGenerator(style: .light).impactOccurred() }
    /// Подъём: долгое нажатие сработало, вещь на холсте взята. В момент подъёма, одновременно с scale 1.04
    public static func lift() { UIImpactFeedbackGenerator(style: .medium).impactOccurred() }
    /// Перетаскиваемая вещь зашла на новую цель или корзину. Только при входе в цель, не при движении внутри
    public static func target() { UISelectionFeedbackGenerator().selectionChanged() }
    /// Бросок в цель: вещь встала на место. На отпускании пальца
    public static func drop() { UIImpactFeedbackGenerator(style: .light).impactOccurred() }
    /// Жест перешёл порог: свайп перелистнёт, sheet закроется, pull-to-refresh, масштаб упёрся в 40 / 300 %. Один раз при пересечении порога; обратно — без вибрации
    public static func threshold() { UIImpactFeedbackGenerator(style: .rigid).impactOccurred() }
    /// Штамп «Надеть» — образ отмечен. В пик пружины bouncy (~120 мс после нажатия)
    public static func stamp() { UINotificationFeedbackGenerator().notificationOccurred(.success) }
    /// «Не нравится» (малый штамп), смена образа свайпом. На нажатии штампа или при перелистывании образа
    public static func skip() { UIImpactFeedbackGenerator(style: .soft).impactOccurred() }
    /// Вещь брошена в корзину, подтверждено удаление. На отпускании над корзиной
    public static func delete() { UINotificationFeedbackGenerator().notificationOccurred(.warning) }
    /// Ошибка: неверный пароль, не загрузилось фото. Вместе с появлением текста ошибки
    public static func error() { UINotificationFeedbackGenerator().notificationOccurred(.error) }
    /// Долгая операция завершилась по действию пользователя: вещь распознана, образ сохранён. Не для фоновых событий
    public static func success() { UINotificationFeedbackGenerator().notificationOccurred(.success) }
}

public extension View {
    /// Tab-bar, FAB, hint, панель sheet. Figma: стиль shadow/floating, цвет — переменная ui-colors/shadow
    func yeetFloatingShadow() -> some View {
        shadow(color: dynamic(UIColor(hex: 0x000000, alpha: 0.12), UIColor(hex: 0x000000, alpha: 0.5)), radius: 20, x: 0, y: 8)
    }
}
