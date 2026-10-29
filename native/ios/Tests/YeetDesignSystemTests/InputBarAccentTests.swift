import XCTest
import SwiftUI
@testable import YeetDesignSystem

/// `YeetInputBar(accent:)` (Garderob P-0030.78): плейсхолдер и «↑» в покое — `textAccent`; по умолчанию — как в ДС.
final class InputBarAccentTests: XCTestCase {
    func test_поУмолчанию_textSecondary() {
        XCTAssertEqual(YeetInputBar.placeholderColor(accent: false), YeetColor.textSecondary)
        XCTAssertEqual(YeetInputBar.sendIdleColor(accent: false), YeetColor.textSecondary)
    }

    func test_акцент_textAccent() {
        XCTAssertEqual(YeetInputBar.placeholderColor(accent: true), YeetColor.textAccent)
        XCTAssertEqual(YeetInputBar.sendIdleColor(accent: true), YeetColor.textAccent)
    }
}
