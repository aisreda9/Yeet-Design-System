import SwiftUI

/// Вариант бейджа (React: `BadgeProps.variant`).
public enum YeetBadgeVariant: String, CaseIterable, Identifiable {
    case primary, danger, secondary, muted, tertiary, ghost

    public var id: String { rawValue }

    var background: Color {
        switch self {
        case .primary: return YeetColor.accent
        case .danger: return YeetColor.danger
        case .secondary: return YeetColor.bgInverse
        case .muted: return YeetColor.textSecondary
        case .tertiary: return YeetColor.bgSubtle
        case .ghost: return .clear
        }
    }

    var foreground: Color {
        switch self {
        case .primary: return YeetColor.textOnAccent
        case .danger: return YeetColor.textOnDanger
        case .secondary: return YeetColor.textInverse
        case .muted: return YeetColor.bgCanvas
        case .tertiary, .ghost: return YeetColor.textPrimary
        }
    }
}

/// Бейдж высотой 24, радиус 12, Caption (React: `Badge`). Скидка на товаре — `danger`, счётчик — `secondary`.
public struct YeetBadge<Content: View>: View {
    private let variant: YeetBadgeVariant
    private let content: Content

    public init(variant: YeetBadgeVariant = .primary, @ViewBuilder content: () -> Content) {
        self.variant = variant
        self.content = content()
    }

    public var body: some View {
        content
            .yeetText(YeetType.caption)
            .lineLimit(1)
            .padding(.horizontal, YeetSpace.s8)
            .frame(minHeight: 24)
            .foregroundStyle(variant.foreground)
            .background(RoundedRectangle(cornerRadius: YeetRadius.sm, style: .continuous).fill(variant.background))
    }
}

public extension YeetBadge where Content == Text {
    init(_ text: String, variant: YeetBadgeVariant = .primary) {
        self.init(variant: variant) { Text(text) }
    }
}

#if DEBUG
#Preview("Badge") {
    VStack(alignment: .leading, spacing: 8) {
        ForEach(YeetBadgeVariant.allCases) { variant in
            YeetBadge(variant == .danger ? "-10%" : variant.rawValue, variant: variant)
        }
    }
    .padding(20)
    .background(YeetColor.bgCanvas)
}
#endif
