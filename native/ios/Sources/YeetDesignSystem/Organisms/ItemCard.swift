import SwiftUI

/// Категория вещи (React: тип `Garment`); иконка категории — одноимённая иконка ui-icons.
/// `dress` — только iOS: в ui-icons и React его пока нет (#2), иллюстрация — временный силуэт `YeetDressSilhouette`.
public enum YeetGarment: String, CaseIterable, Identifiable {
    case top, bottom, outerwear, shoe, accessories, container, dress

    public var id: String { rawValue }

    /// Иконка ui-icons. У `dress` своей нет (#2) — ближайшая `top`; иллюстрация вещи рисует силуэт платья.
    public var icon: YeetIconName {
        switch self {
        case .top: return .top
        case .bottom: return .bottom
        case .outerwear: return .outerwear
        case .shoe: return .shoe
        case .accessories: return .accessories
        case .container: return .container
        case .dress: return .top
        }
    }

    public var title: String {
        switch self {
        case .top: return "Верх"
        case .bottom: return "Низ"
        case .outerwear: return "Верхняя одежда"
        case .shoe: return "Обувь"
        case .accessories: return "Аксессуары"
        case .container: return "Сумка"
        case .dress: return "Платье"
        }
    }
}

/// Временный силуэт платья в координатах viewBox 24×24, в манере ui-icons (`top`, `bottom`): бретели, лиф, талия,
/// расклешённая юбка. Заменить иконкой из Figma, когда дизайнер её нарисует (#2).
struct YeetDressSilhouette: Shape {
    func path(in rect: CGRect) -> Path {
        let s = min(rect.width, rect.height) / 24
        func pt(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: rect.minX + x * s, y: rect.minY + y * s) }
        var p = Path()
        p.move(to: pt(8.6, 2.15))
        p.addLine(to: pt(8.6, 5.2))
        p.addCurve(to: pt(8.0, 10.6), control1: pt(7.0, 6.8), control2: pt(7.0, 9.2))
        p.addLine(to: pt(4.2, 21.84))
        p.addLine(to: pt(19.8, 21.84))
        p.addLine(to: pt(16.0, 10.6))
        p.addCurve(to: pt(15.4, 5.2), control1: pt(17.0, 9.2), control2: pt(17.0, 6.8))
        p.addLine(to: pt(15.4, 2.15))
        p.move(to: pt(8.6, 5.2))
        p.addCurve(to: pt(15.4, 5.2), control1: pt(10.2, 7.6), control2: pt(13.8, 7.6))
        p.move(to: pt(8.0, 10.6))
        p.addLine(to: pt(16.0, 10.6))
        return p
    }
}

/// Вещь (React: `ItemArt`): фото без фона (`src`) или иллюстрация по категории со свотчем цвета.
/// Толщина линии иллюстрации — 1.3 pt при любом размере.
public struct YeetItemArt: View {
    private let kind: YeetGarment
    private let color: YeetItemColor?
    private let size: CGFloat
    private let src: Image?
    private let alt: String

    public init(kind: YeetGarment, color: YeetItemColor? = nil, size: CGFloat = 88, src: Image? = nil, alt: String = "") {
        self.kind = kind
        self.color = color
        self.size = size
        self.src = src
        self.alt = alt
    }

    public var body: some View {
        ZStack(alignment: .bottomTrailing) {
            if let src {
                src.resizable()
                    .scaledToFit()
                    .frame(width: size, height: size)
                    .accessibilityLabel(Text(alt))
                    .accessibilityHidden(alt.isEmpty)
            } else {
                let strokeWidth = max(0.35, 1.3 * 24 / max(size, 1))
                if kind == .dress {
                    YeetDressSilhouette()
                        .stroke(style: StrokeStyle(lineWidth: strokeWidth * size / 24, lineCap: .butt, lineJoin: .miter, miterLimit: 4))
                        .frame(width: size, height: size)
                        .accessibilityHidden(true)
                } else {
                    YeetIcon(name: kind.icon, size: size, strokeWidth: strokeWidth)
                }
                if let color {
                    YeetColorDot(color: color, size: max(10, size / 7))
                        .padding(YeetSpace.s4)
                }
            }
        }
        .frame(width: size, height: size)
    }
}

