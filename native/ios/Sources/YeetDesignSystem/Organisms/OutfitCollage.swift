import SwiftUI

/// Вещь на коллаже (React: тип `CollageItem`): `x`, `y` — центр в процентах площадки.
public struct YeetCollageItem {
    public var kind: YeetGarment
    public var x: CGFloat
    public var y: CGFloat
    /// Размер в координатах макета (`base` 353); по умолчанию — `defaultSize` слоя.
    public var size: CGFloat?
    public var color: YeetItemColor?
    /// Фото вещи без фона.
    public var src: Image?

    public init(kind: YeetGarment, x: CGFloat, y: CGFloat, size: CGFloat? = nil, color: YeetItemColor? = nil, src: Image? = nil) {
        self.kind = kind
        self.x = x
        self.y = y
        self.size = size
        self.color = color
        self.src = src
    }
}

/// Слой вещей коллажа (React: `CollageLayer`). `base` — ширина макета, в которой заданы размеры вещей:
/// слой растягивается по контейнеру и масштабирует вещи.
public struct YeetCollageLayer: View {
    private let items: [YeetCollageItem]
    private let defaultSize: CGFloat
    private let base: CGFloat

    public init(items: [YeetCollageItem], defaultSize: CGFloat = 96, base: CGFloat = 353) {
        self.items = items
        self.defaultSize = defaultSize
        self.base = base
    }

    public var body: some View {
        GeometryReader { proxy in
            let k = proxy.size.width / base
            ZStack(alignment: .topLeading) {
                ForEach(Array(items.enumerated()), id: \.offset) { _, item in
                    YeetItemArt(kind: item.kind, color: item.color, size: (item.size ?? defaultSize) * k, src: item.src)
                        .position(x: proxy.size.width * item.x / 100, y: proxy.size.height * item.y / 100)
                }
            }
            .frame(width: proxy.size.width, height: proxy.size.height)
        }
    }
}

/// Точечный фон коллажа и холста: точка 2 × 2 `patternDot` в клетке 10 × 10.
public struct YeetDotPattern: View {
    public init() {}

    public var body: some View {
        Canvas { context, size in
            var dots = Path()
            var y: CGFloat = 5
            while y < size.height {
                var x: CGFloat = 5
                while x < size.width {
                    dots.addEllipse(in: CGRect(x: x - 1, y: y - 1, width: 2, height: 2))
                    x += 10
                }
                y += 10
            }
            context.fill(dots, with: .color(YeetColor.patternDot))
        }
        .accessibilityHidden(true)
    }
}

/// Коллаж образа 353 × 353 (React: `OutfitCollage`): точечный фон с отступом 14, вещи разложены свободно (x, y в %).
/// `label` — повод бейджем Secondary в 20 от угла, `footer` — белая плашка снизу с отступом 8 (цена образа, переход).
public struct YeetOutfitCollage<Footer: View>: View {
    private let items: [YeetCollageItem]
    private let label: String?
    private let footer: Footer
    private let hasFooter: Bool

    public init(items: [YeetCollageItem], label: String? = nil, @ViewBuilder footer: () -> Footer) {
        self.items = items
        self.label = label
        self.footer = footer()
        self.hasFooter = true
    }

    private var shape: RoundedRectangle {
        RoundedRectangle(cornerRadius: YeetComponent.cardRadius, style: .continuous)
    }

    public var body: some View {
        ZStack {
            YeetComponent.cardBg
            YeetDotPattern().padding(14)
            YeetCollageLayer(items: items)
        }
        .aspectRatio(1, contentMode: .fit)
        .overlay(alignment: .topLeading) {
            if let label {
                YeetBadge(label, variant: .secondary).padding(YeetSpace.s20)
            }
        }
        .overlay(alignment: .bottom) {
            if hasFooter {
                HStack(spacing: YeetSpace.s12) { footer }
                    .padding(.horizontal, YeetSpace.s20)
                    .padding(.vertical, YeetSpace.s16)
                    .frame(maxWidth: .infinity)
                    .background(RoundedRectangle(cornerRadius: YeetRadius.md, style: .continuous).fill(YeetColor.bgElevated))
                    .padding(YeetSpace.s8)
            }
        }
        .clipShape(shape)
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text(label.map { "Образ: \($0)" } ?? "Образ"))
    }
}

public extension YeetOutfitCollage where Footer == EmptyView {
    init(items: [YeetCollageItem], label: String? = nil) {
        self.items = items
        self.label = label
        self.footer = EmptyView()
        self.hasFooter = false
    }
}

#if DEBUG
#Preview("OutfitCollage") {
    let items = [
        YeetCollageItem(kind: .outerwear, x: 30, y: 30, size: 130, color: .beige),
        YeetCollageItem(kind: .top, x: 68, y: 28, color: .white),
        YeetCollageItem(kind: .bottom, x: 50, y: 66, size: 120, color: .blue),
        YeetCollageItem(kind: .shoe, x: 78, y: 80, size: 72, color: .black),
        YeetCollageItem(kind: .container, x: 20, y: 78, size: 64, color: .brown),
    ]
    VStack(spacing: 16) {
        YeetOutfitCollage(items: items, label: "Прогулка")
        YeetOutfitCollage(items: items) {
            Text("Образ за 24 300 ₽").yeetText(YeetType.body)
            Spacer()
            YeetIcon(name: .chevronRight)
        }
    }
    .padding(20)
    .background(YeetColor.bgCanvas)
}
#endif
