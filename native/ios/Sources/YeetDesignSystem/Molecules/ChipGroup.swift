import SwiftUI

/// Данные чипса (React: тип `Chip`). Сам чипс — `YeetChipButton` на базе Button S.
public struct YeetChip: Identifiable, Hashable {
    public var label: String
    /// Идентичность чипса для выбора, `onToggle` / `onRemove`; по умолчанию — `label`.
    public var value: String?
    public var selected: Bool
    /// Тег с «×» справа.
    public var removable: Bool
    /// Свотч цвета вещи перед текстом.
    public var colorDot: YeetItemColor?
    /// Фильтр-дропдаун: `chevronUpDown` справа.
    public var dropdown: Bool
    /// Chip · State=Editing: чипс превращается в поле ввода по ширине текста — свой повод или тип вещи
    /// (флоу Outfit Creation / Custom Occasion Name, «+ Своя»). `label` — введённый текст, `placeholder` — подсказка серым.
    /// В Figma вариант есть только с иконкой справа: `dropdown` — ⌄, `removable` — × (отменить ввод, `onRemove`); обе серые.
    /// Ввод и сохранение — `onEdit` / `onEditDone` группы.
    public var editing: Bool
    public var placeholder: String?

    public var id: String { value ?? label }

    public init(
        label: String,
        value: String? = nil,
        selected: Bool = false,
        removable: Bool = false,
        colorDot: YeetItemColor? = nil,
        dropdown: Bool = false,
        editing: Bool = false,
        placeholder: String? = nil
    ) {
        self.label = label
        self.value = value
        self.selected = selected
        self.removable = removable
        self.colorDot = colorDot
        self.dropdown = dropdown
        self.editing = editing
        self.placeholder = placeholder
    }
}

/// Чипс: Button S — не выбран `tertiary`, выбран `soft`. Боковой отступ 16; с иконкой справа 16 / 12 и иконка 20.
/// У тега (`removable`) крестик — отдельная кнопка «Удалить: …» с зоной 44 внутри той же капсулы.
public struct YeetChipButton: View {
    private let chip: YeetChip
    private let toggleable: Bool
    private let action: () -> Void
    private let onRemove: (() -> Void)?
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// - Parameters:
    ///   - toggleable: чипс — переключатель: VoiceOver слышит «выбрано» (трейт `isSelected`). Фильтр-дропдаун переключателем не бывает.
    ///   - onRemove: крестик тега; без него крестик вызывает `action`.
    public init(chip: YeetChip, toggleable: Bool = true, onRemove: (() -> Void)? = nil, action: @escaping () -> Void) {
        self.chip = chip
        self.toggleable = toggleable
        self.onRemove = onRemove
        self.action = action
    }

    private var style: YeetButtonStyle { chip.selected ? .soft : .tertiary }
    private var hasTrailing: Bool { chip.removable || chip.dropdown }
    private var pressed: Bool { toggleable && !chip.dropdown && chip.selected }

    public var body: some View {
        HStack(spacing: 0) {
            Button(action: action) {
                HStack(spacing: YeetSpace.s8) {
                    if let dot = chip.colorDot {
                        YeetColorDot(color: dot, size: 16)
                    }
                    Text(chip.label)
                        .yeetText(YeetType.body)
                        .lineLimit(1)
                    if chip.dropdown {
                        YeetIcon(name: .chevronUpDown, size: 20)
                    }
                }
                .padding(.leading, YeetSpace.s16)
                .padding(.trailing, chip.removable ? YeetSpace.s8 : (hasTrailing ? YeetSpace.s12 : YeetSpace.s16))
                .frame(minHeight: YeetControlSize.s.height)
                .contentShape(Rectangle())
            }
            .buttonStyle(YeetPressStyle())
            .accessibilityAddTraits(pressed ? [.isSelected] : [])
            if chip.removable {
                Button { (onRemove ?? action)() } label: {
                    YeetIcon(name: .cross, size: 20)
                        .foregroundStyle(YeetColor.textSecondary)
                        .padding(.trailing, YeetSpace.s12)
                        .frame(minHeight: YeetControlSize.s.height)
                        .contentShape(Rectangle())
                }
                .buttonStyle(YeetPressStyle())
                .yeetHitArea(width: 32, height: YeetControlSize.s.height)
                .accessibilityLabel(Text("Удалить: \(chip.label)"))
            }
        }
        .foregroundStyle(style.foreground)
        .background(Capsule().fill(style.background))
        .contentShape(Capsule())
        .animation(reduceMotion ? nil : YeetMotion.select, value: chip.selected)
        .yeetHitArea(height: YeetControlSize.s.height)
        .accessibilityElement(children: .contain)
    }
}

