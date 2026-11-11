import XCTest
import SwiftUI
@testable import YeetDesignSystem

/// Garderob P-0218: `YeetDetailsScreen(collapsesMedia: false)` — обычная прокрутка без сворачивания фото.
/// По умолчанию (`true`) — числа прежние.
final class DetailsNoCollapseTests: XCTestCase {
    private typealias Экран = YeetDetailsScreen<EmptyView, EmptyView>
    // сторона фото 353 → место фото 20 + 353 + 20 = 393, «свёрнуто» = 20 + 353 = 373
    private let сторона: CGFloat = 353, место: CGFloat = 393

    /// Высота содержимого прокрутки при коротком содержимом панели: место фото + панель (её наименьшая высота).
    private func высотаПрокрутки(viewport: CGFloat, низ: CGFloat, зона: CGFloat, сворачивание: Bool) -> CGFloat {
        место + Экран.panelMinHeight(viewport: viewport, bottom: низ, spacer: место,
                                     collapse: Экран.panelCollapse(side: сторона, collapses: сворачивание), safeArea: зона)
    }

    /// Короткое содержимое: прокрутки нет — содержимое ровно по видимой области (с зоной «домой» без закреплённого низа),
    /// пустого листа под кнопками нет.
    func test_безСворачивания_короткоеСодержимое_прокруткиНет() {
        for (viewport, низ, зона) in [(770.0, 0.0, 34.0), (600.0, 0.0, 34.0), (700.0, 86.0, 0.0), (560.0, 0.0, 0.0)]
            as [(CGFloat, CGFloat, CGFloat)] {
            let область = viewport + зона - низ
            XCTAssertEqual(высотаПрокрутки(viewport: viewport, низ: низ, зона: зона, сворачивание: false), область,
                           "\(viewport)/\(низ)/\(зона): запас прокрутки должен быть 0")
        }
    }

    /// Парный: по умолчанию — прежнее поведение P-0030.90.1, прокрутки хватает до «свёрнуто» (373) при любом содержимом.
    func test_поУмолчанию_прокруткаДоСвёрнутого_числаПрежние() {
        XCTAssertEqual(Экран.panelCollapse(side: сторона, collapses: true), 373)
        XCTAssertEqual(высотаПрокрутки(viewport: 770, низ: 0, зона: 34, сворачивание: true) - (770 + 34), 373)
    }

    /// Фото не сворачивается и не масштабируется ни при какой прокрутке.
    func test_безСворачивания_фотоНеСворачивается() {
        for offset in stride(from: -200.0, through: 2_000.0, by: 7.0) as StrideThrough<CGFloat> {
            XCTAssertFalse(Экран.nextCollapsed(offset: offset, side: сторона, collapsed: false, collapses: false))
            XCTAssertFalse(Экран.nextCollapsed(offset: offset, side: сторона, collapsed: true, collapses: false))
        }
    }

    /// Парный: по умолчанию сворачивание с гистерезисом 24 / 40 — как было.
    func test_поУмолчанию_сворачиваниеКакБыло() {
        XCTAssertFalse(Экран.nextCollapsed(offset: 348, side: сторона, collapsed: false, collapses: true))   // видно 25
        XCTAssertTrue(Экран.nextCollapsed(offset: 349, side: сторона, collapsed: false, collapses: true))    // видно 24
        XCTAssertTrue(Экран.nextCollapsed(offset: 334, side: сторона, collapsed: true, collapses: true))     // видно 39
        XCTAssertFalse(Экран.nextCollapsed(offset: 333, side: сторона, collapsed: true, collapses: true))    // видно 40
    }

    /// Фото едет вместе с содержимым в обе стороны: на резинке сверху не отстаёт от панели. По умолчанию резинка фото
    /// не двигает, как было.
    func test_сдвигФото() {
        XCTAssertEqual(Экран.mediaOffset(120, collapses: false), -120)
        XCTAssertEqual(Экран.mediaOffset(-40, collapses: false), 40)
        XCTAssertEqual(Экран.mediaOffset(120, collapses: true), -120)
        XCTAssertEqual(Экран.mediaOffset(-40, collapses: true), 0)
    }
}
