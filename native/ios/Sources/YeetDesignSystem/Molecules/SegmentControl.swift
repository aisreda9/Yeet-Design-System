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
/// которая переезжает между пунктами на пружине `YeetMotion.nav`.
/// Управляемый (`value: $binding`, React `value` + `onChange`) или неуправляемый (`defaultValue`, выбор хранится в `@State`).
/// Для VoiceOver — группа `label` из вкладок: выбранная с трейтом `isSelected`, «n из m» в подсказке.
///
/// Контексты: «Вещи / Образы / Вишлист» в Гардеробе, «Образы · 1 / Вещи» в поездке, режимы создания образа (иконки).
public struct YeetSegmentControl: View {
    private let segments: [YeetSegment]
    private let external: Binding<String>?
    private let onChange: ((String) -> Void)?
    private let size: YeetControlSize
    private let fit: Bool
    private let label: String?
    @State private var internalValue: String
    @Namespace private var pill
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// Управляемый переключатель.
    /// - Parameters:
    ///   - fit: по ширине содержимого (вложенный переключатель «Вещи / Образы» в Вишлисте).
    ///   - label: имя группы для VoiceOver («Раздел гардероба»).
    public init(segments: [YeetSegment], value: Binding<String>, size: YeetControlSize = .l, fit: Bool = false, label: String? = nil) {
        self.segments = segments
        self.external = value
        self.onChange = nil
        self.size = size
        self.fit = fit
        self.label = label
        self._internalValue = State(initialValue: value.wrappedValue)
    }

    /// Неуправляемый переключатель: начинает с `defaultValue` (по умолчанию первый сегмент), дальше переключается сам.
    public init(segments: [YeetSegment], defaultValue: String? = nil, onChange: ((String) -> Void)? = nil, size: YeetControlSize = .l, fit: Bool = false, label: String? = nil) {
        self.segments = segments
        self.external = nil
        self.onChange = onChange
        self.size = size
        self.fit = fit
        self.label = label
        self._internalValue = State(initialValue: defaultValue ?? segments.first?.value ?? "")
    }

    private var value: String { external?.wrappedValue ?? internalValue }

    private func select(_ next: String) {
        if let external { external.wrappedValue = next } else { internalValue = next }
        onChange?(next)
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
        .modifier(YeetGroupLabel(label: label))
    }

    private func item(_ segment: YeetSegment) -> some View {
        let active = segment.value == value
        let position = (segments.firstIndex(of: segment) ?? 0) + 1
        let iconOnly = segment.label == nil && segment.icon != nil
        return Button {
            guard !active else { return }
            YeetHaptic.select()
            yeetWithAnimation(YeetMotion.nav, reduceMotion: reduceMotion) { select(segment.value) }
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
        .yeetHitArea(height: size.height - 8, maxSideSlop: 2) // половина зазора 4: соседние сегменты не делят зону
        .accessibilityLabel(Text(segment.label ?? segment.value))
        .accessibilityAddTraits(active ? [.isSelected] : [])
        .accessibilityHint(Text("\(position) из \(segments.count)"))
    }
}

/// Имя группы для VoiceOver, если оно есть (React: `aria-label` у `radiogroup`).
struct YeetGroupLabel: ViewModifier {
    let label: String?

    @ViewBuilder
    func body(content: Content) -> some View {
        if let label {
            content.accessibilityLabel(Text(label))
        } else {
            content
        }
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
            // неуправляемый: выбор хранится внутри
            YeetSegmentControl(segments: [
                YeetSegment(value: "outfits", label: "Образы · 1"),
                YeetSegment(value: "items", label: "Вещи"),
            ], label: "Поездка")
        }
        .padding(20)
        .background(YeetColor.bgCanvas)
    }
}

#Preview("SegmentControl · Light") { SegmentControlPreview().preferredColorScheme(.light) }
#Preview("SegmentControl · Dark") { SegmentControlPreview().preferredColorScheme(.dark) }
#endif
