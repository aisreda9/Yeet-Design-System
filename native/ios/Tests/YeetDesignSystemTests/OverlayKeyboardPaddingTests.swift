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

/// Garderob P-0240b: при клавиатуре верх шторки не выше безопасной зоны окна + 16, даже если у слоя своей зоны нет.
final class OverlayKeyboardTopTests: XCTestCase {
    func test_клавиатура_слойБезЗоны_верхПодСтрокойСостояния() {
        // Слой растянут под строку состояния (верх слоя 0), своей безопасной зоны нет; у окна — 62.
        XCTAssertEqual(YeetOverlayToken.topPadding(containerTop: 0, layerMinY: 0, windowTop: 62, keyboardShown: true), 62 + YeetOverlayToken.inset,
                       "🔴 заголовок шторки под часами")
        // Слой ниже строки состояния (лист с верхом 62) — отступ только inset.
        XCTAssertEqual(YeetOverlayToken.topPadding(containerTop: 0, layerMinY: 62, windowTop: 62, keyboardShown: true), YeetOverlayToken.inset)
        XCTAssertEqual(YeetOverlayToken.topPadding(containerTop: 62, layerMinY: 0, windowTop: 62, keyboardShown: true), 62 + YeetOverlayToken.inset)
    }
    func test_безКлавиатуры_какБыло() {
        XCTAssertEqual(YeetOverlayToken.topPadding(containerTop: 62, layerMinY: 0, windowTop: 62, keyboardShown: false), 62 + YeetOverlayToken.topGap)
        XCTAssertEqual(YeetOverlayToken.topPadding(containerTop: 0, layerMinY: 0, windowTop: 62, keyboardShown: false), YeetOverlayToken.topGap)
    }
}
