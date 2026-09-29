import SwiftUI

// MARK: - Токены слоя (временно локальные)

/// Геометрия и движение шторки по «Единому правилу шторки» (`design/SHEETS-AUDIT.md`) и решениям владельца в #58.
/// Значения, которых ещё нет в `YeetTokens.swift`, живут здесь до мержа токенов (tokens-сессия, #58 → #92).
enum YeetOverlayToken {
    /// Все четыре угла шторки и диалога — 48: концентрично углу экрана 56 при отступе 8 (#58, решение 1).
    /// TODO(tokens, #92): `YeetRadius.overlay` после мержа токена `radius.overlay`. Пока — то же число, что `radius.bar`.
    static let radius: CGFloat = YeetRadius.bar
    /// Отступ плавающей шторки от краёв экрана L / R / низ и от клавиатуры (D4).
    static let inset: CGFloat = YeetSpace.s8
    /// Верх высокой шторки — под статус-баром + 8 (D2). TODO(tokens, #92): `sheet-top-gap`.
    static let topGap: CGFloat = YeetSpace.s8
    /// Хэндл 48 × 4. TODO(tokens, #92): `YeetComponent.sheetHandle` (D8) — пока цвет веба `bg-subtle`.
    static let handle: Color = YeetColor.bgSubtle
    /// Пружина шторки без перелёта (D5): жёсткость quick (300), ζ = 1. TODO(tokens, #92): `motion.spring.critical`.
    static let spring = Animation.interpolatingSpring(mass: 1, stiffness: 300, damping: 2 * (300.0).squareRoot(), initialVelocity: 0)
    /// Отступ между кнопками футера.
    static let footerGap: CGFloat = 7
}

// MARK: - Слой ↔ шторка

/// Что шторка сообщает слою: колбэк любого закрытия (`onClose` / `onCancel`) и можно ли закрыть тапом по затемнению.
/// Класс, а не состояние: слой читает его в момент жеста, перерисовка не нужна.
final class YeetOverlayRegistry {
    private(set) var onDismiss: (() -> Void)?
    private(set) var backdrop = true
    private var owner: UUID?

    func register(_ owner: UUID, onDismiss: (() -> Void)?, backdrop: Bool = true) {
        self.owner = owner
        self.onDismiss = onDismiss
        self.backdrop = backdrop
    }

    /// Sheet → Dialog в том же слое: новая шторка регистрируется раньше, чем старая уходит, — старая не стирает её настройки.
    func unregister(_ owner: UUID) {
        guard self.owner == owner else { return }
        self.owner = nil
        onDismiss = nil
        backdrop = true
    }
}

/// Модальный слой вокруг шторки (React: `OverlayContext`).
struct YeetOverlayLayer {
    let registry: YeetOverlayRegistry
    /// Слой закрывается свайпом (`dragToDismiss`).
    let canDrag: Bool
    /// Один путь закрытия для свайпа, затемнения, «escape», крестика и «Отмены»: колбэк шторки, затем уход слоя.
    let dismiss: () -> Void
    let dragChanged: (DragGesture.Value) -> Void
    let dragEnded: (DragGesture.Value) -> Void
}

private struct YeetOverlayLayerKey: EnvironmentKey {
    static let defaultValue: YeetOverlayLayer? = nil
}

extension EnvironmentValues {
    var yeetOverlayLayer: YeetOverlayLayer? {
        get { self[YeetOverlayLayerKey.self] }
        set { self[YeetOverlayLayerKey.self] = newValue }
    }
}

/// Жест смахивания на части шторки (хэндл, шапка, футер, непрокручиваемое тело). Координаты глобальные: шторка едет под пальцем.
private struct YeetSheetDrag: ViewModifier {
    let enabled: Bool
    @Environment(\.yeetOverlayLayer) private var layer

    func body(content: Content) -> some View {
        content.gesture(
            DragGesture(minimumDistance: YeetGesture.touchSlop, coordinateSpace: .global)
                .onChanged { layer?.dragChanged($0) }
                .onEnded { layer?.dragEnded($0) },
            including: enabled && layer?.canDrag == true ? .all : .subviews
        )
    }
}

extension View {
    func yeetSheetDrag(_ enabled: Bool) -> some View { modifier(YeetSheetDrag(enabled: enabled)) }
}

