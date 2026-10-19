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
    /// Готовый образ вместо раскладки `items` (React-аналога пока нет, #33): снимок приложения, живой холст.
    /// Вписывается в квадрат образа поверх фона; у превью соседей масштабируется вместе с плиткой.
    public var media: AnyView?
    /// Сплошная заливка плитки вместо `cardBg` с точками (белый холст образа у приложения, как у `YeetOutfitThumbnail`, #30).
    /// С заливкой плитка получает обводку 1 pt `borderSubtle`, чтобы белое не сливалось с фоном экрана. `nil` — точечный фон. Для светлого холста в тёмной теме задайте `media` `.environment(\.colorScheme, .light)`.
    public var background: Color?

    public init(id: String, items: [YeetCollageItem], label: String? = nil, name: String? = nil, background: Color? = nil) {
        self.id = id
        self.items = items
        self.label = label
        self.name = name
        self.background = background
    }

    /// Образ готовой картинкой (снимок, холст) вместо раскладки вещей.
    public init<Media: View>(id: String, label: String? = nil, name: String? = nil, background: Color? = nil, @ViewBuilder media: () -> Media) {
        self.init(id: id, items: [], label: label, name: name, background: background)
        self.media = AnyView(media())
    }
}

/// Пейджер образов (React: `OutfitPager` + `useSwipePager`).
///
/// - Стопка (`axis: .vertical`, Figma `1371:36589`, Animations «scale»): текущий коллаж 353, соседние — превью 96 (или 150 в «Удиви меня»)
///   в 20 над и под ним; смена — пружина gentle (`YeetMotion.swap`), хаптика `skip`.
/// - Лента (`axis: .horizontal`, Figma `1371:42779`): страницы 353 через 20, соседние за краем экрана; смена — `YeetMotion.page`, хаптика `select`.
///
/// **Жест** — `DragGesture`: начинается после `touchSlop` и закрепляется за доминирующей осью (движение поперёк отдаётся
/// скроллу экрана). Дальше 30 % размера или бросок быстрее 500 pt/с — соседний образ; пауза пальца > 80 мс перед отпусканием —
/// не бросок (`YeetVelocityTracker`). На первом и последнем образе — резинка. Хаптика `threshold` один раз на пороге.
/// Тап по соседнему превью — к нему, по текущему образу — `onClick` (открыть образ). При «Уменьшении движения» доводка мгновенная, палец по-прежнему ведёт 1 : 1.
///
/// **VoiceOver:** текущий образ — регулируемый элемент «Образы, 2 из 5: имя», смахивание вверх / вниз листает; скрытые образы не читаются.
/// Управляемый (`index: $i`) или неуправляемый (`defaultIndex`, индекс хранится в `@State`).
/// Пустой `looks` — пейджер ничего не рисует (экран показывает `YeetEmptyState`); один образ — без превью и без жеста.
///
/// **По кругу** (`loop: true`, от двух образов и без `trailing`): с первого назад — последний, с последнего вперёд — первый,
/// превью соседей тоже по кругу (над первым — последний). Внутри — «виртуальный» индекс без границ: рисуются позиции
/// −2…+2 вокруг него, ключ позиции — её виртуальный номер, образ — номер по модулю `looks.count`. Поэтому шаг через стык —
/// тот же шаг на одну позицию (без прыжка и мигания); наружу (`index`, `onIndexChange`, VoiceOver) — настоящий индекс 0…N−1.
public struct YeetOutfitPager: View {
    /// Размер коллажа в макете.
    static let design: CGFloat = 353
    private static let gap: CGFloat = YeetSpace.s20

    private let looks: [YeetPagerLook]
    private let axis: Axis
    private let preview: CGFloat
    private let external: Binding<Int>?
    private let onIndexChange: ((Int) -> Void)?
    private let onClick: ((Int) -> Void)?
    private let weather: AnyView?
    private let stamp: AnyView?
    private let skip: AnyView?
    private let trailing: AnyView?
    private let disabled: Bool
    private let label: String
    private let loop: Bool

