import XCTest
import SwiftUI
@testable import YeetDesignSystem

/// `YeetGarmentIcon` (Garderob P-0030.81): у платья — силуэт, у остальных — иконка ui-icons; `dress.icon` по-прежнему `top`.
final class GarmentIconTests: XCTestCase {
    func test_силуэтТолькоУПлатья() {
        for kind in YeetGarment.allCases {
            XCTAssertEqual(YeetGarmentIcon.рисуетСилуэт(kind), kind == .dress, "\(kind)")
            let вид = YeetGarmentIcon(kind, size: 56)
            XCTAssertEqual(вид.kind, kind)
            XCTAssertEqual(вид.size, 56)
            _ = вид.body
        }
    }

    func test_иконкаПлатьяВНабореНеТронута() {
        XCTAssertEqual(YeetGarment.dress.icon, .top)
    }

    /// Иллюстрация вещи идёт через тот же элемент — один источник силуэта.
    func test_иллюстрацияВещи_черезGarmentIcon() throws {
        let корень = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        let т = try String(contentsOf: корень.appendingPathComponent("Sources/YeetDesignSystem/Organisms/ItemCard.swift"), encoding: .utf8)
        XCTAssertTrue(т.contains("YeetGarmentIcon(kind, size: size, strokeWidth: strokeWidth)"))
        XCTAssertEqual(т.components(separatedBy: "YeetDressSilhouette()").count - 1, 0, "силуэт рисуется в обход YeetGarmentIcon")
    }
}
