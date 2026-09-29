// Общая математика жестов: скорость броска и резинка за границей.
// Порт src/utils/gesture.ts — числа из токенов (YeetGesture), решение принимает код.

import SwiftUI

/// Резинка за границей (как UIScrollView): чем дальше тянешь, тем меньше отдаёт.
/// `offset` — сколько палец прошёл за границу, `dimension` — размер объекта по оси. Результат по модулю всегда < `dimension`.
public func yeetRubberBand(_ offset: CGFloat, dimension: CGFloat, coefficient: CGFloat = YeetGesture.rubberBand) -> CGFloat {
    let size = max(dimension, 1)
    let x = abs(offset)
    let value = (1 - 1 / (x * coefficient / size + 1)) * size
    return offset < 0 ? -value : value
}

/// Скорость пальца по последним 80 мс, pt/с (React: `velocityTracker`).
///
/// Средняя по всему жесту врёт: палец мог долго стоять, а потом резко бросить — бросок должен засчитаться.
/// И наоборот: протянул, подержал палец и отпустил — броска нет. Поэтому в `onEnded` точку отпускания добавляют
/// (`add` перед `velocity`), а `velocity(at:)` отдаёт 0, если с последней точки прошло больше окна.
public struct YeetVelocityTracker {
    /// Окно скорости: учитываются точки не старше этого, и палец, стоявший дольше, бросок не даёт.
    public static let window: TimeInterval = 0.08

    private var samples: [(time: TimeInterval, point: CGPoint)] = []

    public init() {}

    public mutating func reset() { samples.removeAll() }

    public mutating func add(_ point: CGPoint, at date: Date) {
        let t = date.timeIntervalSinceReferenceDate
        samples.append((t, point))
        while samples.count > 2, t - samples[0].time > Self.window { samples.removeFirst() }
    }

    /// Скорость в pt/с. `now` — время отпускания (`DragGesture.Value.time`).
    public func velocity(at now: Date? = nil) -> CGVector {
        guard samples.count >= 2, let a = samples.first, let b = samples.last else { return .zero }
        if let now, now.timeIntervalSinceReferenceDate - b.time > Self.window { return .zero } // палец стоял — это не бросок
        let dt = max(0.001, b.time - a.time)
        return CGVector(dx: (b.point.x - a.point.x) / dt, dy: (b.point.y - a.point.y) / dt)
    }
}
