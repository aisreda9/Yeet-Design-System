import SwiftUI

/// Чей пузырь (React: `ChatBubbleProps.from`, Figma: chat-bubble · From).
public enum YeetChatBubbleFrom: String, CaseIterable, Identifiable {
    /// Стилист: `cardBg` слева, «хвост» 8 снизу слева.
    case stylist
    /// Пользователь: `accentSoft` справа, «хвост» 8 снизу справа, на 12 от края контента (32 от края экрана, #210).
    case user

    public var id: String { rawValue }
}

/// Аватар стилиста (React: `StylistAvatar`): иллюстрация 64 (по умолчанию) или 48, декоративный — VoiceOver его пропускает.
public struct YeetStylistAvatar: View {
    private let size: CGFloat

    public init(size: CGFloat = 64) {
        self.size = size
    }

    public var body: some View {
        Image("stylist-avatar", bundle: .module)
            .resizable()
            .interpolation(.high)
            .scaledToFit()
            .frame(width: size, height: size)
            .accessibilityHidden(true)
    }
}

/// Сообщение в чате со стилистом (React: `ChatBubble`, Figma `chat-bubble` `1036:5333`; флоу `1176:19708` / `19877` / `20046`).
///
/// Паддинг 16 / 20, ширина до 265, радиус 20 с «хвостом» 8, текст Body. Стилист — `cardBg` слева; пользователь —
/// `accentSoft` справа по ширине текста. `avatar` — аватар стилиста 64 слева, выровнен по низу пузыря, через 4.
/// `time` — подпись Caption серым под пузырём (у React её нет — паритет).
/// Выравнивание в ленте делает сам пузырь: он растягивается на ширину контейнера и прижимает себя влево / вправо.
public struct YeetChatBubble: View {
    /// Наибольшая ширина пузыря (Figma).
    public static let maxWidth: CGFloat = 265

    private let text: String
    private let from: YeetChatBubbleFrom
    private let avatar: Bool
    private let time: String?

    public init(_ text: String, from: YeetChatBubbleFrom = .stylist, avatar: Bool = false, time: String? = nil) {
        self.text = text
        self.from = from
        self.avatar = avatar
        self.time = time
    }

    private var own: Bool { from == .user }

    private var shape: YeetRoundedCorners {
        let r = YeetRadius.lg, tail = YeetSpace.s8
        return own
            ? YeetRoundedCorners(topLeading: r, topTrailing: r, bottomTrailing: tail, bottomLeading: r)
            : YeetRoundedCorners(topLeading: r, topTrailing: r, bottomTrailing: r, bottomLeading: tail)
    }

    public var body: some View {
        HStack(alignment: .bottom, spacing: YeetSpace.s4) {
            if own { Spacer(minLength: 0) }
            if avatar && !own {
                YeetStylistAvatar()
            }
            VStack(alignment: own ? .trailing : .leading, spacing: YeetSpace.s4) {
                Text(text)
                    .yeetText(YeetType.body)
                    .foregroundStyle(YeetColor.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.vertical, YeetSpace.s16)
                    .padding(.horizontal, YeetSpace.s20)
                    .background(own ? YeetColor.accentSoft : YeetComponent.cardBg, in: shape)
                    .frame(maxWidth: Self.maxWidth, alignment: own ? .trailing : .leading)
                if let time {
                    Text(time)
                        .yeetText(YeetType.caption)
                        .foregroundStyle(YeetColor.textSecondary)
                        .padding(.horizontal, YeetSpace.s4)
                }
            }
            .padding(.trailing, own ? YeetSpace.s12 : 0)
            if !own { Spacer(minLength: 0) }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(Text((own ? "Ты: " : "Стилист: ") + text))
    }
}

/// «Стилист печатает» — три точки в пузыре стилиста (паритет React — нет). Точки по очереди проявляются
/// (400 мс на шаг, `YeetMotion.swap`); при «Уменьшении движения» стоят. `avatar` — как у `YeetChatBubble`.
public struct YeetTypingIndicator: View {
    private let avatar: Bool
    @State private var phase = 0
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    public init(avatar: Bool = false) {
        self.avatar = avatar
    }

    public var body: some View {
        HStack(alignment: .bottom, spacing: YeetSpace.s4) {
            if avatar { YeetStylistAvatar() }
            HStack(spacing: YeetSpace.s4) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(YeetColor.textSecondary)
                        .frame(width: 6, height: 6)
                        .opacity(reduceMotion || phase == i ? 1 : 0.3)
                }
            }
            .frame(height: 20)
            .padding(.vertical, YeetSpace.s16)
            .padding(.horizontal, YeetSpace.s20)
            .background(YeetComponent.cardBg, in: YeetRoundedCorners(topLeading: YeetRadius.lg, topTrailing: YeetRadius.lg,
                                                                     bottomTrailing: YeetRadius.lg, bottomLeading: YeetSpace.s8))
            Spacer(minLength: 0)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text("Стилист печатает"))
        .task(id: reduceMotion) {
            guard !reduceMotion else { return }
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 400_000_000)
                withAnimation(YeetMotion.swap) { phase = (phase + 1) % 3 }
            }
        }
    }
}

#if DEBUG
private struct ChatBubblePreview: View {
    @State private var draft = ""

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: YeetSpace.s8) {
                    YeetChatBubble("Привет! Я твой ИИ-стилист. Спрашивай про образы, сочетания и что надеть сегодня", avatar: true)
                    YeetChatBubble("Что надеть на свидание?", from: .user, time: "21:23")
                    YeetChatBubble("Платье миди и лоферы — и тепло, и красиво.", time: "21:24")
                    YeetTypingIndicator(avatar: true)
                    HStack(alignment: .bottom, spacing: YeetSpace.s16) {
                        YeetStylistAvatar()
                        YeetStylistAvatar(size: 48)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding(YeetSpace.s20)
            }
            YeetInputBar(placeholder: "Спроси у стилиста", value: $draft, send: YeetSendAction(label: "Отправить") { draft = "" }, lines: 1...4)
                .padding(YeetSpace.s20)
        }
        .background(YeetColor.bgCanvas)
    }
}

#Preview("ChatBubble · Light") { ChatBubblePreview().preferredColorScheme(.light) }
#Preview("ChatBubble · Dark") { ChatBubblePreview().preferredColorScheme(.dark) }
#endif
