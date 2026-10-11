import SwiftUI

/// Кнопка по краю панели ввода (React: `BarAction`).
public struct YeetBarAction {
    public var icon: YeetIconName
    public var label: String
    public var variant: YeetButtonStyle?
    public var onClick: (() -> Void)?

    public init(icon: YeetIconName, label: String, variant: YeetButtonStyle? = nil, onClick: (() -> Void)? = nil) {
        self.icon = icon
        self.label = label
        self.variant = variant
        self.onClick = onClick
    }
}

/// Кнопка отправки в чате со стилистом (React: `InputBarProps.send`).
public struct YeetSendAction {
    public var label: String
    public var onClick: (() -> Void)?

    public init(label: String, onClick: (() -> Void)? = nil) {
        self.label = label
        self.onClick = onClick
    }
}

/// Высота поля (React: `InputBarProps.size`): M — 48 (в шапке), L — 52 (поле поиска на экране).
public enum YeetInputBarSize: String, CaseIterable, Identifiable {
    case m = "M", l = "L"

    public var id: String { rawValue }
}

/// Панель ввода: [кнопка] поле [кнопка] (React: `InputBar`). React `value` + `onChange` → `Binding`.
///
/// Контексты: поиск («Назад» + поле + поиск по фото), чат со стилистом (поле + «Отправить» внутри поля),
/// поиск по гардеробу. Пока в поле есть текст — очистка «×» 20 серым (кроме чата).
public struct YeetInputBar: View {
    private let placeholder: String
    @Binding private var value: String
    private let fieldIcon: YeetIconName?
    private let leading: YeetBarAction?
    private let trailing: YeetBarAction?
    private let send: YeetSendAction?
    private let size: YeetInputBarSize
    private let lines: ClosedRange<Int>
    @FocusState private var focused: Bool
    /// Клавиша «Найти» в поиске (`YeetHeader(.search(onSubmit:))`); у чата отправку делает `send`.
    private var submit: (() -> Void)?

    /// - Parameters:
    ///   - fieldIcon: иконка внутри поля. Для поиска — `search`, для чата — нет.
    ///   - send: чат со стилистом: кнопка отправки 44 внутри поля (primary, когда есть текст), поле 52 на подложке с тенью.
    ///     В фокусе — обводка 1.5 `textAccent` внутри поля (Figma: input-bar · Focus / Typing, React `:focus-within`).
    ///   - lines: сколько строк поле может занять: `1...1` — одна (по умолчанию, как раньше); `1...4` — чат растёт до
    ///     четырёх строк, дальше прокручивается. При нескольких строках «Ввод» переносит строку, отправка — кнопкой.
    public init(
        placeholder: String,
        value: Binding<String>,
        fieldIcon: YeetIconName? = nil,
        leading: YeetBarAction? = nil,
        trailing: YeetBarAction? = nil,
        send: YeetSendAction? = nil,
        size: YeetInputBarSize = .m,
        lines: ClosedRange<Int> = 1...1
    ) {
        self.placeholder = placeholder
        self._value = value
        self.fieldIcon = fieldIcon
        self.leading = leading
        self.trailing = trailing
        self.send = send
        self.size = size
        self.lines = lines
    }

    /// Колбэк клавиши «Найти» — для шапки поиска внутри пакета; публичного API поля не меняет.
    func submitting(_ action: (() -> Void)?) -> YeetInputBar {
        var copy = self
        copy.submit = action
        return copy
    }

    private var isChat: Bool { send != nil }
    private var multiline: Bool { lines.upperBound > 1 }
    private var height: CGFloat { isChat || size == .l ? 52 : 48 }
    private var buttonSize: YeetControlSize { size == .l ? .l : .m }

    public var body: some View {
        HStack(spacing: YeetSpace.s8) {
            if let leading {
                barButton(leading)
            }
            field
            if let trailing {
                barButton(trailing)
            }
        }
        .frame(maxWidth: .infinity)
    }

    private func barButton(_ action: YeetBarAction) -> some View {
        YeetIconButton(icon: action.icon, label: action.label, variant: action.variant ?? .tertiary, size: buttonSize) {
            action.onClick?()
        }
    }

