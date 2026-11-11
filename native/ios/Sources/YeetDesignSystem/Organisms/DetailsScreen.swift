import SwiftUI
import UIKit

/// Детали вещи и образа (React: `DetailsScreen` + `usePhotoCollapse`; Figma: Wardrobe / Item Details `1371:41024 → 1371:41076`,
/// Outfit Details `1371:41156 → 1371:41329`, Animations «new things» `354:17405 → 354:17449`).
///
/// В покое: фото во всю ширину минус поля в 20 под шапкой, под ним панель деталей (`YeetSheet(type: .panel)`).
/// После 24 pt скролла (обратно — при ≤ 8: гистерезис, чтобы шапка не дрожала на границе):
/// - панель поднимается поверх фото;
/// - фото сворачивается в миниатюру 48 по центру шапки (сдвиг + масштаб, `YeetMotion.collapse`), радиус миниатюры 16;
///   со своей миниатюрой (`thumb`) — фото гаснет, миниатюра встаёт в шапку вместо пилюли `titleChip`;
/// - низ (`bottom`) и штамп (`stamp`) остаются на месте.
/// При «Уменьшении движения» миниатюра появляется сразу. Фото опускается под панель, только когда долетело обратно.
///
/// **`pinned`** (#26) — блок между фото и панелью ВНЕ прокрутки (решение по фото, которое обязано быть видно без
/// прокрутки). Фото уступает ему высоту: квадрат сжимается так, чтобы фото + блок помещались в экран, в пределах
/// `mediaMinFraction`…`mediaMaxFraction` высоты области под шапкой. Панель начинается под блоком; при прокрутке она
/// наезжает на фото, но не на блок: в свёрнутом состоянии блок поднимается под шапку и остаётся над панелью.
/// Без `pinned` раскладка прежняя, пиксель в пиксель.
public struct YeetDetailsScreen<Media: View, Content: View>: View {
    /// Сворачивание (Garderob P-0030.54): фото едет вместе с прокруткой под шапку и сворачивается в миниатюру, когда от
    /// него осталось `collapseVisible` pt; разворачивается, когда снова видно `expandVisible` pt (гистерезис — шапка не
    /// дрожит на границе). Прежде фото сворачивалось уже после 24 pt прокрутки, место фото в прокрутке схлопывалось с
    /// 20 + сторона + 20 до 25, и короткую панель приходилось растягивать на весь экран — поля уезжали под шапку, под
    /// ними оставалась пустая панель (P-0030.49 п. 2 «не выше, чем нужно» так и не выполнялся).
    static var collapseVisible: CGFloat { 24 }
    static var expandVisible: CGFloat { 40 }

    private let title: String?
    private let titleChip: String?
    private let actions: [YeetHeaderAction]
    private let onBack: (() -> Void)?
    private let thumb: AnyView?
    private let bottom: AnyView?
    private let stamp: AnyView?
    private let pinned: AnyView?
    /// Элементы управления поверх фото (Garderob P-0030.53: «×» на фото, нажимаемый квадрат «Добавить фотографию»).
    private let mediaControls: AnyView?
    /// Блок панели над заголовком (Garderob P-0030.91) — передаётся в `YeetSheet(header:)`.
    private let panelHeader: AnyView?
    private let subtitle: String?
    private let mediaMinFraction: CGFloat
    private let mediaMaxFraction: CGFloat
    private let minPanelPeek: CGFloat
    /// Пропорция фото «ширина / высота» (Garderob P-0147). `1` — квадрат, как было у всех экранов.
    private let mediaAspect: CGFloat
    /// Сворачивание фото в миниатюру шапки (Garderob P-0218). `false` — обычная прокрутка: фото едет вместе с
    /// содержимым без масштаба и миниатюры, нет доводки к двум состояниям, высота прокрутки = высота содержимого.
    private let collapsesMedia: Bool
    private let media: Media
    private let content: Content

