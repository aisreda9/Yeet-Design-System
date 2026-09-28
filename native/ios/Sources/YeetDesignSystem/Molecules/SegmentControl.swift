import SwiftUI

/// Сегмент переключателя (React: тип `Segment`). Только `icon` без `label` — сегмент-иконка, `value` озвучивается.
public struct YeetSegment: Identifiable, Hashable {
    public var value: String
    public var label: String?
    public var icon: YeetIconName?

    public var id: String { value }

    public init(value: String, label: String? = nil, icon: YeetIconName? = nil) {
        self.value = value
        self.label = label
        self.icon = icon
    }
}

/// Переключатель вкладок (React: `SegmentControl`): под активным сегментом — пилюля `inverse`,
/// которая переезжает между пунктами на пружине `YeetMotion.nav`. React `value` + `onChange` → `Binding`.
///
/// Контексты: «Вещи / Образы / Вишлист» в Гардеробе, «Образы · 1 / Вещи» в поездке, режимы создания образа (иконки).
public struct YeetSegmentControl: View {
    private let segments: [YeetSegment]
    @Binding private var value: String
    private let size: YeetControlSize
    private let fit: Bool
    @Namespace private var pill
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// - Parameter fit: по ширине содержимого (вложенный переключатель «Вещи / Образы» в Вишлисте).
    public init(segments: [YeetSegment], value: Binding<String>, size: YeetControlSize = .l, fit: Bool = false) {
        self.segments = segments
        self._value = value
        self.size = size
        self.fit = fit
    }

    public var body: some View {
        HStack(spacing: YeetSpace.s4) {
            ForEach(segments) { segment in
                item(segment)
            }
        }
        .padding(YeetSpace.s4)
        .frame(height: size.height)
        .frame(maxWidth: fit ? nil : .infinity)
        .background(Capsule().fill(YeetColor.bgSubtle))
        .accessibilityElement(children: .contain)
    }

    private func item(_ segment: YeetSegment) -> some View {
        let active = segment.value == value
        let iconOnly = segment.label == nil && segment.icon != nil
        return Button {
            guard !active else { return }
            YeetHaptic.select()
            withAnimation(reduceMotion ? nil : YeetMotion.nav) { value = segment.value }
        } label: {
            HStack(spacing: size.gap) {
                if let icon = segment.icon {
                    YeetIcon(name: icon, size: iconOnly ? size.iconSize : 24)
                }
                if let label = segment.label {
                    Text(label).yeetText(YeetType.body).lineLimit(1)
                }
            }
            .padding(.horizontal, iconOnly ? 0 : size.padding)
            .frame(maxWidth: fit ? nil : .infinity, maxHeight: .infinity)
            .frame(minWidth: iconOnly ? size.height - 8 : nil)
            .foregroundStyle(iconOnly && !active ? YeetColor.textSecondary : YeetComponent.buttonGhostFg)
            .background {
                if active {
                    Capsule()
                        .fill(YeetComponent.buttonInverseBg)
                        .matchedGeometryEffect(id: "pill", in: pill)
                }
            }
            .contentShape(Capsule())
        }
        .buttonStyle(YeetPressStyle())
        .accessibilityLabel(Text(segment.label ?? segment.value))
        .accessibilityAddTraits(active ? [.isSelected] : [])
    }
}

#if DEBUG
private struct SegmentControlPreview: View {
    @State private var tab = "items"
    @State private var mode = "collage"

    var body: some View {
        VStack(spacing: 16) {
            YeetSegmentControl(segments: [
                YeetSegment(value: "items", label: "Вещи"),
                YeetSegment(value: "outfits", label: "Образы"),
                YeetSegment(value: "wishlist", label: "Вишлист"),
            ], value: $tab)
            YeetSegmentControl(segments: [
                YeetSegment(value: "collage", icon: .collage),
                YeetSegment(value: "shuffle", icon: .arrowsShuffle),
                YeetSegment(value: "ai", icon: .ai),
            ], value: $mode, size: .s, fit: true)
        }
        .padding(20)
        .background(YeetColor.bgCanvas)
    }
}

#Preview("SegmentControl") { SegmentControlPreview() }
#endif