// MARK: - Части шторки

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
    /// Плавающая карточка поверх затемнения: 8 от краёв экрана, все углы 48 (концентрично углу экрана), тело прокручивается.
    case modal
    /// Постоянная панель деталей во всю ширину, 32 сверху, с тенью.
    case panel

    public var id: String { rawValue }
}

/// Хэндл 48 × 4 по центру. Декоративный: закрытие для VoiceOver — жест «escape».
struct YeetSheetHandle: View {
    var body: some View {
        Capsule()
            .fill(YeetOverlayToken.handle)
            .frame(width: 48, height: 4)
            .frame(maxWidth: .infinity)
            .accessibilityHidden(true)
    }
}

/// Кнопки футера: равные половины через 7, если каждая подпись влезает в половину; иначе — столбец во всю ширину (D7).
/// Порядок в столбце тот же, что в строке: безопасное действие последним.
struct YeetFooterLayout: Layout {
    var spacing: CGFloat = YeetOverlayToken.footerGap

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = resolvedWidth(proposal, subviews)
        if let cell = rowCell(width, subviews) {
            let height = subviews.map { $0.sizeThatFits(ProposedViewSize(width: cell, height: nil)).height }.max() ?? 0
            return CGSize(width: width, height: height)
        }
        let heights = subviews.map { $0.sizeThatFits(ProposedViewSize(width: width, height: nil)).height }
        return CGSize(width: width, height: heights.reduce(0, +) + spacing * CGFloat(max(0, subviews.count - 1)))
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        if let cell = rowCell(bounds.width, subviews) {
            var x = bounds.minX
            for subview in subviews {
                subview.place(at: CGPoint(x: x, y: bounds.minY), proposal: ProposedViewSize(width: cell, height: bounds.height))
                x += cell + spacing
            }
            return
        }
        var y = bounds.minY
        for subview in subviews {
            let height = subview.sizeThatFits(ProposedViewSize(width: bounds.width, height: nil)).height
            subview.place(at: CGPoint(x: bounds.minX, y: y), proposal: ProposedViewSize(width: bounds.width, height: height))
            y += height + spacing
        }
    }

    private func resolvedWidth(_ proposal: ProposedViewSize, _ subviews: Subviews) -> CGFloat {
        if let width = proposal.width, width.isFinite { return width }
        let ideal = subviews.map { $0.sizeThatFits(.unspecified).width }
        return (ideal.max() ?? 0) * CGFloat(subviews.count) + spacing * CGFloat(max(0, subviews.count - 1))
    }

    /// Ширина половины, если все подписи в неё влезают; nil — столбец.
    private func rowCell(_ width: CGFloat, _ subviews: Subviews) -> CGFloat? {
        guard !subviews.isEmpty else { return nil }
        let count = CGFloat(subviews.count)
        let cell = (width - spacing * (count - 1)) / count
        return subviews.allSatisfy({ $0.sizeThatFits(.unspecified).width <= cell + 0.5 }) ? cell : nil
    }
}

/// Футер: кнопки L. Одна кнопка — Tertiary на всю ширину; две — Tertiary + Primary.
struct YeetSheetFooter: View {
    let actions: [YeetFooterAction]
    /// VoiceOver-фокус на последней (безопасной) кнопке — у диалога.
    var safeFocus: AccessibilityFocusState<Bool>.Binding?

    var body: some View {
        YeetFooterLayout {
            ForEach(actions.indices, id: \.self) { index in
                button(index)
            }
        }
    }

    @ViewBuilder
    private func button(_ index: Int) -> some View {
        let action = actions[index]
        let face = YeetButton(action.label, variant: action.variant ?? (index == 0 ? .tertiary : .primary), size: .l, fullWidth: true) {
            action.onClick?()
        }
        if let safeFocus, index == actions.count - 1 {
            face.accessibilityFocused(safeFocus)
        } else {
            face
        }
    }
}

/// Высота по содержимому, но не больше предложенной: так тело шторки растёт до «экран − статус-бар − 8» и дальше прокручивается.
/// `ScrollView` без предложенной высоты отдаёт высоту содержимого.
private struct YeetFitHeightLayout: Layout {
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        guard let child = subviews.first else { return .zero }
        let ideal = child.sizeThatFits(ProposedViewSize(width: proposal.width, height: nil))
        let height = min(ideal.height, proposal.height ?? ideal.height)
        return CGSize(width: proposal.width ?? ideal.width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        subviews.first?.place(at: bounds.origin, proposal: ProposedViewSize(bounds.size))
    }
}

