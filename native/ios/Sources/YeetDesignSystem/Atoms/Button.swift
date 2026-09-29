import SwiftUI

/// Семантический стиль кнопки (React: `ButtonStyle`, prop `variant`; Figma: Style).
/// Один `primary` на экран; удаление — всегда `destructive`.
public enum YeetButtonStyle: String, CaseIterable, Identifiable {
    case primary, secondary, tertiary, inverse, ghost, soft, destructive

    public var id: String { rawValue }

    public var background: Color {
        switch self {
        case .primary: return YeetComponent.buttonPrimaryBg
        case .secondary: return YeetComponent.buttonSecondaryBg
        case .tertiary: return YeetComponent.buttonTertiaryBg
        case .inverse: return YeetComponent.buttonInverseBg
        case .ghost: return YeetComponent.buttonGhostBg
        case .soft: return YeetComponent.buttonSoftBg
        case .destructive: return YeetComponent.buttonDestructiveBg
        }
    }

    public var foreground: Color {
        switch self {
        case .primary: return YeetComponent.buttonPrimaryFg
        case .secondary: return YeetComponent.buttonSecondaryFg
        case .tertiary: return YeetComponent.buttonTertiaryFg
        case .inverse: return YeetComponent.buttonInverseFg
        case .ghost: return YeetComponent.buttonGhostFg
        case .soft: return YeetComponent.buttonSoftFg
        case .destructive: return YeetComponent.buttonDestructiveFg
        }
    }
}

/// Размер кнопки (React: `ControlSize`): S 40, M 48, L 52, XL 56.
public enum YeetControlSize: String, CaseIterable, Identifiable {
    case s = "S", m = "M", l = "L", xl = "XL"

    public var id: String { rawValue }

    public var height: CGFloat {
        switch self {
        case .s: return 40
        case .m: return 48
        case .l: return 52
        case .xl: return 56
        }
    }

    /// Боковой отступ текстовой кнопки.
    public var padding: CGFloat {
        switch self {
        case .s: return YeetSpace.s12
        case .m: return YeetSpace.s16
        case .l: return YeetSpace.s20
        case .xl: return YeetSpace.s24
        }
    }

    /// Расстояние между иконкой и текстом.
    public var gap: CGFloat {
        switch self {
        case .s, .m: return YeetSpace.s8
        case .l, .xl: return YeetSpace.s12
        }
    }

    /// Иконка в `IconButton`: 20 у S, иначе 24.
    public var iconSize: CGFloat { self == .s ? 20 : 24 }
}

// MARK: - Button

/// Кнопка-капсула с текстом (React: `Button`).
///
/// Контексты во флоу: главный CTA онбординга и входа (Primary XL), пара действий в sheet (Tertiary + Primary L),
/// фильтры-дропдауны (Tertiary / Soft S + `chevronUpDown`), «Пропустить» (Ghost M).
/// Выключение — стандартный `.disabled(true)`: прозрачность 0.4.
/// **Загрузка:** `isLoading` — «Войти» пока идёт запрос, «Сохранить» вещь, «Удалить аккаунт»: вместо содержимого спиннер,
/// ширина кнопки не меняется, повторное нажатие не срабатывает, но кнопка остаётся доступной VoiceOver (значение — `loadingLabel`).
public struct YeetButton<Label: View>: View {
    private let variant: YeetButtonStyle
    private let size: YeetControlSize
    private let leftIcon: YeetIconName?
    private let rightIcon: YeetIconName?
    private let fullWidth: Bool
    private let floating: Bool
    private let isLoading: Bool
    private let loadingLabel: String
    private let action: () -> Void
    private let label: Label