/// Группа чипсов (React: `ChipGroup`). `wrap` — перенос строк (теги, цвета), иначе горизонтальный скролл
/// с выходом за поля экрана (фильтры, поводы). Смена выбора — хаптика `select`.
///
/// **Выбор:** по-старому — `chips[].selected` + `onToggle` (состояние снаружи); либо `selection: $set` (управляемый)
/// или `defaultSelection` (неуправляемый: группа хранит выбор сама в `@State`), `multiple: false` — один выбранный.
public struct YeetChipGroup: View {
    private let chips: [YeetChip]
    private let externalSelection: Binding<Set<String>>?
    private let managed: Bool
    private let multiple: Bool
    private let onToggle: ((String) -> Void)?
    private let onRemove: ((String) -> Void)?
    private let onAdd: (() -> Void)?
    private let onEdit: ((String) -> Void)?
    private let onEditDone: ((String) -> Void)?
    private let wrap: Bool
    private let center: Bool
    @State private var internalSelection: Set<String>

    /// - Parameters:
    ///   - selection: выбранные чипсы по `id` (`value` или `label`), управляемый режим: `selected` у чипсов не читается.
    ///   - defaultSelection: начальный выбор неуправляемого режима — дальше группа переключает чипсы сама.
    ///   - multiple: `false` — одиночный выбор (повод, категория): новый чипс снимает прежний.
    ///   - onToggle: нажатие на чипс: приходит `id`.
    ///   - onRemove: крестик тега (`removable`): приходит `id`.
    ///   - onAdd: кнопка «+» (Primary 36) перед чипсами.
    ///   - onEdit: ввод в редактируемом чипсе (`editing`): приходит весь текст. Без него поле только для чтения.
    ///   - onEditDone: «Готово» на клавиатуре или уход фокуса из редактируемого чипса: сохранить введённое.
    ///   - center: подсказки по центру (Поиск в сторах), только с `wrap`.
    public init(
        chips: [YeetChip],
        selection: Binding<Set<String>>? = nil,
        defaultSelection: Set<String>? = nil,
        multiple: Bool = true,
        onToggle: ((String) -> Void)? = nil,
        onRemove: ((String) -> Void)? = nil,
        onAdd: (() -> Void)? = nil,
        onEdit: ((String) -> Void)? = nil,
        onEditDone: ((String) -> Void)? = nil,
        wrap: Bool = false,
        center: Bool = false
    ) {
        self.chips = chips
        self.externalSelection = selection
        self.managed = selection != nil || defaultSelection != nil
        self.multiple = multiple
        self.onToggle = onToggle
        self.onRemove = onRemove
        self.onAdd = onAdd
        self.onEdit = onEdit
        self.onEditDone = onEditDone
        self.wrap = wrap
        self.center = center
        self._internalSelection = State(initialValue: defaultSelection ?? [])
    }

    private var selection: Binding<Set<String>> { externalSelection ?? $internalSelection }

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
            if chip.editing {
                YeetChipEditField(
                    chip: chip,
                    onEdit: onEdit,
                    onEditDone: onEditDone,
                    onRemove: onRemove.map { remove in { remove(chip.id) } }
                )
            } else {
                YeetChipButton(
                    chip: resolved(chip),
                    toggleable: managed || onToggle != nil,
                    onRemove: onRemove.map { remove in { remove(chip.id) } }
                ) {
                    toggle(chip)
                }
            }
        }
    }

    private func resolved(_ chip: YeetChip) -> YeetChip {
        guard managed else { return chip }
        var copy = chip
        copy.selected = selection.wrappedValue.contains(chip.id)
        return copy
    }

    private func toggle(_ chip: YeetChip) {
        YeetHaptic.select()
        if managed && !chip.dropdown {
            var next = selection.wrappedValue
            if next.contains(chip.id) {
                next.remove(chip.id)
            } else if multiple {
                next.insert(chip.id)
            } else {
                next = [chip.id]
            }
            selection.wrappedValue = next
        }
        onToggle?(chip.id)
    }
}