    @State private var collapsed = false
    /// Смещение прокрутки, pt: фото в покое едет вместе с содержимым.
    @State private var scrollOffset: CGFloat = 0
    @State private var mediaOnTop = false
    @State private var headerHeight: CGFloat = 0
    @State private var pinnedHeight: CGFloat = 0
    @State private var bottomHeight: CGFloat = 0
    /// Верх закреплённого низа в координатах окна — до него поднимается поле в фокусе.
    @State private var bottomTop: CGFloat = .infinity
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// - Parameters:
    ///   - title: заголовок панели (H2).
    ///   - titleChip: пилюля по центру шапки в покое («Новая вещь»); при сворачивании её место занимает миниатюра.
    ///   - actions: кнопки справа в шапке. По умолчанию — «Ещё».
    ///   - thumb: миниатюра 48 в шапке, когда фото свёрнуто. По умолчанию — само фото, уменьшенное до 48.
    ///   - bottom: закреплённый низ (`BottomBar`): панель уходит под него.
    ///   - stamp: штамп «Надеть» — поверх контента справа внизу, со скроллом не едет.
    ///   - subtitle: строка под заголовком панели (Body `textSecondary`): «Все сезоны» (#39).
    ///   - pinned: блок между фото и панелью вне прокрутки (#26); с ним фото уступает высоту.
    ///   - mediaMinFraction: с `pinned` — нижняя граница фото, доля высоты области под шапкой.
    ///   - mediaMaxFraction: с `pinned` — верхняя граница фото, доля высоты области под шапкой.
    ///   - minPanelPeek: с `pinned` — сколько панели оставить видимым над нижним краем, чтобы за неё можно было
    ///     потянуть (фото и блок прокрутку не ловят). Пол `mediaMinFraction` сильнее: на низком экране с высоким
    ///     блоком панель может уйти за край — тогда приложение опускает `mediaMinFraction`.
    ///   - mediaControls: слой поверх фото — квадрат той же стороны. Фото лежит ПОД прокруткой, и касания по нему забирает
    ///     она; этот слой живёт в самой прокрутке на месте фото, поэтому нажимается, а свайп по фото по-прежнему тянет
    ///     панель. Уезжает вместе с содержимым (до 24 pt до сворачивания), в свёрнутом состоянии скрыт. `nil` — как было.
    ///   - panelHeader: блок панели над её заголовком (Garderob P-0030.91: решение по улучшенному фото); `nil` — как было.
    ///   - mediaAspect: пропорция фото «ширина / высота» (Garderob P-0147: холст «Предпросмотра» выше квадрата). Ширина —
    ///     как у квадрата (во всю ширину минус поля; с `pinned` — по `mediaMinFraction`…`mediaMaxFraction`, которые теперь
    ///     ограничивают высоту), высота — ширина / `mediaAspect`. По умолчанию `1`: квадрат, раскладка прежняя.
    ///   - collapsesMedia: `true` (по умолчанию) — как было: фото сворачивается в миниатюру шапки, панель доезжает до двух
    ///     состояний и прокручивается до «свёрнуто» при любом содержимом. `false` (Garderob P-0218, карточка вещи) — фото
    ///     прокручивается вместе с содержимым обычным образом (и на резинке сверху — без масштаба), миниатюры и доводки
    ///     нет; панель тянется фоном до низа экрана, но прокрутки не добавляет: всё поместилось — прокрутки нет.
    ///     Содержимое и фото уходят под нижний край шапки и обрезаются по нему.
    ///   - media: фото вещи, коллаж образа — квадрат (или прямоугольник `mediaAspect`).
    public init(
        title: String? = nil,
        titleChip: String? = nil,
        actions: [YeetHeaderAction] = [YeetHeaderAction(icon: .more, label: "Ещё")],
        onBack: (() -> Void)? = nil,
        thumb: AnyView? = nil,
        bottom: AnyView? = nil,
        stamp: AnyView? = nil,
        subtitle: String? = nil,
        pinned: AnyView? = nil,
        mediaMinFraction: CGFloat = 0.5,
        mediaMaxFraction: CGFloat = 0.65,
        minPanelPeek: CGFloat = 56,
        mediaControls: AnyView? = nil,
        panelHeader: AnyView? = nil,
        mediaAspect: CGFloat = 1,
        collapsesMedia: Bool = true,
        @ViewBuilder media: () -> Media,
        @ViewBuilder content: () -> Content
    ) {
        self.panelHeader = panelHeader
        self.title = title
        self.titleChip = titleChip
        self.actions = actions
        self.onBack = onBack
        self.thumb = thumb
        self.bottom = bottom
        self.stamp = stamp
        self.subtitle = subtitle
        self.pinned = pinned
        self.mediaControls = mediaControls
        self.mediaMinFraction = mediaMinFraction
        self.mediaMaxFraction = mediaMaxFraction
        self.minPanelPeek = minPanelPeek
        self.mediaAspect = mediaAspect > 0 ? mediaAspect : 1
        self.collapsesMedia = collapsesMedia
        self.media = media()
        self.content = content()
    }

