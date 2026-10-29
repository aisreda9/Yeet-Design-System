import SwiftUI

/// Иконка категории вещи (Garderob P-0030.81): та же линейная иконка ui-icons, что `YeetIcon(name: kind.icon)`, а у
/// `dress` — силуэт платья `YeetDressSilhouette` той же толщиной и того же цвета (`foregroundStyle` наследуется).
/// Один источник для иллюстрации вещи (`YeetItemArt`) и иконок категорий в приложении.
///
/// ⚠️ Временно до глифа `dress` в ui-icons (#2): когда дизайнер его нарисует, `.dress` переходит на `YeetIcon(.dress)`,
/// силуэт уходит. `YeetGarment.dress.icon` остаётся `top` — для мест, которым нужен именно `YeetIconName`.
public struct YeetGarmentIcon: View {
    public let kind: YeetGarment
    public let size: CGFloat
    /// В единицах viewBox 24, как у `YeetIcon`: при `size` 48 и 1.3 толщина линии 2.6 pt.
    public let strokeWidth: CGFloat

    public init(_ kind: YeetGarment, size: CGFloat = 24, strokeWidth: CGFloat = 1.3) {
        self.kind = kind
        self.size = size
        self.strokeWidth = strokeWidth
    }

    /// Рисуется ли силуэт платья, а не иконка ui-icons.
    static func рисуетСилуэт(_ kind: YeetGarment) -> Bool { kind == .dress }

    public var body: some View {
        if Self.рисуетСилуэт(kind) {
            YeetDressSilhouette()
                .stroke(style: StrokeStyle(lineWidth: strokeWidth * size / 24, lineCap: .butt, lineJoin: .miter, miterLimit: 4))
                .frame(width: size, height: size)
                .accessibilityHidden(true)
        } else {
            YeetIcon(name: kind.icon, size: size, strokeWidth: strokeWidth)
        }
    }
}

#if DEBUG
#Preview("GarmentIcon") {
    VStack(alignment: .leading, spacing: 16) {
        HStack(spacing: 12) {
            ForEach(YeetGarment.allCases) { YeetGarmentIcon($0) }
        }
        HStack(spacing: 8) {
            ForEach(YeetGarment.allCases) { kind in
                YeetGarmentIcon(kind)
                    .frame(width: 56, height: 56)
                    .background(Circle().fill(YeetComponent.cardBg))
            }
        }
    }
    .padding()
    .foregroundStyle(YeetColor.textPrimary)
}
#endif
