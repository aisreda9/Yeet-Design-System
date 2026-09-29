import SwiftUI

/// Рамка обрезки в долях контейнера 0…1 (React: `CropRect`): левый верхний угол, ширина, высота.
/// В долях — поэтому рамка остаётся на месте при любой ширине экрана.
public struct YeetCropRect: Equatable {
    public var x: CGFloat
    public var y: CGFloat
    public var width: CGFloat
    public var height: CGFloat

    public init(x: CGFloat, y: CGFloat, width: CGFloat, height: CGFloat) {
        self.x = x
        self.y = y
        self.width = width
        self.height = height
    }

    /// Рамка из флоу Search / Photo / Crop `261:1590`: 353 × 226 в 20 от краёв экрана 393 × 852, верх на 315.
    public static let `default` = YeetCropRect(x: 20 / 393, y: 315 / 852, width: 353 / 393, height: 226 / 852)

    /// Масштаб вокруг центра.
    func scaled(_ k: CGFloat) -> YeetCropRect {
        let w = width * k, h = height * k
        return YeetCropRect(x: x + width / 2 - w / 2, y: y + height / 2 - h / 2, width: w, height: h)
    }
}

/// Угол кропа: скруглённый уголок 32 × 32, линия 2, радиус 20 (левый верхний; остальные — поворотом).
private struct YeetCropCornerShape: Shape {
    func path(in rect: CGRect) -> Path {
        let r = min(YeetRadius.lg, rect.width, rect.height)
        var p = Path()
        p.move(to: CGPoint(x: rect.minX, y: rect.maxY))
        p.addLine(to: CGPoint(x: rect.minX, y: rect.minY + r))
        p.addArc(center: CGPoint(x: rect.minX + r, y: rect.minY + r), radius: r, startAngle: .degrees(180), endAngle: .degrees(270), clockwise: false)
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.minY))
        return p
    }
}

/// Рамка обрезки фото (React: `CropFrame`; Figma: Search / Photo / Crop `261:1590`): снаружи — затемнение `bgOverlay`,
/// по углам — белые уголки. Рамку двигают пальцем, углы тянут (зона 44), двумя пальцами масштабируют вокруг центра;
/// рамка не выходит за фото и не меньше `minSide`. Начало жеста — хаптика `threshold`.
///
/// VoiceOver: рамка — регулируемый элемент «Рамка обрезки, 90 × 27 % фото»: смахивание вверх / вниз масштабирует,
/// действия «Сдвинуть вверх / вниз / влево / вправо» двигают.
/// Управляемая (`rect: $rect`) или неуправляемая (`defaultRect`, рамка хранится в `@State`).
public struct YeetCropFrame<Photo: View>: View {
    private let external: Binding<YeetCropRect>?
    private let onChange: ((YeetCropRect) -> Void)?
    private let hint: String?
    private let minSide: CGFloat
    private let photo: Photo

    @State private var internalRect: YeetCropRect
    @State private var start: YeetCropRect?
    @State private var pinchStart: YeetCropRect?

    /// Управляемая рамка.
    /// - Parameters:
    ///   - hint: подсказка на фото внизу (в 20 над кнопкой L: 92 от низа); `nil` — без подсказки.
    ///   - minSide: минимальная сторона рамки, pt.
    ///   - photo: фото под рамкой — заполняет контейнер (`resizable().scaledToFill()`).
    public init(
        rect: Binding<YeetCropRect>,
        onChange: ((YeetCropRect) -> Void)? = nil,
        hint: String? = "Перемещай и масштабируй рамку",
        minSide: CGFloat = 64,
        @ViewBuilder photo: () -> Photo
    ) {
        self.external = rect
        self.onChange = onChange
        self.hint = hint
        self.minSide = minSide
        self.photo = photo()
        self._internalRect = State(initialValue: rect.wrappedValue)
    }

