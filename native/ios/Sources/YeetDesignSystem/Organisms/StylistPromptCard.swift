import SwiftUI

/// Карточка функции стилиста (React: `StylistPromptCard`, флоу Stylist / Catalog `1173:18217`): H3 + описание Caption
/// серым сверху, паддинг 20, радиус 20, фон `cardBg`.
///
/// - `wide` — на всю ширину, высота 172; иначе половина ряда, высота 220. Сетку (2 колонки через 8) строит экран.
/// - `soon` — функция ещё недоступна: заголовок серым, бейдж «Скоро» (`muted`) в 20 от левого нижнего угла,
///   не нажимается, VoiceOver — «{title} — скоро».
/// - `art` — иллюстрация в правом нижнем углу, выходит за низ карточки на 40 и обрезается ею (чемодан у «Для поездок»).
///
/// **Контексты:** Стилист — Конструктор, Удиви меня, С чем носить, Для поездок, Оживи гардероб, Докупить, Оцени образ.
public struct YeetStylistPromptCard: View {
    private let title: String
    private let description: String?
    private let wide: Bool
    private let soon: Bool
    private let art: AnyView?
    private let onClick: (() -> Void)?

    /// - Parameters:
    ///   - description: Caption серым; `\n` — перенос строки, как в Figma («Максимум\nиз одной вещи»).
    public init(
        title: String,
        description: String? = nil,
        wide: Bool = false,
        soon: Bool = false,
        art: AnyView? = nil,
        onClick: (() -> Void)? = nil
    ) {
        self.title = title
        self.description = description
        self.wide = wide
        self.soon = soon
        self.art = art
        self.onClick = onClick
    }

    /// Высота карточки: широкая 172, половинная 220 (Figma).
    public static func height(wide: Bool) -> CGFloat { wide ? 172 : 220 }

    private var shape: RoundedRectangle { RoundedRectangle(cornerRadius: YeetRadius.lg, style: .continuous) }

    public var body: some View {
        Button { onClick?() } label: { card }
            .buttonStyle(YeetPressStyle(scale: YeetGesture.pressScaleCard, dimsWhenDisabled: false))
            .disabled(soon)
            .accessibilityLabel(Text(soon ? "\(title) — скоро" : title))
            .accessibilityHint(Text(soon ? "" : (description ?? "").replacingOccurrences(of: "\n", with: " ")))
    }

    private var card: some View {
        ZStack(alignment: .topLeading) {
            YeetComponent.cardBg
            if let art {
                art
                    .accessibilityHidden(true)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
                    .offset(y: 40)
            }
            VStack(alignment: .leading, spacing: YeetSpace.s8) {
                Text(title)
                    .yeetText(YeetType.h3)
                    .foregroundStyle(soon ? YeetColor.textSecondary : YeetColor.textPrimary)
                    .multilineTextAlignment(.leading)
                if let description {
                    Text(description)
                        .yeetText(YeetType.caption)
                        .foregroundStyle(YeetColor.textSecondary)
                        .multilineTextAlignment(.leading)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(YeetSpace.s20)
            .frame(maxWidth: .infinity, alignment: .leading)
            if soon {
                YeetBadge("Скоро", variant: .muted)
                    .padding(YeetSpace.s20)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: Self.height(wide: wide))
        .clipShape(shape)
        .contentShape(shape)
    }
}

#if DEBUG
private struct StylistPromptCardPreview: View {
    @State private var tapped = "—"

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: YeetSpace.s8) {
                Text("Нажато: \(tapped)").yeetText(YeetType.caption).foregroundStyle(YeetColor.textSecondary)
                YeetStylistPromptCard(title: "Конструктор", description: "Образы по разным критериям", wide: true) { tapped = "Конструктор" }
                HStack(spacing: YeetSpace.s8) {
                    YeetStylistPromptCard(title: "Удиви меня", description: "Рулетка образов, собранных из твоих вещей") { tapped = "Удиви меня" }
                    YeetStylistPromptCard(title: "С чем носить", description: "Максимум\nиз одной вещи") { tapped = "С чем носить" }
                }
                YeetStylistPromptCard(
                    title: "Для поездок", description: "Стиль и лёгкость\nв любой поездке", wide: true,
                    art: AnyView(YeetItemArt(kind: .container, color: .grey, size: 150))
                ) { tapped = "Для поездок" }
                HStack(spacing: YeetSpace.s8) {
                    YeetStylistPromptCard(title: "Оживи гардероб", description: "Новая жизнь старым вещам", soon: true)
                    YeetStylistPromptCard(title: "Докупить", description: "Подберём интересное из сторов", soon: true)
                }
                YeetStylistPromptCard(title: "Оцени образ", description: "Разбор образов\nи рекомендации", wide: true, soon: true)
            }
            .padding(YeetSpace.s20)
        }
        .background(YeetColor.bgCanvas)
    }
}

#Preview("StylistPromptCard · Light") { StylistPromptCardPreview().preferredColorScheme(.light) }
#Preview("StylistPromptCard · Dark") { StylistPromptCardPreview().preferredColorScheme(.dark) }
#endif
