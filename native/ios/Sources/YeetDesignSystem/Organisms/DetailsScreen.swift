import SwiftUI

private struct YeetDetailsOffsetKey: PreferenceKey {
    static let defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = nextValue() }
}

/// Детали вещи и образа (React: `DetailsScreen` + `usePhotoCollapse`; Figma: Wardrobe / Item Details `349:9258 → 349:9976`,
/// Outfit Details `349:8637 → 349:10430`, Animations «new things» `354:17405 → 354:17449`).
///
/// В покое: фото во всю ширину минус поля в 20 под шапкой, под ним панель деталей (`YeetSheet(type: .panel)`).
/// После 24 pt скролла (обратно — при ≤ 8: гистерезис, чтобы шапка не дрожала на границе):
/// - панель поднимается поверх фото;
/// - фото сворачивается в миниатюру 48 по центру шапки (сдвиг + масштаб, `YeetMotion.collapse`), радиус миниатюры 16;
///   со своей миниатюрой (`thumb`) — фото гаснет, миниатюра встаёт в шапку вместо пилюли `titleChip`;
/// - низ (`bottom`) и штамп (`stamp`) остаются на месте.
/// При «Уменьшении движения» миниатюра появляется сразу. Фото опускается под панель, только когда долетело обратно.
public struct YeetDetailsScreen<Media: View, Content: View>: View {
    /// Порог сворачивания и возврата, pt.
    static var collapseAt: CGFloat { 24 }
    static var expandAt: CGFloat { 8 }

    private let title: String?
    private let titleChip: String?
    private let actions: [YeetHeaderAction]
    private let onBack: (() -> Void)?
    private let thumb: AnyView?
    private let bottom: AnyView?
    private let stamp: AnyView?
    private let media: Media
    private let content: Content

    @State private var collapsed = false
    @State private var mediaOnTop = false
    @State private var headerHeight: CGFloat = 0
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// - Parameters:
    ///   - title: заголовок панели (H2).
    ///   - titleChip: пилюля по центру шапки в покое («Новая вещь»); при сворачивании её место занимает миниатюра.
    ///   - actions: кнопки справа в шапке. По умолчанию — «Ещё».
    ///   - thumb: миниатюра 48 в шапке, когда фото свёрнуто. По умолчанию — само фото, уменьшенное до 48.
    ///   - bottom: закреплённый низ (`BottomBar`): панель уходит под него.
    ///   - stamp: штамп «Надеть» — поверх контента справа внизу, со скроллом не едет.
    ///   - media: фото вещи, коллаж образа — квадрат.
    public init(
        title: String? = nil,
        titleChip: String? = nil,
        actions: [YeetHeaderAction] = [YeetHeaderAction(icon: .more, label: "Ещё")],
        onBack: (() -> Void)? = nil,
        thumb: AnyView? = nil,
        bottom: AnyView? = nil,
        stamp: AnyView? = nil,
        @ViewBuilder media: () -> Media,
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.titleChip = titleChip
        self.actions = actions
        self.onBack = onBack
        self.thumb = thumb
        self.bottom = bottom
        self.stamp = stamp
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
                let side = max(proxy.size.width - 2 * gutter, 1)
                ZStack(alignment: .top) {
                    mediaLayer(side: side, width: proxy.size.width)
                        .zIndex(mediaOnTop ? 2 : 0)
                    scroll(side: side, viewport: proxy.size.height)
                        .zIndex(1)
                }
            }
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

    /// Фото вне скролла: в покое под панелью, свёрнутое — миниатюра 48 в центре ряда кнопок шапки (сверху 8, ряд 48).
    private func mediaLayer(side: CGFloat, width: CGFloat) -> some View {
        let k = 48 / side
        let dx = width / 2 - 24 - gutter
        let dy = -headerHeight + YeetSpace.s8 - YeetSpace.s20
        return media
            .frame(width: side, height: side)
            .clipShape(RoundedRectangle(cornerRadius: collapsed ? YeetRadius.md / k : YeetComponent.cardRadius, style: .continuous))
            .scaleEffect(collapsed ? k : 1, anchor: .topLeading)
            .offset(x: collapsed ? dx : 0, y: collapsed ? dy : 0)
            .opacity(collapsed && thumb != nil ? 0 : 1)
            .padding(.top, YeetSpace.s20)
            .frame(maxWidth: .infinity)
            .allowsHitTesting(!collapsed)
            .accessibilityHidden(collapsed)
    }

    private func scroll(side: CGFloat, viewport: CGFloat) -> some View {
        ScrollView {
            VStack(spacing: 0) {
                // место фото в потоке: схлопывается, и панель поднимается (остаток 25 = порог + 1)
                Color.clear
                    .frame(height: collapsed ? 25 : YeetSpace.s20 + side + YeetSpace.s20)
                    .allowsHitTesting(false)
                    .accessibilityHidden(true)
                // панель не короче экрана: свёрнутое состояние держится, даже если в ней мало полей
                YeetSheet(title: title, type: .panel) { content }
                    .frame(minHeight: viewport + 120, alignment: .top)
            }
            .background(GeometryReader { proxy in
                Color.clear.preference(key: YeetDetailsOffsetKey.self, value: -proxy.frame(in: .named("yeet-details")).minY)
            })
        }
        .coordinateSpace(name: "yeet-details")
        .onPreferenceChange(YeetDetailsOffsetKey.self, perform: update)
        .safeAreaInset(edge: .bottom, spacing: 0) {
            if let bottom { bottom }
        }
    }

    private func update(_ offset: CGFloat) {
        let next = collapsed ? offset > Self.expandAt : offset > Self.collapseAt
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

#Preview("DetailsScreen · Light") { DetailsScreenPreview().preferredColorScheme(.light) }
#Preview("DetailsScreen · Dark") { DetailsScreenPreview().preferredColorScheme(.dark) }
#endif
