// Общие примитивы пакета: нажатие, зона касания 44, «Уменьшение движения», формы с разными радиусами.
// Значения — только из сгенерированных токенов (Generated/YeetTokens.swift).

import CoreText
import SwiftUI

// MARK: - Типографика

public extension YeetTextStyle {
    /// Шрифт фиксированного размера (без Dynamic Type) — для букв внутри кругов фиксированного размера (аватар, вкладка «Профиль»).
    var fixedFont: Font { Font(uiFont() as CTFont) }
}

// MARK: - Цвет вещи

public extension YeetItemColor {
    /// Светлые цвета: буква на них тёмная, свотч обведён.
    var isLight: Bool { self == .white || self == .beige || self == .yellow }
}

// MARK: - Нажатие

/// Нажатие: сжатие `YeetGesture.pressScale` (кнопки, чипсы) или `pressScaleCard` (карточки) на `YeetMotion.press`;
/// выключенное состояние — прозрачность 0.4. При «Уменьшении движения» сжатия нет.
public struct YeetPressStyle: ButtonStyle {
    public var scale: CGFloat
    public var dimsWhenDisabled: Bool

    public init(scale: CGFloat = YeetGesture.pressScale, dimsWhenDisabled: Bool = true) {
        self.scale = scale
        self.dimsWhenDisabled = dimsWhenDisabled
    }

    public func makeBody(configuration: Configuration) -> some View {
        YeetPressBody(configuration: configuration, scale: scale, dimsWhenDisabled: dimsWhenDisabled)
    }
}

private struct YeetPressBody: View {
    let configuration: ButtonStyleConfiguration
    let scale: CGFloat
    let dimsWhenDisabled: Bool
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        configuration.label
            .scaleEffect(configuration.isPressed && isEnabled && !reduceMotion ? scale : 1)
            .opacity(isEnabled || !dimsWhenDisabled ? 1 : 0.4)
            .animation(YeetMotion.press, value: configuration.isPressed)
    }
}

/// Строка списка не сжимается при нажатии — подсвечивается фоном `borderSubtle` (в `YeetListGroup`).
struct YeetRowStyle: ButtonStyle {
    let highlight: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background(highlight && configuration.isPressed ? YeetColor.borderSubtle : Color.clear)
            .animation(YeetMotion.select, value: configuration.isPressed)
    }
}

// MARK: - Доступность

public extension View {
    /// Зона касания не меньше 44 × 44 pt (HIG) без изменения вида: форма нажатия выходит за края мелкого элемента.
    func yeetHitArea(width: CGFloat? = nil, height: CGFloat) -> some View {
        let side = min(width ?? height, height)
        return contentShape(Rectangle().inset(by: -max(0, (44 - side) / 2)))
    }

    /// Анимация токена с учётом «Уменьшения движения»: при включённом — мгновенно.
    func yeetAnimation<V: Equatable>(_ animation: Animation, value: V) -> some View {
        modifier(YeetAnimationModifier(animation: animation, value: value))
    }

    /// Тень `floating`, если `enabled`.
    @ViewBuilder
    func yeetFloating(_ enabled: Bool) -> some View {
        if enabled { yeetFloatingShadow() } else { self }
    }
}

private struct YeetAnimationModifier<V: Equatable>: ViewModifier {
    let animation: Animation
    let value: V
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func body(content: Content) -> some View {
        content.animation(reduceMotion ? nil : animation, value: value)
    }
}

/// `withAnimation` с учётом «Уменьшения движения» (`reduceMotion` — из `@Environment(\.accessibilityReduceMotion)`).
public func yeetWithAnimation<Result>(_ animation: Animation, reduceMotion: Bool, _ body: () throws -> Result) rethrows -> Result {
    try withAnimation(reduceMotion ? nil : animation, body)
}

// MARK: - Формы

/// Прямоугольник с отдельным радиусом каждого угла (iOS 16: `UnevenRoundedRectangle` появился только в iOS 17).
/// Sheet Modal — 32 сверху и 48 снизу, карточка погоды — 20 / 20 / 20 / 8.
public struct YeetRoundedCorners: InsettableShape {
    public var topLeading: CGFloat
    public var topTrailing: CGFloat
    public var bottomTrailing: CGFloat
    public var bottomLeading: CGFloat
    private var insetAmount: CGFloat = 0

    public init(topLeading: CGFloat = 0, topTrailing: CGFloat = 0, bottomTrailing: CGFloat = 0, bottomLeading: CGFloat = 0) {
        self.topLeading = topLeading
        self.topTrailing = topTrailing
        self.bottomTrailing = bottomTrailing
        self.bottomLeading = bottomLeading
    }

    public func inset(by amount: CGFloat) -> YeetRoundedCorners {
        var shape = self
        shape.insetAmount += amount
        return shape
    }