    private var gutter: CGFloat { YeetSpace.screenGutter }

    public var body: some View {
        VStack(spacing: 0) {
            YeetHeader(type: .bar(
                titleChip: collapsed && thumb != nil ? nil : titleChip,
                center: collapsed ? thumb.map { thumb in
                    AnyView(
                        thumb
                            .frame(width: 48, height: 48)
                            .clipShape(RoundedRectangle(cornerRadius: YeetRadius.md, style: .continuous))
                            .transition(.opacity)
                            .accessibilityHidden(true)
                    )
                } : nil,
                onBack: onBack,
                actions: actions
            ))
            .background(GeometryReader { proxy in
                Color.clear
                    .onAppear { headerHeight = proxy.size.height }
                    .onChange(of: proxy.size.height) { headerHeight = $0 }
            })
            // слой ниже шапки в дереве рисуется поверх неё — так свёрнутое фото встаёт в шапку
            GeometryReader { proxy in
                let size = mediaSize(width: proxy.size.width, viewport: proxy.size.height)
                ZStack(alignment: .top) {
                    mediaLayer(size: size, width: proxy.size.width)
                        .zIndex(mediaOnTop ? 2 : 0)
                    scroll(size: size, viewport: proxy.size.height, safeBottom: proxy.safeAreaInsets.bottom)
                        .zIndex(1)
                    if let pinned {
                        pinnedLayer(pinned, side: size.height)
                            .zIndex(3)
                    }
                }
            }
            // Без своей миниатюры (`thumb == nil`) в шапку встаёт само фото — слой с ним должен быть над шапкой
            // (у `YeetHeader` `zIndex(1)`): иначе свёрнутое фото уходило ПОД шапку и миниатюры не было видно.
            .zIndex(mediaOnTop && thumb == nil ? 2 : 0)
            // P-0218: без сворачивания фото и содержимое уходят под шапку прокруткой — обрезать по её нижнему краю, а не
            // рисовать поверх «‹» / «⋮». Вниз маска открыта: панель без закреплённого низа заходит под безопасную зону.
            .modifier(DetailsTopClip(enabled: !collapsesMedia))
        }
        .background(YeetColor.bgCanvas.ignoresSafeArea())
        .overlay(alignment: .bottomTrailing) {
            if let stamp {
                stamp
                    .padding(.trailing, gutter)
                    .padding(.bottom, 28)
            }
        }
    }

    /// Сторона фото. Без `pinned` — во всю ширину минус поля (как было). С `pinned` — столько, чтобы фото, блок,
    /// зазоры (20 над фото, 20 до блока, 12 после) и край панели `minPanelPeek` поместились в область под шапкой, но не меньше
    /// `mediaMinFraction` и не больше `mediaMaxFraction` её высоты.
    private func mediaSize(width: CGFloat, viewport: CGFloat) -> CGSize {
        Self.mediaSize(width: width, viewport: viewport, gutter: gutter, aspect: mediaAspect,
                       pinnedHeight: pinned == nil ? nil : pinnedHeight, minPanelPeek: minPanelPeek,
                       minFraction: mediaMinFraction, maxFraction: mediaMaxFraction)
    }

