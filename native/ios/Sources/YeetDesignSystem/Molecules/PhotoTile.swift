import SwiftUI

/// Источник фото для `YeetPhotoTile` (React: `source`).
public enum YeetPhotoSource: String, CaseIterable, Identifiable {
    case gallery, camera

    public var id: String { rawValue }

    /// Подпись по умолчанию в две строки, как в Figma.
    /// Иконка заглушки: камера у `.camera`, `imageAdd` у `.gallery` (#23 — плитку камеры читали как галерею).
    var placeholderIcon: YeetIconName {
        switch self {
        case .camera: return .camera
        case .gallery: return .imageAdd
        }
    }

    var defaultLabel: String {
        switch self {
        case .camera: return "Сделать\nфото"
        case .gallery: return "Выбрать\nиз галереи"
        }
    }
}

/// Плитка выбора источника фото (React: `PhotoTile`, Figma photo-tile · Source Gallery / Camera `1173:16729`):
/// квадрат на `cardBg`, радиус 20, поля 20 / 20 / 12, по центру арт 63 и подпись Body в две строки через 22.
/// В ряду плитки делят ширину. Пока 3D-иллюстрации перерисовываются, вместо них — заглушка (решение владельца, #220):
/// подложка `bgSubtle`, иконка 24 `textSecondary` (`camera` у камеры, `image-add` у галереи; в React у обеих `image-add`),
/// радиус 4 (концентрично плитке). Иллюстраций в iOS-пакете нет, поэтому React-проп `illustration` не перенесён.
public struct YeetPhotoTile: View {
    private let source: YeetPhotoSource
    private let label: String?
    private let onClick: (() -> Void)?

    /// - Parameters:
    ///   - label: своя подпись; по умолчанию «Сделать фото» / «Выбрать из галереи» в две строки.
    public init(source: YeetPhotoSource, label: String? = nil, onClick: (() -> Void)? = nil) {
        self.source = source
        self.label = label
        self.onClick = onClick
    }

    private var shape: RoundedRectangle {
        RoundedRectangle(cornerRadius: YeetRadius.lg, style: .continuous)
    }

    public var body: some View {
        let text = label ?? source.defaultLabel
        Button {
            onClick?()
        } label: {
            VStack(spacing: 22) {
                YeetIcon(name: source.placeholderIcon, size: 24)
                    .foregroundStyle(YeetColor.textSecondary)
                    .frame(width: 63, height: 63)
                    .background(RoundedRectangle(cornerRadius: YeetRadius.xs, style: .continuous).fill(YeetColor.bgSubtle))
                    .accessibilityHidden(true)
                Text(text)
                    .yeetText(YeetType.body)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(YeetColor.textPrimary)
            }
            .padding(.top, YeetSpace.s20)
            .padding(.horizontal, YeetSpace.s20)
            .padding(.bottom, YeetSpace.s12)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .aspectRatio(1, contentMode: .fit)
            .background(shape.fill(YeetComponent.cardBg))
            .contentShape(shape)
        }
        .buttonStyle(YeetPressStyle(scale: YeetGesture.pressScaleCard))
        .accessibilityLabel(Text(text.replacingOccurrences(of: "\n", with: " ")))
    }
}

#if DEBUG
private struct PhotoTilePreview: View {
    var body: some View {
        HStack(spacing: 7) {
            YeetPhotoTile(source: .camera)
            YeetPhotoTile(source: .gallery)
        }
        .padding(20)
        .background(YeetColor.bgCanvas)
    }
}

#Preview("PhotoTile · Light") { PhotoTilePreview().preferredColorScheme(.light) }
#Preview("PhotoTile · Dark") { PhotoTilePreview().preferredColorScheme(.dark) }
#endif