    @State private var internalIndex: Int
    /// Виртуальный индекс ленты по кругу (без границ); его остаток по `looks.count` — настоящий индекс.
    @State private var virtualIndex: Int
    @State private var drag: CGFloat = 0
    @State private var lockedAxis: Axis?
    @State private var crossed = false
    @State private var tracker = YeetVelocityTracker()
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// Управляемый пейджер.
    /// - Parameters:
    ///   - preview: размер превью соседних образов в стопке: 96 — главная (`1371:36589`), 150 — «Удиви меня» (`1371:42686`).
    ///   - weather: слот над левым верхним углом коллажа (`YeetWeatherCard(tilt:)`).
    ///   - stamp: слот у правого нижнего угла (`YeetStamp` «Надеть» / «Сохранить»).
    ///   - skip: слот у левого нижнего угла (`YeetStamp(tone: .secondary)` «Не нравится»).
    ///   - onClick: тап по текущему образу (открыть карточку образа): приходит его индекс.
    ///   - disabled: выключить жест (например, пока открыта шторка).
    ///   - trailing: слайд после последнего образа — страница той же стороны, что коллаж («Досмотрели все образы /
    ///     Показать ещё», «Это все варианты»). Листается как образ; его индекс — `looks.count`. На нём слоты погоды и
    ///     штампов прячутся, тап по нему не вызывает `onClick` — кнопки внутри слайда нажимаются сами.
    ///   - loop: листать по кругу (от двух образов; со слайдом `trailing` не действует). По умолчанию — нет.
    public init(
        looks: [YeetPagerLook],
        axis: Axis = .vertical,
        preview: CGFloat = 96,
        index: Binding<Int>,
        onIndexChange: ((Int) -> Void)? = nil,
        onClick: ((Int) -> Void)? = nil,
        weather: AnyView? = nil,
        stamp: AnyView? = nil,
        skip: AnyView? = nil,
        disabled: Bool = false,
        label: String = "Образы",
        loop: Bool = false,
        trailing: AnyView? = nil
    ) {
        self.looks = looks
        self.axis = axis
        self.preview = preview
        self.external = index
        self.onIndexChange = onIndexChange
        self.onClick = onClick
        self.weather = weather
        self.stamp = stamp
        self.skip = skip
        self.trailing = trailing
        self.disabled = disabled
        self.label = label
        self.loop = loop
        self._internalIndex = State(initialValue: index.wrappedValue)
        self._virtualIndex = State(initialValue: index.wrappedValue)
    }

    /// Неуправляемый пейджер: начинает с `defaultIndex`, дальше листает сам и сообщает в `onIndexChange`.
    /// `trailing` — как у управляемого.
    public init(
        looks: [YeetPagerLook],
        axis: Axis = .vertical,
        preview: CGFloat = 96,
        defaultIndex: Int = 0,
        onIndexChange: ((Int) -> Void)? = nil,
        onClick: ((Int) -> Void)? = nil,
        weather: AnyView? = nil,
        stamp: AnyView? = nil,
        skip: AnyView? = nil,
        disabled: Bool = false,
        label: String = "Образы",
        loop: Bool = false,
        trailing: AnyView? = nil
    ) {
        self.looks = looks
        self.axis = axis
        self.preview = preview
        self.external = nil
        self.onIndexChange = onIndexChange
        self.onClick = onClick
        self.weather = weather
        self.stamp = stamp
        self.skip = skip
        self.trailing = trailing
        self.disabled = disabled
        self.label = label
        self.loop = loop
        self._internalIndex = State(initialValue: defaultIndex)
        self._virtualIndex = State(initialValue: defaultIndex)
    }

    /// Страниц: образы и слайд после них (`trailing`).
    private var count: Int { looks.count + (trailing == nil ? 0 : 1) }
    /// Текущая страница — слайд после образов.
    private var onTrailing: Bool { trailing != nil && index == looks.count }

    private var index: Int {
        let raw = external?.wrappedValue ?? internalIndex
        return min(max(raw, 0), max(count - 1, 0))
    }

    /// Лента по кругу: просили, образов два и больше, слайда после них нет.
    private var looping: Bool { loop && trailing == nil && looks.count >= 2 }

    private func wrap(_ v: Int) -> Int { let n = max(looks.count, 1); return ((v % n) + n) % n }

    /// Виртуальная позиция текущего образа. Индекс сменили снаружи (новая лента — к первому) — позиция = индекс.
    private var virtual: Int { wrap(virtualIndex) == index ? virtualIndex : index }

    /// Верх текущего коллажа: в стопке под превью + 20.
    private var top: CGFloat { axis == .vertical ? preview + Self.gap : 0 }

    public var body: some View {
        if !looks.isEmpty { pager }
    }

