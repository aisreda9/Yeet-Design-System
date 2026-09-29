import SwiftUI

/// Образ в пейджере (React: `PagerLook`).
public struct YeetPagerLook: Identifiable {
    /// Стабильный ключ: по нему превью «переезжает» в коллаж, а не перерисовывается.
    public var id: String
    public var items: [YeetCollageItem]
    /// Повод-бейдж на коллаже.
    public var label: String?
    /// Имя для VoiceOver: «Образ 2 из 5» + это имя.
    public var name: String?

    public init(id: String, items: [YeetCollageItem], label: String? = nil, name: String? = nil) {
        self.id = id
        self.items = items
        self.label = label
        self.name = name
    }
}

/// Пейджер образов (React: `OutfitPager` + `useSwipePager`).
///
/// - Стопка (`axis: .vertical`, Figma `232:1355`, Animations «scale»): текущий коллаж 353, соседние — превью 96 (или 150 в «Удиви меня»)
///   в 20 над и под ним; смена — пружина gentle (`YeetMotion.swap`), хаптика `skip`.
/// - Лента (`axis: .horizontal`, Figma `463:1534`): страницы 353 через 20, соседние за краем экрана; смена — `YeetMotion.page`, хаптика `select`.
///
/// **Жест** — `DragGesture`: начинается после `touchSlop` и закрепляется за доминирующей осью (движение поперёк отдаётся
/// скроллу экрана). Дальше 30 % размера или бросок быстрее 500 pt/с — соседний образ; пауза пальца > 80 мс перед отпусканием —
/// не бросок (`YeetVelocityTracker`). На первом и последнем образе — резинка. Хаптика `threshold` один раз на пороге.
/// Тап по соседнему превью — к нему. При «Уменьшении движения» доводка мгновенная, палец по-прежнему ведёт 1 : 1.
///
/// **VoiceOver:** текущий образ — регулируемый элемент «Образы, 2 из 5: имя», смахивание вверх / вниз листает; скрытые образы не читаются.
/// Управляемый (`index: $i`) или неуправляемый (`defaultIndex`, индекс хранится в `@State`).
public struct YeetOutfitPager: View {
    /// Размер коллажа в макете.
    static let design: CGFloat = 353
    private static let gap: CGFloat = YeetSpace.s20

    private let looks: [YeetPagerLook]
    private let axis: Axis
    private let preview: CGFloat
    private let external: Binding<Int>?
    private let onIndexChange: ((Int) -> Void)?
    private let weather: AnyView?
    private let stamp: AnyView?
    private let skip: AnyView?
    private let disabled: Bool
    private let label: String

    @State private var internalIndex: Int
    @State private var drag: CGFloat = 0
    @State private var lockedAxis: Axis?
    @State private var crossed = false
    @State private var tracker = YeetVelocityTracker()
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// Управляемый пейджер.
    /// - Parameters:
    ///   - preview: размер превью соседних образов в стопке: 96 — главная (`232:1355`), 150 — «Удиви меня» (`798:1741`).
    ///   - weather: слот над левым верхним углом коллажа (`YeetWeatherCard(tilt:)`).
    ///   - stamp: слот у правого нижнего угла (`YeetStamp` «Надеть» / «Сохранить»).
    ///   - skip: слот у левого нижнего угла (`YeetStamp(tone: .secondary)` «Не нравится»).
    ///   - disabled: выключить жест (например, пока открыта шторка).
    public init(
        looks: [YeetPagerLook],
        axis: Axis = .vertical,
        preview: CGFloat = 96,
        index: Binding<Int>,
        onIndexChange: ((Int) -> Void)? = nil,
        weather: AnyView? = nil,
        stamp: AnyView? = nil,
        skip: AnyView? = nil,
        disabled: Bool = false,
        label: String = "Образы"
    ) {
        self.looks = looks
        self.axis = axis
        self.preview = preview
        self.external = index
        self.onIndexChange = onIndexChange
        self.weather = weather
        self.stamp = stamp
        self.skip = skip
        self.disabled = disabled
        self.label = label
        self._internalIndex = State(initialValue: index.wrappedValue)
    }

    /// Неуправляемый пейджер: начинает с `defaultIndex`, дальше листает сам и сообщает в `onIndexChange`.
    public init(
        looks: [YeetPagerLook],
        axis: Axis = .vertical,
        preview: CGFloat = 96,
        defaultIndex: Int = 0,
        onIndexChange: ((Int) -> Void)? = nil,
        weather: AnyView? = nil,
        stamp: AnyView? = nil,
        skip: AnyView? = nil,
        disabled: Bool = false,
        label: String = "Образы"
    ) {
        self.looks = looks
        self.axis = axis
        self.preview = preview
        self.external = nil
        self.onIndexChange = onIndexChange
        self.weather = weather
        self.stamp = stamp
        self.skip = skip
        self.disabled = disabled
        self.label = label
        self._internalIndex = State(initialValue: defaultIndex)
    }

