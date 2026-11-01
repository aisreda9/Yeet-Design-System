import XCTest
import SwiftUI
@testable import YeetDesignSystem

/// Наименьшая высота панели `YeetDetailsScreen`.
/// P-0030.69: без закреплённого низа — до края экрана (плюс нижняя зона), с низом — без зоны.
/// P-0030.90.1 (решение владельца 01.11): прокрутки хватает до состояния «свёрнуто» (`collapse` = 20 + сторона фото) при
/// любом содержимом — прежде короткая панель останавливала прокрутку на полпути, фото срезалось шапкой.
final class DetailsPanelMinHeightTests: XCTestCase {
    private typealias Экран = YeetDetailsScreen<EmptyView, EmptyView>
    // сторона фото 353 → место фото 20 + 353 + 20 = 393, «свёрнуто» = 20 + 353 = 373: над панелью остаётся 20
    private let место: CGFloat = 393, свёрнуто: CGFloat = 373

    func test_безНиза_зона34_доКраяЭкрана() {
        XCTAssertEqual(Экран.panelMinHeight(viewport: 700, bottom: 0, spacer: место, collapse: свёрнуто, safeArea: 34), 714)
    }

    func test_безНиза_зона0() {
        XCTAssertEqual(Экран.panelMinHeight(viewport: 700, bottom: 0, spacer: место, collapse: свёрнуто, safeArea: 0), 680)
        XCTAssertEqual(Экран.panelMinHeight(viewport: 700, bottom: 0, spacer: место, collapse: свёрнуто), 680, "по умолчанию — зона 0")
    }

    func test_сНизом_безЗоны() {
        XCTAssertEqual(Экран.panelMinHeight(viewport: 700, bottom: 86, spacer: место, collapse: свёрнуто), 594)
    }

    /// Хватает прокрутки до «свёрнуто»: место фото + панель − видимая область ≥ collapse.
    func test_прокруткиХватаетДоСвёрнутого() {
        for (viewport, низ) in [(700.0, 86.0), (580.0, 86.0), (760.0, 0.0)] as [(CGFloat, CGFloat)] {
            let панель = Экран.panelMinHeight(viewport: viewport, bottom: низ, spacer: место, collapse: свёрнуто)
            XCTAssertGreaterThanOrEqual(место + панель - (viewport - низ), свёрнуто, "viewport \(viewport)")
        }
    }

    func test_неОтрицательная() {
        XCTAssertEqual(Экран.panelMinHeight(viewport: 10, bottom: 86, spacer: место, collapse: свёрнуто, safeArea: 0), 0)
    }
}

/// Два состояния панели после жеста (Garderob P-0030.90.1): «в покое» (0) или «свёрнуто»; дальше — обычная прокрутка.
final class DetailsSnapTests: XCTestCase {
    private typealias Экран = YeetDetailsScreen<EmptyView, EmptyView>

    func test_ближайшееИзДвух() {
        XCTAssertEqual(Экран.collapsedOffset(side: 353), 373)
        XCTAssertEqual(Экран.snapTarget(124, collapsed: 373), 0, "подняли на 124 — обратно в покой")
        XCTAssertEqual(Экран.snapTarget(200, collapsed: 373), 373, "больше половины — свёрнуто")
        XCTAssertEqual(Экран.snapTarget(0, collapsed: 373), 0)
        XCTAssertEqual(Экран.snapTarget(373, collapsed: 373), 373)
        XCTAssertEqual(Экран.snapTarget(520, collapsed: 373), 520, "за «свёрнуто» — длинная панель прокручивается свободно")
    }

    func test_жестПодключён() throws {
        let корень = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        let т = try String(contentsOf: корень.appendingPathComponent("Sources/YeetDesignSystem/Organisms/DetailsScreen.swift"), encoding: .utf8)
        XCTAssertTrue(т.contains(".modifier(DetailsSnap(collapsed: Self.collapsedOffset(side: side)))"), "панель без двух состояний")
        XCTAssertTrue(т.contains("YeetFocusedField.snapLifted(collapsed:"), "после клавиатуры панель не возвращается")
    }
}