    /// Размер фото (Garderob P-0147). При `aspect == 1` — квадрат прежней стороны, выражение для выражения. Высота
    /// подчиняется тем же ограничениям, что прежде сторона; ширина = высота × `aspect`, но не шире экрана минус поля.
    static func mediaSize(width: CGFloat, viewport: CGFloat, gutter: CGFloat, aspect: CGFloat, pinnedHeight: CGFloat?,
                          minPanelPeek: CGFloat, minFraction: CGFloat, maxFraction: CGFloat) -> CGSize {
        let full = max(width - 2 * gutter, 1)
        let fullHeight = full / aspect
        guard let pinnedHeight else { return CGSize(width: full, height: fullHeight) }
        let available = viewport - YeetSpace.s20 - pinnedGap - pinnedHeight - YeetSpace.s12 - minPanelPeek
        let fitted = min(max(available, viewport * minFraction), viewport * maxFraction)
        let height = max(min(fullHeight, fitted), 1)
        return CGSize(width: max(min(full, height * aspect), 1), height: height)
    }

    /// Зазор между фото и блоком `pinned`.
    private static var pinnedGap: CGFloat { YeetSpace.s20 }

    /// Блок `pinned`: в покое под фото, в свёрнутом состоянии — под шапкой; фон экрана, панель уходит под него.
    private func pinnedLayer(_ pinned: AnyView, side: CGFloat) -> some View {
        pinned
            .frame(maxWidth: .infinity)
            .background(GeometryReader { proxy in
                Color.clear
                    .onAppear { pinnedHeight = proxy.size.height }
                    .onChange(of: proxy.size.height) { pinnedHeight = $0 }
            })
            .padding(.bottom, YeetSpace.s12)
            .background(YeetColor.bgCanvas)
            .offset(y: collapsed ? 0 : YeetSpace.s20 + side + Self.pinnedGap + Self.mediaOffset(scrollOffset, collapses: collapsesMedia))
    }

    /// Фото вне скролла: в покое под панелью, свёрнутое — миниатюра 48 в центре ряда кнопок шапки (сверху 8, ряд 48).
    private func mediaLayer(size: CGSize, width: CGFloat) -> some View {
        // Миниатюра 48 по большей стороне; по горизонтали — по центру ряда (у квадрата это прежние 24).
        let k = 48 / max(size.width, size.height)
        let dx = width / 2 - size.width * k / 2 - gutter - (width - 2 * gutter - size.width) / 2
        let dy = -headerHeight + YeetSpace.s8 - YeetSpace.s20
        return media
            .frame(width: size.width, height: size.height)
            .clipShape(RoundedRectangle(cornerRadius: collapsed ? YeetRadius.md / k : YeetComponent.cardRadius, style: .continuous))
            .scaleEffect(collapsed ? k : 1, anchor: .topLeading)
            // в покое фото едет вместе с прокруткой (уходит под шапку), свёрнутое — миниатюра в шапке
            .offset(x: collapsed ? dx : 0, y: collapsed ? dy : Self.mediaOffset(scrollOffset, collapses: collapsesMedia))
            .opacity(collapsed && thumb != nil ? 0 : 1)
            .padding(.top, YeetSpace.s20)
            .frame(maxWidth: .infinity)
            .allowsHitTesting(!collapsed)
            .accessibilityHidden(collapsed)
    }

    /// Нижняя безопасная зона, под которую уходят прокрутка и подложка панели: только без закреплённого низа (Garderob
    /// P-0030.69). С `bottom` её закрывает `safeAreaInset` низа — там всё по-прежнему, `0`.
    private func зонаПодПанелью(_ safeBottom: CGFloat) -> CGFloat { bottom == nil ? safeBottom : 0 }

