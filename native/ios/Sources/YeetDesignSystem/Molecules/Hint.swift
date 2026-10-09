import SwiftUI

/// Окраска подсказки относительно фона (React: `tone`).
public enum YeetHintTone: String, CaseIterable, Identifiable {
    /// Пилюля `bgElevated` с тенью, иконка 16, зазор 6, поля 4 / 12 / 4 / 8.
    case `default`
    /// Поверх фото: без подложки, иконка 24, зазор 8, текст и иконка `textOnPhoto` (Figma: hint · On Photo `1183:20594`).
    case onPhoto

    public var id: String { rawValue }
}

/// Подсказка поверх холста или фото, Body (React: `Hint`): иконка и текст. Для VoiceOver — один элемент с текстом подсказки.
/// Появление (в вебе — сдвиг 8 и прозрачность) задаёт экран переходом, как и у других слоёв.
public struct YeetHint: View {
    private let text: String
    private let icon: YeetIconName
    private let tone: YeetHintTone

    public init(_ text: String, icon: YeetIconName = .fingersPinch, tone: YeetHintTone = .default) {
        self.text = text
        self.icon = icon
        self.tone = tone
    }

    public var body: some View {
        let onPhoto = tone == .onPhoto
        HStack(spacing: onPhoto ? YeetSpace.s8 : 6) {
            YeetIcon(name: icon, size: onPhoto ? 24 : 16)
                .accessibilityHidden(true)
            Text(text)
                .yeetText(YeetType.body)
        }
        .foregroundStyle(onPhoto ? YeetColor.textOnPhoto : YeetColor.textPrimary)
        .padding(.top, onPhoto ? 0 : YeetSpace.s4)
        .padding(.bottom, onPhoto ? 0 : YeetSpace.s4)
        .padding(.leading, onPhoto ? 0 : YeetSpace.s8)
        .padding(.trailing, onPhoto ? 0 : YeetSpace.s12)
        .background {
            if !onPhoto {
                Capsule().fill(YeetColor.bgElevated).yeetFloatingShadow()
            }
        }
        .accessibilityElement(children: .combine)
    }
}

#if DEBUG
private struct HintPreview: View {
    var body: some View {
        VStack(spacing: 24) {
            YeetHint("Сведи пальцы, чтобы уменьшить")
            YeetHint("Нажми на вещь, чтобы заменить", icon: .arrowsShuffle)
            YeetHint("Обведи вещь пальцем", tone: .onPhoto)
                .padding(20)
                .background(Color.gray)
        }
        .padding(20)
        .background(YeetColor.bgCanvas)
    }
}

#Preview("Hint · Light") { HintPreview().preferredColorScheme(.light) }
#Preview("Hint · Dark") { HintPreview().preferredColorScheme(.dark) }
#endif
