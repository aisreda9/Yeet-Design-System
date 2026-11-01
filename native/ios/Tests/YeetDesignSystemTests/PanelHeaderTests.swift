import XCTest
import SwiftUI
@testable import YeetDesignSystem

/// Блок панели над заголовком (Garderob P-0030.91): хэндл → 20 → блок → 24 → заголовок; без блока — как было.
final class PanelHeaderTests: XCTestCase {
    func test_порядок_хэндл_блок_заголовок() throws {
        XCTAssertEqual(YeetSheet<EmptyView>.headerGap, 24)
        let корень = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        let лист = try String(contentsOf: корень.appendingPathComponent("Sources/YeetDesignSystem/Organisms/Sheet.swift"), encoding: .utf8)
        let хэндл = try XCTUnwrap(лист.range(of: "if showHandle { YeetSheetHandle() }\n            if let header"))
        let блок = try XCTUnwrap(лист.range(of: "if let header { header.padding(.top, showHandle ? YeetSpace.s20 : 0) }"))
        let заголовок = try XCTUnwrap(лист.range(of: "if hasHead { head.padding(.top, header != nil ? Self.headerGap : (showHandle ? YeetSpace.s20 : 0)) }"))
        XCTAssertTrue(хэндл.lowerBound < блок.lowerBound && блок.upperBound <= заголовок.lowerBound, "блок не между хэндлом и заголовком")
        let экран = try String(contentsOf: корень.appendingPathComponent("Sources/YeetDesignSystem/Organisms/DetailsScreen.swift"), encoding: .utf8)
        XCTAssertTrue(экран.contains("YeetSheet(title: title, description: subtitle, type: .panel, header: panelHeader)"), "каркас не передаёт блок")
    }
}