private struct YeetSheetContentHeightKey: PreferenceKey {
    static let defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = max(value, nextValue()) }
}

private struct YeetSheetViewportHeightKey: PreferenceKey {
    static let defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = max(value, nextValue()) }
}

/// Тело модальной шторки (React: `.y-sheet__body`): прокручивается только оно, во всю ширину шторки — лента чипсов упирается в край.
/// Пока содержимое влезает, прокрутка выключена и тело тянет шторку вместе с шапкой; прокручиваемое тело жест шторки не забирает.
private struct YeetSheetScrollBody<Content: View>: View {
    let swipe: Bool
    let content: Content

    @State private var contentHeight: CGFloat = 0
    @State private var viewportHeight: CGFloat = 0

    private var overflows: Bool { contentHeight > viewportHeight + 0.5 }

    var body: some View {
        YeetFitHeightLayout {
            ScrollView(.vertical, showsIndicators: overflows) {
                content
                    .padding(.horizontal, YeetSpace.screenGutter)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(GeometryReader { proxy in
                        Color.clear.preference(key: YeetSheetContentHeightKey.self, value: proxy.size.height)
                    })
            }
            .scrollDisabled(!overflows)
            .background(GeometryReader { proxy in
                Color.clear.preference(key: YeetSheetViewportHeightKey.self, value: proxy.size.height)
            })
        }
        .onPreferenceChange(YeetSheetContentHeightKey.self) { contentHeight = $0 }
        .onPreferenceChange(YeetSheetViewportHeightKey.self) { viewportHeight = $0 }
        .contentShape(Rectangle())
        .yeetSheetDrag(swipe && !overflows)
    }
}

/// Плавающая карточка — общая форма Sheet `modal` и Dialog: хэндл → 16 → шапка → 16 → тело → 16 → футер.
/// Без хэндла шапка на 20 от верха; скрытая шапка не занимает места. Хэндл, шапка и футер закреплены и не сжимаются.
private struct YeetModalCard<Head: View, Main: View>: View {
    let showHandle: Bool
    let hasHead: Bool
    let hasBody: Bool
    let footer: [YeetFooterAction]
    let swipe: Bool
    var safeFocus: AccessibilityFocusState<Bool>.Binding?
    @ViewBuilder let head: Head
    @ViewBuilder let main: Main

    private var topPadding: CGFloat { showHandle ? YeetSpace.s8 : YeetSpace.s20 }

    var body: some View {
        VStack(alignment: .leading, spacing: YeetSpace.s16) {
            if showHandle || hasHead {
                VStack(alignment: .leading, spacing: YeetSpace.s16) {
                    if showHandle { YeetSheetHandle() }
                    if hasHead { head }
                }
                .padding(.horizontal, YeetSpace.screenGutter)
                .padding(.top, topPadding)
                .frame(maxWidth: .infinity, alignment: .leading)
                .fixedSize(horizontal: false, vertical: true)
                .layoutPriority(1)
                .contentShape(Rectangle())
                .yeetSheetDrag(swipe)
            }
            if hasBody {
                YeetSheetScrollBody(swipe: swipe, content: main)
            }
            if !footer.isEmpty {
                YeetSheetFooter(actions: footer, safeFocus: safeFocus)
                    .padding(.horizontal, YeetSpace.screenGutter)
                    .padding(.bottom, YeetSpace.s20)
                    .fixedSize(horizontal: false, vertical: true)
                    .layoutPriority(1)
                    .contentShape(Rectangle())
                    .yeetSheetDrag(swipe)
            }
        }
        .padding(.top, showHandle || hasHead ? 0 : topPadding)
        .padding(.bottom, footer.isEmpty ? YeetSpace.s20 : 0)
        .frame(maxWidth: .infinity, alignment: .leading)
        .foregroundStyle(YeetColor.textPrimary)
        .background(YeetComponent.sheetBg)
        .clipShape(RoundedRectangle(cornerRadius: YeetOverlayToken.radius, style: .continuous))
    }
}

/// Заголовок шторки: H3 в одну строку с многоточием (D11), при крупном шрифте — переносится.
private struct YeetSheetTitle: View {
    let text: String
    let style: YeetTextStyle
    var singleLine = true
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    var body: some View {
        Text(text)
            .yeetText(style)
            .lineLimit(singleLine && !dynamicTypeSize.isAccessibilitySize ? 1 : nil)
            .accessibilityAddTraits(.isHeader)
    }
}

