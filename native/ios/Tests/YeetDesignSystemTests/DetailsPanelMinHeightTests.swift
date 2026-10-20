import XCTest
import SwiftUI
@testable import YeetDesignSystem

/// Наименьшая высота панели `YeetDetailsScreen` (Garderob P-0030.69): без закреплённого низа — до края экрана,
/// с низом — прежняя формула.
final class DetailsPanelMinHeightTests: XCTestCase {
    private typealias Экран = YeetDetailsScreen<EmptyView, EmptyView>

    func test_безНиза_зона34_доКраяЭкрана() {
        // область под шапкой 700, место фото 393 → было 307 (кончалось на линии безопасной зоны), стало 307 + 34
        XCTAssertEqual(Экран.panelMinHeight(viewport: 700, bottom: 0, spacer: 393, safeArea: 34), 341)
    }

    func test_безНиза_зона0_какРаньше() {
        XCTAssertEqual(Экран.panelMinHeight(viewport: 700, bottom: 0, spacer: 393, safeArea: 0), 307)
        XCTAssertEqual(Экран.panelMinHeight(viewport: 700, bottom: 0, spacer: 393), 307, "по умолчанию — прежняя формула")
    }

    func test_сНизом_безИзменений() {
        // с закреплённым низом экран передаёт зону 0 — то же, что до P-0030.69
        XCTAssertEqual(Экран.panelMinHeight(viewport: 700, bottom: 86, spacer: 393), 221)
        XCTAssertEqual(Экран.panelMinHeight(viewport: 700, bottom: 86, spacer: 393, safeArea: 0), 221)
    }

    func test_неОтрицательная() {
        XCTAssertEqual(Экран.panelMinHeight(viewport: 300, bottom: 86, spacer: 393, safeArea: 34), 0)
    }
}
