import SwiftUI
import UIKit

/// Поле ввода внутри `YeetField` (React: `input` — атрибуты `<input>`).
public struct YeetFieldInput {
    public var text: Binding<String>
    public var isSecure: Bool
    public var keyboardType: UIKeyboardType
    public var textContentType: UITextContentType?

    public init(text: Binding<String>, isSecure: Bool = false, keyboardType: UIKeyboardType = .default, textContentType: UITextContentType? = nil) {
        self.text = text
        self.isSecure = isSecure
        self.keyboardType = keyboardType
        self.textContentType = textContentType
    }
}

/// Строка поля (React: `Field`; Figma: `input` + `input-value`). Живёт внутри `YeetInputGroup`.
/// Три паттерна: ввод текста, «ключ — значение» с выбором в sheet, пароль с глазом.
/// Пароль (`input.isSecure` без своего `onTrailingClick`) — глаз справа встроен: показывает и скрывает пароль,
/// VoiceOver слышит «Показать пароль» / «Скрыть пароль». Кнопка справа — зона 44 без изменения вида.
public struct YeetField: View {
    private let label: String
    private let value: String?
    private let colorDot: YeetItemColor?
    private let trailingIcon: YeetIconName?
    private let onTrailingClick: (() -> Void)?
    private let trailingLabel: String?
    private let input: YeetFieldInput?
    private let error: Bool
    private let onClick: (() -> Void)?
    @Environment(\.yeetInputGroupSize) private var groupSize
    @State private var revealed = false

    /// - Parameters:
    ///   - label: лейбл слева (серый); в режиме ввода — плейсхолдер и подпись для VoiceOver.
    ///   - value: выбранное значение справа (режим «ключ — значение»).
    ///   - colorDot: свотч цвета вещи перед значением.
    ///   - trailingIcon: `chevronUpDown` — выбор, `eye` — пароль, `externalLink` — ссылка.
    ///   - trailingLabel: имя кнопки справа для VoiceOver («Открыть сайт»). По умолчанию — по иконке.
    ///   - input: поле ввода вместо статичного лейбла.
    public init(
        label: String,
        value: String? = nil,
        colorDot: YeetItemColor? = nil,
        trailingIcon: YeetIconName? = nil,
        onTrailingClick: (() -> Void)? = nil,
        trailingLabel: String? = nil,
        input: YeetFieldInput? = nil,
        error: Bool = false,
        onClick: (() -> Void)? = nil
    ) {
        self.label = label
        self.value = value
        self.colorDot = colorDot
        self.trailingIcon = trailingIcon
        self.onTrailingClick = onTrailingClick
        self.trailingLabel = trailingLabel
        self.input = input
        self.error = error
        self.onClick = onClick
    }

    private var minHeight: CGFloat { groupSize?.fieldHeight ?? 56 }
    /// Встроенный глаз пароля.
    private var password: Bool { input?.isSecure == true && onTrailingClick == nil }
    private var contentColor: Color { error ? YeetColor.textDanger : YeetColor.textPrimary }

    public var body: some View {
        Group {
            if let onClick {
                Button(action: onClick) { row }
                    .buttonStyle(YeetRowStyle(highlight: true))
                    .accessibilityElement(children: .combine)
            } else {
                row
            }
        }
        .overlay(alignment: .top) {
            if groupSize != nil { YeetRowDivider() }
        }
        .onChange(of: error) { hasError in
            if hasError { YeetHaptic.error() }
        }
    }

