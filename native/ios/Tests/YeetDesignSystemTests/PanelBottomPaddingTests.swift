import XCTest
import SwiftUI
@testable import YeetDesignSystem

/// Нижний отступ панели `YeetSheet(type: .panel)` (Garderob P-0030.77): зазор до низа задаётся снаружи, по умолчанию 20.
final class PanelBottomPaddingTests: XCTestCase {
    func test_поУмолчанию_20_безЗоны() {
        let env = EnvironmentValues()
        XCTAssertEqual(env.yeetPanelBottomGap, 20)
        XCTAssertEqual(env.yeetPanelBottomInset, 0)
        XCTAssertEqual(YeetSheet<EmptyView>.panelBottomPadding(gap: env.yeetPanelBottomGap, inset: env.yeetPanelBottomInset), 20)
    }

    func test_панельДеталей_зона34() {
        // как у `YeetDetailsScreen` без закреплённого низа (P-0030.69): 20 + 34
        XCTAssertEqual(YeetSheet<EmptyView>.panelBottomPadding(gap: 20, inset: 34), 54)
    }

    func test_док_зазор8_подМеню() {
        // док Стилиста: поле → 8 → меню 56 → 20 до края; зона под панелью 76 (17 Pro)
        XCTAssertEqual(YeetSheet<EmptyView>.panelBottomPadding(gap: 8, inset: 76), 84)
    }
}
