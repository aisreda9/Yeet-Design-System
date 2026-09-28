import SwiftUI

/// Кнопка футера sheet / dialog (React: `FooterAction`).
public struct YeetFooterAction {
    public var label: String
    public var variant: YeetButtonStyle?
    public var onClick: (() -> Void)?

    public init(label: String, variant: YeetButtonStyle? = nil, onClick: (() -> Void)? = nil) {
        self.label = label
        self.variant = variant
        self.onClick = onClick
    }
}

/// Тип шторки (React: `SheetProps.type`, Figma: sheet · Type).
public enum YeetSheetType: String, CaseIterable, Identifiable {
    /// Плавающая карточка поверх overlay: 8 от краёв экрана, радиус 32 сверху и 48 снизу (концентрично углу экрана).
    case modal
    /// Постоянная панель деталей во всю ширину, 32 сверху, с тенью.
    case panel

    public var id: String { rawValue }
}

/// Хэндл 48 × 4 `bgSubtle`.
struct YeetSheetHandle: View {
    var body: some View {
        Capsule()
            .fill(YeetColor.bgSubtle)
            .frame(width: 48, height: 4)
            .frame(maxWidth: .infinity)
            .accessibilityHidden(true)
    }
}

/// Пара кнопок L через 7 (по умолчанию Tertiary + Primary).
struct YeetSheetFooter: View {
    let actions: (YeetFooterAction, YeetFooterAction)

    var body: some View {
        HStack(spacing: 7) {
            button(actions.0, fallback: .tertiary)
            button(actions.1, fallback: .primary)
        }
    }

    private func button(_ action: YeetFooterAction, fallback: YeetButtonStyle) -> some View {
        YeetButton(action.label, variant: action.variant ?? fallback, size: .l, fullWidth: true) { action.onClick?() }
    }
}

/// Форма плавающей карточки: 32 сверху, 48 снизу; панель — 32 только сверху.
func yeetSheetShape(_ type: YeetSheetType) -> YeetRoundedCorners {
    let top = YeetComponent.sheetRadius
    let bottom = type == .modal ? YeetComponent.sheetRadiusBottom : 0
    return YeetRoundedCorners(topLeading: top, topTrailing: top, bottomTrailing: bottom, bottomLeading: bottom)
}

// MARK: - Sheet

/// Bottom sheet — основа всех выборов, действий и фильтров (React: `Sheet`). Всё временное открывается sheet'ом, а не новым экраном.
/// Хэндл → 16 → заголовок H3 → 12 → контент → 16 → пара кнопок L через 7. Показ поверх экрана — `.yeetOverlay(isPresented:)`.
/// Контент: `YeetListItem` (действия, радио, категории), `YeetChipGroup` (фильтры), `YeetInputBar` (поиск), `YeetAccountCard` (аккаунты).
public struct YeetSheet<Content: View>: View {
    private let title: String?
    private let type: YeetSheetType
    private let footer: (YeetFooterAction, YeetFooterAction)?
    private let onClose: (() -> Void)?
    private let content: Content

    /// - Parameter onClose: крестик справа от заголовка вместо хэндла — высокая шторка со своим скроллом (Outfit Creation / Item Filter).
    public init(
        title: String? = nil,
        type: YeetSheetType = .modal,
        footer: (YeetFooterAction, YeetFooterAction)? = nil,
        onClose: (() -> Void)? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.type = type
        self.footer = footer
        self.onClose = onClose
        self.content = content()
    }

    private var gap: CGFloat { type == .modal ? YeetSpace.s16 : YeetSpace.s20 }
    private var afterTitle: CGFloat { type == .modal ? YeetSpace.s12 : YeetSpace.s16 }
    private var hasHead: Bool { title != nil || onClose != nil }

    public var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if onClose == nil {
                YeetSheetHandle()
            }
            if hasHead {
                head.padding(.top, onClose == nil ? gap : YeetSpace.s12)
            }
            content.padding(.top, hasHead ? afterTitle : (onClose == nil ? gap : 0))
            if let footer {
                YeetSheetFooter(actions: footer).padding(.top, gap)
            }
        }
        .padding(.top, YeetSpace.s8)
        .padding(.horizontal, YeetSpace.screenGutter)
        .padding(.bottom, YeetSpace.s20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .foregroundStyle(YeetColor.textPrimary)
        .background(yeetSheetShape(type).fill(YeetComponent.sheetBg))
        .yeetFloating(type == .panel)
        .accessibilityElement(children: .contain)
        .accessibilityAddTraits(type == .modal ? [.isModal] : [])
    }

    private var head: some View {
        HStack(spacing: YeetSpace.s8) {
            if let title {
                Text(title)
                    .yeetText(type == .panel ? YeetType.h2 : YeetType.h3)
                    .accessibilityAddTraits(.isHeader)
            }
            Spacer(minLength: 0)
            if let onClose {
                YeetIconButton(icon: .cross, label: "Закрыть", variant: .ghost, size: .s, action: onClose)
                    .padding(-8)
            }
        }
        .frame(minHeight: 24)
    }
}

