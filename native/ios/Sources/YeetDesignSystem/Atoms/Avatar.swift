import SwiftUI

/// Размер аватара (React: `AvatarProps.size`): L 96 (профиль), M 40 (аккаунты, настройки, чат), S 24.
public enum YeetAvatarSize: String, CaseIterable, Identifiable {
    case s = "S", m = "M", l = "L"

    public var id: String { rawValue }

    public var side: CGFloat {
        switch self {
        case .s: return 24
        case .m: return 40
        case .l: return 96
        }
    }

    /// Стиль буквы: L — H1, M — H3 (флоу), S — Caption.
    var letterStyle: YeetTextStyle {
        switch self {
        case .s: return YeetType.caption
        case .m: return YeetType.h3
        case .l: return YeetType.h1
        }
    }

    var iconSize: CGFloat { self == .s ? 14 : 24 }
}

/// Аватар (React: `Avatar`). Без фото — буква Roboto Slab на цвете аккаунта или иконка камеры.
///
/// `src` — готовое изображение (в React — URL): загрузку и кеш делает приложение.
public struct YeetAvatar: View {
    private let size: YeetAvatarSize
    private let initial: String?
    private let src: Image?
    private let alt: String
    private let color: YeetItemColor?

    /// - Parameter color: фон буквы — у каждого аккаунта свой цвет вещи. По умолчанию — акцент.
    public init(size: YeetAvatarSize = .m, initial: String? = nil, src: Image? = nil, alt: String = "", color: YeetItemColor? = nil) {
        self.size = size
        self.initial = initial
        self.src = src
        self.alt = alt
        self.color = color
    }

    private var background: Color {
        if src != nil { return YeetColor.bgSubtle }
        if let color { return color.color }
        return initial != nil ? YeetColor.accent : YeetColor.bgSubtle
    }

    private var foreground: Color {
        if let color, color.isLight, src == nil { return YeetPrimitive.neutral1000 }
        return initial != nil && src == nil ? YeetColor.textOnAccent : YeetColor.textPrimary
    }

    private var accessibilityText: String { alt.isEmpty ? (initial ?? "") : alt }

    public var body: some View {
        ZStack {
            background
            if let src {
                src.resizable().scaledToFill()
            } else if let initial {
                Text(initial).font(size.letterStyle.fixedFont).tracking(size.letterStyle.tracking)
            } else {
                YeetIcon(name: .camera, size: size.iconSize)
            }
        }
        .foregroundStyle(foreground)
        .frame(width: size.side, height: size.side)
        .clipShape(Circle())
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(accessibilityText))
        .accessibilityAddTraits(.isImage)
        .accessibilityHidden(accessibilityText.isEmpty)
    }
}

#if DEBUG
#Preview("Avatar") {
    HStack(spacing: 12) {
        YeetAvatar(size: .l, initial: "Т", color: .orange)
        YeetAvatar(size: .m, initial: "С")
        YeetAvatar(size: .m, initial: "Б", color: .beige)
        YeetAvatar(size: .m)
        YeetAvatar(size: .s, initial: "А")
    }
    .padding(20)
    .background(YeetColor.bgCanvas)
}
#endif