// MARK: - Sheet

/// Bottom sheet — основа всех выборов, действий и фильтров (React: `Sheet`). Всё временное открывается шторкой, а не новым экраном.
///
/// Хэндл → 16 → заголовок H3 → 16 → [описание → 20] → контент → 16 → кнопки L через 7. Показ поверх экрана — `.yeetOverlay(isPresented:)`.
/// Шторка по высоте содержимого, но не выше «экран − статус-бар − 8»: хэндл, заголовок и футер закреплены, прокручивается только тело.
/// Контент: `YeetListItem` (действия, радио, категории), `YeetChipGroup` (фильтры), `YeetInputBar` (поиск), `YeetAccountCard` (аккаунты).
public struct YeetSheet<Content: View>: View {
    private let title: String?
    private let description: String?
    private let type: YeetSheetType
    private let footer: (YeetFooterAction, YeetFooterAction)?
    private let onClose: (() -> Void)?
    private let label: String?
    private let handle: Bool?
    private let content: Content

    @Environment(\.yeetOverlayLayer) private var layer
    @State private var registration = UUID()

    /// - Parameters:
    ///   - description: абзац под заголовком: Body серым, 16 под заголовком и 20 до контента.
    ///   - onClose: крестик справа от заголовка вместо хэндла — высокая шторка (Outfit Creation / Item Filter).
    ///     В слое `.yeetOverlay` крестик, свайп, тап по затемнению и «escape» закрывают одним путём и вызывают `onClose` один раз.
    ///   - label: имя для VoiceOver, если у шторки нет заголовка (шторка источника фото, D10).
    ///   - handle: показывать хэндл (Figma: sheet · Show Handle). По умолчанию — да, если нет крестика.
    public init(
        title: String? = nil,
        description: String? = nil,
        type: YeetSheetType = .modal,
        footer: (YeetFooterAction, YeetFooterAction)? = nil,
        onClose: (() -> Void)? = nil,
        label: String? = nil,
        handle: Bool? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.description = description
        self.type = type
        self.footer = footer
        self.onClose = onClose
        self.label = label
        self.handle = handle
        self.content = content()
    }

    private var showHandle: Bool { handle ?? (onClose == nil) }
    private var hasHead: Bool { title != nil || onClose != nil }
    private var hasContent: Bool { Content.self != EmptyView.self }
    private var footerActions: [YeetFooterAction] { footer.map { [$0.0, $0.1] } ?? [] }
    private var close: (() -> Void)? { onClose == nil ? nil : (layer?.dismiss ?? onClose) }

    public var body: some View {
        Group {
            if type == .modal {
                YeetModalCard(
                    showHandle: showHandle,
                    hasHead: hasHead,
                    hasBody: description != nil || hasContent,
                    footer: footerActions,
                    swipe: true,
                    head: { head },
                    main: {
                        VStack(alignment: .leading, spacing: 0) {
                            if let description { descriptionText(description) }
                            content.padding(.top, description != nil && hasContent ? YeetSpace.s20 : 0)
                        }
                    }
                )
            } else {
                panel
            }
        }
        .accessibilityElement(children: .contain)
        .modifier(YeetOptionalLabel(label: title == nil ? label : nil))
        .accessibilityAddTraits(type == .modal ? [.isModal] : [])
        .onAppear { layer?.registry.register(registration, onDismiss: onClose) }
        .onDisappear { layer?.registry.unregister(registration) }
    }

    private var head: some View {
        HStack(spacing: YeetSpace.s8) {
            if let title {
                YeetSheetTitle(text: title, style: type == .panel ? YeetType.h2 : YeetType.h3, singleLine: type == .modal)
            }
            Spacer(minLength: 0)
            if let close {
                // Кнопка 40 с отступом −8: иконка на 20 от края, по центру строки заголовка
                YeetIconButton(icon: .cross, label: "Закрыть", variant: .ghost, size: .s, action: close)
                    .padding(-8)
            }
        }
        .frame(minHeight: 24)
    }

    private func descriptionText(_ text: String) -> some View {
        Text(text)
            .yeetText(YeetType.body)
            .foregroundStyle(YeetColor.textSecondary)
            .fixedSize(horizontal: false, vertical: true)
    }

    private var panelContentGap: CGFloat {
        if description != nil { return YeetSpace.s20 }
        if hasHead { return YeetSpace.s16 }
        return showHandle ? YeetSpace.s20 : 0
    }

