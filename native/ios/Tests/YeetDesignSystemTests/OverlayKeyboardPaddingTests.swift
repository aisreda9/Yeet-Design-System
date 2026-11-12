import XCTest
@testable import YeetDesignSystem

/// Garderob P-0240: при открытой клавиатуре нижний отступ шторки не вычитает её второй раз.
final class OverlayKeyboardPaddingTests: XCTestCase {
    func test_клавиатура_отступТолькоInset() {
        XCTAssertEqual(YeetOverlayToken.bottomPadding(safeBottom: 335, keyboardShown: true), YeetOverlayToken.inset,
                       "🔴 клавиатура вычтена дважды: кадр слоя уже над ней")
    }
    func test_безКлавиатуры_какБыло() {
        XCTAssertEqual(YeetOverlayToken.bottomPadding(safeBottom: 34, keyboardShown: false), 34, "home indicator")
        XCTAssertEqual(YeetOverlayToken.bottomPadding(safeBottom: 0, keyboardShown: false), YeetOverlayToken.inset)
    }
}
