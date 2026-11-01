import XCTest
import SwiftUI
import UIKit
@testable import YeetDesignSystem

/// Акцент Navy (Garderob P-0030.89, Figma «Navy test» 4002:35945): светлая тема — `#20265F`, текст на акценте белый;
/// тёмная — прежняя синяя до значения дизайнера (решение владельца 01.11: Navy в тёмной не читается, 1,37 : 1).
final class AccentNavyTests: XCTestCase {
    private func hex(_ цвет: Color, _ стиль: UIUserInterfaceStyle) -> String {
        let c = UIColor(цвет).resolvedColor(with: UITraitCollection(userInterfaceStyle: стиль))
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        c.getRed(&r, green: &g, blue: &b, alpha: &a)
        return String(format: "#%02X%02X%02X", Int((r * 255).rounded()), Int((g * 255).rounded()), Int((b * 255).rounded()))
    }

    func test_светлая_navy() {
        XCTAssertEqual(hex(YeetColor.accent, .light), "#20265F")
        XCTAssertEqual(hex(YeetColor.textAccent, .light), "#20265F")
        XCTAssertEqual(hex(YeetColor.textOnAccent, .light), "#FFFFFF")
        XCTAssertEqual(hex(YeetComponent.buttonPrimaryBg, .light), "#20265F", "Primary не от акцента")
    }

    func test_тёмная_прежняя() {
        XCTAssertEqual(hex(YeetColor.accent, .dark), "#4B4BFF")
        XCTAssertEqual(hex(YeetColor.textAccent, .dark), "#8A8AFF")
    }

    func test_синийВещи_неТронут() {
        XCTAssertEqual(hex(YeetItemColor.blue.color, .light), "#0100F4", "цвет вещи «Синий» — не акцент")
    }
}