// MARK: - Dialog

/// Тон диалога (React: `DialogProps.tone`, Figma: dialog · Tone). Безопасное действие всегда синее справа.
public enum YeetDialogTone: String, CaseIterable, Identifiable {
    /// Tertiary + Primary («Выйти / Сохранить и выйти»).
    case `default`
    /// Необратимое действие серым слева, безопасная «Отмена» синей справа («Очистить / Отмена»).
    case destructive
    /// Удаление аккаунта: красная Destructive слева, «Отменить» синей справа.
    case danger

    public var id: String { rawValue }
}

/// Подтверждение в той же плавающей форме, что и sheet (React: `Dialog`). Показ — `.yeetOverlay(isPresented:dragToDismiss: false)`.
public struct YeetDialog<Content: View>: View {
    private let tone: YeetDialogTone
    private let title: String
    private let description: String?
    private let cancel: String
    private let confirm: String
    private let onCancel: (() -> Void)?
    private let onConfirm: (() -> Void)?
    private let content: Content

    /// - Parameter content: слот для сложных случаев (удаление аккаунта: плитки статистики).
    public init(
        tone: YeetDialogTone = .default,
        title: String,
        description: String? = nil,
        cancel: String,
        confirm: String,
        onCancel: (() -> Void)? = nil,
        onConfirm: (() -> Void)? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.tone = tone
        self.title = title
        self.description = description
        self.cancel = cancel
        self.confirm = confirm
        self.onCancel = onCancel
        self.onConfirm = onConfirm
        self.content = content()
    }

    private var actions: (YeetFooterAction, YeetFooterAction) {
        let safe = YeetFooterAction(label: cancel, variant: .primary, onClick: onCancel)
        switch tone {
        case .default:
            return (YeetFooterAction(label: cancel, variant: .tertiary, onClick: onCancel), YeetFooterAction(label: confirm, variant: .primary, onClick: onConfirm))
        case .destructive:
            return (YeetFooterAction(label: confirm, variant: .tertiary, onClick: onConfirm), safe)
        case .danger:
            return (YeetFooterAction(label: confirm, variant: .destructive, onClick: onConfirm), safe)
        }
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: YeetSpace.s16) {
            YeetSheetHandle()
            VStack(alignment: .leading, spacing: YeetSpace.s12) {
                Text(title)
                    .yeetText(YeetType.h3)
                    .accessibilityAddTraits(.isHeader)
                if let description {
                    Text(description)
                        .yeetText(YeetType.body)
                        .foregroundStyle(YeetColor.textSecondary)
                }
            }
            content
            YeetSheetFooter(actions: actions)
        }
        .padding(.top, YeetSpace.s8)
        .padding(.horizontal, YeetSpace.screenGutter)
        .padding(.bottom, YeetSpace.s20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .foregroundStyle(YeetColor.textPrimary)
        .background(yeetSheetShape(.modal).fill(YeetComponent.sheetBg))
        .accessibilityElement(children: .contain)
        .accessibilityAddTraits(.isModal)
    }
}

public extension YeetDialog where Content == EmptyView {
    init(
        tone: YeetDialogTone = .default,
        title: String,
        description: String? = nil,
        cancel: String,
        confirm: String,
        onCancel: (() -> Void)? = nil,
        onConfirm: (() -> Void)? = nil
    ) {
        self.init(tone: tone, title: title, description: description, cancel: cancel, confirm: confirm, onCancel: onCancel, onConfirm: onConfirm) {
            EmptyView()
        }
    }
}

// MARK: - Overlay

public extension View {
    /// Модальный слой (React: `Overlay`): затемнение `bgOverlay` и прижатая к низу плавающая шторка с отступом 8 от краёв экрана.
    /// Шторка выезжает снизу на пружине `nav` (quick), уходит быстрее (`exit`). Тап по затемнению и свайп вниз закрывают:
    /// порог — 30 % высоты шторки или бросок быстрее 500 pt/с (`YeetGesture`), при пересечении порога — хаптика `threshold`.
    /// Применять к корню экрана, чтобы слой накрыл всё, включая нижнюю навигацию.
    func yeetOverlay<Sheet: View>(
        isPresented: Binding<Bool>,
        dismissOnTap: Bool = true,
        dragToDismiss: Bool = true,
        @ViewBuilder content: @escaping () -> Sheet
    ) -> some View {
        modifier(YeetOverlayModifier(isPresented: isPresented, dismissOnTap: dismissOnTap, dragToDismiss: dragToDismiss, sheet: content))
    }
}

