import SwiftUI

/// Линейная иконка 24×24 из набора ui-icons (React: `Icon`). Цвет наследуется из `foregroundStyle`.
/// `strokeWidth` — в единицах viewBox 24, как в SVG: при `size` 48 и 1.3 толщина линии 2.6 pt.
public struct YeetIcon: View {
    public let name: YeetIconName
    public var size: CGFloat
    /// Подпись для VoiceOver. Без неё иконка декоративная и скрыта от скринридера.
    public var title: String?
    public var strokeWidth: CGFloat

    public init(name: YeetIconName, size: CGFloat = 24, title: String? = nil, strokeWidth: CGFloat = 1.3) {
        self.name = name
        self.size = size
        self.title = title
        self.strokeWidth = strokeWidth
    }

    public var body: some View {
        let scale = size / 24
        ZStack {
            ForEach(Array(name.layers.enumerated()), id: \.offset) { _, layer in
                YeetIconLayerView(layer: layer, scale: scale, strokeWidth: strokeWidth)
            }
        }
        .frame(width: size, height: size)
        .yeetIconAccessibility(title)
    }
}

private struct YeetIconLayerShape: Shape {
    let path: Path

    func path(in rect: CGRect) -> Path {
        let s = min(rect.width, rect.height) / 24
        return path.applying(CGAffineTransform(a: s, b: 0, c: 0, d: s, tx: rect.minX, ty: rect.minY))
    }
}

private struct YeetIconLayerView: View {
    let layer: YeetIconLayer
    let scale: CGFloat
    let strokeWidth: CGFloat

    var body: some View {
        let shape = YeetIconLayerShape(path: layer.path)
        ZStack {
            if layer.fill {
                shape.fill()
            }
            if layer.stroke {
                shape.stroke(style: StrokeStyle(
                    lineWidth: strokeWidth * scale,
                    lineCap: layer.lineCap,
                    lineJoin: layer.lineJoin,
                    miterLimit: 4,
                    dash: layer.dash.map { $0 * scale }
                ))
            }
        }
    }
}

extension View {
    @ViewBuilder
    func yeetIconAccessibility(_ title: String?) -> some View {
        if let title {
            accessibilityElement(children: .ignore)
                .accessibilityLabel(Text(title))
                .accessibilityAddTraits(.isImage)
        } else {
            accessibilityHidden(true)
        }
    }
}

/// Словесный знак `yeet` (React: `Logo`). Цвет наследуется.
public struct YeetLogo: View {
    public var height: CGFloat

    public init(height: CGFloat = 32) {
        self.height = height
    }

    public var body: some View {
        YeetViewBoxShape(path: YeetBrandPath.logo, viewBox: YeetBrandPath.logoViewBox)
            .fill()
            .frame(width: height * YeetBrandPath.logoViewBox.width / YeetBrandPath.logoViewBox.height, height: height)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Text("yeet"))
            .accessibilityAddTraits(.isImage)
    }
}

/// Свотч цвета вещи (React: `ColorDot`). Только для атрибута «цвет вещи», не для интерфейса.
public struct YeetColorDot: View {
    public let color: YeetItemColor
    public var size: CGFloat

    public init(color: YeetItemColor, size: CGFloat = 12) {
        self.color = color
        self.size = size
    }

    public var body: some View {
        Circle()
            .fill(color.color)
            .overlay(Circle().strokeBorder(YeetColor.borderSubtle, lineWidth: 1))
            .frame(width: size, height: size)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Text(color.title))
    }
}

#if DEBUG
#Preview("Icon") {
    ScrollView {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 6), spacing: 16) {
            ForEach(YeetIconName.allCases) { name in
                VStack(spacing: 4) {
                    YeetIcon(name: name)
                    Text(name.rawValue).font(.system(size: 8)).lineLimit(1)
                }
            }
        }
        .padding()
        HStack(spacing: 16) {
            YeetIcon(name: .heart, size: 48)
            YeetLogo(height: 32)
            YeetColorDot(color: .red, size: 16)
            YeetColorDot(color: .white, size: 16)
        }
    }
    .foregroundStyle(YeetColor.textPrimary)
}
#endif
