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

    /// - Parameters:
    ///   - fieldIcon: иконка внутри поля. Для поиска — `search`, для чата — нет.
    ///   - send: чат со стилистом: кнопка отправки 44 внутри поля (primary, когда есть текст), поле 52 на подложке с тенью.
    public init(
        placeholder: String,
        value: Binding<String>,
        fieldIcon: YeetIconName? = nil,
        leading: YeetBarAction? = nil,
        trailing: YeetBarAction? = nil,
        send: YeetSendAction? = nil,
        size: YeetInputBarSize = .m
    ) {
        self.placeholder = placeholder
        self._value = value
        self.fieldIcon = fieldIcon
        self.leading = leading
        self.trailing = trailing
        self.send = send
        self.size = size
    }

    private var isChat: Bool { send != nil }
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
        HStack(spacing: YeetSpace.s8) {
            if let fieldIcon {
                YeetIcon(name: fieldIcon).foregroundStyle(YeetColor.textSecondary)
            }
            TextField("", text: $value, prompt: Text(placeholder).foregroundColor(YeetColor.textSecondary))
                .yeetText(YeetType.body)
                .lineLimit(1)
                .foregroundStyle(YeetColor.textPrimary)
                .tint(YeetColor.accent)
                .submitLabel(isChat ? .send : .search)
                .onSubmit { send?.onClick?() }
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
        .frame(height: isChat || size == .l ? 52 : 48)
        .frame(maxWidth: .infinity)
        .background(Capsule().fill(isChat ? YeetColor.bgElevated : YeetComponent.inputBg))
        .yeetFloating(isChat)
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
