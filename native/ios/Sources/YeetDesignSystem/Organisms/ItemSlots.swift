import SwiftUI

/// Выбор вещей в образ (React: `ItemSlots`; Figma: Outfit Creation / Item Selection `414:1459`, пустой `414:1541`):
/// панель с секциями «Верх / Низ / Обувь», между секциями — разделитель во всю ширину. Фон `bgElevated`, радиус 32 сверху, тень.
public struct YeetItemSlots<Content: View>: View {
    private let content: Content

    public init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    public var body: some View {
        VStack(spacing: 0) { content }
            .frame(maxWidth: .infinity)
            // разделитель рисует каждая секция сверху; у первой его закрывает полоса фона панели
            .overlay(alignment: .top) { YeetColor.bgElevated.frame(height: 1).accessibilityHidden(true) }
            .background(
                YeetRoundedCorners(topLeading: YeetRadius.xl, topTrailing: YeetRadius.xl)
                    .fill(YeetColor.bgElevated)
            )
            .yeetFloatingShadow()
    }
}

/// Секция выбора (React: `ItemSlot`): заголовок H2 и горизонтальный ряд карточек 173 через 8 со снапом по центру.
/// Выбранная карточка стоит по центру экрана, соседние обрезаны краем, в конце — карточка «+» (кнопка L в 21 от её края);
/// в пустой секции «+» по центру.
///
/// - Свайп ведёт ряд за пальцем 1 : 1, после отпускания ряд встаёт на ближайшую карточку (с учётом броска), хаптика `select`.
///   Вертикальное движение отдаётся скроллу экрана. На краях — резинка.
/// - VoiceOver: ряд листается смахиванием тремя пальцами, секция объявляет «Верх: 2 из 5».
/// - Смена `index` снаружи прокручивает ряд плавно (`YeetMotion.page`), при «Уменьшении движения» — сразу.
public struct YeetItemSlot<Data: RandomAccessCollection, Card: View>: View where Data.Element: Identifiable {
    static var cardWidth: CGFloat { 173 }
    static var spacing: CGFloat { YeetSpace.s8 }

    private let title: String
    private let items: Data
    private let external: Binding<Int>?
    private let onIndexChange: ((Int) -> Void)?
    private let onAdd: (() -> Void)?
    private let addLabel: String?
    private let card: (Data.Element) -> Card

    @State private var internalIndex: Int
    @State private var drag: CGFloat = 0
    @State private var lockedAxis: Axis?
    @State private var tracker = YeetVelocityTracker()
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// Управляемая секция.
    /// - Parameters:
    ///   - title: заголовок H2: «Верх», «Низ», «Обувь».
    ///   - items: вещи; карточка каждой — `card` (обычно `YeetItemCard` с `onRemove`).
    ///   - index: выбранная вещь — по центру ряда.
    ///   - onAdd: карточка «+» в конце ряда. Без обработчика карточки нет.
    ///   - addLabel: подпись «+» для VoiceOver. По умолчанию «Добавить: <title>».
    public init(
        title: String,
        items: Data,
        index: Binding<Int>,
        onIndexChange: ((Int) -> Void)? = nil,
        onAdd: (() -> Void)? = nil,
        addLabel: String? = nil,
        @ViewBuilder card: @escaping (Data.Element) -> Card
    ) {
        self.title = title
        self.items = items
        self.external = index
        self.onIndexChange = onIndexChange
        self.onAdd = onAdd
        self.addLabel = addLabel
        self.card = card
        self._internalIndex = State(initialValue: index.wrappedValue)
    }

    /// Неуправляемая секция: начинает с `defaultIndex`, дальше листается сама и сообщает в `onIndexChange`.
    public init(
        title: String,
        items: Data,
        defaultIndex: Int = 0,
        onIndexChange: ((Int) -> Void)? = nil,
        onAdd: (() -> Void)? = nil,
        addLabel: String? = nil,
        @ViewBuilder card: @escaping (Data.Element) -> Card
    ) {
        self.title = title
        self.items = items
        self.external = nil
        self.onIndexChange = onIndexChange
        self.onAdd = onAdd
        self.addLabel = addLabel
        self.card = card
        self._internalIndex = State(initialValue: defaultIndex)
    }

    private var count: Int { items.count }

    private var index: Int {
        let raw = external?.wrappedValue ?? internalIndex
        return min(max(raw, 0), max(count - 1, 0))
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: YeetSpace.s16) {
            Text(title)
                .yeetText(YeetType.h2)
                .foregroundStyle(YeetColor.textPrimary)
                .accessibilityAddTraits(.isHeader)
            YeetSnapRowLayout(index: index, drag: drag, itemWidth: Self.cardWidth, spacing: Self.spacing) {
                ForEach(Array(items.enumerated()), id: \.element.id) { k, item in
                    card(item)
                        .accessibilityHidden(abs(k - index) > 1)
                }
                if let onAdd {
                    addCard(onAdd)
                }
            }
            // ряд выходит на поля экрана
            .padding(.horizontal, -YeetSpace.screenGutter)
            .contentShape(Rectangle())
            .simultaneousGesture(rowDrag, including: count > 1 ? .all : .subviews)
            .accessibilityElement(children: .contain)
            .accessibilityLabel(Text(count > 1 ? "\(title): \(index + 1) из \(count)" : title))
            .accessibilityScrollAction { edge in
                switch edge {
                case .trailing, .bottom: go(index + 1)
                case .leading, .top: go(index - 1)
                }
            }
        }
        .padding(.horizontal, YeetSpace.screenGutter)
        .padding(.vertical, YeetSpace.s20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .overlay(alignment: .top) {
            Rectangle().fill(YeetColor.divider).frame(height: 1).accessibilityHidden(true)
        }
    }