/// Карточка вещи 173 × 172 в сетке 2 колонки (React: `ItemCard`). Фото без фона на `cardBg`; карточка резиновая,
/// вещь масштабируется пропорционально ширине (88, фото 138 при 173).
///
/// Контексты: Гардероб (сетка), результаты поиска (`discount`), создание образа (`selected`), профиль (`label`).
///
/// Картинка — слот `media` (React: `children`): любая вью, например асинхронная загрузка приложения со своим кешем.
/// Карточка владеет рамкой 138 (при ширине 173), фоном, скруглением, бейджем, галочкой выбора и подписью VoiceOver;
/// содержимое слота для VoiceOver скрыто. Без картинки — `init(kind:color:image:…)` с `image: nil`: иллюстрация по `kind` и `color`.
public struct YeetItemCard<Media: View>: View {
    private let kind: YeetGarment
    private let color: YeetItemColor?
    private let media: Media?
    private let discount: String?
    private let label: String?
    private let name: String?
    private let selected: Bool?
    private let onClick: (() -> Void)?
    private let onRemove: (() -> Void)?
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// - Parameters:
    ///   - discount: скидка на товаре: «-10%» (Figma: Show Discount + Discount).
    ///   - label: метка-счётчик: «30 раз», «20 дней».
    ///   - name: название для VoiceOver: «Чёрная сумка». По умолчанию — категория.
    ///   - selected: режим выбора (создание образа); `nil` — без галочки.
    ///   - onRemove: убрать вещь из образа: «×» 20 серым в правом верхнем углу.
    ///   - media: картинка вещи — вписывается в квадрат 138 × 138 (при ширине карточки 173) по центру.
    public init(
        kind: YeetGarment,
        discount: String? = nil,
        label: String? = nil,
        name: String? = nil,
        selected: Bool? = nil,
        onClick: (() -> Void)? = nil,
        onRemove: (() -> Void)? = nil,
        @ViewBuilder media: () -> Media
    ) {
        self.init(kind: kind, color: nil, media: media(), discount: discount, label: label, name: name,
                  selected: selected, onClick: onClick, onRemove: onRemove)
    }

    private init(
        kind: YeetGarment,
        color: YeetItemColor?,
        media: Media?,
        discount: String?,
        label: String?,
        name: String?,
        selected: Bool?,
        onClick: (() -> Void)?,
        onRemove: (() -> Void)?
    ) {
        self.kind = kind
        self.color = color
        self.media = media
        self.discount = discount
        self.label = label
        self.name = name
        self.selected = selected
        self.onClick = onClick
        self.onRemove = onRemove
    }

    private var accessibilityText: String {
        [name ?? kind.title, discount.map { "скидка \($0)" }, label].compactMap { $0 }.joined(separator: ", ")
    }

    private var shape: RoundedRectangle {
        RoundedRectangle(cornerRadius: YeetComponent.cardRadius, style: .continuous)
    }

    public var body: some View {
        let card = Button {
            if selected != nil { YeetHaptic.toggle() }
            onClick?()
        } label: {
            GeometryReader { proxy in
                let k = proxy.size.width / 173
                Group {
                    if let media {
                        media
                            .frame(width: 138 * k, height: 138 * k)
                            .accessibilityHidden(true)
                    } else {
                        YeetItemArt(kind: kind, color: color, size: 88 * k)
                    }
                }
                .frame(width: proxy.size.width, height: proxy.size.height)
            }
            .aspectRatio(173.0 / 172.0, contentMode: .fit)
            .overlay(alignment: .topLeading) { badge.padding(YeetSpace.s16) }
            .overlay(alignment: .topTrailing) {
                if selected == true {
                    check
                        .padding(YeetSpace.s16)
                        .transition(.scale(scale: 0.4).combined(with: .opacity))
                }
            }
            .animation(reduceMotion ? nil : YeetMotion.drop, value: selected)
            .foregroundStyle(YeetColor.textPrimary)
            .background(shape.fill(YeetComponent.cardBg))
            .clipShape(shape)
            .contentShape(shape)
        }
        .buttonStyle(YeetPressStyle(scale: YeetGesture.pressScaleCard))
        .accessibilityLabel(Text(accessibilityText))
        .accessibilityAddTraits(selected == true ? [.isSelected] : [])

        if let onRemove {
            // «×» — отдельная кнопка поверх карточки, не внутри неё
            card.overlay(alignment: .topTrailing) {
                Button(action: onRemove) {
                    YeetIcon(name: .cross, size: 20)
                        .foregroundStyle(YeetColor.textSecondary)
                        .frame(width: 44, height: 44)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .padding(YeetSpace.s4)
                .accessibilityLabel(Text("Убрать: \(accessibilityText)"))
            }
        } else {
            card
        }
    }

    @ViewBuilder
    private var badge: some View {
        if let discount {
            YeetBadge(discount, variant: .danger)
        } else if let label {
            YeetBadge(label, variant: .secondary)
        }
    }

    private var check: some View {
        YeetIcon(name: .check, size: 16, strokeWidth: 2)
            .foregroundStyle(YeetColor.textOnAccent)
            .frame(width: 24, height: 24)
            .background(Circle().fill(YeetColor.accent))
            .accessibilityHidden(true)
    }
}

/// Готовое фото вещи без фона для слота `media`: вписывается в слот целиком (`resizable` + `scaledToFit`).
public struct YeetItemImage: View {
    private let image: Image