    private func scroll(size: CGSize, viewport: CGFloat, safeBottom: CGFloat) -> some View {
        // Всё вертикальное (место фото в потоке, сворачивание) — по высоте фото; у квадрата это прежняя сторона.
        let side = size.height
        return ScrollView {
            VStack(spacing: 0) {
                // место фото в потоке: схлопывается, и панель поднимается (остаток 25 = порог + 1)
                ZStack(alignment: .top) {
                    Color.clear
                        .frame(height: spacerHeight(side: side))
                        .allowsHitTesting(false)
                        .accessibilityHidden(true)
                    if let mediaControls, !collapsed {
                        // слой нажатий — в самой прокрутке, поэтому едет вместе с фото
                        mediaControls
                            .frame(width: size.width, height: size.height)
                            .padding(.top, YeetSpace.s20)
                            .frame(maxWidth: .infinity)
                            .transition(.opacity)
                    }
                }
                // Панель не короче видимой области (над нижней кнопкой) + 8: свёрнутое состояние держится, даже
                // если в ней мало полей, а подложка панели тянется до низа — без пустоты под коротким содержимым.
                // Прежде `.frame(minHeight: viewport + 120)` стоял СНАРУЖИ панели: фон покрывал только содержимое
                // (пустота посреди экрана), а запас 120 уводил верх панели под шапку (Garderob P-0030.49).
                // 🔴 Без закреплённого низа (Garderob P-0030.69) — до самого края экрана: `viewport` (область под шапкой)
                // нижнюю безопасную зону не включает, и при коротком содержимом подложка кончалась на её линии — ниже
                // 34 pt пустого фона и тень панели (карточка купленной вещи после P-0030.66). Прокрутка уходит под
                // зону, к высоте добавляется зона, а содержимому — нижний отступ на неё же: строка не под полосой «домой».
                YeetSheet(title: title, description: subtitle, type: .panel, header: panelHeader) { content }
                    .environment(\.yeetPanelMinHeight, Self.panelMinHeight(viewport: viewport, bottom: bottomHeight,
                                                                            spacer: spacerHeight(side: side),
                                                                            collapse: Self.panelCollapse(side: side, collapses: collapsesMedia),
                                                                            safeArea: зонаПодПанелью(safeBottom)))
                    .environment(\.yeetPanelBottomInset, зонаПодПанелью(safeBottom))
            }
            // 🔴 Смещение — `onGeometryChange`, а не `PreferenceKey` из фона содержимого: на iOS 26 ключ из
            // фона внутри `ScrollView` при прокрутке НЕ обновлялся (одно значение 0 при появлении), и фото
            // никогда не сворачивалось в миниатюру шапки. `onGeometryChange` доступен с iOS 16 (back-deploy).
            .onGeometryChange(for: CGFloat.self) { proxy in
                -proxy.frame(in: .named("yeet-details")).minY
            } action: { offset in
                scrollOffset = offset
                update(offset, side: side)
            }
        }
        .coordinateSpace(name: "yeet-details")
        // Два состояния (Garderob P-0030.90.1): отпущенная панель доезжает либо «в покое» (фото целиком), либо
        // «свёрнуто» (фото в миниатюре шапки) — промежуточного положения, где фото срезано шапкой, нет.
        .modifier(DetailsSnap(collapsed: Self.collapsedOffset(side: side), enabled: collapsesMedia))
        // P-0218: без сворачивания короткое содержимое не прокручивается и не тянется резинкой.
        .modifier(DetailsBounce(basedOnSize: !collapsesMedia))
        .ignoresSafeArea(.container, edges: bottom == nil ? .bottom : [])
        .safeAreaInset(edge: .bottom, spacing: 0) {
            if let bottom {
                bottom
                    .onGeometryChange(for: CGFloat.self) { $0.size.height } action: { bottomHeight = $0 }
                    .onGeometryChange(for: CGFloat.self) { $0.frame(in: .global).minY } action: { bottomTop = $0 }
            }
        }
        // Поле в фокусе — над закреплённым низом (Garderob P-0030.55). Низ встаёт над клавиатурой, а SwiftUI докручивает
        // к полю, только когда его закрывает сама клавиатура: поле, видное над ней, но закрытое поднявшимся низом,
        // оставалось под кнопкой («Название» на SE и 17 Pro). Способ закрепления (`safeAreaInset` / `safeAreaPadding` /
        // `contentMargins`) этого не меняет — замер на стенде одинаковый. Поэтому, когда клавиатура встала, экран сам
        // докручивает поле до верха низа.
        .onReceive(NotificationCenter.default.publisher(for: UIResponder.keyboardDidShowNotification)) { _ in
            guard bottom != nil else { return }
            YeetFocusedField.lift(above: bottomTop - Self.focusGap)
        }
        // Клавиатура ушла — докрученная к полю панель возвращается в ближайшее из двух состояний (P-0030.90.1):
        // программная докрутка мимо `scrollTargetBehavior`, и без этого фото оставалось срезанным шапкой.
        .onReceive(NotificationCenter.default.publisher(for: UIResponder.keyboardWillHideNotification)) { _ in
            guard collapsesMedia else { return }
            YeetFocusedField.snapLifted(collapsed: Self.collapsedOffset(side: side))
        }
    }