    /// «+»: карточка той же ширины без фона, кнопка L в 21 от её края; в пустой секции — по центру.
    private func addCard(_ action: @escaping () -> Void) -> some View {
        YeetIconButton(icon: .plus, label: addLabel ?? "Добавить: \(title.lowercased())", size: .l, action: action)
            .padding(.leading, count == 0 ? 0 : 21)
            .frame(width: Self.cardWidth, alignment: count == 0 ? .center : .leading)
            .frame(minHeight: Self.cardWidth * 172 / 173, maxHeight: .infinity)
    }

    private var rowDrag: some Gesture {
        DragGesture(minimumDistance: YeetGesture.touchSlop, coordinateSpace: .global)
            .onChanged { value in
                if lockedAxis == nil {
                    lockedAxis = abs(value.translation.width) > abs(value.translation.height) ? .horizontal : .vertical
                    tracker.reset()
                }
                guard lockedAxis == .horizontal else { return }
                tracker.add(value.location, at: value.time)
                let d = value.translation.width
                let edge = (d > 0 && index == 0) || (d < 0 && index == count - 1)
                drag = edge ? yeetRubberBand(d, dimension: Self.cardWidth) : d
            }
            .onEnded { value in
                let mine = lockedAxis == .horizontal
                lockedAxis = nil
                guard mine else { return }
                tracker.add(value.location, at: value.time)
                let v = tracker.velocity(at: value.time).dx
                tracker.reset()
                let step = Self.cardWidth + Self.spacing
                var delta = Int((-value.translation.width / step).rounded())
                if delta == 0 && abs(v) > YeetGesture.swipeVelocity { delta = v < 0 ? 1 : -1 }
                go(index + delta)
            }
    }

    private func go(_ next: Int) {
        let target = min(max(next, 0), max(count - 1, 0))
        let changed = target != index
        if changed { YeetHaptic.select() }
        yeetWithAnimation(YeetMotion.page, reduceMotion: reduceMotion) {
            drag = 0
            if let external { external.wrappedValue = target } else { internalIndex = target }
        }
        if changed { onIndexChange?(target) }
    }
}

/// Ряд со снапом: карточка `index` по центру, остальные через `spacing`, сдвиг за пальцем — `drag`.
private struct YeetSnapRowLayout: Layout {
    var index: Int
    var drag: CGFloat
    var itemWidth: CGFloat
    var spacing: CGFloat

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let height = subviews.map { $0.sizeThatFits(ProposedViewSize(width: itemWidth, height: nil)).height }.max() ?? 0
        let width = proposal.width.flatMap { $0.isFinite ? $0 : nil } ?? itemWidth
        return CGSize(width: width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let step = itemWidth + spacing
        let origin = bounds.midX - itemWidth / 2 - CGFloat(index) * step + drag
        for (k, subview) in subviews.enumerated() {
            subview.place(
                at: CGPoint(x: origin + CGFloat(k) * step, y: bounds.minY),
                proposal: ProposedViewSize(width: itemWidth, height: bounds.height)
            )
        }
    }
}

#if DEBUG
private struct ItemSlotsPreview: View {
    private struct Item: Identifiable {
        let id: Int
        let kind: YeetGarment
        let color: YeetItemColor
    }

    @State private var tops = [Item(id: 1, kind: .top, color: .white), Item(id: 2, kind: .top, color: .blue), Item(id: 3, kind: .top, color: .black)]
    @State private var topIndex = 1

    var body: some View {
        ScrollView {
            YeetItemSlots {
                YeetItemSlot(title: "Верх", items: tops, index: $topIndex, onAdd: {}) { item in
                    YeetItemCard(kind: item.kind, color: item.color, onRemove: { tops.removeAll { $0.id == item.id } })
                }
                YeetItemSlot(title: "Низ", items: [Item(id: 4, kind: .bottom, color: .blue), Item(id: 5, kind: .bottom, color: .beige)], onAdd: {}) { item in
                    YeetItemCard(kind: item.kind, color: item.color)
                }
                YeetItemSlot(title: "Обувь", items: [Item](), onAdd: {}) { item in
                    YeetItemCard(kind: item.kind, color: item.color)
                }
            }
            .padding(.top, 40)
        }
        .background(YeetColor.bgCanvas)
    }
}

#Preview("ItemSlots · Light") { ItemSlotsPreview().preferredColorScheme(.light) }
#Preview("ItemSlots · Dark") { ItemSlotsPreview().preferredColorScheme(.dark) }
#endif