    /// Неуправляемая рамка: начинает с `defaultRect` (по умолчанию — как во флоу).
    public init(
        defaultRect: YeetCropRect = .default,
        onChange: ((YeetCropRect) -> Void)? = nil,
        hint: String? = "Перемещай и масштабируй рамку",
        minSide: CGFloat = 64,
        @ViewBuilder photo: () -> Photo
    ) {
        self.external = nil
        self.onChange = onChange
        self.hint = hint
        self.minSide = minSide
        self.photo = photo()
        self._internalRect = State(initialValue: defaultRect)
    }

    private var rect: YeetCropRect { external?.wrappedValue ?? internalRect }
    private var active: Bool { start != nil || pinchStart != nil }

    public var body: some View {
        GeometryReader { proxy in
            let size = proxy.size
            let frame = CGRect(x: rect.x * size.width, y: rect.y * size.height, width: rect.width * size.width, height: rect.height * size.height)
            ZStack(alignment: .topLeading) {
                photo
                    .frame(width: size.width, height: size.height)
                    .clipped()
                    .accessibilityHidden(true)
                // затемнение с вырезом под рамку
                Path { p in
                    p.addRect(CGRect(origin: .zero, size: size))
                    p.addRoundedRect(in: frame, cornerSize: CGSize(width: YeetRadius.lg, height: YeetRadius.lg), style: .continuous)
                }
                .fill(YeetColor.bgOverlay, style: FillStyle(eoFill: true))
                .allowsHitTesting(false)
                .accessibilityHidden(true)
                frameView(frame, size: size)
                ForEach(0..<4, id: \.self) { corner in
                    cornerView(corner, frame: frame, size: size)
                }
                if let hint {
                    HStack(spacing: 6) {
                        YeetIcon(name: .fingersPinch, size: 16)
                        Text(hint).yeetText(YeetType.body)
                    }
                    .foregroundStyle(YeetColor.textOnPhoto)
                    .padding(.bottom, 92) // в 20 над кнопкой L внизу экрана: 20 + 52 + 20
                    .frame(width: size.width, height: size.height, alignment: .bottom)
                    .allowsHitTesting(false)
                    .accessibilityHidden(true)
                }
            }
            .frame(width: size.width, height: size.height)
            .contentShape(Rectangle())
            // второй палец может лечь и мимо рамки — щипок ловит весь контейнер
            .simultaneousGesture(
                MagnificationGesture()
                    .onChanged { scale in
                        if pinchStart == nil { pinchStart = rect; YeetHaptic.threshold() }
                        if let pinchStart { set(pinchStart.scaled(scale), size: size) }
                    }
                    .onEnded { _ in pinchStart = nil }
            )
        }
        .clipped()
        .yeetAnimation(YeetMotion.fade, value: active)
    }

    // MARK: Рамка и углы

