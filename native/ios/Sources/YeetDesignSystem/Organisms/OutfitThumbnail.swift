import SwiftUI

/// Миниатюра образа (React: `OutfitThumbnail`, Figma `outfit-thumbnail` `1348:16896`, стороны 96 / 138 / 150):
/// кнопка-квадрат на `cardBg` с точечным фоном, радиус 20, вещи — слоем коллажа (`defaultSize` = 0,4 стороны).
/// Вместо раскладки можно передать готовый снимок образа в слот `media` (React-аналога у слота нет, #3):
/// он вписывается в квадрат поверх точечного фона. Для VoiceOver — «Открыть образ», содержимое скрыто.
/// `background` — сплошная заливка вместо `cardBg` с точками (белый холст образа у приложения, #27; в React пропа нет).
/// Контурные заглушки вещей (`YeetItemArt`) рисуются цветом `textPrimary`: на белой заливке в тёмной теме они пропадают —
/// для светлого холста задайте миниатюре `.environment(\.colorScheme, .light)`.
public struct YeetOutfitThumbnail<Media: View>: View {
    private let items: [YeetCollageItem]
    private let media: Media?
    private let size: CGFloat
    private let background: Color?
    private let onClick: (() -> Void)?

    /// Снимок образа (PNG / JPEG приложения или его асинхронная загрузка) вместо раскладки вещей.
    /// - Parameter background: заливка под снимком вместо `cardBg` с точками; `nil` — точечный фон.
    public init(size: CGFloat = 138, background: Color? = nil, onClick: (() -> Void)? = nil, @ViewBuilder media: () -> Media) {
        self.items = []
        self.media = media()
        self.size = size
        self.background = background
        self.onClick = onClick
    }

    private var shape: RoundedRectangle {
        RoundedRectangle(cornerRadius: YeetRadius.lg, style: .continuous)
    }

    public var body: some View {
        Button {
            onClick?()
        } label: {
            ZStack {
                if let background {
                    background
                } else {
                    YeetComponent.cardBg
                    YeetDotPattern()
                }
                Group {
                    if let media {
                        media
                    } else {
                        YeetCollageLayer(items: items, defaultSize: size * 0.4, base: size)
                    }
                }
                .frame(width: size, height: size)
                .accessibilityHidden(true)
            }
            .frame(width: size, height: size)
            .clipShape(shape)
            .contentShape(shape)
        }
        .buttonStyle(YeetPressStyle(scale: YeetGesture.pressScaleCard))
        .accessibilityLabel(Text("Открыть образ"))
    }
}

public extension YeetOutfitThumbnail where Media == EmptyView {
    /// Раскладка вещей (React: `items`, `size`); `x`, `y` — центр в процентах, `size` вещи — в координатах стороны миниатюры.
    /// - Parameter background: заливка под коллажем вместо `cardBg` с точками; `nil` — точечный фон.
    init(items: [YeetCollageItem], size: CGFloat = 138, background: Color? = nil, onClick: (() -> Void)? = nil) {
        self.items = items
        self.media = nil
        self.size = size
        self.background = background
        self.onClick = onClick
    }
}

#if DEBUG
private struct OutfitThumbnailPreview: View {
    private let items = [
        YeetCollageItem(kind: .outerwear, x: 30, y: 32, color: .beige),
        YeetCollageItem(kind: .top, x: 70, y: 30, color: .white),
        YeetCollageItem(kind: .bottom, x: 50, y: 70, color: .blue),
    ]

    var body: some View {
        HStack(spacing: YeetSpace.s8) {
            YeetOutfitThumbnail(items: items, size: 96)
            YeetOutfitThumbnail(items: items)
            YeetOutfitThumbnail(items: items, size: 96, background: .white)
            YeetOutfitThumbnail {
                AsyncImage(url: nil) { image in
                    image.resizable().scaledToFit()
                } placeholder: {
                    YeetIcon(name: .collage, size: 32).foregroundStyle(YeetColor.textSecondary)
                }
            }
        }
        .padding(20)
        .background(YeetColor.bgCanvas)
    }
}

#Preview("OutfitThumbnail · Light") { OutfitThumbnailPreview().preferredColorScheme(.light) }
#Preview("OutfitThumbnail · Dark") { OutfitThumbnailPreview().preferredColorScheme(.dark) }
#endif