    private var field: some View {
        HStack(alignment: multiline ? .bottom : .center, spacing: YeetSpace.s8) {
            if let fieldIcon {
                YeetIcon(name: fieldIcon).foregroundStyle(YeetColor.textSecondary)
            }
            textField
                .yeetText(YeetType.body)
                .focused($focused)
                // несколько строк: первая строка по центру кнопки 44, следующие растут вниз
                .padding(.vertical, multiline ? 12 : 0)
                .foregroundStyle(YeetColor.textPrimary)
                .tint(YeetColor.accent)
                // несколько строк: «Ввод» переносит строку — клавиша не обещает отправку
                .submitLabel(multiline ? .return : (isChat ? .send : .search))
                .onSubmit {
                    send?.onClick?()
                    submit?()
                }
                .accessibilityLabel(Text(placeholder))
            if !value.isEmpty && !isChat {
                Button { value = "" } label: {
                    YeetIcon(name: .cross, size: 20)
                        .foregroundStyle(YeetColor.textSecondary)
                        .frame(width: 44, height: 44)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .padding(-12)
                .accessibilityLabel(Text("Очистить"))
            }
            if let send {
                sendButton(send)
            }
        }
        .padding(.leading, isChat ? YeetSpace.s20 : (size == .l ? YeetSpace.s16 : YeetSpace.s20))
        .padding(.trailing, isChat ? YeetSpace.s4 : YeetSpace.s20)
        .padding(.vertical, multiline ? (height - 44) / 2 : 0) // строки растут вниз, кнопка 44 остаётся на 4 от низа
        .frame(minHeight: height)
        .frame(height: multiline ? nil : height)
        .frame(maxWidth: .infinity)
        .background(RoundedRectangle(cornerRadius: height / 2, style: .continuous).fill(isChat ? YeetColor.bgElevated : YeetComponent.inputBg))
        .overlay {
            if isChat && focused {
                RoundedRectangle(cornerRadius: height / 2, style: .continuous)
                    .strokeBorder(YeetColor.textAccent, lineWidth: 1.5)
            }
        }
        .yeetFloating(isChat)
        .contentShape(RoundedRectangle(cornerRadius: height / 2, style: .continuous))
        .onTapGesture { focused = true } // тап по полю мимо текста — тоже в поле
    }

    /// Одна строка — как раньше; несколько — растёт по вертикали до `lines.upperBound`.
    @ViewBuilder
    private var textField: some View {
        let prompt = Text(placeholder).foregroundColor(YeetColor.textSecondary)
        if multiline {
            TextField("", text: $value, prompt: prompt, axis: .vertical)
                .lineLimit(lines)
        } else {
            TextField("", text: $value, prompt: prompt)
                .lineLimit(1)
        }
    }

    private func sendButton(_ send: YeetSendAction) -> some View {
        let hasText = !value.isEmpty
        let style: YeetButtonStyle = hasText ? .primary : .tertiary
        return Button { send.onClick?() } label: {
            YeetIcon(name: .arrowUp, size: 20)
                .frame(width: 44, height: 44)
                .foregroundStyle(hasText ? style.foreground : YeetColor.textSecondary)
                .background(Circle().fill(style.background))
                .contentShape(Circle())
        }
        .buttonStyle(YeetPressStyle(dimsWhenDisabled: false))
        .disabled(!hasText)
        .accessibilityLabel(Text(send.label))
    }
}

#if DEBUG
private struct InputBarPreview: View {
    @State private var query = "Белая рубашка оверсайз"
    @State private var message = ""

    var body: some View {
        VStack(spacing: 24) {
            YeetInputBar(
                placeholder: "Уточните текстом",
                value: $query,
                fieldIcon: .search,
                leading: YeetBarAction(icon: .chevronLeft, label: "Назад"),
                trailing: YeetBarAction(icon: .imageAdd, label: "Поиск по фото")
            )
            YeetInputBar(placeholder: "Поиск по гардеробу", value: .constant(""), fieldIcon: .search, size: .l)
            YeetInputBar(placeholder: "Спроси у стилиста", value: $message, send: YeetSendAction(label: "Отправить"))
        }
        .padding(20)
        .background(YeetColor.bgCanvas)
    }
}

#Preview("InputBar") { InputBarPreview() }
#endif