    public init(
        variant: YeetButtonStyle = .primary,
        size: YeetControlSize = .l,
        leftIcon: YeetIconName? = nil,
        rightIcon: YeetIconName? = nil,
        fullWidth: Bool = false,
        floating: Bool = false,
        isLoading: Bool = false,
        loadingLabel: String = "Загрузка",
        action: @escaping () -> Void,
        @ViewBuilder label: () -> Label
    ) {
        self.variant = variant
        self.size = size
        self.leftIcon = leftIcon
        self.rightIcon = rightIcon
        self.fullWidth = fullWidth
        self.floating = floating
        self.isLoading = isLoading
        self.loadingLabel = loadingLabel
        self.action = action
        self.label = label()
    }

    public var body: some View {
        Button {
            if !isLoading { action() }
        } label: {
            HStack(spacing: size.gap) {
                if let leftIcon {
                    YeetIcon(name: leftIcon)
                }
                label
                    .yeetText(YeetType.body)
                    .lineLimit(1)
                if let rightIcon {
                    YeetIcon(name: rightIcon)
                }
            }
            .opacity(isLoading ? 0 : 1)
            .overlay {
                if isLoading { YeetSpinner(size: size.iconSize) }
            }
            .padding(.horizontal, size.padding)
            .frame(maxWidth: fullWidth ? .infinity : nil)
            .frame(minHeight: size.height)
            .foregroundStyle(variant.foreground)
            .background(Capsule().fill(variant.background))
            .yeetFloating(floating)
            .contentShape(Capsule())
        }
        .buttonStyle(YeetPressStyle(scale: isLoading ? 1 : YeetGesture.pressScale))
        .yeetHitArea(height: size.height)
        .modifier(YeetBusy(isLoading: isLoading, label: loadingLabel))
    }
}

public extension YeetButton where Label == Text {
    /// Кнопка с текстом (React: `children`).
    init(
        _ title: String,
        variant: YeetButtonStyle = .primary,
        size: YeetControlSize = .l,
        leftIcon: YeetIconName? = nil,
        rightIcon: YeetIconName? = nil,
        fullWidth: Bool = false,
        floating: Bool = false,
        isLoading: Bool = false,
        loadingLabel: String = "Загрузка",
        action: @escaping () -> Void
    ) {
        self.init(variant: variant, size: size, leftIcon: leftIcon, rightIcon: rightIcon, fullWidth: fullWidth, floating: floating, isLoading: isLoading, loadingLabel: loadingLabel, action: action) {
            Text(title)
        }
    }
}

// MARK: - Загрузка

/// Спиннер `spin`: оборот за 1,2 с; при «Уменьшении движения» — пульсация прозрачности 1,6 с вместо вращения.
struct YeetSpinner: View {
    let size: CGFloat
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var spinning = false

    var body: some View {
        YeetIcon(name: .spin, size: size)
            .rotationEffect(.degrees(!reduceMotion && spinning ? 360 : 0))
            .opacity(reduceMotion && spinning ? 0.4 : 1)
            .animation(
                reduceMotion
                    ? .easeInOut(duration: 1.6).repeatForever(autoreverses: true)
                    : .linear(duration: 1.2).repeatForever(autoreverses: false),
                value: spinning
            )
            .onAppear { spinning = true }
            .accessibilityHidden(true)
    }
}

/// Кнопка в загрузке: VoiceOver читает «Загрузка» значением, повторное нажатие не срабатывает (React: `aria-busy`).
private struct YeetBusy: ViewModifier {
    let isLoading: Bool
    let label: String

    @ViewBuilder
    func body(content: Content) -> some View {
        if isLoading {
            content.accessibilityValue(Text(label))
        } else {
            content
        }
    }
}

// MARK: - IconButton

/// Круглая кнопка с иконкой (React: `IconButton`). Те же стили и размеры, что у `YeetButton`.
///
/// Контексты: «Назад» и «Ещё» в шапке (Tertiary M), FAB «+» (Primary XL, floating), «Отправить» в чате (Primary M),
/// поделиться (Secondary XL), фильтры гардероба (Tertiary S).
public struct YeetIconButton: View {
    private let icon: YeetIconName
    private let label: String
    private let variant: YeetButtonStyle
    private let size: YeetControlSize
    private let floating: Bool
    private let decorative: Bool
    private let isLoading: Bool
    private let loadingLabel: String
    private let action: () -> Void
    // Внутренние подстройки размеров (чипс «+» 36, кнопки карточки аккаунта с иконкой 24)
    var side: CGFloat?
    var iconSize: CGFloat?

