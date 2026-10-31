import XCTest
import SwiftUI
@testable import YeetDesignSystem

/// Шапка `back`: текстовое действие справа — серая Tertiary M (Garderob P-0030.84, кадр `1173:21880`), не ghost.
final class HeaderTextActionTests: XCTestCase {
    func test_текстовоеДействие_tertiary() throws {
        XCTAssertEqual(YeetHeader.textActionVariant, .tertiary)
        let корень = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        let т = try String(contentsOf: корень.appendingPathComponent("Sources/YeetDesignSystem/Organisms/Header.swift"), encoding: .utf8)
        XCTAssertTrue(т.contains("YeetButton(textAction.label, variant: Self.textActionVariant, size: .m)"))
        XCTAssertFalse(т.contains("variant: .ghost"), "в шапке осталась ghost-кнопка")
    }
}

/// Шапка `back` без `onBack` — без «‹» (Garderob P-0030.84.1); с `onBack` — «‹» есть.
final class HeaderBackOptionalTests: XCTestCase {
    func test_безOnBack_безКнопкиНазад() throws {
        let корень = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        let т = try String(contentsOf: корень.appendingPathComponent("Sources/YeetDesignSystem/Organisms/Header.swift"), encoding: .utf8)
        let назад = try XCTUnwrap(т.range(of: "private func back("))
        let тело = т[назад.upperBound...].prefix(700)
        XCTAssertTrue(тело.contains("if let onBack {\n                YeetIconButton(icon: .chevronLeft, label: \"Назад\") { onBack() }"),
                      "«‹» шапки back рисуется без onBack")
    }
}
