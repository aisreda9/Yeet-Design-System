import SwiftUI

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
    private let pinned: AnyView?
    private let subtitle: String?
    private let mediaMinFraction: CGFloat
    private let mediaMaxFraction: CGFloat
    private let minPanelPeek: CGFloat
    private let media: Media
    private let content: Content

    @State private var collapsed = false
    @State private var mediaOnTop = false
    @State private var headerHeight: CGFloat = 0
    @State private var pinnedHeight: CGFloat = 0
    @State private var bottomHeight: CGFloat = 0
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
    ///   - media: фото вещи, коллаж образа — квадрат.
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
        self.subtitle = subtitle
        self.pinned = pinned
        self.mediaMinFraction = mediaMinFraction
        self.mediaMaxFraction = mediaMaxFraction
        self.minPanelPeek = minPanelPeek
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
                let side = mediaSide(width: proxy.size.width, viewport: proxy.size.height)
                ZStack(alignment: .top) {
                    mediaLayer(side: side, width: proxy.size.width)
                        .zIndex(mediaOnTop ? 2 : 0)
                    scroll(side: side, viewport: proxy.size.height)
                        .zIndex(1)
                    if let pinned {
                        pinnedLayer(pinned, side: side)
                            .zIndex(3)
                    }
                }
            }
            // Без своей миниатюры (`thumb == nil`) в шапку встаёт само фото — слой с ним должен быть над шапкой
            // (у `YeetHeader` `zIndex(1)`): иначе свёрнутое фото уходило ПОД шапку и миниатюры не было видно.
            .zIndex(mediaOnTop && thumb == nil ? 2 : 0)
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
    private func mediaSide(width: CGFloat, viewport: CGFloat) -> CGFloat {
        let full = max(width - 2 * gutter, 1)
        guard pinned != nil else { return full }
        let available = viewport - YeetSpace.s20 - Self.pinnedGap - pinnedHeight - YeetSpace.s12 - minPanelPeek
        let fitted = min(max(available, viewport * mediaMinFraction), viewport * mediaMaxFraction)
        return max(min(full, fitted), 1)
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
            .offset(y: collapsed ? 0 : YeetSpace.s20 + side + Self.pinnedGap)
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
                    .frame(height: spacerHeight(side: side))
                    .allowsHitTesting(false)
                    .accessibilityHidden(true)
                // Панель не короче видимой области (над нижней кнопкой) + 8: свёрнутое состояние держится, даже
                // если в ней мало полей, а подложка панели тянется до низа — без пустоты под коротким содержимым.
                // Прежде `.frame(minHeight: viewport + 120)` стоял СНАРУЖИ панели: фон покрывал только содержимое
                // (пустота посреди экрана), а запас 120 уводил верх панели под шапку (Garderob P-0030.49).
                YeetSheet(title: title, description: subtitle, type: .panel) { content }
                    .environment(\.yeetPanelMinHeight, Self.panelMinHeight(viewport: viewport, bottom: bottomHeight))
            }
            // 🔴 Смещение — `onGeometryChange`, а не `PreferenceKey` из фона содержимого: на iOS 26 ключ из
            // фона внутри `ScrollView` при прокрутке НЕ обновлялся (одно значение 0 при появлении), и фото
            // никогда не сворачивалось в миниатюру шапки. `onGeometryChange` доступен с iOS 16 (back-deploy).
            .onGeometryChange(for: CGFloat.self) { proxy in
                -proxy.frame(in: .named("yeet-details")).minY
            } action: { offset in
                update(offset)
            }
        }
        .coordinateSpace(name: "yeet-details")
        .safeAreaInset(edge: .bottom, spacing: 0) {
            if let bottom {
                bottom.onGeometryChange(for: CGFloat.self) { $0.size.height } action: { bottomHeight = $0 }
            }
        }
    }

    /// Наименьшая высота панели: видимая область прокрутки (область под шапкой минус закреплённый низ) + 8. При
    /// докрутке до конца коротко заполненная панель встаёт верхом под шапку (на 8 под неё), подложка — до низа.
    static func panelMinHeight(viewport: CGFloat, bottom: CGFloat) -> CGFloat {
        max(0, viewport - bottom + 8)
    }

    /// Место фото в потоке. Без `pinned` — как было: 20 + сторона + 20, свёрнуто — 25 (порог + 1). С `pinned` —
    /// плюс блок и зазор под ним: панель начинается под блоком и в покое, и в свёрнутом состоянии.
    private func spacerHeight(side: CGFloat) -> CGFloat {
        let base = collapsed ? 25 : YeetSpace.s20 + side + YeetSpace.s20
        guard pinned != nil else { return base }
        return base + pinnedHeight + YeetSpace.s12
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
