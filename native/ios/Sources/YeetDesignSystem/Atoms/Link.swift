import SwiftUI

/// Ссылка (React: `Link`): цвет и шрифт окружающего текста, подчёркивание 1 pt, зона нажатия ≥ 44 без изменения вида.
/// Открывает адрес через `openURL` окружения: http(s) — в Safari (или в обработчике приложения), `mailto:` и `tel:` — системой.
/// Не кнопка: действие без адреса — `YeetButton(variant: .ghost)`.
///
/// Контексты: юридическая подпись на входе («условиями» · «политикой конфиденциальности»), диалог удаления аккаунта, e-mail в Legal.
/// Ссылка **внутри абзаца** — `Text(yeetMarkdown: "Принимаю [условия](https://…)")` + `.tint(<цвет абзаца>)`:
/// SwiftUI переносит её вместе с текстом и сам даёт ей трейт ссылки для VoiceOver.
public struct YeetLink: View {
    private let title: String
    private let destination: URL
    @Environment(\.openURL) private var openURL

    public init(_ title: String, destination: URL) {
        self.title = title
        self.destination = destination
    }

    public var body: some View {
        Button {
            openURL(destination)
        } label: {
            Text(title).underline()
        }
        .buttonStyle(YeetLinkPressStyle())
        .yeetHitArea(height: 20)
        .accessibilityRemoveTraits(.isButton)
        .accessibilityAddTraits(.isLink)
    }
}

/// Нажатая ссылка слегка гаснет (как системные ссылки), не сжимается.
private struct YeetLinkPressStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.opacity(configuration.isPressed ? YeetOpacity.pressed : 1)
    }
}

public extension Text {
    /// Текст с Markdown-ссылками, подчёркнутыми как `YeetLink`. Цвет ссылок — `tint`: задайте цвет окружающего текста.
    init(yeetMarkdown markdown: String) {
        var string = (try? AttributedString(markdown: markdown)) ?? AttributedString(markdown)
        for run in string.runs where run.link != nil {
            string[run.range][AttributeScopes.SwiftUIAttributes.UnderlineStyleAttribute.self] = Text.LineStyle.single
        }
        self.init(string)
    }
}

#if DEBUG
private struct LinkPreview: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 4) {
                Text("Пишите на")
                YeetLink("hello@yeet.app", destination: URL(string: "mailto:hello@yeet.app")!)
            }
            .yeetText(YeetType.body)
            .foregroundStyle(YeetColor.textPrimary)
            Text(yeetMarkdown: "Продолжая, вы принимаете [условия](https://yeet.app/terms) и [политику конфиденциальности](https://yeet.app/privacy)")
                .yeetText(YeetType.caption)
                .foregroundStyle(YeetColor.textSecondary)
                .tint(YeetColor.textSecondary)
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(YeetColor.bgCanvas)
    }
}

#Preview("Link · Light") { LinkPreview().preferredColorScheme(.light) }
#Preview("Link · Dark") { LinkPreview().preferredColorScheme(.dark) }
#endif