    private var count: Int { looks.count }

    private var index: Int {
        let raw = external?.wrappedValue ?? internalIndex
        return min(max(raw, 0), max(count - 1, 0))
    }

    /// Верх текущего коллажа: в стопке под превью + 20.
    private var top: CGFloat { axis == .vertical ? preview + Self.gap : 0 }

    public var body: some View {
        YeetPagerSizing(extra: 2 * top) {
            GeometryReader { proxy in
                let side = proxy.size.width
                ZStack(alignment: .topLeading) {
                    ForEach(Array(looks.enumerated()), id: \.element.id) { k, look in
                        lookView(look, at: k, side: side)
                    }
                    slots(side: side)
                }
                .frame(width: side, height: proxy.size.height, alignment: .topLeading)
            }
        }
        .contentShape(Rectangle())
        .modifier(YeetPagerGesture(axis: axis, enabled: !disabled && count > 1, gesture: pagerDrag))
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text(label))
    }

    // MARK: Раскладка

    private struct Placement {
        var x: CGFloat = 0
        var y: CGFloat = 0
        var scale: CGFloat = 1
        var opacity: Double = 1
    }

    private func placement(_ k: Int, side: CGFloat) -> Placement {
        let r = k - index
        if axis == .horizontal {
            return Placement(x: CGFloat(r) * (side + Self.gap) + drag)
        }
        let p = preview / max(side, 1)
        switch r {
        case 0: return Placement(y: top + drag)
        case -1: return Placement(y: drag, scale: p)
        case 1: return Placement(y: top + side + Self.gap + drag, scale: p)
        case ..<(-1): return Placement(y: -44 + drag, scale: p * 0.75, opacity: 0)
        default: return Placement(y: top + side + 107 + drag, scale: p * 0.75, opacity: 0)
        }
    }

    private func lookView(_ look: YeetPagerLook, at k: Int, side: CGFloat) -> some View {
        let place = placement(k, side: side)
        let current = k == index
        let neighbour = abs(k - index) == 1
        // у превью радиус 20, как у миниатюры образа: до масштаба 20 / scale
        let radius = YeetComponent.cardRadius / max(place.scale, 0.01)
        return YeetOutfitCollage(items: look.items, label: current ? look.label : nil)
            .frame(width: side, height: side)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .scaleEffect(place.scale, anchor: axis == .vertical ? .top : .center)
            .offset(x: place.x, y: place.y)
            .opacity(place.opacity)
            .zIndex(current ? 1 : 0)
            .onTapGesture {
                guard neighbour, !disabled else { return }
                YeetHaptic.select()
                go(k)
            }
            .allowsHitTesting(neighbour || current)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Text(label))
            .accessibilityValue(Text("\(k + 1) из \(count)" + (look.name.map { ": \($0)" } ?? "")))
            .accessibilityAdjustableAction { direction in
                switch direction {
                case .increment: go(index + 1)
                case .decrement: go(index - 1)
                @unknown default: break
                }
            }
            .accessibilityHidden(!current)
    }

    /// Слоты поверх текущего коллажа: погода над левым верхним углом, штамп у правого нижнего, «Не нравится» — у левого.
    private func slots(side: CGFloat) -> some View {
        let k = side / Self.design
        return ZStack(alignment: .topLeading) {
            Color.clear
            if let weather { weather.offset(x: YeetSpace.s20, y: -43) }
            if let skip { skip.offset(x: YeetSpace.s20, y: 321 * k) }
        }
        .frame(width: side, height: side, alignment: .topLeading)
        .overlay(alignment: .topTrailing) {
            if let stamp {
                stamp
                    .environment(\.yeetStampTurn, .degrees(Double(index) * 180))
                    .offset(x: -YeetSpace.s20, y: 280 * k)
            }
        }
        .offset(y: top)
        .zIndex(2)
    }

    // MARK: Жест

    private func along(_ size: CGSize) -> CGFloat { axis == .horizontal ? size.width : size.height }
    private func along(_ vector: CGVector) -> CGFloat { axis == .horizontal ? vector.dx : vector.dy }

    private var pagerDrag: some Gesture {
        DragGesture(minimumDistance: YeetGesture.touchSlop, coordinateSpace: .global)
            .onChanged(dragChanged)
            .onEnded(dragEnded)
    }

    private func dragChanged(_ value: DragGesture.Value) {
        if lockedAxis == nil {
            let t = value.translation
            lockedAxis = abs(t.width) > abs(t.height) ? .horizontal : .vertical
            tracker.reset()
        }
        guard lockedAxis == axis else { return } // жест поперёк — не наш
        tracker.add(value.location, at: value.time)
        let d = along(value.translation)
        let edge = (d > 0 && index == 0) || (d < 0 && index == count - 1)
        let isCrossed = !edge && abs(d) > Self.design * YeetGesture.swipeDistance
        if isCrossed && !crossed { YeetHaptic.threshold() } // один раз на пороге
        crossed = isCrossed
        drag = edge ? yeetRubberBand(d, dimension: Self.design) : d
    }

    private func dragEnded(_ value: DragGesture.Value) {
        let mine = lockedAxis == axis
        lockedAxis = nil
        crossed = false
        guard mine else { return }
        tracker.add(value.location, at: value.time) // точка отпускания: палец мог стоять перед подъёмом
        let v = along(tracker.velocity(at: value.time))
        tracker.reset()
        let d = along(value.translation)
        let flick = abs(v) > YeetGesture.swipeVelocity && (v > 0) == (d > 0)
        let target = index + (d < 0 ? 1 : -1)
        if (abs(d) > Self.design * YeetGesture.swipeDistance || flick) && (0..<count).contains(target) {
            if axis == .vertical { YeetHaptic.skip() } else { YeetHaptic.select() }
            go(target)
        } else {
            yeetWithAnimation(settle, reduceMotion: reduceMotion) { drag = 0 }
        }
    }

    private var settle: Animation { axis == .vertical ? YeetMotion.swap : YeetMotion.page }

    private func go(_ next: Int) {
        guard (0..<count).contains(next) else { return }
        let changed = next != index
        yeetWithAnimation(settle, reduceMotion: reduceMotion) {
            drag = 0
            if let external { external.wrappedValue = next } else { internalIndex = next }
        }
        if changed {
            onIndexChange?(next)
            UIAccessibility.post(notification: .announcement, argument: "Образ \(next + 1) из \(count)" + (looks[next].name.map { ": \($0)" } ?? ""))
        }
    }
}