    public init(_ image: Image) {
        self.image = image
    }

    public var body: some View {
        image.resizable().scaledToFit()
    }
}

public extension YeetItemCard where Media == YeetItemImage {
    /// Карточка с готовым `Image` (как `src` в React) или, при `image: nil`, с иллюстрацией по `kind` и `color`.
    /// Та же карточка, что и со слотом `media`: `image` кладётся в слот как `YeetItemImage`.
    init(
        kind: YeetGarment,
        color: YeetItemColor? = nil,
        image: Image? = nil,
        discount: String? = nil,
        label: String? = nil,
        name: String? = nil,
        selected: Bool? = nil,
        onClick: (() -> Void)? = nil,
        onRemove: (() -> Void)? = nil
    ) {
        self.init(kind: kind, color: color, media: image.map(YeetItemImage.init), discount: discount, label: label,
                  name: name, selected: selected, onClick: onClick, onRemove: onRemove)
    }
}

#if DEBUG
#Preview("ItemCard") {
    LazyVGrid(columns: [GridItem(.flexible(), spacing: 7), GridItem(.flexible())], spacing: 7) {
        YeetItemCard(kind: .top, color: .blue)
        YeetItemCard(kind: .shoe, discount: "-10%")
        YeetItemCard(kind: .container, color: .black, label: "30 раз", name: "Чёрная сумка")
        YeetItemCard(kind: .bottom, selected: true)
        YeetItemCard(kind: .outerwear, selected: false, onRemove: {})
        YeetItemCard(kind: .accessories, color: .beige)
        YeetItemCard(kind: .dress, color: .red)
    }
    .padding(20)
    .background(YeetColor.bgCanvas)
}

/// Слот `media`: асинхронная загрузка (здесь `AsyncImage` без адреса — всегда фаза-заглушка) рядом с карточкой без картинки.
private struct ItemCardMediaPreview: View {
    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible(), spacing: 7), GridItem(.flexible())], spacing: 7) {
            YeetItemCard(kind: .top, name: "Футболка", selected: true) {
                AsyncImage(url: nil) { phase in
                    if let image = phase.image {
                        YeetItemImage(image)
                    } else {
                        RoundedRectangle(cornerRadius: YeetRadius.sm, style: .continuous)
                            .fill(YeetColor.patternDot)
                    }
                }
            }
            YeetItemCard(kind: .top, color: .white, name: "Футболка", selected: false)
            YeetItemCard(kind: .dress, discount: "-10%") {
                AsyncImage(url: nil) { image in
                    YeetItemImage(image)
                } placeholder: {
                    ProgressView()
                }
            }
            YeetItemCard(kind: .dress, color: .black, label: "3 раза")
        }
        .padding(20)
        .background(YeetColor.bgCanvas)
    }
}

#Preview("ItemCard · media · Light") { ItemCardMediaPreview().preferredColorScheme(.light) }
#Preview("ItemCard · media · Dark") { ItemCardMediaPreview().preferredColorScheme(.dark) }
#endif
