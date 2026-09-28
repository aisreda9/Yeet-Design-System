import SwiftUI

/// Данные чипса (React: тип `Chip`). Сам чипс — `YeetChipButton` на базе Button S.
public struct YeetChip: Identifiable, Hashable {
    public var label: String
    public var selected: Bool
    /// Тег с «×» справа.
    public var removable: Bool
    /// Свотч цвета вещи перед текстом.
    public var colorDot: YeetItemColor?
    /// Фильтр-дропдаун: `chevronUpDown` справа.
    public var dropdown: Bool

    public var id: String { label }

    public init(label: String, selected: Bool = false, removable: Bool = false, colorDot: YeetItemColor? = nil, dropdown: Bool = false) {
        self.label = label
        self.selected = selected
        self.removable = removable
        self.colorDot = colorDot
        self.dropdown = dropdown
    }
}

/// Чипс: Button S — не выбран `tertiary`, выбран `soft`. Боковой отступ 16; с иконкой справа 16 / 12 и иконка 20.
public struct YeetChipButton: View {
    private let chip: YeetChip
    private let action: () -> Void
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    public init(chip: YeetChip, action: @escaping () -> Void) {
        self.chip = chip
        self.action = action
    }

    private var style: YeetButtonStyle { chip.selected ? .soft : .tertiary }
    private var hasTrailing: Bool { chip.removable || chip.dropdown }

    public var body: some View {
        Button(action: action) {
            HStack(spacing: YeetSpace.s8) {
                if let dot = chip.colorDot {
                    YeetColorDot(color: dot)
                }
                Text(chip.label)
                    .yeetText(YeetType.body)
                    .lineLimit(1)
                if chip.removable {
                    YeetIcon(name: .cross, size: 20).foregroundStyle(YeetColor.textSecondary)
                } else if chip.dropdown {
                    YeetIcon(name: .chevronUpDown, size: 20)
                }
            }
            .padding(.leading, YeetSpace.s16)
            .padding(.trailing, hasTrailing ? YeetSpace.s12 : YeetSpace.s16)
            .frame(minHeight: YeetControlSize.s.height)
            .foregroundStyle(style.foreground)
            .background(Capsule().fill(style.background))
            .contentShape(Capsule())
            .animation(reduceMotion ? nil : YeetMotion.select, value: chip.selected)
        }
        .buttonStyle(YeetPressStyle())
        .yeetHitArea(height: YeetControlSize.s.height)
        .accessibilityAddTraits(chip.selected ? [.isSelected] : [])
        .accessibilityHint(chip.removable ? Text("Убрать") : Text(""))
    }
}

/// Группа чипсов (React: `ChipGroup`). `wrap` — перенос строк (теги, цвета), иначе горизонтальный скролл
/// с выходом за поля экрана (фильтры, поводы). Смена выбора — хаптика `select`.
public struct YeetChipGroup: View {
    private let chips: [YeetChip]
    private let onToggle: ((String) -> Void)?
    private let onAdd: (() -> Void)?
    private let wrap: Bool
    private let center: Bool

    /// - Parameters:
    ///   - onAdd: кнопка «+» (Primary 36) перед чипсами.
    ///   - center: подсказки по центру (Поиск в сторах), только с `wrap`.
    public init(chips: [YeetChip], onToggle: ((String) -> Void)? = nil, onAdd: (() -> Void)? = nil, wrap: Bool = false, center: Bool = false) {
        self.chips = chips
        self.onToggle = onToggle
        self.onAdd = onAdd
        self.wrap = wrap
        self.center = center
    }

    public var body: some View {
        if wrap {
            YeetFlowLayout(spacing: YeetSpace.s4, center: center) { items }
        } else {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: YeetSpace.s4) { items }
                    .padding(.horizontal, YeetSpace.screenGutter)
            }
            .padding(.horizontal, -YeetSpace.screenGutter)
        }
    }

    @ViewBuilder
    private var items: some View {
        if let onAdd {
            YeetIconButton(icon: .plus, label: "Добавить", variant: .primary, size: .s, action: onAdd)
                .sized(side: 36)
        }
        ForEach(chips) { chip in
            YeetChipButton(chip: chip) {
                YeetHaptic.select()
                onToggle?(chip.label)
            }
        }
    }
}

#if DEBUG
private struct ChipGroupPreview: View {
    @State private var chips = [
        YeetChip(label: "Весна", selected: true),
        YeetChip(label: "Лето"),
        YeetChip(label: "Осень"),
        YeetChip(label: "Зима"),
        YeetChip(label: "Красный", colorDot: .red),
        YeetChip(label: "Сортировка", dropdown: true),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            YeetChipGroup(chips: chips, onToggle: toggle)
            YeetChipGroup(chips: chips.map { YeetChip(label: $0.label, removable: true) }, onAdd: {}, wrap: true)
        }
        .padding(20)
        .background(YeetColor.bgCanvas)
    }

    private func toggle(_ label: String) {
        if let i = chips.firstIndex(where: { $0.label == label }) { chips[i].selected.toggle() }
    }
}

#Preview("ChipGroup") { ChipGroupPreview() }
#endif
