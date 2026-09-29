import SwiftUI

/// Вариант одиночного выбора (React: `RadioOption`).
public struct YeetRadioOption: Identifiable, Hashable {
    public var value: String
    public var label: String
    /// Флаг, код валюты «₽ · RUB» справа — серым, в одну строку.
    public var trailing: String?

    public var id: String { value }

    public init(value: String, label: String, trailing: String? = nil) {
        self.value = value
        self.label = label
        self.trailing = trailing
    }
}

/// Одиночный выбор строками `YeetListItem(type: .radio)` в колонке `YeetList` через 20 (React: `RadioList`; Figma: list-item · Type=Radio).
/// Управляемый (`selection: $value`) или неуправляемый (`defaultValue`, выбор хранится в `@State`).
/// VoiceOver: группа `label`, выбранная строка — трейт `isSelected` и «выбрано»; смена выбора — хаптика `select`.
///
/// Контексты: год рождения, пол, страна (с флагом), валюта (с кодом справа).
public struct YeetRadioList: View {
    private let options: [YeetRadioOption]
    private let external: Binding<String?>?
    private let onChange: ((String) -> Void)?
    private let label: String?
    @State private var internalValue: String?

    /// Управляемый список. `label` — имя группы для VoiceOver: «Год рождения», «Страна».
    public init(options: [YeetRadioOption], selection: Binding<String?>, label: String? = nil) {
        self.options = options
        self.external = selection
        self.onChange = nil
        self.label = label
        self._internalValue = State(initialValue: selection.wrappedValue)
    }

    /// Неуправляемый список: начинает с `defaultValue`, дальше выбирает сам и сообщает в `onChange`.
    public init(options: [YeetRadioOption], defaultValue: String? = nil, onChange: ((String) -> Void)? = nil, label: String? = nil) {
        self.options = options
        self.external = nil
        self.onChange = onChange
        self.label = label
        self._internalValue = State(initialValue: defaultValue)
    }

    private var value: String? {
        if let external { return external.wrappedValue }
        return internalValue
    }

    public var body: some View {
        YeetList {
            ForEach(options) { option in
                YeetListItem(
                    type: .radio,
                    label: option.label,
                    checked: option.value == value,
                    trailing: option.trailing.map { text in
                        AnyView(
                            Text(text)
                                .yeetText(YeetType.body)
                                .foregroundStyle(YeetColor.textSecondary)
                                .lineLimit(1)
                                .fixedSize()
                        )
                    },
                    onClick: { select(option.value) }
                )
            }
        }
        .accessibilityElement(children: .contain)
        .modifier(YeetGroupLabel(label: label))
    }

    private func select(_ next: String) {
        guard next != value else { return }
        if let external { external.wrappedValue = next } else { internalValue = next }
        onChange?(next)
    }
}

#if DEBUG
private struct RadioListPreview: View {
    @State private var currency: String? = "rub"

    var body: some View {
        VStack(alignment: .leading, spacing: 32) {
            YeetRadioList(options: [
                YeetRadioOption(value: "rub", label: "Российский рубль", trailing: "₽ · RUB"),
                YeetRadioOption(value: "usd", label: "Доллар США", trailing: "$ · USD"),
                YeetRadioOption(value: "eur", label: "Евро", trailing: "€ · EUR"),
            ], selection: $currency, label: "Валюта")
            // неуправляемый: выбор хранится внутри
            YeetRadioList(options: [
                YeetRadioOption(value: "f", label: "Женский"),
                YeetRadioOption(value: "m", label: "Мужской"),
            ], defaultValue: "f", label: "Пол")
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(YeetColor.bgCanvas)
    }
}

#Preview("RadioList · Light") { RadioListPreview().preferredColorScheme(.light) }
#Preview("RadioList · Dark") { RadioListPreview().preferredColorScheme(.dark) }
#endif
