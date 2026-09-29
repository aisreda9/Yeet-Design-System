import SwiftUI

/// Тон штампа (React: `StampProps.tone`, Figma: stamp · Tone). Размер задаётся тоном.
public enum YeetStampTone: String, CaseIterable, Identifiable {
    /// Главное действие: синий 148 с текстом.
    case primary
    /// Вспомогательное: чёрный 64 с белой иконкой 29, наклонённой как подпись («Не нравится»).
    case secondary

    public var id: String { rawValue }

    var side: CGFloat { self == .secondary ? 64 : 148 }
    var background: Color { self == .secondary ? YeetComponent.buttonSecondaryBg : YeetComponent.buttonPrimaryBg }
    var foreground: Color { self == .secondary ? YeetComponent.buttonSecondaryFg : YeetComponent.buttonPrimaryFg }
}

/// До какого размера сжимается выполненный штамп (React: `StampProps.doneSize`). Габарит кнопки (148) не меняется.
public enum YeetStampDoneSize: String, CaseIterable, Identifiable {
    /// 78 — главная (Outfits / Everyday `252:286`), «отменить» 24.
    case m = "M"
    /// 56 — детали образа (Outfit Details / Variant 02 `440:3008`): плавающая кнопка в углу поверх панели, «отменить» 20.
    case s = "S"

    public var id: String { rawValue }

    var scale: CGFloat { self == .s ? 0.378 : 0.53 }
    var undoIcon: CGFloat { self == .s ? 20 : 24 }
}

private struct YeetStampTurnKey: EnvironmentKey {
    static let defaultValue: Angle = .zero
}

extension EnvironmentValues {
    /// Дополнительный поворот звезды штампа (без подписи): `YeetOutfitPager` задаёт 180° × индекс образа.
    var yeetStampTurn: Angle {
        get { self[YeetStampTurnKey.self] }
        set { self[YeetStampTurnKey.self] = newValue }
    }
}

/// Скруглённая 12-лучевая звезда штампа (`shapes / main-action`).
public struct YeetStarShape: Shape {
    public init() {}

    public func path(in rect: CGRect) -> Path {
        YeetViewBoxShape(path: YeetBrandPath.stampStar, viewBox: YeetBrandPath.stampStarViewBox).path(in: rect)
    }
}

/// Штамп — фирменная кнопка главного действия поверх коллажа, одна на экран (React: `Stamp`).
/// Нажатие анимируется пружиной `YeetMotion.stamp` (bouncy); `done` — штамп сжимается до 78 (или 56, `doneSize: .s`), поворачивается на −60°,
/// чернеет и показывает «отменить». Хаптика: `stamp` в пик пружины (~120 мс), у `secondary` — `skip` на нажатии.
public struct YeetStamp: View {
    private let label: String
    private let tone: YeetStampTone
    private let icon: YeetIconName
    private let done: Bool
    private let doneSize: YeetStampDoneSize
    private let action: () -> Void
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.yeetStampTurn) private var turn

    /// - Parameters:
    ///   - label: текст действия: «Надеть», «Сохранить». У `secondary` не показывается (только иконка), но озвучивается.
    ///   - icon: иконка малого штампа (`secondary`).
    ///   - done: действие выполнено.
    ///   - doneSize: до какого размера сжимается выполненный штамп: `.m` 78, `.s` 56.
    public init(
        label: String,
        tone: YeetStampTone = .primary,
        icon: YeetIconName = .thumbDown,
        done: Bool = false,
        doneSize: YeetStampDoneSize = .m,
        action: @escaping () -> Void
    ) {
        self.label = label
        self.tone = tone
        self.icon = icon
        self.done = done
        self.doneSize = doneSize
        self.action = action
    }

    public var body: some View {
        Button {
            if tone == .secondary { YeetHaptic.skip() }
            action()
        } label: {
            ZStack {
                YeetStarShape()
                    .fill(done ? YeetComponent.buttonSecondaryBg : tone.background)
                    .scaleEffect(done ? doneSize.scale : 1)
                    .rotationEffect(.degrees(done ? -60 : 0))
                    // в пейджере образов звезда поворачивается на 180° с каждой сменой образа (Animations «scale»)
                    .rotationEffect(turn)
                    .animation(reduceMotion ? nil : YeetMotion.swap, value: turn)
                Group {
                    if tone == .secondary {
                        YeetIcon(name: icon, size: 29)
                    } else {
                        Text(label).yeetText(YeetType.body).lineLimit(1)
                    }
                }
                .foregroundStyle(tone.foreground)
                // Figma: подпись наклонена на 15° по часовой
                .rotationEffect(.degrees(15))
                .opacity(done ? 0 : 1)
                .scaleEffect(done ? 0.6 : 1)
                YeetIcon(name: .undo, size: doneSize.undoIcon)
                    .foregroundStyle(YeetComponent.buttonSecondaryFg)
                    .opacity(done ? 1 : 0)
                    .scaleEffect(done ? 1 : 0.6)
            }
            .frame(width: tone.side, height: tone.side)
            .contentShape(Circle())
        }
        .buttonStyle(YeetPressStyle(scale: YeetGesture.pressScaleStamp))
        .yeetHitArea(height: tone.side)
        .animation(reduceMotion ? nil : YeetMotion.stamp, value: done)
        .accessibilityLabel(Text(done ? "Отменить: \(label)" : label))
        .accessibilityAddTraits(done ? [.isSelected] : [])
        .onChange(of: done) { isDone in
            guard isDone else { return }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.12) { YeetHaptic.stamp() }
        }
    }
}

#if DEBUG
private struct StampPreview: View {
    @State private var done = false

    var body: some View {
        HStack(spacing: 24) {
            YeetStamp(label: "Надеть", done: done) { done.toggle() }
            YeetStamp(label: "Сохранить", done: done, doneSize: .s) { done.toggle() }
            YeetStamp(label: "Не нравится", tone: .secondary) {}
        }
        .padding(20)
        .background(YeetColor.bgCanvas)
    }
}

#Preview("Stamp · Light") { StampPreview().preferredColorScheme(.light) }
#Preview("Stamp · Dark") { StampPreview().preferredColorScheme(.dark) }
#endif