    /// Панель: хэндл → 20 → заголовок H2 → 16 (описание → 20) → контент → 20 → футер; во всю ширину, 32 сверху, с тенью.
    private var panel: some View {
        VStack(alignment: .leading, spacing: 0) {
            if showHandle { YeetSheetHandle() }
            if hasHead { head.padding(.top, showHandle ? YeetSpace.s20 : 0) }
            if let description {
                descriptionText(description).padding(.top, hasHead ? YeetSpace.s12 : 0)
            }
            content.padding(.top, panelContentGap)
            if let footer {
                YeetSheetFooter(actions: [footer.0, footer.1]).padding(.top, YeetSpace.s20)
            }
        }
        .padding(.top, showHandle ? YeetSpace.s8 : YeetSpace.s20)
        .padding(.horizontal, YeetSpace.screenGutter)
        .padding(.bottom, YeetSpace.s20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .foregroundStyle(YeetColor.textPrimary)
        .background(
            YeetRoundedCorners(topLeading: YeetComponent.sheetRadius, topTrailing: YeetComponent.sheetRadius)
                .fill(YeetComponent.sheetBg)
        )
        .yeetFloatingShadow()
    }
}

public extension YeetSheet where Content == EmptyView {
    /// Шторка без тела: только заголовок, описание и кнопки.
    init(
        title: String? = nil,
        description: String? = nil,
        type: YeetSheetType = .modal,
        footer: (YeetFooterAction, YeetFooterAction)? = nil,
        onClose: (() -> Void)? = nil,
        label: String? = nil,
        handle: Bool? = nil
    ) {
        self.init(title: title, description: description, type: type, footer: footer, onClose: onClose, label: label, handle: handle) {
            EmptyView()
        }
    }
}

/// `accessibilityLabel` только если имя есть.
private struct YeetOptionalLabel: ViewModifier {
    let label: String?