    private func frameView(_ frame: CGRect, size: CGSize) -> some View {
        RoundedRectangle(cornerRadius: YeetRadius.lg, style: .continuous)
            .fill(Color.clear)
            .overlay(
                RoundedRectangle(cornerRadius: YeetRadius.lg, style: .continuous)
                    .strokeBorder(YeetColor.textOnPhoto.opacity(active ? 0.4 : 0), lineWidth: YeetBorderWidth.thin)
            )
            .contentShape(RoundedRectangle(cornerRadius: YeetRadius.lg, style: .continuous))
            .frame(width: frame.width, height: frame.height)
            .position(x: frame.midX, y: frame.midY)
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        let from = begin()
                        set(YeetCropRect(
                            x: from.x + value.translation.width / size.width,
                            y: from.y + value.translation.height / size.height,
                            width: from.width,
                            height: from.height
                        ), size: size)
                    }
                    .onEnded { _ in start = nil }
            )
            .accessibilityElement()
            .accessibilityLabel(Text("Рамка обрезки"))
            .accessibilityValue(Text("\(percent(rect.width)) × \(percent(rect.height)) % фото"))
            .accessibilityAdjustableAction { direction in
                switch direction {
                case .increment: set(rect.scaled(1.05), size: size)
                case .decrement: set(rect.scaled(1 / 1.05), size: size)
                @unknown default: break
                }
            }
            .accessibilityAction(named: Text("Сдвинуть вверх")) { nudge(dx: 0, dy: -20, size: size) }
            .accessibilityAction(named: Text("Сдвинуть вниз")) { nudge(dx: 0, dy: 20, size: size) }
            .accessibilityAction(named: Text("Сдвинуть влево")) { nudge(dx: -20, dy: 0, size: size) }
            .accessibilityAction(named: Text("Сдвинуть вправо")) { nudge(dx: 20, dy: 0, size: size) }
    }

    /// Угол: 0 — левый верхний, 1 — правый верхний, 2 — правый нижний, 3 — левый нижний. Видимый уголок 32, зона захвата 44.
    private func cornerView(_ corner: Int, frame: CGRect, size: CGSize) -> some View {
        let left = corner == 0 || corner == 3
        let top = corner == 0 || corner == 1
        // центр зоны 44: уголок 32 стоит в рамке, зона выходит за неё на 10
        let cx = left ? frame.minX + 12 : frame.maxX - 12
        let cy = top ? frame.minY + 12 : frame.maxY - 12
        return YeetCropCornerShape()
            .stroke(YeetColor.textOnPhoto, style: StrokeStyle(lineWidth: YeetBorderWidth.thick, lineCap: .round))
            .frame(width: 32, height: 32)
            .rotationEffect(.degrees(Double(corner) * 90))
            .frame(width: 44, height: 44)
            .contentShape(Rectangle())
            .position(x: cx, y: cy)
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        let r = begin()
                        let dx = value.translation.width / size.width
                        let dy = value.translation.height / size.height
                        let mw = minSide / size.width, mh = minSide / size.height
                        // угол тянется, противоположный стоит на месте
                        let right = r.x + r.width, bottom = r.y + r.height
                        let x = left ? clamp(r.x + dx, 0, right - mw) : r.x
                        let y = top ? clamp(r.y + dy, 0, bottom - mh) : r.y
                        let w = left ? right - x : clamp(r.width + dx, mw, 1 - r.x)
                        let h = top ? bottom - y : clamp(r.height + dy, mh, 1 - r.y)
                        set(YeetCropRect(x: x, y: y, width: w, height: h), size: size)
                    }
                    .onEnded { _ in start = nil }
            )
            .accessibilityHidden(true)
    }

    // MARK: Геометрия

    private func begin() -> YeetCropRect {
        if let start { return start }
        start = rect
        YeetHaptic.threshold()
        return rect
    }

    private func clamp(_ v: CGFloat, _ lo: CGFloat, _ hi: CGFloat) -> CGFloat { min(max(v, lo), max(lo, hi)) }

    private func percent(_ v: CGFloat) -> Int { Int((v * 100).rounded()) }

    private func nudge(dx: CGFloat, dy: CGFloat, size: CGSize) {
        var r = rect
        r.x += dx / max(size.width, 1)
        r.y += dy / max(size.height, 1)
        set(r, size: size)
    }

    /// Рамка не выходит за фото и не меньше `minSide`.
    private func set(_ r: YeetCropRect, size: CGSize) {
        let mw = min(minSide / max(size.width, 1), 1), mh = min(minSide / max(size.height, 1), 1)
        let w = clamp(r.width, mw, 1), h = clamp(r.height, mh, 1)
        let next = YeetCropRect(x: clamp(r.x, 0, 1 - w), y: clamp(r.y, 0, 1 - h), width: w, height: h)
        guard next != rect else { return }
        if let external { external.wrappedValue = next } else { internalRect = next }
        onChange?(next)
    }
}

#if DEBUG
private struct CropFramePreview: View {
    var body: some View {
        YeetCropFrame {
            LinearGradient(colors: [YeetPrimitive.graphite400, YeetPrimitive.graphite900], startPoint: .top, endPoint: .bottom)
                .overlay(YeetItemArt(kind: .top, color: .blue, size: 220))
        }
        .ignoresSafeArea()
    }
}

#Preview("CropFrame · Light") { CropFramePreview().preferredColorScheme(.light) }
#Preview("CropFrame · Dark") { CropFramePreview().preferredColorScheme(.dark) }
#endif