    /// Зазор от текста поля в фокусе до закреплённого низа. Первый ответчик — сам текст (`UITextField` ~22 pt), а не
    /// строка поля: её нижний отступ (~20 у `YeetField`) входит в зазор, чтобы строка целиком была над низом.
    static var focusGap: CGFloat { YeetSpace.s24 }

    /// Наименьшая высота панели: от её места в покое (под фото) до закреплённого низа. Подложка тянется до низа в покое и
    /// при любой прокрутке (при докрутке до конца низ панели = низ видимой области), а короткое содержимое не уезжает
    /// выше, чем нужно, чтобы показать его целиком над нижней кнопкой: фото при этом уходит под шапку (P-0030.49 п. 2).
    /// `safeArea` — нижняя безопасная зона, под которую уходит панель без закреплённого низа (Garderob P-0030.69); с низом — 0,
    /// и формула прежняя.
    ///
    /// 🔴 Garderob P-0030.90.1 (решение владельца 01.11): панель поднимается до состояния «свёрнуто» при ЛЮБОМ содержимом —
    /// прокрутки должно хватать до `collapse` (фото целиком под шапкой, в шапке миниатюра). Прежняя формула
    /// (`viewport − низ − место фото`, P-0030.49 «не выше, чем нужно») при коротком содержимом останавливала прокрутку на
    /// полпути: фото срезано шапкой, миниатюры нет. Теперь панель не короче `viewport − низ − (место фото − collapse)`;
    /// без `pinned` это 20 под шапкой, с `pinned` — блок под шапкой и 12.
    static func panelMinHeight(viewport: CGFloat, bottom: CGFloat, spacer: CGFloat, collapse: CGFloat,
                               safeArea: CGFloat = 0) -> CGFloat {
        max(0, viewport + safeArea - bottom - (spacer - collapse))
    }

    /// Свёрнуто ли фото после смещения `offset` (гистерезис `collapseVisible` / `expandVisible`). Без сворачивания
    /// (P-0218) — никогда.
    static func nextCollapsed(offset: CGFloat, side: CGFloat, collapsed: Bool, collapses: Bool) -> Bool {
        guard collapses else { return false }
        let видно = YeetSpace.s20 + side - offset
        return collapsed ? видно < expandVisible : видно <= collapseVisible
    }

    /// Сколько прокрутки панель добавляет сверх своего места, чтобы дойти до «свёрнуто» (P-0030.90.1). Без сворачивания
    /// (P-0218) — 0: панель тянется фоном до низа, но прокрутки не добавляет.
    static func panelCollapse(side: CGFloat, collapses: Bool) -> CGFloat {
        collapses ? collapsedOffset(side: side) : 0
    }

    /// Сдвиг фото (и блока `pinned`) за прокруткой. Со сворачиванием резинка сверху фото не двигает (как было); без
    /// него (P-0218) фото едет вместе с содержимым в обе стороны — не отстаёт от панели и не масштабируется.
    static func mediaOffset(_ scrollOffset: CGFloat, collapses: Bool) -> CGFloat {
        collapses ? -max(0, scrollOffset) : -scrollOffset
    }

    /// Смещение прокрутки в состоянии «свёрнуто»: фото (20 + сторона) целиком ушло под шапку.
    static func collapsedOffset(side: CGFloat) -> CGFloat { YeetSpace.s20 + side }

    /// Куда доезжает отпущенная панель: выше половины пути — «свёрнуто», ниже — «в покое»; дальше «свёрнуто» —
    /// обычная прокрутка длинного содержимого.
    static func snapTarget(_ offset: CGFloat, collapsed: CGFloat) -> CGFloat {
        guard offset > 0, offset < collapsed else { return offset }
        return offset < collapsed / 2 ? 0 : collapsed
    }

    /// Место фото в потоке — постоянное (20 + сторона + 20; с `pinned` — плюс блок и зазор): фото уходит под шапку
    /// прокруткой, а не схлопыванием места, и панель не прыгает при сворачивании.
    private func spacerHeight(side: CGFloat) -> CGFloat {
        let base = YeetSpace.s20 + side + YeetSpace.s20
        guard pinned != nil else { return base }
        return base + pinnedHeight + YeetSpace.s12
    }