    private var row: some View {
        HStack(spacing: YeetSpace.s12) {
            HStack(spacing: YeetSpace.s12) {
                if let input {
                    inputField(input)
                } else {
                    Text(label).foregroundStyle(YeetColor.textSecondary).layoutPriority(1)
                }
                if let value {
                    Spacer(minLength: 0)
                    HStack(spacing: YeetSpace.s12) {
                        if let colorDot { YeetColorDot(color: colorDot, size: 16) }
                        Text(value).foregroundStyle(contentColor)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            if password {
                Button { revealed.toggle() } label: {
                    YeetIcon(name: revealed ? .eyeOff : .eye, size: 20)
                }
                .buttonStyle(YeetPressStyle())
                .yeetHitArea(height: 20)
                .accessibilityLabel(Text(revealed ? "Скрыть пароль" : "Показать пароль"))
            } else if let trailingIcon {
                trailing(trailingIcon)
            }
        }
        .yeetText(YeetType.body)
        .padding(.horizontal, YeetSpace.s20)
        .padding(.vertical, YeetSpace.s12)
        .frame(minHeight: minHeight)
        .foregroundStyle(YeetColor.textPrimary)
        .contentShape(Rectangle())
    }

    @ViewBuilder
    private func inputField(_ input: YeetFieldInput) -> some View {
        let prompt = Text(label).foregroundColor(YeetColor.textSecondary)
        Group {
            if input.isSecure && !revealed {
                SecureField("", text: input.text, prompt: prompt)
            } else {
                TextField("", text: input.text, prompt: prompt)
            }
        }
        .keyboardType(input.keyboardType)
        .textContentType(input.textContentType)
        .foregroundStyle(contentColor)
        .tint(YeetColor.accent)
        .accessibilityLabel(Text(label))
    }

    @ViewBuilder
    private func trailing(_ icon: YeetIconName) -> some View {
        let glyph = YeetIcon(name: icon, size: icon == .chevronUpDown ? 20 : 24)
        if let onTrailingClick {
            Button(action: onTrailingClick) { glyph }
                .buttonStyle(YeetPressStyle())
                .yeetHitArea(height: 24)
                .accessibilityLabel(Text(trailingLabel ?? Self.trailingLabel(icon)))
        } else {
            glyph
        }
    }

    private static func trailingLabel(_ icon: YeetIconName) -> String {
        switch icon {
        case .eye: return "Показать пароль"
        case .eyeOff: return "Скрыть пароль"
        case .externalLink: return "Открыть"
        case .chevronUpDown: return "Выбрать"
        default: return icon.rawValue
        }
    }
}

/// Размер группы полей (React: `InputGroup.size`): высота строки M 48, L 52, XL 56.
public enum YeetInputGroupSize: String, CaseIterable, Identifiable {
    case m = "M", l = "L", xl = "XL"

    public var id: String { rawValue }

    var fieldHeight: CGFloat {
        switch self {
        case .m: return 48
        case .l: return 52
        case .xl: return 56
        }
    }
}

/// Группа полей на `inputBg`, радиус 20, строки разделены линией (React: `InputGroup`). Вход, детали вещи, настройки.
public struct YeetInputGroup<Content: View>: View {
    private let size: YeetInputGroupSize
    private let content: Content

    public init(size: YeetInputGroupSize = .xl, @ViewBuilder content: () -> Content) {
        self.size = size
        self.content = content()
    }

    public var body: some View {
        VStack(spacing: 0) { content }
            .environment(\.yeetInputGroupSize, size)
            .frame(maxWidth: .infinity)
            .background(YeetComponent.inputBg)
            // Разделитель рисует каждое поле сверху; у первого он закрыт полосой фона группы
            .overlay(alignment: .top) { YeetComponent.inputBg.frame(height: 1).accessibilityHidden(true) }
            .clipShape(RoundedRectangle(cornerRadius: YeetRadius.lg, style: .continuous))
    }
}

#if DEBUG
private struct FieldPreview: View {
    @State private var email = ""
    @State private var password = "secret"

    var body: some View {
        VStack(spacing: 24) {
            YeetInputGroup {
                YeetField(label: "Почта", input: YeetFieldInput(text: $email, keyboardType: .emailAddress, textContentType: .emailAddress))
                // глаз встроен: показывает и скрывает пароль
                YeetField(label: "Пароль", input: YeetFieldInput(text: $password, isSecure: true, textContentType: .password))
            }
            YeetInputGroup(size: .l) {
                YeetField(label: "Категория", value: "Верх", trailingIcon: .chevronUpDown, onClick: {})
                YeetField(label: "Цвет", value: "Красный", colorDot: .red, trailingIcon: .chevronUpDown, onClick: {})
                YeetField(label: "Страна", value: "Россия")
                YeetField(label: "Сайт магазина", trailingIcon: .externalLink, onTrailingClick: {}, trailingLabel: "Открыть сайт магазина")
            }
            YeetInputGroup {
                YeetField(label: "Почта", input: YeetFieldInput(text: .constant("wrong@")), error: true)
            }
        }
        .padding(20)
        .background(YeetColor.bgCanvas)
    }
}

#Preview("Field / InputGroup · Light") { FieldPreview().preferredColorScheme(.light) }
#Preview("Field / InputGroup · Dark") { FieldPreview().preferredColorScheme(.dark) }
#endif
