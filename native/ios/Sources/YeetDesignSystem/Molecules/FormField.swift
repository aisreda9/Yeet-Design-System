import SwiftUI

/// Обёртка поля формы (React: `FormField`): подпись над полем, описание и текст ошибки под ним.
/// Сама не рисует поле: внутри — `YeetField` в `YeetInputGroup`, `YeetInputBar`, `TextEditor` и т. п.
///
/// Для VoiceOver подпись связана с полем (`accessibilityLabeledPair`), описание, ошибка и «обязательное» звучат подсказкой поля,
/// появившаяся ошибка объявляется сразу. Отступы: подпись → 8 → поле → 8 → описание / ошибка, тексты на 20 от края группы.
///
/// ```swift
/// YeetFormField(label: "Почта", description: "Пришлём код для входа", error: bad ? "Проверьте адрес" : nil) {
///     YeetInputGroup { YeetField(label: "Почта", input: YeetFieldInput(text: $email), error: bad) }
/// }
/// ```
/// Контексты: вход и регистрация (почта, пароль с ошибкой), профиль (имя), новая вещь (название, цена).
public struct YeetFormField<Content: View>: View {
    private let label: String
    private let hideLabel: Bool
    private let description: String?
    private let error: String?
    private let required: Bool
    private let content: Content
    @Namespace private var pair

    /// - Parameters:
    ///   - label: видимая подпись над полем (Caption серым). Она же имя поля для VoiceOver.
    ///   - hideLabel: подпись только для VoiceOver — когда плейсхолдер поля уже говорит, что вводить (вход, поиск).
    ///   - description: подсказка под полем: «Мы пришлём код на эту почту».
    ///   - error: текст ошибки (красным); `nil` или пустая строка — ошибки нет.
    ///   - required: обязательное поле — VoiceOver добавит «обязательное».
    public init(
        label: String,
        hideLabel: Bool = false,
        description: String? = nil,
        error: String? = nil,
        required: Bool = false,
        @ViewBuilder content: () -> Content
    ) {
        self.label = label
        self.hideLabel = hideLabel
        self.description = description
        self.error = error
        self.required = required
        self.content = content()
    }

    private var errorText: String? { error.flatMap { $0.isEmpty ? nil : $0 } }

    private var hint: String {
        [errorText, description, required ? "Обязательное поле" : nil].compactMap { $0 }.joined(separator: ". ")
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: YeetSpace.s8) {
            if !hideLabel {
                caption(label, color: YeetColor.textSecondary)
                    .accessibilityLabeledPair(role: .label, id: "control", in: pair)
            }
            content
                .accessibilityLabeledPair(role: .content, id: "control", in: pair)
                .accessibilityHint(Text(hint))
            if let description {
                caption(description, color: YeetColor.textSecondary)
                    .accessibilityHidden(true) // звучит подсказкой поля
            }
            if let errorText {
                caption(errorText, color: YeetColor.textDanger)
                    .accessibilityHidden(true)
                    .transition(.opacity)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .yeetAnimation(YeetMotion.fade, value: errorText)
        .onChange(of: errorText) { newError in
            // ошибка, появившаяся после отправки, озвучивается (React: aria-live="polite")
            if let newError { UIAccessibility.post(notification: .announcement, argument: newError) }
        }
    }

    private func caption(_ text: String, color: Color) -> some View {
        Text(text)
            .yeetText(YeetType.caption)
            .foregroundStyle(color)
            .fixedSize(horizontal: false, vertical: true)
            .padding(.horizontal, YeetSpace.s20)
    }
}

#if DEBUG
private struct FormFieldPreview: View {
    @State private var email = "anna@"
    @State private var name = ""
    @State private var submitted = false

    var body: some View {
        VStack(spacing: 24) {
            YeetFormField(label: "Почта", description: "Пришлём код для входа", error: submitted && !email.contains(".") ? "Проверьте адрес" : nil, required: true) {
                YeetInputGroup {
                    YeetField(label: "Почта", input: YeetFieldInput(text: $email, keyboardType: .emailAddress), error: submitted && !email.contains("."))
                }
            }
            YeetFormField(label: "Имя", hideLabel: true) {
                YeetInputGroup { YeetField(label: "Имя", input: YeetFieldInput(text: $name)) }
            }
            YeetButton("Отправить", fullWidth: true) { submitted = true }
        }
        .padding(20)
        .background(YeetColor.bgCanvas)
    }
}

#Preview("FormField · Light") { FormFieldPreview().preferredColorScheme(.light) }
#Preview("FormField · Dark") { FormFieldPreview().preferredColorScheme(.dark) }
#endif