    /// Видимая часть фото = 20 + сторона − смещение. Свернуть, когда осталось ≤ `collapseVisible`; развернуть, когда
    /// снова видно ≥ `expandVisible`.
    private func update(_ offset: CGFloat, side: CGFloat) {
        let next = Self.nextCollapsed(offset: offset, side: side, collapsed: collapsed, collapses: collapsesMedia)
        guard next != collapsed else { return }
        if next { mediaOnTop = true }
        yeetWithAnimation(YeetMotion.collapse, reduceMotion: reduceMotion) { collapsed = next }
        if !next {
            // обратно фото опускается под панель, только когда долетело
            DispatchQueue.main.asyncAfter(deadline: .now() + (reduceMotion ? 0 : 0.3)) {
                if !collapsed { mediaOnTop = false }
            }
        }
    }
}

/// Поле ввода в фокусе (первый ответчик UIKit под SwiftUI `TextField`) и его прокрутка.
@MainActor
enum YeetFocusedField {
    fileprivate static weak var found: UIResponder?
    /// Прокрутка, которую докрутили к полю (`lift`) — её возвращаем в одно из двух состояний, когда клавиатура уходит.
    private static weak var lifted: UIScrollView?

    /// Вернуть докрученную к полю прокрутку в ближайшее из двух состояний `YeetDetailsScreen` (P-0030.90.1).
    static func snapLifted(collapsed: CGFloat) {
        guard let scroll = lifted else { return }
        lifted = nil
        let y = scroll.contentOffset.y + scroll.adjustedContentInset.top
        let target = YeetDetailsScreen<EmptyView, EmptyView>.snapTarget(y, collapsed: collapsed)
        guard abs(target - y) > 0.5 else { return }
        scroll.setContentOffset(CGPoint(x: scroll.contentOffset.x, y: target - scroll.adjustedContentInset.top), animated: true)
    }

    static func current() -> UIView? {
        found = nil
        UIApplication.shared.sendAction(#selector(UIResponder.yeetRememberFirstResponder), to: nil, from: nil, for: nil)
        return found as? UIView
    }

    /// Насколько докрутить, чтобы низ поля встал на `limit` (координаты окна), при запасе прокрутки `room`.
    static func lift(fieldBottom: CGFloat, limit: CGFloat, room: CGFloat) -> CGFloat {
        guard fieldBottom > limit + 0.5 else { return 0 }
        return min(fieldBottom - limit, max(0, room))
    }

    /// Докрутить ближайшую прокрутку поля в фокусе так, чтобы его низ был не ниже `limit`. Возвращает сдвиг.
    @discardableResult
    static func lift(above limit: CGFloat) -> CGFloat {
        guard let field = current(), field.window != nil else { return 0 }
        var view = field.superview
        while let v = view, !(v is UIScrollView) { view = v.superview }
        guard let scroll = view as? UIScrollView else { return 0 }
        let bottom = field.convert(field.bounds, to: nil).maxY
        let maxOffset = scroll.contentSize.height + scroll.adjustedContentInset.bottom - scroll.bounds.height
        let delta = lift(fieldBottom: bottom, limit: limit, room: maxOffset - scroll.contentOffset.y)
        guard delta > 0 else { return 0 }
        lifted = scroll
        scroll.setContentOffset(CGPoint(x: scroll.contentOffset.x, y: scroll.contentOffset.y + delta), animated: true)
        return delta
    }
}

/// Два состояния панели после жеста (iOS 17+, `scrollTargetBehavior`); на iOS 16 — как было.
private struct DetailsSnap: ViewModifier {
    let collapsed: CGFloat
    var enabled = true

    func body(content: Content) -> some View {
        if enabled, #available(iOS 17, *) {
            content.scrollTargetBehavior(DetailsSnapBehavior(collapsed: collapsed))
        } else {
            content
        }
    }
}

/// P-0218: обрезка по верхнему краю области под шапкой; вниз открыто (панель заходит под безопасную зону). Выключена —
/// содержимое как было, без маски.
private struct DetailsTopClip: ViewModifier {
    let enabled: Bool

