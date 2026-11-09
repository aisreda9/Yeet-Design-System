import XCTest
import SwiftUI
@testable import YeetDesignSystem

/// Garderob P-0147: пропорция фото `YeetDetailsScreen`. Квадрат по умолчанию — числа прежние; прямоугольник — во всю
/// ширину минус поля, высота по пропорции.
final class DetailsMediaAspectTests: XCTestCase {
    private typealias Экран = YeetDetailsScreen<EmptyView, EmptyView>

    /// Прежняя формула стороны квадрата — дословно из edbc761 (`mediaSide`), числами на двух ширинах.
    private func прежняяСторона(width: CGFloat, viewport: CGFloat, pinned: CGFloat?, peek: CGFloat = 56,
                                min: CGFloat = 0.5, max: CGFloat = 0.65) -> CGFloat {
        let full = Swift.max(width - 2 * 20, 1)
        guard let pinned else { return full }
        let available = viewport - 20 - 20 - pinned - 12 - peek
        let fitted = Swift.min(Swift.max(available, viewport * min), viewport * max)
        return Swift.max(Swift.min(full, fitted), 1)
    }

    func testSquareByDefault_numbersAsBefore() {
        for (w, v, p) in [(402.0, 770.0, nil), (375.0, 600.0, nil), (402.0, 770.0, 120.0), (375.0, 560.0, 200.0)] as [(CGFloat, CGFloat, CGFloat?)] {
            let s = Экран.mediaSize(width: w, viewport: v, gutter: 20, aspect: 1, pinnedHeight: p,
                                    minPanelPeek: 56, minFraction: 0.5, maxFraction: 0.65)
            let прежде = прежняяСторона(width: w, viewport: v, pinned: p)
            XCTAssertEqual(s.width, прежде, accuracy: 0.0001, "\(w)×\(v) pinned=\(String(describing: p))")
            XCTAssertEqual(s.height, прежде, accuracy: 0.0001)
        }
    }

    func testRectangle_fullWidthHeightByAspect() {
        let s = Экран.mediaSize(width: 402, viewport: 770, gutter: 20, aspect: 0.6822, pinnedHeight: nil,
                                minPanelPeek: 96, minFraction: 0.35, maxFraction: 0.65)
        XCTAssertEqual(s.width, 362, accuracy: 0.0001)
        XCTAssertEqual(s.height, 362 / 0.6822, accuracy: 0.0001)
        XCTAssertEqual(s.width / s.height, 0.6822, accuracy: 0.0001)
    }

    func testRectangleWithPinned_heightLimitedWidthKeepsAspect() {
        let s = Экран.mediaSize(width: 402, viewport: 700, gutter: 20, aspect: 0.6822, pinnedHeight: 100,
                                minPanelPeek: 56, minFraction: 0.5, maxFraction: 0.65)
        XCTAssertEqual(s.height, 700 * 0.65, accuracy: 0.0001)
        XCTAssertEqual(s.width / s.height, 0.6822, accuracy: 0.0001)
    }

    func testDefaultInitIsSquare() {
        // Публичный вход: без аргумента — квадрат (все текущие экраны, «Новая вещь»).
        let экран = YeetDetailsScreen(media: { EmptyView() }, content: { EmptyView() })
        XCTAssertEqual(Mirror(reflecting: экран).children.first { $0.label == "mediaAspect" }?.value as? CGFloat, 1)
    }
}