/// Стопка вертикальная забирает жест целиком; лента — одновременно со скроллом экрана, чтобы вертикаль уходила ему.
private struct YeetPagerGesture<G: Gesture>: ViewModifier {
    let axis: Axis
    let enabled: Bool
    let gesture: G

    @ViewBuilder
    func body(content: Content) -> some View {
        if axis == .vertical {
            content.gesture(gesture, including: enabled ? .all : .subviews)
        } else {
            content.simultaneousGesture(gesture, including: enabled ? .all : .subviews)
        }
    }
}

/// Ширина — по контейнеру, но не больше 353; высота — сторона + `extra` (превью стопки сверху и снизу).
private struct YeetPagerSizing: Layout {
    let extra: CGFloat

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let available = proposal.width.flatMap { $0.isFinite ? $0 : nil } ?? YeetOutfitPager.design
        let side = min(YeetOutfitPager.design, available)
        return CGSize(width: side, height: side + extra)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let side = min(YeetOutfitPager.design, bounds.width)
        subviews.first?.place(
            at: CGPoint(x: bounds.midX, y: bounds.minY),
            anchor: .top,
            proposal: ProposedViewSize(width: side, height: side + extra)
        )
    }
}

#if DEBUG
private struct OutfitPagerPreview: View {
    @State private var index = 1

    private static func look(_ id: String, _ label: String, _ colors: [YeetItemColor]) -> YeetPagerLook {
        YeetPagerLook(id: id, items: [
            YeetCollageItem(kind: .outerwear, x: 30, y: 30, size: 130, color: colors[0]),
            YeetCollageItem(kind: .bottom, x: 55, y: 66, size: 120, color: colors[1]),
            YeetCollageItem(kind: .shoe, x: 78, y: 80, size: 72, color: colors[2]),
        ], label: label, name: label)
    }

    private let looks = [
        look("a", "Прогулка", [.beige, .blue, .black]),
        look("b", "Офис", [.grey, .black, .brown]),
        look("c", "Свидание", [.red, .black, .white]),
        look("d", "Спорт", [.green, .grey, .white]),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 40) {
                YeetOutfitPager(
                    looks: looks,
                    index: $index,
                    stamp: AnyView(YeetStamp(label: "Надеть") {})
                )
                YeetOutfitPager(
                    looks: looks,
                    axis: .horizontal,
                    stamp: AnyView(YeetStamp(label: "Сохранить") {}),
                    skip: AnyView(YeetStamp(label: "Не нравится", tone: .secondary) {})
                )
            }
            .padding(.vertical, 20)
            .frame(maxWidth: .infinity)
        }
        .background(YeetColor.bgCanvas)
    }
}

#Preview("OutfitPager · Light") { OutfitPagerPreview().preferredColorScheme(.light) }
#Preview("OutfitPager · Dark") { OutfitPagerPreview().preferredColorScheme(.dark) }
#endif