    func body(content: Content) -> some View {
        if enabled {
            content.mask(alignment: .top) { Rectangle().padding(.bottom, -10_000) }
        } else {
            content
        }
    }
}

/// P-0218: без сворачивания прокрутка только когда содержимое длиннее экрана (iOS 16.4+); иначе как было.
private struct DetailsBounce: ViewModifier {
    let basedOnSize: Bool

    func body(content: Content) -> some View {
        if basedOnSize, #available(iOS 16.4, *) {
            content.scrollBounceBehavior(.basedOnSize, axes: .vertical)
        } else {
            content
        }
    }
}

@available(iOS 17, *)
private struct DetailsSnapBehavior: ScrollTargetBehavior {
    let collapsed: CGFloat

    func updateTarget(_ target: inout ScrollTarget, context: TargetContext) {
        target.rect.origin.y = YeetDetailsScreen<EmptyView, EmptyView>.snapTarget(target.rect.minY, collapsed: collapsed)
    }
}

extension UIResponder {
    @MainActor @objc fileprivate func yeetRememberFirstResponder() { YeetFocusedField.found = self }
}

#if DEBUG
private struct DetailsScreenPreview: View {
    var body: some View {
        YeetDetailsScreen(
            title: "Белая рубашка",
            titleChip: "Вещь",
            bottom: AnyView(
                HStack(spacing: 7) {
                    YeetButton("Удалить", variant: .tertiary, fullWidth: true) {}
                    YeetButton("Сохранить", fullWidth: true) {}
                }
                .padding(YeetSpace.s20)
                .background(YeetColor.bgElevated)
            ),
            stamp: AnyView(YeetStamp(label: "Надеть") {}),
            media: {
                ZStack {
                    YeetComponent.cardBg
                    YeetItemArt(kind: .top, color: .white, size: 220)
                }
            },
            content: {
                YeetInputGroup {
                    YeetField(label: "Категория", value: "Верх", trailingIcon: .chevronUpDown, onClick: {})
                    YeetField(label: "Цвет", value: "Белый", colorDot: .white, trailingIcon: .chevronUpDown, onClick: {})
                    YeetField(label: "Сезон", value: "Лето", trailingIcon: .chevronUpDown, onClick: {})
                    YeetField(label: "Цена", value: "4 990 ₽")
                }
            }
        )
    }
}

/// С `pinned` (#26) и подзаголовком (#39): блок решения по фото между фото и панелью, два действия в шапке.
private struct DetailsScreenPinnedPreview: View {
    var body: some View {
        YeetDetailsScreen(
            title: "Белая рубашка",
            actions: [YeetHeaderAction(icon: .more, label: "Ещё"), YeetHeaderAction(icon: .edit, label: "Изменить")],
            subtitle: "Все сезоны",
            pinned: AnyView(
                VStack(alignment: .leading, spacing: YeetSpace.s12) {
                    Text("Новое фото готово").yeetText(YeetType.body)
                    HStack(spacing: YeetSpace.s8) {
                        YeetButton("Оставить прежнее", variant: .tertiary, fullWidth: true) {}
                        YeetButton("Подтвердить", fullWidth: true) {}
                    }
                }
                .padding(.horizontal, YeetSpace.screenGutter)
            ),
            media: {
                ZStack {
                    YeetComponent.cardBg
                    YeetItemArt(kind: .top, color: .white, size: 220)
                }
            },
            content: {
                YeetInputGroup {
                    YeetField(label: "Категория", value: "Верх", trailingIcon: .chevronUpDown, onClick: {})
                    YeetField(label: "Цвет", value: "Белый", colorDot: .white, trailingIcon: .chevronUpDown, onClick: {})
                    YeetField(label: "Сезон", value: "Лето", trailingIcon: .chevronUpDown, onClick: {})
                }
            }
        )
    }
}

#Preview("DetailsScreen · pinned · SE") { DetailsScreenPinnedPreview().frame(height: 667) }
#Preview("DetailsScreen · pinned · Dark") { DetailsScreenPinnedPreview().preferredColorScheme(.dark) }
#Preview("DetailsScreen · Light") { DetailsScreenPreview().preferredColorScheme(.light) }
#Preview("DetailsScreen · Dark") { DetailsScreenPreview().preferredColorScheme(.dark) }
#endif