private struct YeetOverlayModifier<Sheet: View>: ViewModifier {
    @Binding var isPresented: Bool
    let dismissOnTap: Bool
    let dragToDismiss: Bool
    let sheet: () -> Sheet

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var dragOffset: CGFloat = 0
    @State private var sheetHeight: CGFloat = 0
    @State private var pastThreshold = false

    private var threshold: CGFloat { max(sheetHeight, 1) * YeetGesture.swipeDistance }

    func body(content: Content) -> some View {
        content
            .accessibilityHidden(isPresented)
            .overlay {
                ZStack(alignment: .bottom) {
                    if isPresented {
                        YeetColor.bgOverlay
                            .ignoresSafeArea()
                            .contentShape(Rectangle())
                            .onTapGesture { if dismissOnTap { dismiss() } }
                            .accessibilityHidden(true)
                            .transition(.opacity)
                        sheet()
                            .background(GeometryReader { proxy in
                                Color.clear
                                    .onAppear { sheetHeight = proxy.size.height }
                                    .onChange(of: proxy.size.height) { sheetHeight = $0 }
                            })
                            .offset(y: dragOffset)
                            .gesture(drag, including: dragToDismiss ? .all : .subviews)
                            .padding(.horizontal, YeetSpace.s8)
                            .padding(.bottom, YeetSpace.s8)
                            .transition(.move(edge: .bottom))
                            .accessibilityAction(.escape) { dismiss() }
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
                .ignoresSafeArea(.container, edges: .bottom)
                .animation(reduceMotion ? nil : (isPresented ? YeetMotion.nav : YeetMotion.exit), value: isPresented)
            }
            .onChange(of: isPresented) { presented in
                if presented {
                    dragOffset = 0
                    pastThreshold = false
                }
            }
    }

    private func dismiss() {
        isPresented = false
    }

    private var drag: some Gesture {
        DragGesture(minimumDistance: YeetGesture.touchSlop)
            .onChanged { value in
                let dy = value.translation.height
                if dy >= 0 {
                    dragOffset = dy
                } else {
                    // Сопротивление вверх (rubber band): чем дальше, тем меньше сдвиг
                    let dimension = max(sheetHeight, 1)
                    dragOffset = -(1 - 1 / ((-dy) * YeetGesture.rubberBand / dimension + 1)) * dimension
                }
                let crossed = dy > threshold
                if crossed != pastThreshold {
                    pastThreshold = crossed
                    if crossed { YeetHaptic.threshold() }
                }
            }
            .onEnded { value in
                let dy = value.translation.height
                // predictedEndTranslation ≈ translation + v · 0.5 (торможение UIScrollView .normal)
                let velocity = (value.predictedEndTranslation.height - dy) * 2
                pastThreshold = false
                if dy > threshold || (dy > 0 && velocity > YeetGesture.swipeVelocity) {
                    dismiss()
                } else {
                    withAnimation(reduceMotion ? nil : YeetMotion.`return`) { dragOffset = 0 }
                }
            }
    }
}

#if DEBUG
private struct SheetPreview: View {
    @State private var sheet = false
    @State private var dialog: YeetDialogTone?

    var body: some View {
        VStack(spacing: 12) {
            YeetButton("Sheet", variant: .tertiary) { sheet = true }
            ForEach(YeetDialogTone.allCases) { tone in
                YeetButton("Dialog · \(tone.rawValue)", variant: .tertiary) { dialog = tone }
            }
            YeetSheet(title: "Детали вещи", type: .panel) {
                Text("Панель поверх фото").yeetText(YeetType.body)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(YeetColor.bgCanvas)
        .yeetOverlay(isPresented: $sheet) {
            YeetSheet(title: "Сезон", footer: (YeetFooterAction(label: "Сбросить"), YeetFooterAction(label: "Применить", onClick: { sheet = false }))) {
                YeetChipGroup(chips: [YeetChip(label: "Весна", selected: true), YeetChip(label: "Лето"), YeetChip(label: "Осень"), YeetChip(label: "Зима")], wrap: true)
            }
        }
        .yeetOverlay(isPresented: Binding(get: { dialog != nil }, set: { if !$0 { dialog = nil } }), dragToDismiss: false) {
            YeetDialog(
                tone: dialog ?? .default,
                title: dialog == .danger ? "Удалить аккаунт?" : "Очистить корзину?",
                description: "Это действие нельзя отменить",
                cancel: "Отмена",
                confirm: dialog == .danger ? "Удалить" : "Очистить",
                onCancel: { dialog = nil },
                onConfirm: { dialog = nil }
            )
        }
    }
}

#Preview("Sheet / Dialog") { SheetPreview() }
#endif