    /// - Parameters:
    ///   - label: обязательное описание действия для VoiceOver: «Назад», «Ещё», «Добавить».
    ///   - decorative: только вид кнопки внутри другой кнопки — без собственного действия, скрыта от VoiceOver.
    ///   - isLoading: «Отправить» в чате, пока сообщение уходит: спиннер вместо иконки, повторное нажатие не срабатывает.
    public init(
        icon: YeetIconName,
        label: String,
        variant: YeetButtonStyle = .tertiary,
        size: YeetControlSize = .m,
        floating: Bool = false,
        decorative: Bool = false,
        isLoading: Bool = false,
        loadingLabel: String = "Загрузка",
        action: @escaping () -> Void = {}
    ) {
        self.icon = icon
        self.label = label
        self.variant = variant
        self.size = size
        self.floating = floating
        self.decorative = decorative
        self.isLoading = isLoading
        self.loadingLabel = loadingLabel
        self.action = action
    }

    /// Копия с нестандартным диаметром и / или размером иконки (внутри пакета: «+» в ChipGroup 36, действия AccountCard).
    func sized(side: CGFloat? = nil, iconSize: CGFloat? = nil) -> YeetIconButton {
        var copy = self
        copy.side = side ?? self.side
        copy.iconSize = iconSize ?? self.iconSize
        return copy
    }

    public var body: some View {
        let diameter = side ?? size.height
        let glyph = iconSize ?? size.iconSize
        let face = ZStack {
            YeetIcon(name: icon, size: glyph).opacity(isLoading ? 0 : 1)
            if isLoading { YeetSpinner(size: glyph) }
        }
            .frame(width: diameter, height: diameter)
            .foregroundStyle(variant.foreground)
            .background(Circle().fill(variant.background))
            .yeetFloating(floating)
            .contentShape(Circle())
        if decorative {
            face.accessibilityHidden(true)
        } else {
            Button {
                if !isLoading { action() }
            } label: { face }
                .buttonStyle(YeetPressStyle(scale: isLoading ? 1 : YeetGesture.pressScale))
                .yeetHitArea(height: diameter)
                .accessibilityLabel(Text(label))
                .modifier(YeetBusy(isLoading: isLoading, label: loadingLabel))
        }
    }
}

#if DEBUG
private struct ButtonPreview: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                ForEach(YeetButtonStyle.allCases) { style in
                    HStack(spacing: 8) {
                        YeetButton(style.rawValue.capitalized, variant: style, size: .l) {}
                        YeetIconButton(icon: .plus, label: "Добавить", variant: style, size: .l)
                    }
                }
                ForEach(YeetControlSize.allCases) { size in
                    HStack(spacing: 8) {
                        YeetButton("Размер \(size.rawValue)", variant: .tertiary, size: size, rightIcon: .chevronUpDown) {}
                        YeetIconButton(icon: .more, label: "Ещё", size: size)
                    }
                }
                YeetButton("Войти", variant: .primary, size: .xl, leftIcon: .apple, fullWidth: true) {}
                YeetButton("Недоступно", variant: .primary) {}.disabled(true)
                HStack(spacing: 8) {
                    YeetButton("Войти", variant: .primary, size: .xl, isLoading: true) {}
                    YeetIconButton(icon: .arrowUp, label: "Отправить", variant: .primary, isLoading: true)
                }
                YeetIconButton(icon: .plus, label: "Добавить", variant: .primary, size: .xl, floating: true)
            }
            .padding(20)
        }
        .background(YeetColor.bgCanvas)
    }
}

#Preview("Button · Light") { ButtonPreview().preferredColorScheme(.light) }
#Preview("Button · Dark") { ButtonPreview().preferredColorScheme(.dark) }
#endif