    public func path(in bounds: CGRect) -> Path {
        let rect = bounds.insetBy(dx: insetAmount, dy: insetAmount)
        let limit = max(0, min(rect.width, rect.height) / 2)
        let tl = min(max(0, topLeading - insetAmount), limit)
        let tr = min(max(0, topTrailing - insetAmount), limit)
        let br = min(max(0, bottomTrailing - insetAmount), limit)
        let bl = min(max(0, bottomLeading - insetAmount), limit)
        var p = Path()
        p.move(to: CGPoint(x: rect.minX + tl, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.maxX - tr, y: rect.minY))
        p.addArc(center: CGPoint(x: rect.maxX - tr, y: rect.minY + tr), radius: tr, startAngle: .degrees(-90), endAngle: .degrees(0), clockwise: false)
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - br))
        p.addArc(center: CGPoint(x: rect.maxX - br, y: rect.maxY - br), radius: br, startAngle: .degrees(0), endAngle: .degrees(90), clockwise: false)
        p.addLine(to: CGPoint(x: rect.minX + bl, y: rect.maxY))
        p.addArc(center: CGPoint(x: rect.minX + bl, y: rect.maxY - bl), radius: bl, startAngle: .degrees(90), endAngle: .degrees(180), clockwise: false)
        p.addLine(to: CGPoint(x: rect.minX, y: rect.minY + tl))
        p.addArc(center: CGPoint(x: rect.minX + tl, y: rect.minY + tl), radius: tl, startAngle: .degrees(180), endAngle: .degrees(270), clockwise: false)
        p.closeSubpath()
        return p
    }
}

/// Контур из SVG-координат `viewBox`, вписанный по центру в прямоугольник (как `preserveAspectRatio="xMidYMid meet"`).
public struct YeetViewBoxShape: Shape {
    public let path: Path
    public let viewBox: CGSize

    public init(path: Path, viewBox: CGSize) {
        self.path = path
        self.viewBox = viewBox
    }

    public func path(in rect: CGRect) -> Path {
        guard viewBox.width > 0, viewBox.height > 0 else { return Path() }
        let s = min(rect.width / viewBox.width, rect.height / viewBox.height)
        let dx = rect.minX + (rect.width - viewBox.width * s) / 2
        let dy = rect.minY + (rect.height - viewBox.height * s) / 2
        return path.applying(CGAffineTransform(a: s, b: 0, c: 0, d: s, tx: dx, ty: dy))
    }
}

// MARK: - Раскладка

/// Перенос по строкам (ChipGroup `wrap`): элементы через `spacing`, строки через `spacing`.
struct YeetFlowLayout: Layout {
    var spacing: CGFloat = YeetSpace.s4
    var center = false

    private struct Row {
        var indices: [Int] = []
        var width: CGFloat = 0
        var height: CGFloat = 0
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = arrange(maxWidth: proposal.width ?? .infinity, subviews: subviews)
        let height = rows.reduce(0) { $0 + $1.height } + spacing * CGFloat(max(0, rows.count - 1))
        let widest = rows.map(\.width).max() ?? 0
        let width = proposal.width.flatMap { $0.isFinite ? $0 : nil } ?? widest
        return CGSize(width: width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for row in arrange(maxWidth: bounds.width, subviews: subviews) {
            var x = center ? bounds.minX + (bounds.width - row.width) / 2 : bounds.minX
            for index in row.indices {
                let size = subviews[index].sizeThatFits(.unspecified)
                subviews[index].place(at: CGPoint(x: x, y: y + (row.height - size.height) / 2), proposal: ProposedViewSize(size))
                x += size.width + spacing
            }
            y += row.height + spacing
        }
    }

    private func arrange(maxWidth: CGFloat, subviews: Subviews) -> [Row] {
        var rows: [Row] = []
        var current = Row()
        for index in subviews.indices {
            let size = subviews[index].sizeThatFits(.unspecified)
            if !current.indices.isEmpty, current.width + spacing + size.width > maxWidth {
                rows.append(current)
                current = Row()
            }
            current.width += (current.indices.isEmpty ? 0 : spacing) + size.width
            current.height = max(current.height, size.height)
            current.indices.append(index)
        }
        if !current.indices.isEmpty { rows.append(current) }
        return rows
    }
}

// MARK: - Окружение

private struct InListGroupKey: EnvironmentKey {
    static let defaultValue = false
}

private struct InputGroupSizeKey: EnvironmentKey {
    static let defaultValue: YeetInputGroupSize? = nil
}

extension EnvironmentValues {
    /// Строка внутри `YeetListGroup`: паддинги 16 / 20, разделитель, подсветка нажатия.
    var yeetInListGroup: Bool {
        get { self[InListGroupKey.self] }
        set { self[InListGroupKey.self] = newValue }
    }

    /// Размер `YeetInputGroup`, в котором стоит поле (nil — поле вне группы).
    var yeetInputGroupSize: YeetInputGroupSize? {
        get { self[InputGroupSizeKey.self] }
        set { self[InputGroupSizeKey.self] = newValue }
    }
}

/// Разделитель строк в группе: 1 pt `divider` с отступом 16 от краёв.
struct YeetRowDivider: View {
    var body: some View {
        Rectangle()
            .fill(YeetColor.divider)
            .frame(height: 1)
            .padding(.horizontal, YeetSpace.s16)
            .accessibilityHidden(true)
    }
}