    private var pager: some View {
        YeetPagerSizing(extra: 2 * top) {
            GeometryReader { proxy in
                let side = proxy.size.width
                ZStack(alignment: .topLeading) {
                    if looping {
                        // позиции −2…+2 вокруг текущей; при двух образах сосед сверху и снизу — один и тот же образ
                        ForEach(Array((virtual - 2)...(virtual + 2)), id: \.self) { v in
                            lookView(looks[wrap(v)], at: wrap(v), offset: v - virtual, side: side)
                        }
                    } else {
                        ForEach(Array(looks.enumerated()), id: \.element.id) { k, look in
                            lookView(look, at: k, offset: k - index, side: side)
                        }
                    }
                    if let trailing {
                        trailingView(trailing, side: side)
                    }
                    // на слайде после образов слотов нет совсем (не только прозрачны): не нажимаются и не читаются
                    if !onTrailing {
                        slots(side: side)
                            .transition(.opacity)
                    }
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

    /// `r` — смещение от текущего образа (−1 — сосед сверху / слева).
    private func placement(_ r: Int, side: CGFloat) -> Placement {
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

    private func lookView(_ look: YeetPagerLook, at k: Int, offset r: Int, side: CGFloat) -> some View {
        let place = placement(r, side: side)
        let current = r == 0
        let neighbour = abs(r) == 1
        // у превью радиус 20, как у миниатюры образа: до масштаба 20 / scale
        let radius = YeetComponent.cardRadius / max(place.scale, 0.01)
        let shape = RoundedRectangle(cornerRadius: radius, style: .continuous)
        return tile(look, current: current)
            .frame(width: side, height: side)
            .clipShape(shape)
            .overlay {
                // своя заливка (белый холст) сливается с фоном экрана — обводка 1 pt, как у плитки образа в приложении
                if look.background != nil {
                    shape.strokeBorder(YeetColor.borderSubtle, lineWidth: 1 / max(place.scale, 0.01))
                }
            }
            .contentShape(shape)
            .scaleEffect(place.scale, anchor: axis == .vertical ? .top : .center)
            .offset(x: place.x, y: place.y)
            .opacity(place.opacity)
            .zIndex(current ? 1 : 0)
            .onTapGesture {
                guard !disabled else { return }
                if current {
                    onClick?(k)
                } else if neighbour {
                    YeetHaptic.select()
                    step(r)
                }
            }
            .allowsHitTesting(neighbour || current)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Text(label))
            .accessibilityValue(Text("\(k + 1) из \(looks.count)" + (look.name.map { ": \($0)" } ?? "")))
            .accessibilityAddTraits(current && onClick != nil ? .isButton : [])
            .accessibilityAction { if current, !disabled { onClick?(k) } }
            .accessibilityAdjustableAction { direction in
                switch direction {
                case .increment: step(1)
                case .decrement: step(-1)
                @unknown default: break
                }
            }
            .accessibilityHidden(!current && !(onTrailing && k == looks.count - 1))
    }

    /// Слайд после образов: та же раскладка, что у образа с индексом `looks.count` (превью снизу, когда соседний),
    /// без обводки и без `onClick`. Текущий — содержимое доступно VoiceOver и нажимается; вернуться к образам VoiceOver
    /// может через последний образ: на слайде он остаётся регулируемым элементом («N из N», смахивание вниз — к нему).
    private func trailingView(_ content: AnyView, side: CGFloat) -> some View {
        let k = looks.count
        let place = placement(k - index, side: side)
        let current = k == index
        let neighbour = abs(k - index) == 1
        let shape = RoundedRectangle(cornerRadius: YeetComponent.cardRadius / max(place.scale, 0.01), style: .continuous)
        return content
            .allowsHitTesting(current) // у превью кнопки слайда не нажимаются — тап листает к нему
            .frame(width: side, height: side)
            .background(YeetComponent.cardBg)
            .clipShape(shape)
            .overlay {
                // превью слайда: прозрачный слой листает к нему. У текущего слоя нет — жест на самом слайде делал его
                // одним элементом VoiceOver с рамкой всей страницы, и тап по «кнопке» приходился мимо неё
                if neighbour && !disabled {
                    Color.clear
                        .contentShape(shape)
                        .onTapGesture { YeetHaptic.select(); go(k) }
                        .accessibilityHidden(true)
                }
            }
            .scaleEffect(place.scale, anchor: axis == .vertical ? .top : .center)
            .offset(x: place.x, y: place.y)
            .opacity(place.opacity)
            .zIndex(current ? 1 : 0)
            .allowsHitTesting(neighbour || current)
            .accessibilityElement(children: .contain)
            .accessibilityHidden(!current)
    }

    /// Плитка образа: коллаж из `items` (как раньше) либо `media` / `background` поверх той же геометрии.
    @ViewBuilder
    private func tile(_ look: YeetPagerLook, current: Bool) -> some View {
        if look.media == nil && look.background == nil {
            YeetOutfitCollage(items: look.items, label: current ? look.label : nil)
        } else {
            ZStack {
                if let background = look.background {
                    background
                } else {
                    YeetComponent.cardBg
                    YeetDotPattern().padding(14)
                }
                if let media = look.media {
                    media
                } else {
                    YeetCollageLayer(items: look.items)
                }
            }
            .overlay(alignment: .topLeading) {
                if current, let label = look.label {
                    YeetBadge(label, variant: .secondary).padding(YeetSpace.s20)
                }
            }
        }
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
        let edge = !looping && ((d > 0 && index == 0) || (d < 0 && index == count - 1))
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
        let delta = d < 0 ? 1 : -1
        if (abs(d) > Self.design * YeetGesture.swipeDistance || flick) && (looping || (0..<count).contains(index + delta)) {
            if axis == .vertical { YeetHaptic.skip() } else { YeetHaptic.select() }
            step(delta)
        } else {
            yeetWithAnimation(settle, reduceMotion: reduceMotion) { drag = 0 }
        }
    }

    private var settle: Animation { axis == .vertical ? YeetMotion.swap : YeetMotion.page }

    /// Шаг на `delta` позиций. По кругу — через виртуальный индекс (стык как обычный шаг), иначе — `go`.
    private func step(_ delta: Int) {
        guard looping else { go(index + delta); return }
        let nextVirtual = virtual + delta
        let next = wrap(nextVirtual)
        yeetWithAnimation(settle, reduceMotion: reduceMotion) {
            drag = 0
            virtualIndex = nextVirtual
            if let external { external.wrappedValue = next } else { internalIndex = next }
        }
        if next != index {
            onIndexChange?(next)
            UIAccessibility.post(notification: .announcement, argument: "Образ \(next + 1) из \(looks.count)" + (looks[next].name.map { ": \($0)" } ?? ""))
        }
    }

    private func go(_ next: Int) {
        guard (0..<count).contains(next) else { return }
        let changed = next != index
        yeetWithAnimation(settle, reduceMotion: reduceMotion) {
            drag = 0
            if let external { external.wrappedValue = next } else { internalIndex = next }
        }
        if changed {
            onIndexChange?(next)
            if next < looks.count {
                UIAccessibility.post(notification: .announcement, argument: "Образ \(next + 1) из \(looks.count)" + (looks[next].name.map { ": \($0)" } ?? ""))
            }
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

    /// Снимок образа приложения: картинка на белом холсте (`background: .white`).
    private static func snapshot(_ id: String, _ symbols: [String]) -> YeetPagerLook {
        YeetPagerLook(id: id, name: "Снимок \(id)", background: .white) {
            VStack(spacing: 12) {
                ForEach(symbols, id: \.self) { Image(systemName: $0).resizable().scaledToFit().frame(height: 72) }
            }
            .foregroundStyle(Color(white: 0.25))
            .environment(\.colorScheme, .light)
        }
    }

    private let snapshots = [
        snapshot("s1", ["tshirt", "shoe"]),
        snapshot("s2", ["jacket", "bag"]),
        snapshot("s3", ["hanger", "eyeglasses"]),
    ]

    @State private var snapshotIndex = 0
    @State private var surpriseIndex = 0
    @State private var saved = false
    @State private var worn = false

    var body: some View {
        ScrollView {
            VStack(spacing: 40) {
                // «Сегодня» (Figma `1173:16144`): снимки, погода наклоном, штамп «Надеть»; по кругу
                YeetOutfitPager(
                    looks: snapshots,
                    index: $snapshotIndex,
                    onClick: { _ in },
                    weather: AnyView(YeetWeatherCard(temperature: "20°", description: "Солнечно, ветер 14 км/ч", tilt: true)),
                    stamp: AnyView(YeetStamp(label: "Надеть", done: worn) { worn.toggle() }),
                    loop: true
                )
                // «Удиви меня» (Figma `1176:20319`): превью 150, «Не нравится» слева, «Сохранить» справа, после образов —
                // слайд «Досмотрели все образы» (`trailing`)
                YeetOutfitPager(
                    looks: looks,
                    preview: 150,
                    index: $surpriseIndex,
                    stamp: AnyView(YeetStamp(label: "Сохранить", done: saved) { saved.toggle() }),
                    skip: AnyView(YeetStamp(label: "Не нравится", tone: .secondary) { surpriseIndex += 1 }),
                    trailing: AnyView(
                        YeetEmptyState(title: "Досмотрели все образы", description: "Соберём ещё из твоих вещей",
                                       action: YeetEmptyStateAction(label: "Показать ещё", variant: .primary) { surpriseIndex = 0 })
                    )
                )
                // один образ — без превью
                YeetOutfitPager(looks: [snapshots[0]], defaultIndex: 0, onClick: { _ in })
                // пусто — ничего
                YeetOutfitPager(looks: [], defaultIndex: 0)
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