/// Chip · State=Editing (React: `Chip.editing` в `ChipGroup`): поле по ширине текста в капсуле S `tertiary`,
/// плейсхолдер серым, каретка акцентом; при появлении получает фокус. Справа — серый ⌄ (`dropdown`) или × (`removable`).
/// Поля: слева 16; справа 16, с ⌄ — 12, с × — 8 до крестика (как у тега).
struct YeetChipEditField: View {
    let chip: YeetChip
    let onEdit: ((String) -> Void)?
    let onEditDone: ((String) -> Void)?
    let onRemove: (() -> Void)?
    @FocusState private var focused: Bool

    private var text: Binding<String> {
        Binding(get: { chip.label }, set: { onEdit?($0) })
    }

    private var name: String { chip.placeholder ?? "Название" }

    var body: some View {
        HStack(spacing: chip.dropdown && !chip.removable ? YeetSpace.s8 : 0) {
            TextField("", text: text, prompt: Text(chip.placeholder ?? "").foregroundColor(YeetColor.textSecondary))
                .yeetText(YeetType.body)
                .lineLimit(1)
                .fixedSize(horizontal: true, vertical: false)
                .foregroundStyle(YeetColor.textPrimary)
                .tint(YeetColor.accent)
                .submitLabel(.done)
                .focused($focused)
                .disabled(onEdit == nil)
                .onSubmit { onEditDone?(chip.label) }
                .accessibilityLabel(Text(name))
                .padding(.leading, YeetSpace.s16)
                .padding(.trailing, chip.removable ? YeetSpace.s8 : (chip.dropdown ? 0 : YeetSpace.s16))
            if chip.removable {
                Button { onRemove?() } label: {
                    YeetIcon(name: .cross, size: 20)
                        .padding(.trailing, YeetSpace.s12)
                        .frame(minHeight: YeetControlSize.s.height)
                        .contentShape(Rectangle())
                }
                .buttonStyle(YeetPressStyle())
                .yeetHitArea(width: 32, height: YeetControlSize.s.height)
                .accessibilityLabel(Text(chip.label.isEmpty ? "Удалить" : "Удалить: \(chip.label)"))
            } else if chip.dropdown {
                YeetIcon(name: .chevronUpDown, size: 20)
                    .padding(.trailing, YeetSpace.s12)
                    .accessibilityHidden(true)
            }
        }
        .foregroundStyle(YeetColor.textSecondary)
        .frame(minHeight: YeetControlSize.s.height)
        .background(Capsule().fill(YeetButtonStyle.tertiary.background))
        .contentShape(Capsule())
        .onTapGesture { focused = true }
        .yeetHitArea(height: YeetControlSize.s.height)
        .accessibilityElement(children: .contain)
        .onAppear { if onEdit != nil { focused = true } }
        .onChange(of: focused) { isFocused in
            if !isFocused { onEditDone?(chip.label) }
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

    @State private var custom = "Дача"

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            YeetChipGroup(chips: chips, onToggle: toggle)
            YeetChipGroup(chips: chips.map { YeetChip(label: $0.label, removable: true) }, onRemove: { label in chips.removeAll { $0.label == label } }, onAdd: {}, wrap: true)
            // неуправляемый одиночный выбор: группа хранит повод сама
            YeetChipGroup(chips: ["Работа", "Свидание", "Спорт", "Путешествие"].map { YeetChip(label: $0) }, defaultSelection: ["Работа"], multiple: false)
            // «+ Своя»: редактируемый чипс — пустой с плейсхолдером, с текстом и ×, с ⌄
            YeetChipGroup(
                chips: [
                    YeetChip(label: custom, value: "custom", removable: true, editing: true, placeholder: "Свой повод"),
                    YeetChip(label: "", value: "type", dropdown: true, editing: true, placeholder: "Тип вещи"),
                    YeetChip(label: "Работа"),
                ],
                onRemove: { _ in custom = "" },
                onEdit: { custom = $0 },
                onEditDone: { _ in },
                wrap: true
            )
        }
        .padding(20)
        .background(YeetColor.bgCanvas)
    }

    private func toggle(_ label: String) {
        if let i = chips.firstIndex(where: { $0.label == label }) { chips[i].selected.toggle() }
    }
}

#Preview("ChipGroup · Light") { ChipGroupPreview().preferredColorScheme(.light) }
#Preview("ChipGroup · Dark") { ChipGroupPreview().preferredColorScheme(.dark) }
#endif