    @ViewBuilder
    func body(content: Content) -> some View {
        if let label {
            content.accessibilityLabel(Text(label))
        } else {
            content
        }
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

/// Подтверждение в той же плавающей форме, что и шторка (React: `Dialog`, alertdialog). **Безопасное действие всегда синее справа.**
///
/// Без хэндла (D1): заголовок на 20 от верха → 16 → описание → 16 → слот → 16 → кнопки. Показ — `.yeetDialog(isPresented:)`.
/// Рискованный (`destructive`, `danger`) закрывается только кнопками и «escape» — не свайпом и не тапом по затемнению (D6).
/// При открытии VoiceOver встаёт на безопасное действие.
public struct YeetDialog<Content: View>: View {
    private let tone: YeetDialogTone
    private let title: String
    private let description: String?
    private let cancel: String?
    private let confirm: String
    private let onCancel: (() -> Void)?
    private let onConfirm: (() -> Void)?
    private let handle: Bool
    private let dismissible: Bool?
    private let content: Content

    @Environment(\.yeetOverlayLayer) private var layer
    @State private var registration = UUID()
    @AccessibilityFocusState private var safeFocused: Bool

    /// - Parameters:
    ///   - cancel: без `cancel` — уведомление с одной кнопкой `confirm` Tertiary на всю ширину («Ок!»).
    ///   - onCancel: отмена — при любом закрытии, кроме `confirm`: кнопка `cancel`, «escape», у нерискованного и свайп, и тап по затемнению.
    ///     В слое `.yeetDialog` / `.yeetOverlay` слой уходит сам, `onCancel` вызывается один раз.
    ///   - handle: хэндл (Figma: dialog · Show Handle). По умолчанию нет (D1).
    ///   - dismissible: закрывается ли свайпом и тапом по затемнению. По умолчанию — только `tone: .default` (D6).
    ///   - content: слот для сложных случаев (удаление аккаунта: плитки статистики).
    public init(
        tone: YeetDialogTone = .default,
        title: String,
        description: String? = nil,
        cancel: String? = nil,
        confirm: String,
        onCancel: (() -> Void)? = nil,
        onConfirm: (() -> Void)? = nil,
        handle: Bool = false,
        dismissible: Bool? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.tone = tone
        self.title = title
        self.description = description
        self.cancel = cancel
        self.confirm = confirm
        self.onCancel = onCancel
        self.onConfirm = onConfirm
        self.handle = handle
        self.dismissible = dismissible
        self.content = content()
    }

    private var loose: Bool { dismissible ?? (tone == .default) }
    /// Через слой: уход с анимацией и `onCancel` один раз.
    private var cancelAll: (() -> Void)? { layer?.dismiss ?? onCancel }

    private var actions: [YeetFooterAction] {
        guard let cancel else { return [YeetFooterAction(label: confirm, variant: .tertiary, onClick: onConfirm)] }
        let safe = YeetFooterAction(label: cancel, variant: .primary, onClick: cancelAll)
        switch tone {
        case .default:
            return [YeetFooterAction(label: cancel, variant: .tertiary, onClick: cancelAll), YeetFooterAction(label: confirm, variant: .primary, onClick: onConfirm)]
        case .destructive:
            return [YeetFooterAction(label: confirm, variant: .tertiary, onClick: onConfirm), safe]
        case .danger:
            return [YeetFooterAction(label: confirm, variant: .destructive, onClick: onConfirm), safe]
        }
    }

    public var body: some View {
        YeetModalCard(
            showHandle: handle,
            hasHead: false,
            hasBody: true,
            footer: actions,
            swipe: loose,
            safeFocus: $safeFocused,
            head: { EmptyView() },
            main: {
                VStack(alignment: .leading, spacing: YeetSpace.s16) {
                    YeetSheetTitle(text: title, style: YeetType.h3, singleLine: false)
                    if let description {
                        Text(description)
                            .yeetText(YeetType.body)
                            .foregroundStyle(YeetColor.textSecondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    content
                }
            }
        )
        .accessibilityElement(children: .contain)
        .accessibilityAddTraits(.isModal)
        .onAppear {
            layer?.registry.register(registration, onDismiss: onCancel, backdrop: loose)
            guard layer != nil else { return }
            // после объявления смены экрана — на безопасное действие (React: data-autofocus у правой кнопки)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { safeFocused = true }
        }
        .onDisappear { layer?.registry.unregister(registration) }
    }
}

public extension YeetDialog where Content == EmptyView {
    init(
        tone: YeetDialogTone = .default,
        title: String,
        description: String? = nil,
        cancel: String? = nil,
        confirm: String,
        onCancel: (() -> Void)? = nil,
        onConfirm: (() -> Void)? = nil,
        handle: Bool = false,
        dismissible: Bool? = nil
    ) {
        self.init(tone: tone, title: title, description: description, cancel: cancel, confirm: confirm, onCancel: onCancel, onConfirm: onConfirm, handle: handle, dismissible: dismissible) {
            EmptyView()
        }
    }
}

// MARK: - Overlay

/// Как слой появляется: шторка — пружина без перелёта, диалог — `YeetMotion.appear` (240 мс).
enum YeetOverlayPresentation {
    case sheet, dialog
}

public extension View {
    /// Модальный слой (React: `Overlay`): затемнение `bgOverlay` и прижатая к низу плавающая шторка.
    ///
    /// **Место.** 8 от краёв экрана, снизу — `max(8, safe area)` (D3), над клавиатурой — 8 (D4), сверху не выше статус-бара + 8 (D2).
    /// **Движение.** Шторка выезжает на пружине без перелёта (D5), уходит быстрее (`YeetMotion.exit`).
    /// При «Уменьшении движения» — растворение вместо сдвига.
    /// **Закрытие** — один путь: свайп вниз (с хэндла, шапки, футера или непрокручиваемого тела; порог 30 % высоты
    /// или бросок быстрее 500 pt/с, пауза > 80 мс — не бросок, хаптика `threshold` на пороге), тап по затемнению,
    /// жест VoiceOver «escape», крестик и «Отмена» шторки. Колбэк шторки (`onClose` / `onCancel`) вызывается один раз.
    /// **Модальность.** Фон скрыт от VoiceOver, шторка — `isModal`, при появлении VoiceOver переходит в неё.
    /// Применять к корню экрана, чтобы слой накрыл всё, включая нижнюю навигацию.
    func yeetOverlay<Sheet: View>(
        isPresented: Binding<Bool>,
        dismissOnTap: Bool = true,
        dragToDismiss: Bool = true,
        @ViewBuilder content: @escaping () -> Sheet
    ) -> some View {
        modifier(YeetOverlayModifier(isPresented: isPresented, dismissOnTap: dismissOnTap, dragToDismiss: dragToDismiss, presentation: .sheet, sheet: content))
    }

    /// Слой для `YeetDialog`: появление `YeetMotion.appear` вместо пружины. Рискованный диалог сам запрещает свайп и тап по затемнению.
    func yeetDialog<Dialog: View>(
        isPresented: Binding<Bool>,
        @ViewBuilder content: @escaping () -> Dialog
    ) -> some View {
        modifier(YeetOverlayModifier(isPresented: isPresented, dismissOnTap: true, dragToDismiss: true, presentation: .dialog, sheet: content))
    }
}

private struct YeetOverlayModifier<Sheet: View>: ViewModifier {
    @Binding var isPresented: Bool
    let dismissOnTap: Bool
    let dragToDismiss: Bool
    let presentation: YeetOverlayPresentation
    let sheet: () -> Sheet

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var registry = YeetOverlayRegistry()
    @State private var dragOffset: CGFloat = 0
    @State private var sheetHeight: CGFloat = 0
    @State private var pastThreshold = false
    @State private var tracker = YeetVelocityTracker()

    private var threshold: CGFloat { max(sheetHeight, 1) * YeetGesture.swipeDistance }

    private var layer: YeetOverlayLayer {
        YeetOverlayLayer(registry: registry, canDrag: dragToDismiss, dismiss: dismiss, dragChanged: dragChanged, dragEnded: dragEnded)
    }

    private var animation: Animation {
        if reduceMotion { return YeetMotion.fade }
        if !isPresented { return YeetMotion.exit }
        return presentation == .dialog ? YeetMotion.appear : YeetOverlayToken.spring
    }

    /// Затемнение гаснет вместе с жестом.
    private var dim: Double { 1 - Double(min(1, max(0, dragOffset) / max(sheetHeight, 1))) }

    func body(content: Content) -> some View {
        content
            .accessibilityHidden(isPresented)
            .overlay {
                // Слой во весь экран (под статус-баром и home indicator), но над клавиатурой: её safe area не игнорируется (D4)
                GeometryReader { proxy in
                    ZStack(alignment: .bottom) {
                        if isPresented {
                            YeetColor.bgOverlay
                                .opacity(dim)
                                .contentShape(Rectangle())
                                .onTapGesture { if dismissOnTap && registry.backdrop { dismiss() } }
                                .accessibilityHidden(true)
                                .transition(.opacity)
                            sheet()
                                .environment(\.yeetOverlayLayer, layer)
                                .background(GeometryReader { sheetProxy in
                                    Color.clear
                                        .onAppear { sheetHeight = sheetProxy.size.height }
                                        .onChange(of: sheetProxy.size.height) { sheetHeight = $0 }
                                })
                                .offset(y: dragOffset)
                                .accessibilityAction(.escape) { dismiss() }
                                .onAppear { UIAccessibility.post(notification: .screenChanged, argument: nil) }
                                .padding(.horizontal, YeetOverlayToken.inset)
                                .padding(.top, proxy.safeAreaInsets.top + YeetOverlayToken.topGap)
                                .padding(.bottom, max(YeetOverlayToken.inset, proxy.safeAreaInsets.bottom))
                                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
                                .transition(reduceMotion ? .opacity : .move(edge: .bottom))
                                .zIndex(1)
                        }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
                    .animation(animation, value: isPresented)
                }
                .ignoresSafeArea(.container)
            }
            .onChange(of: isPresented) { presented in
                if presented {
                    dragOffset = 0
                    pastThreshold = false
                    tracker.reset()
                }
            }
    }

    private func dismiss() {
        let callback = registry.onDismiss
        isPresented = false
        callback?()
    }

    private func dragChanged(_ value: DragGesture.Value) {
        tracker.add(value.location, at: value.time)
        let dy = value.translation.height
        // вниз — 1 : 1, вверх — с сопротивлением
        dragOffset = dy >= 0 ? dy : yeetRubberBand(dy, dimension: sheetHeight)
        let crossed = dy > threshold
        if crossed != pastThreshold {
            pastThreshold = crossed
            if crossed { YeetHaptic.threshold() }
        }
    }

    private func dragEnded(_ value: DragGesture.Value) {
        tracker.add(value.location, at: value.time)
        let velocity = tracker.velocity(at: value.time).dy
        let dy = value.translation.height
        tracker.reset()
        pastThreshold = false
        if dy > threshold || (dy > 0 && velocity > YeetGesture.swipeVelocity) {
            dismiss()
        } else {
            yeetWithAnimation(YeetOverlayToken.spring, reduceMotion: reduceMotion) { dragOffset = 0 }
        }
    }
}

#if DEBUG
private struct SheetPreview: View {
    @State private var season = false
    @State private var long = false
    @State private var filter = false
    @State private var dialog: YeetDialogTone?
    @State private var notice = false

    private let countries = ["Австрия", "Беларусь", "Бельгия", "Германия", "Грузия", "Испания", "Италия", "Казахстан", "Латвия", "Литва",
                             "Нидерланды", "Польша", "Португалия", "Россия", "Сербия", "Турция", "Финляндия", "Франция", "Чехия", "Эстония"]

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                YeetButton("Sheet · Сезон", variant: .tertiary) { season = true }
                YeetButton("Sheet · длинный список", variant: .tertiary) { long = true }
                YeetButton("Sheet · крестик и длинные кнопки", variant: .tertiary) { filter = true }
                ForEach(YeetDialogTone.allCases) { tone in
                    YeetButton("Dialog · \(tone.rawValue)", variant: .tertiary) { dialog = tone }
                }
                YeetButton("Dialog · одна кнопка", variant: .tertiary) { notice = true }
                YeetSheet(title: "Детали вещи", description: "Панель поверх фото", type: .panel) {
                    Text("Контент панели").yeetText(YeetType.body)
                }
                // Без слоя — статичные формы, как в документации
                YeetSheet(title: "Валюта", description: "Цены в гардеробе и аналитике", footer: (YeetFooterAction(label: "Сбросить"), YeetFooterAction(label: "Применить"))) {
                    YeetChipGroup(chips: [YeetChip(label: "₽", selected: true), YeetChip(label: "$"), YeetChip(label: "€")], wrap: true)
                }
                YeetDialog(tone: .danger, title: "Удалить аккаунт?", description: "Это действие нельзя отменить", cancel: "Отменить", confirm: "Удалить")
            }
            .padding(8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(YeetColor.bgCanvas)
        .yeetOverlay(isPresented: $season) {
            YeetSheet(title: "Сезон", footer: (YeetFooterAction(label: "Сбросить"), YeetFooterAction(label: "Применить", onClick: { season = false }))) {
                YeetChipGroup(chips: [YeetChip(label: "Весна", selected: true), YeetChip(label: "Лето"), YeetChip(label: "Осень"), YeetChip(label: "Зима")], wrap: true)
            }
        }
        .yeetOverlay(isPresented: $long) {
            YeetSheet(title: "Страна", footer: (YeetFooterAction(label: "Сбросить"), YeetFooterAction(label: "Готово", onClick: { long = false }))) {
                VStack(spacing: 0) {
                    ForEach(countries, id: \.self) { country in
                        Text(country).yeetText(YeetType.body).frame(maxWidth: .infinity, minHeight: 52, alignment: .leading)
                    }
                }
            }
        }
        .yeetOverlay(isPresented: $filter) {
            YeetSheet(
                title: "Фильтр вещей с очень длинным названием",
                footer: (YeetFooterAction(label: "Сбросить все фильтры"), YeetFooterAction(label: "Показать 128 вещей")),
                onClose: { filter = false }
            ) {
                YeetChipGroup(chips: [YeetChip(label: "Верх"), YeetChip(label: "Низ", selected: true), YeetChip(label: "Обувь")])
            }
        }
        .yeetDialog(isPresented: Binding(get: { dialog != nil }, set: { if !$0 { dialog = nil } })) {
            YeetDialog(
                tone: dialog ?? .default,
                title: dialog == .danger ? "Удалить аккаунт?" : dialog == .destructive ? "Очистить корзину?" : "Выйти без сохранения?",
                description: "Это действие нельзя отменить",
                cancel: dialog == .default ? "Выйти" : "Отмена",
                confirm: dialog == .danger ? "Удалить" : dialog == .destructive ? "Очистить" : "Сохранить и выйти",
                onCancel: { dialog = nil },
                onConfirm: { dialog = nil }
            )
        }
        .yeetDialog(isPresented: $notice) {
            YeetDialog(title: "Готово!", description: "Код отправлен на почту", confirm: "Ок!", onConfirm: { notice = false })
        }
    }
}

#Preview("Sheet / Dialog · Light") { SheetPreview().preferredColorScheme(.light) }
#Preview("Sheet / Dialog · Dark") { SheetPreview().preferredColorScheme(.dark) }
#endif
