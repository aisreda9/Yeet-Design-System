// Сгенерировано scripts/build-tokens.mjs из tokens/tokens.json — не редактировать вручную.
// Иконки ui-icons (src/icons/icons.ts) и фирменная графика (src/icons/brand.ts), переведённые в SwiftUI Path.

import SwiftUI

/// Слой иконки в координатах viewBox 24×24: контур и параметры обводки из SVG.
public struct YeetIconLayer {
    public let path: Path
    public let stroke: Bool
    public let fill: Bool
    public let lineCap: CGLineCap
    public let lineJoin: CGLineJoin
    public let dash: [CGFloat]
}

/// Линейные иконки 24×24 из Figma (Design System 2.0 · ui-icons). Имя = имя в Figma и в React (`IconName`).
public enum YeetIconName: String, CaseIterable, Identifiable {
    case chevronUpDown = "chevron-up-down"
    case chevronLeft = "chevron-left"
    case chevronRight = "chevron-right"
    case chevronUp = "chevron-up"
    case chevronDown = "chevron-down"
    case externalLink = "external-link"
    case arrowUp = "arrow-up"
    case arrowsShuffle = "arrows-shuffle"
    case plus = "plus"
    case cross = "cross"
    case more = "more"
    case eye = "eye"
    case spin = "spin"
    case collage = "collage"
    case pen = "pen"
    case trash = "trash"
    case archive = "archive"
    case heart = "heart"
    case container = "container"
    case fingersPinch = "fingers-pinch"
    case home = "home"
    case searchByImage = "search-by-image"
    case imageAdd = "image-add"
    case wardrobe = "wardrobe"
    case ai = "ai"
    case camera = "camera"
    case search = "search"
    case outerwear = "outerwear"
    case top = "top"
    case bottom = "bottom"
    case shoe = "shoe"
    case accessories = "accessories"
    case placeholder = "placeholder"
    case check = "check"
    case apple = "apple"
    case thumbDown = "thumb-down"
    case undo = "undo"
    case eyeOff = "eye-off"
    case bagCheck = "bag-check"
    case horizontalDrag = "horizontal-drag"
    case info = "info"
    case edit = "edit"
    case settings = "settings"
    case logOut = "log-out"
    case sun = "sun"
    case snowflake = "snowflake"
    case leaf = "leaf"
    case flower = "flower"

    public var id: String { rawValue }
    /// Слои контура (viewBox 24×24).
    public var layers: [YeetIconLayer] { YeetIconPaths.layers(for: self) }
}

private func pt(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: x, y: y) }

enum YeetIconPaths {
    static func layers(for name: YeetIconName) -> [YeetIconLayer] {
        switch name {
        case .chevronUpDown: return chevronUpDown
        case .chevronLeft: return chevronLeft
        case .chevronRight: return chevronRight
        case .chevronUp: return chevronUp
        case .chevronDown: return chevronDown
        case .externalLink: return externalLink
        case .arrowUp: return arrowUp
        case .arrowsShuffle: return arrowsShuffle
        case .plus: return plus
        case .cross: return cross
        case .more: return more
        case .eye: return eye
        case .spin: return spin
        case .collage: return collage
        case .pen: return pen
        case .trash: return trash
        case .archive: return archive
        case .heart: return heart
        case .container: return container
        case .fingersPinch: return fingersPinch
        case .home: return home
        case .searchByImage: return searchByImage
        case .imageAdd: return imageAdd
        case .wardrobe: return wardrobe
        case .ai: return ai
        case .camera: return camera
        case .search: return search
        case .outerwear: return outerwear
        case .top: return top
        case .bottom: return bottom
        case .shoe: return shoe
        case .accessories: return accessories
        case .placeholder: return placeholder
        case .check: return check
        case .apple: return apple
        case .thumbDown: return thumbDown
        case .undo: return undo
        case .eyeOff: return eyeOff
        case .bagCheck: return bagCheck
        case .horizontalDrag: return horizontalDrag
        case .info: return info
        case .edit: return edit
        case .settings: return settings
        case .logOut: return logOut
        case .sun: return sun
        case .snowflake: return snowflake
        case .leaf: return leaf
        case .flower: return flower
        }
    }

    private static let chevronUpDown: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(8, 13.25))
            p.addLine(to: pt(12, 17))
            p.addLine(to: pt(16, 13.25))
            p.move(to: pt(8, 10.75))
            p.addLine(to: pt(12, 7))
            p.addLine(to: pt(16, 10.75))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let chevronLeft: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(15, 18))
            p.addLine(to: pt(9, 12))
            p.addLine(to: pt(15, 6))
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .miter, dash: []),
    ]

    private static let chevronRight: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(9, 18))
            p.addLine(to: pt(15, 12))
            p.addLine(to: pt(9, 6))
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .miter, dash: []),
    ]

    private static let chevronUp: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(6, 15))
            p.addLine(to: pt(12, 9))
            p.addLine(to: pt(18, 15))
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .miter, dash: []),
    ]

    private static let chevronDown: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(18, 8.97))
            p.addLine(to: pt(12, 14.95))
            p.addLine(to: pt(6, 8.97))
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .miter, dash: []),
    ]

    private static let externalLink: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(6, 18))
            p.addLine(to: pt(18, 6))
            p.move(to: pt(18, 14))
            p.addLine(to: pt(18, 6))
            p.addLine(to: pt(10, 6))
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .miter, dash: []),
    ]

    private static let arrowUp: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(12, 5))
            p.addLine(to: pt(12, 19))
            p.move(to: pt(6, 10))
            p.addLine(to: pt(12, 4))
            p.addLine(to: pt(18, 10))
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .miter, dash: []),
    ]

    private static let arrowsShuffle: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(18, 21))
            p.addLine(to: pt(21, 18))
            p.addLine(to: pt(18, 15))
            p.move(to: pt(21, 18))
            p.addLine(to: pt(18.56, 18))
            p.addCurve(to: pt(16.73, 17.87), control1: pt(17.62, 18), control2: pt(17.16, 18))
            p.addCurve(to: pt(15.7, 17.31), control1: pt(16.35, 17.75), control2: pt(16, 17.56))
            p.addCurve(to: pt(14.57, 15.86), control1: pt(15.35, 17.03), control2: pt(15.09, 16.64))
            p.addLine(to: pt(14.33, 15.5))
            p.move(to: pt(18, 9))
            p.addLine(to: pt(21, 6))
            p.addLine(to: pt(18, 3))
            p.move(to: pt(21, 6))
            p.addLine(to: pt(18.56, 6))
            p.addCurve(to: pt(16.73, 6.12), control1: pt(17.62, 6), control2: pt(17.16, 6))
            p.addCurve(to: pt(15.7, 6.68), control1: pt(16.35, 6.24), control2: pt(16, 6.43))
            p.addCurve(to: pt(14.57, 8.13), control1: pt(15.35, 6.96), control2: pt(15.09, 7.35))
            p.addLine(to: pt(9.42, 15.86))
            p.addCurve(to: pt(8.29, 17.31), control1: pt(8.9, 16.64), control2: pt(8.64, 17.03))
            p.addCurve(to: pt(7.26, 17.87), control1: pt(7.99, 17.56), control2: pt(7.64, 17.75))
            p.addCurve(to: pt(5.43, 18), control1: pt(6.83, 18), control2: pt(6.37, 18))
            p.addLine(to: pt(3, 18))
            p.move(to: pt(3, 6))
            p.addLine(to: pt(5.43, 6))
            p.addCurve(to: pt(7.26, 6.12), control1: pt(6.37, 6), control2: pt(6.83, 6))
            p.addCurve(to: pt(8.29, 6.68), control1: pt(7.64, 6.24), control2: pt(7.99, 6.43))
            p.addCurve(to: pt(9.42, 8.13), control1: pt(8.64, 6.96), control2: pt(8.9, 7.35))
            p.addLine(to: pt(9.66, 8.5))
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .miter, dash: []),
    ]

    private static let plus: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(6, 12))
            p.addLine(to: pt(12, 12))
            p.move(to: pt(12, 12))
            p.addLine(to: pt(18, 12))
            p.move(to: pt(12, 12))
            p.addLine(to: pt(12, 6))
            p.move(to: pt(12, 12))
            p.addLine(to: pt(12, 18))
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .miter, dash: []),
    ]

    private static let cross: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(17, 7))
            p.addLine(to: pt(12, 12))
            p.move(to: pt(12, 12))
            p.addLine(to: pt(7, 17))
            p.move(to: pt(12, 12))
            p.addLine(to: pt(7, 7))
            p.move(to: pt(12, 12))
            p.addLine(to: pt(17, 17))
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .round, dash: []),
    ]

    private static let more: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(12, 13))
            p.addCurve(to: pt(13, 12), control1: pt(12.55, 13), control2: pt(13, 12.55))
            p.addCurve(to: pt(12, 11), control1: pt(13, 11.44), control2: pt(12.55, 11))
            p.addCurve(to: pt(11, 12), control1: pt(11.44, 11), control2: pt(11, 11.44))
            p.addCurve(to: pt(12, 13), control1: pt(11, 12.55), control2: pt(11.44, 13))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .round, lineJoin: .round, dash: []),
        YeetIconLayer(path: Path { p in
            p.move(to: pt(12, 6))
            p.addCurve(to: pt(13, 5), control1: pt(12.55, 6), control2: pt(13, 5.55))
            p.addCurve(to: pt(12, 4), control1: pt(13, 4.44), control2: pt(12.55, 4))
            p.addCurve(to: pt(11, 5), control1: pt(11.44, 4), control2: pt(11, 4.44))
            p.addCurve(to: pt(12, 6), control1: pt(11, 5.55), control2: pt(11.44, 6))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .round, lineJoin: .round, dash: []),
        YeetIconLayer(path: Path { p in
            p.move(to: pt(12, 20))
            p.addCurve(to: pt(13, 19), control1: pt(12.55, 20), control2: pt(13, 19.55))
            p.addCurve(to: pt(12, 18), control1: pt(13, 18.44), control2: pt(12.55, 18))
            p.addCurve(to: pt(11, 19), control1: pt(11.44, 18), control2: pt(11, 18.44))
            p.addCurve(to: pt(12, 20), control1: pt(11, 19.55), control2: pt(11.44, 20))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .round, lineJoin: .round, dash: []),
    ]

    private static let eye: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(2.42, 12.71))
            p.addCurve(to: pt(2.17, 12.22), control1: pt(2.28, 12.49), control2: pt(2.21, 12.38))
            p.addCurve(to: pt(2.17, 11.77), control1: pt(2.14, 12.09), control2: pt(2.14, 11.9))
            p.addCurve(to: pt(2.42, 11.28), control1: pt(2.21, 11.61), control2: pt(2.28, 11.5))
            p.addCurve(to: pt(12, 5), control1: pt(3.54, 9.5), control2: pt(6.89, 5))
            p.addCurve(to: pt(21.58, 11.28), control1: pt(17.1, 5), control2: pt(20.45, 9.5))
            p.addCurve(to: pt(21.82, 11.77), control1: pt(21.71, 11.5), control2: pt(21.78, 11.61))
            p.addCurve(to: pt(21.82, 12.22), control1: pt(21.85, 11.9), control2: pt(21.85, 12.09))
            p.addCurve(to: pt(21.58, 12.71), control1: pt(21.78, 12.38), control2: pt(21.71, 12.49))
            p.addCurve(to: pt(12, 19), control1: pt(20.45, 14.49), control2: pt(17.1, 19))
            p.addCurve(to: pt(2.42, 12.71), control1: pt(6.89, 19), control2: pt(3.54, 14.49))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .miter, dash: []),
        YeetIconLayer(path: Path { p in
            p.move(to: pt(12, 15))
            p.addCurve(to: pt(15, 12), control1: pt(13.65, 15), control2: pt(15, 13.65))
            p.addCurve(to: pt(12, 9), control1: pt(15, 10.34), control2: pt(13.65, 9))
            p.addCurve(to: pt(9, 12), control1: pt(10.34, 9), control2: pt(9, 10.34))
            p.addCurve(to: pt(12, 15), control1: pt(9, 13.65), control2: pt(10.34, 15))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .miter, dash: []),
    ]

    private static let spin: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(12, 2))
            p.addLine(to: pt(12, 6))
            p.move(to: pt(12, 18))
            p.addLine(to: pt(12, 22))
            p.move(to: pt(6, 12))
            p.addLine(to: pt(2, 12))
            p.move(to: pt(22, 12))
            p.addLine(to: pt(18, 12))
            p.move(to: pt(19.07, 19.07))
            p.addLine(to: pt(16.25, 16.25))
            p.move(to: pt(19.07, 4.99))
            p.addLine(to: pt(16.25, 7.82))
            p.move(to: pt(4.92, 19.07))
            p.addLine(to: pt(7.75, 16.25))
            p.move(to: pt(4.92, 4.99))
            p.addLine(to: pt(7.75, 7.82))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let collage: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(1.5, 1.5))
            p.addLine(to: pt(22.5, 1.5))
            p.addLine(to: pt(22.5, 22.5))
            p.addLine(to: pt(1.5, 22.5))
            p.addLine(to: pt(1.5, 1.5))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: [1.5, 1.5]),
        YeetIconLayer(path: Path { p in
            p.move(to: pt(16.17, 9.01))
            p.addLine(to: pt(16.17, 12))
            p.move(to: pt(7.82, 9.01))
            p.addLine(to: pt(7.82, 12))
            p.addLine(to: pt(7.82, 18.56))
            p.addLine(to: pt(16.17, 18.56))
            p.addLine(to: pt(16.17, 12))
            p.move(to: pt(16.17, 12))
            p.addLine(to: pt(18.56, 12))
            p.addLine(to: pt(18.56, 9.5))
            p.addCurve(to: pt(17.38, 6.63), control1: pt(18.56, 8.42), control2: pt(18.13, 7.39))
            p.addCurve(to: pt(14.5, 5.43), control1: pt(16.61, 5.86), control2: pt(15.58, 5.43))
            p.addLine(to: pt(13.78, 5.43))
            p.addCurve(to: pt(12, 6.63), control1: pt(13.78, 6.09), control2: pt(12.98, 6.63))
            p.addCurve(to: pt(10.21, 5.43), control1: pt(11.01, 6.63), control2: pt(10.21, 6.06))
            p.addLine(to: pt(9.5, 5.43))
            p.addCurve(to: pt(6.63, 6.63), control1: pt(8.42, 5.44), control2: pt(7.39, 5.87))
            p.addCurve(to: pt(5.43, 9.5), control1: pt(5.87, 7.39), control2: pt(5.44, 8.42))
            p.addLine(to: pt(5.43, 12))
            p.addLine(to: pt(7.82, 12))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let pen: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(6.68, 8.41))
            p.addLine(to: pt(10.24, 4.86))
            p.addLine(to: pt(14.69, 4.86))
            p.move(to: pt(21.25, 5.43))
            p.addLine(to: pt(19.04, 7.61))
            p.addLine(to: pt(16.38, 4.95))
            p.addLine(to: pt(18.56, 2.74))
            p.addCurve(to: pt(19.17, 2.33), control1: pt(18.73, 2.57), control2: pt(18.94, 2.43))
            p.addCurve(to: pt(19.89, 2.19), control1: pt(19.4, 2.24), control2: pt(19.64, 2.19))
            p.addCurve(to: pt(21.21, 2.74), control1: pt(20.39, 2.19), control2: pt(20.86, 2.39))
            p.addCurve(to: pt(21.76, 4.06), control1: pt(21.57, 3.09), control2: pt(21.76, 3.57))
            p.addCurve(to: pt(21.64, 4.8), control1: pt(21.77, 4.31), control2: pt(21.73, 4.57))
            p.addCurve(to: pt(21.25, 5.43), control1: pt(21.56, 5.04), control2: pt(21.42, 5.25))
            p.closeSubpath()
            p.move(to: pt(19.94, 8.5))
            p.addLine(to: pt(8.46, 19.97))
            p.addLine(to: pt(3.05, 20.95))
            p.addLine(to: pt(4.02, 15.53))
            p.addLine(to: pt(15.49, 4.05))
            p.addLine(to: pt(19.94, 8.5))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let trash: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(3.04, 5.73))
            p.addLine(to: pt(20.95, 5.73))
            p.move(to: pt(12, 8.41))
            p.addLine(to: pt(12, 19.16))
            p.move(to: pt(15.58, 8.41))
            p.addLine(to: pt(15.58, 19.16))
            p.move(to: pt(8.41, 8.41))
            p.addLine(to: pt(8.41, 19.16))
            p.move(to: pt(16.57, 21.84))
            p.addLine(to: pt(7.42, 21.84))
            p.addCurve(to: pt(6.19, 21.35), control1: pt(6.96, 21.84), control2: pt(6.52, 21.66))
            p.addCurve(to: pt(5.64, 20.15), control1: pt(5.86, 21.04), control2: pt(5.66, 20.61))
            p.addLine(to: pt(4.83, 5.73))
            p.addLine(to: pt(19.16, 5.73))
            p.addLine(to: pt(18.35, 20.15))
            p.addCurve(to: pt(17.8, 21.35), control1: pt(18.33, 20.61), control2: pt(18.13, 21.04))
            p.addCurve(to: pt(16.57, 21.84), control1: pt(17.47, 21.66), control2: pt(17.03, 21.84))
            p.closeSubpath()
            p.move(to: pt(10.2, 2.15))
            p.addLine(to: pt(13.79, 2.15))
            p.addCurve(to: pt(15.05, 2.68), control1: pt(14.26, 2.15), control2: pt(14.72, 2.34))
            p.addCurve(to: pt(15.58, 3.94), control1: pt(15.39, 3.01), control2: pt(15.58, 3.47))
            p.addLine(to: pt(15.58, 5.73))
            p.addLine(to: pt(8.41, 5.73))
            p.addLine(to: pt(8.41, 3.94))
            p.addCurve(to: pt(8.94, 2.68), control1: pt(8.41, 3.47), control2: pt(8.6, 3.01))
            p.addCurve(to: pt(10.2, 2.15), control1: pt(9.27, 2.34), control2: pt(9.73, 2.15))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let archive: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(3, 4))
            p.addLine(to: pt(21, 4))
            p.addLine(to: pt(21, 8))
            p.addLine(to: pt(3, 8))
            p.addLine(to: pt(3, 4))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
        YeetIconLayer(path: Path { p in
            p.move(to: pt(5, 8))
            p.addLine(to: pt(19, 8))
            p.addLine(to: pt(19, 20))
            p.addLine(to: pt(5, 20))
            p.addLine(to: pt(5, 8))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
        YeetIconLayer(path: Path { p in
            p.move(to: pt(10, 12))
            p.addLine(to: pt(14, 12))
            p.addLine(to: pt(14, 12.1))
            p.addLine(to: pt(10, 12.1))
            p.addLine(to: pt(10, 12))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let heart: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(16.47, 3.94))
            p.addCurve(to: pt(13.93, 4.59), control1: pt(15.58, 3.95), control2: pt(14.71, 4.17))
            p.addCurve(to: pt(12, 6.37), control1: pt(13.14, 5.02), control2: pt(12.48, 5.63))
            p.addCurve(to: pt(9.35, 4.29), control1: pt(11.36, 5.41), control2: pt(10.43, 4.68))
            p.addCurve(to: pt(5.98, 4.2), control1: pt(8.27, 3.9), control2: pt(7.09, 3.87))
            p.addCurve(to: pt(3.22, 6.12), control1: pt(4.88, 4.53), control2: pt(3.91, 5.2))
            p.addCurve(to: pt(2.15, 9.31), control1: pt(2.53, 7.05), control2: pt(2.16, 8.16))
            p.addCurve(to: pt(12, 20.05), control1: pt(2.15, 17.37), control2: pt(12, 20.05))
            p.addCurve(to: pt(21.84, 9.31), control1: pt(12, 20.05), control2: pt(21.84, 17.37))
            p.addCurve(to: pt(21.43, 7.26), control1: pt(21.84, 8.61), control2: pt(21.7, 7.91))
            p.addCurve(to: pt(20.27, 5.51), control1: pt(21.16, 6.6), control2: pt(20.77, 6.01))
            p.addCurve(to: pt(18.52, 4.35), control1: pt(19.77, 5.01), control2: pt(19.18, 4.62))
            p.addCurve(to: pt(16.47, 3.94), control1: pt(17.87, 4.08), control2: pt(17.17, 3.94))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let container: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(18.26, 14.68))
            p.addLine(to: pt(20.21, 14.68))
            p.addCurve(to: pt(21.36, 14.2), control1: pt(20.64, 14.68), control2: pt(21.05, 14.51))
            p.addCurve(to: pt(21.84, 13.05), control1: pt(21.66, 13.9), control2: pt(21.84, 13.49))
            p.addCurve(to: pt(21.59, 12.17), control1: pt(21.84, 12.74), control2: pt(21.75, 12.43))
            p.addCurve(to: pt(20.9, 11.55), control1: pt(21.42, 11.9), control2: pt(21.18, 11.69))
            p.addLine(to: pt(12, 7.52))
            p.move(to: pt(12, 7.52))
            p.addLine(to: pt(3.11, 11.55))
            p.addCurve(to: pt(2.42, 12.17), control1: pt(2.83, 11.69), control2: pt(2.59, 11.9))
            p.addCurve(to: pt(2.17, 13.05), control1: pt(2.25, 12.43), control2: pt(2.17, 12.74))
            p.addCurve(to: pt(2.65, 14.2), control1: pt(2.17, 13.49), control2: pt(2.35, 13.9))
            p.addCurve(to: pt(3.8, 14.68), control1: pt(2.96, 14.51), control2: pt(3.37, 14.68))
            p.addLine(to: pt(5.73, 14.68))
            p.move(to: pt(12, 7.52))
            p.addLine(to: pt(12, 7.31))
            p.addCurve(to: pt(12.3, 6.24), control1: pt(12.01, 6.93), control2: pt(12.12, 6.57))
            p.addCurve(to: pt(13.05, 5.43), control1: pt(12.48, 5.92), control2: pt(12.74, 5.64))
            p.addCurve(to: pt(13.65, 4.74), control1: pt(13.31, 5.26), control2: pt(13.51, 5.02))
            p.addCurve(to: pt(13.82, 3.84), control1: pt(13.78, 4.46), control2: pt(13.84, 4.15))
            p.addCurve(to: pt(13.53, 2.98), control1: pt(13.8, 3.53), control2: pt(13.7, 3.24))
            p.addCurve(to: pt(12.85, 2.37), control1: pt(13.36, 2.72), control2: pt(13.13, 2.51))
            p.addCurve(to: pt(11.96, 2.17), control1: pt(12.58, 2.23), control2: pt(12.27, 2.16))
            p.addCurve(to: pt(11.09, 2.44), control1: pt(11.65, 2.19), control2: pt(11.35, 2.28))
            p.addCurve(to: pt(10.46, 3.1), control1: pt(10.83, 2.6), control2: pt(10.61, 2.83))
            p.addCurve(to: pt(10.24, 3.99), control1: pt(10.31, 3.37), control2: pt(10.24, 3.68))
            p.move(to: pt(5.73, 14.68))
            p.addLine(to: pt(5.73, 21.84))
            p.addLine(to: pt(18.27, 21.84))
            p.addLine(to: pt(18.27, 14.72))
            p.addCurve(to: pt(17.74, 13.46), control1: pt(18.27, 14.25), control2: pt(18.08, 13.79))
            p.addCurve(to: pt(16.48, 12.93), control1: pt(17.41, 13.12), control2: pt(16.95, 12.93))
            p.addLine(to: pt(7.52, 12.93))
            p.addCurve(to: pt(6.27, 13.44), control1: pt(7.06, 12.93), control2: pt(6.61, 13.11))
            p.addCurve(to: pt(5.73, 14.68), control1: pt(5.94, 13.77), control2: pt(5.74, 14.21))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let fingersPinch: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(12.93, 21.84))
            p.addLine(to: pt(8.08, 17.02))
            p.addCurve(to: pt(7.66, 16.41), control1: pt(7.9, 16.84), control2: pt(7.76, 16.64))
            p.addCurve(to: pt(7.52, 15.68), control1: pt(7.57, 16.18), control2: pt(7.52, 15.93))
            p.addCurve(to: pt(8.07, 14.35), control1: pt(7.52, 15.18), control2: pt(7.72, 14.71))
            p.addCurve(to: pt(9.4, 13.8), control1: pt(8.42, 14), control2: pt(8.9, 13.8))
            p.addCurve(to: pt(10.12, 13.95), control1: pt(9.65, 13.8), control2: pt(9.89, 13.85))
            p.addCurve(to: pt(10.74, 14.36), control1: pt(10.35, 14.04), control2: pt(10.56, 14.18))
            p.addLine(to: pt(12, 15.58))
            p.addLine(to: pt(12, 6.73))
            p.addCurve(to: pt(12.46, 5.48), control1: pt(11.99, 6.27), control2: pt(12.15, 5.83))
            p.addCurve(to: pt(13.63, 4.85), control1: pt(12.76, 5.13), control2: pt(13.17, 4.91))
            p.addCurve(to: pt(14.39, 4.95), control1: pt(13.89, 4.83), control2: pt(14.15, 4.86))
            p.addCurve(to: pt(15.04, 5.38), control1: pt(14.64, 5.04), control2: pt(14.86, 5.19))
            p.addCurve(to: pt(15.44, 5.95), control1: pt(15.21, 5.54), control2: pt(15.35, 5.73))
            p.addCurve(to: pt(15.58, 6.63), control1: pt(15.53, 6.17), control2: pt(15.58, 6.4))
            p.addLine(to: pt(15.58, 12))
            p.addLine(to: pt(20.26, 12.67))
            p.addCurve(to: pt(21.36, 13.27), control1: pt(20.69, 12.73), control2: pt(21.08, 12.94))
            p.addCurve(to: pt(21.8, 14.44), control1: pt(21.65, 13.59), control2: pt(21.8, 14.01))
            p.addCurve(to: pt(20.1, 21.67), control1: pt(21.8, 16.95), control2: pt(21.22, 19.43))
            p.addLine(to: pt(20.01, 21.84))
            p.move(to: pt(2.15, 6.62))
            p.addLine(to: pt(2.15, 10.2))
            p.addLine(to: pt(5.73, 10.2))
            p.move(to: pt(2.15, 10.2))
            p.addLine(to: pt(5.73, 6.62))
            p.move(to: pt(10.2, 5.73))
            p.addLine(to: pt(10.2, 2.15))
            p.addLine(to: pt(6.62, 2.15))
            p.move(to: pt(10.2, 2.15))
            p.addLine(to: pt(6.62, 5.73))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let home: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(1.68, 12))
            p.addLine(to: pt(12, 3.4))
            p.addLine(to: pt(22.31, 12))
            p.move(to: pt(18.87, 9.42))
            p.addLine(to: pt(18.87, 20.59))
            p.addLine(to: pt(14.57, 20.59))
            p.addLine(to: pt(14.57, 13.71))
            p.addLine(to: pt(9.42, 13.71))
            p.addLine(to: pt(9.42, 20.59))
            p.addLine(to: pt(5.12, 20.59))
            p.addLine(to: pt(5.12, 9.42))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let searchByImage: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(3, 7))
            p.addLine(to: pt(3, 3))
            p.addLine(to: pt(7, 3))
            p.move(to: pt(7, 21))
            p.addLine(to: pt(3, 21))
            p.addLine(to: pt(3, 17))
            p.move(to: pt(17, 3))
            p.addLine(to: pt(21, 3))
            p.addLine(to: pt(21, 7))
            p.move(to: pt(21, 21))
            p.addLine(to: pt(15.5, 15.5))
            p.move(to: pt(7, 12))
            p.addCurve(to: pt(7.38, 13.91), control1: pt(7, 12.65), control2: pt(7.12, 13.3))
            p.addCurve(to: pt(8.46, 15.53), control1: pt(7.63, 14.52), control2: pt(8, 15.07))
            p.addCurve(to: pt(10.08, 16.61), control1: pt(8.92, 15.99), control2: pt(9.47, 16.36))
            p.addCurve(to: pt(12, 17), control1: pt(10.69, 16.87), control2: pt(11.34, 17))
            p.addCurve(to: pt(13.91, 16.61), control1: pt(12.65, 17), control2: pt(13.3, 16.87))
            p.addCurve(to: pt(15.53, 15.53), control1: pt(14.52, 16.36), control2: pt(15.07, 15.99))
            p.addCurve(to: pt(16.61, 13.91), control1: pt(15.99, 15.07), control2: pt(16.36, 14.52))
            p.addCurve(to: pt(17, 12), control1: pt(16.87, 13.3), control2: pt(17, 12.65))
            p.addCurve(to: pt(15.53, 8.46), control1: pt(17, 10.67), control2: pt(16.47, 9.4))
            p.addCurve(to: pt(12, 7), control1: pt(14.59, 7.52), control2: pt(13.32, 7))
            p.addCurve(to: pt(8.46, 8.46), control1: pt(10.67, 7), control2: pt(9.4, 7.52))
            p.addCurve(to: pt(7, 12), control1: pt(7.52, 9.4), control2: pt(7, 10.67))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let imageAdd: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(2.15, 2.15))
            p.addLine(to: pt(21.84, 2.15))
            p.addLine(to: pt(21.84, 21.84))
            p.addLine(to: pt(2.15, 21.84))
            p.addLine(to: pt(2.15, 2.15))
            p.closeSubpath()
            p.move(to: pt(12, 9))
            p.addLine(to: pt(18, 9))
            p.move(to: pt(15, 6))
            p.addLine(to: pt(15, 12))
            p.move(to: pt(2.15, 19.16))
            p.addLine(to: pt(8.41, 12.9))
            p.addLine(to: pt(13.79, 18.26))
            p.addLine(to: pt(17.37, 14.68))
            p.addLine(to: pt(21.84, 19.16))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let wardrobe: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(1.21, 3.93))
            p.addLine(to: pt(22.78, 3.93))
            p.move(to: pt(4.8, 21))
            p.addLine(to: pt(4.8, 16.5))
            p.move(to: pt(19.19, 21))
            p.addLine(to: pt(19.19, 16.5))
            p.move(to: pt(10.2, 12.91))
            p.addLine(to: pt(13.8, 12.91))
            p.move(to: pt(10.2, 6.62))
            p.addLine(to: pt(13.8, 6.62))
            p.move(to: pt(3.91, 10.21))
            p.addLine(to: pt(20.09, 10.21))
            p.addLine(to: pt(20.09, 16.5))
            p.addLine(to: pt(3.91, 16.5))
            p.addLine(to: pt(3.91, 10.21))
            p.closeSubpath()
            p.move(to: pt(3.91, 3.93))
            p.addLine(to: pt(20.09, 3.93))
            p.addLine(to: pt(20.09, 10.22))
            p.addLine(to: pt(3.91, 10.22))
            p.addLine(to: pt(3.91, 3.93))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let ai: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(16.46, 5.01))
            p.addLine(to: pt(19, 7.55))
            p.move(to: pt(18.75, 2.56))
            p.addLine(to: pt(21.44, 5.26))
            p.addLine(to: pt(5.26, 21.44))
            p.addLine(to: pt(2.56, 18.74))
            p.addLine(to: pt(18.75, 2.56))
            p.closeSubpath()
            p.move(to: pt(6.5, 4))
            p.addLine(to: pt(6.5, 6.49))
            p.addLine(to: pt(9, 6.5))
            p.addLine(to: pt(6.5, 6.5))
            p.addLine(to: pt(6.5, 9))
            p.addLine(to: pt(6.49, 6.5))
            p.addLine(to: pt(4, 6.5))
            p.addLine(to: pt(6.49, 6.49))
            p.addLine(to: pt(6.5, 4))
            p.closeSubpath()
            p.move(to: pt(16.5, 15))
            p.addLine(to: pt(16.5, 17.49))
            p.addLine(to: pt(19, 17.5))
            p.addLine(to: pt(16.5, 17.5))
            p.addLine(to: pt(16.5, 20))
            p.addLine(to: pt(16.49, 17.5))
            p.addLine(to: pt(14, 17.5))
            p.addLine(to: pt(16.49, 17.49))
            p.addLine(to: pt(16.5, 15))
            p.closeSubpath()
            p.move(to: pt(11.5, 1))
            p.addLine(to: pt(11.5, 2.49))
            p.addLine(to: pt(14, 2.5))
            p.addLine(to: pt(11.5, 2.5))
            p.addLine(to: pt(11.5, 5))
            p.addLine(to: pt(11.49, 2.5))
            p.addLine(to: pt(9, 2.5))
            p.addLine(to: pt(11.49, 2.49))
            p.addLine(to: pt(11.5, 1))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let camera: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(17.37, 6.62))
            p.addLine(to: pt(15.58, 3.05))
            p.addLine(to: pt(8.41, 3.05))
            p.addLine(to: pt(6.62, 6.62))
            p.addLine(to: pt(2.15, 6.62))
            p.addLine(to: pt(2.15, 20.95))
            p.addLine(to: pt(21.84, 20.95))
            p.addLine(to: pt(21.84, 6.62))
            p.addLine(to: pt(17.37, 6.62))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
        YeetIconLayer(path: Path { p in
            p.addEllipse(in: CGRect(x: 7.53, y: 8.42, width: 8.94, height: 8.94))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let search: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(21, 21))
            p.addLine(to: pt(15, 15))
            p.move(to: pt(3, 10))
            p.addCurve(to: pt(5.05, 14.94), control1: pt(3, 11.85), control2: pt(3.73, 13.63))
            p.addCurve(to: pt(10, 17), control1: pt(6.36, 16.26), control2: pt(8.14, 17))
            p.addCurve(to: pt(14.94, 14.94), control1: pt(11.85, 17), control2: pt(13.63, 16.26))
            p.addCurve(to: pt(17, 10), control1: pt(16.26, 13.63), control2: pt(17, 11.85))
            p.addCurve(to: pt(14.94, 5.05), control1: pt(17, 8.14), control2: pt(16.26, 6.36))
            p.addCurve(to: pt(10, 3), control1: pt(13.63, 3.73), control2: pt(11.85, 3))
            p.addCurve(to: pt(5.05, 5.05), control1: pt(8.14, 3), control2: pt(6.36, 3.73))
            p.addCurve(to: pt(3, 10), control1: pt(3.73, 6.36), control2: pt(3, 8.14))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let outerwear: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(12, 5.73))
            p.addLine(to: pt(15.61, 5.73))
            p.addLine(to: pt(15.61, 2.15))
            p.addLine(to: pt(14.68, 2.15))
            p.addCurve(to: pt(12.79, 2.92), control1: pt(13.97, 2.15), control2: pt(13.3, 2.43))
            p.addCurve(to: pt(12, 4.8), control1: pt(12.29, 3.42), control2: pt(12, 4.09))
            p.addLine(to: pt(12, 5.73))
            p.closeSubpath()
            p.move(to: pt(12, 5.73))
            p.addLine(to: pt(12, 21.84))
            p.move(to: pt(5.73, 20.05))
            p.addLine(to: pt(2.15, 20.05))
            p.addLine(to: pt(2.15, 14.38))
            p.addCurve(to: pt(3.78, 8.25), control1: pt(2.14, 12.22), control2: pt(2.71, 10.11))
            p.addCurve(to: pt(5.73, 6.38), control1: pt(4.26, 7.46), control2: pt(4.93, 6.82))
            p.addCurve(to: pt(8.35, 5.73), control1: pt(6.53, 5.94), control2: pt(7.43, 5.72))
            p.addLine(to: pt(15.64, 5.73))
            p.addCurve(to: pt(18.26, 6.38), control1: pt(16.56, 5.72), control2: pt(17.46, 5.94))
            p.addCurve(to: pt(20.21, 8.25), control1: pt(19.06, 6.82), control2: pt(19.73, 7.46))
            p.addCurve(to: pt(21.84, 14.38), control1: pt(21.28, 10.11), control2: pt(21.85, 12.22))
            p.addLine(to: pt(21.84, 20.05))
            p.addLine(to: pt(18.26, 20.05))
            p.move(to: pt(5.73, 11.1))
            p.addLine(to: pt(5.73, 20.05))
            p.addCurve(to: pt(5.87, 20.73), control1: pt(5.73, 20.28), control2: pt(5.78, 20.52))
            p.addCurve(to: pt(6.25, 21.32), control1: pt(5.96, 20.95), control2: pt(6.09, 21.15))
            p.addCurve(to: pt(6.84, 21.71), control1: pt(6.42, 21.48), control2: pt(6.62, 21.62))
            p.addCurve(to: pt(7.52, 21.84), control1: pt(7.05, 21.79), control2: pt(7.29, 21.84))
            p.addLine(to: pt(16.47, 21.84))
            p.addCurve(to: pt(17.15, 21.71), control1: pt(16.7, 21.84), control2: pt(16.94, 21.79))
            p.addCurve(to: pt(17.74, 21.32), control1: pt(17.37, 21.62), control2: pt(17.57, 21.48))
            p.addCurve(to: pt(18.12, 20.73), control1: pt(17.9, 21.15), control2: pt(18.03, 20.95))
            p.addCurve(to: pt(18.26, 20.05), control1: pt(18.21, 20.52), control2: pt(18.26, 20.28))
            p.addLine(to: pt(18.26, 11.1))
            p.move(to: pt(9.31, 17.37))
            p.addLine(to: pt(5.73, 17.37))
            p.move(to: pt(18.26, 17.37))
            p.addLine(to: pt(14.68, 17.37))
            p.move(to: pt(8.41, 2.15))
            p.addLine(to: pt(9.35, 2.15))
            p.addCurve(to: pt(11.22, 2.95), control1: pt(10.06, 2.16), control2: pt(10.73, 2.45))
            p.addCurve(to: pt(12, 4.83), control1: pt(11.72, 3.45), control2: pt(12, 4.13))
            p.addLine(to: pt(12, 5.77))
            p.addLine(to: pt(8.41, 5.77))
            p.addLine(to: pt(8.41, 2.15))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let top: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(18.26, 7.52))
            p.addLine(to: pt(18.26, 12))
            p.move(to: pt(18.26, 12))
            p.addLine(to: pt(18.26, 21.84))
            p.addLine(to: pt(5.73, 21.84))
            p.addLine(to: pt(5.73, 12))
            p.move(to: pt(18.26, 12))
            p.addLine(to: pt(21.84, 12))
            p.addLine(to: pt(21.84, 8.25))
            p.addCurve(to: pt(20.07, 3.94), control1: pt(21.84, 6.63), control2: pt(21.2, 5.09))
            p.addCurve(to: pt(15.75, 2.15), control1: pt(18.92, 2.8), control2: pt(17.37, 2.15))
            p.addLine(to: pt(14.68, 2.15))
            p.addCurve(to: pt(12, 3.94), control1: pt(14.68, 3.14), control2: pt(13.48, 3.94))
            p.addCurve(to: pt(9.31, 2.15), control1: pt(10.51, 3.94), control2: pt(9.31, 3.09))
            p.addLine(to: pt(8.25, 2.15))
            p.addCurve(to: pt(3.94, 3.94), control1: pt(6.63, 2.16), control2: pt(5.08, 2.8))
            p.addCurve(to: pt(2.15, 8.25), control1: pt(2.8, 5.08), control2: pt(2.16, 6.63))
            p.addLine(to: pt(2.15, 12))
            p.addLine(to: pt(5.73, 12))
            p.move(to: pt(5.73, 12))
            p.addLine(to: pt(5.73, 7.52))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let bottom: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(20.05, 5.73))
            p.addLine(to: pt(20.05, 2.15))
            p.addLine(to: pt(3.94, 2.15))
            p.addLine(to: pt(3.94, 5.73))
            p.move(to: pt(20.05, 5.73))
            p.addLine(to: pt(3.94, 5.73))
            p.move(to: pt(20.05, 5.73))
            p.addLine(to: pt(21.84, 21.84))
            p.addLine(to: pt(13.79, 21.84))
            p.addLine(to: pt(13.06, 13.77))
            p.addCurve(to: pt(12.67, 13.16), control1: pt(13, 13.53), control2: pt(12.87, 13.32))
            p.addCurve(to: pt(12, 12.93), control1: pt(12.48, 13.01), control2: pt(12.24, 12.93))
            p.addCurve(to: pt(11.3, 13.18), control1: pt(11.74, 12.93), control2: pt(11.5, 13.02))
            p.addCurve(to: pt(10.93, 13.81), control1: pt(11.11, 13.34), control2: pt(10.98, 13.57))
            p.addLine(to: pt(10.2, 21.89))
            p.addLine(to: pt(2.15, 21.89))
            p.addLine(to: pt(3.94, 5.73))
            p.move(to: pt(10.2, 5.73))
            p.addLine(to: pt(9.31, 9.31))
            p.move(to: pt(12.89, 5.73))
            p.addLine(to: pt(13.79, 9.31))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let shoe: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(10.2, 5.71))
            p.addLine(to: pt(19.4, 9.95))
            p.addCurve(to: pt(21.18, 11.5), control1: pt(20.13, 10.29), control2: pt(20.74, 10.83))
            p.addCurve(to: pt(21.84, 13.77), control1: pt(21.61, 12.18), control2: pt(21.84, 12.96))
            p.addCurve(to: pt(21.31, 15.03), control1: pt(21.84, 14.24), control2: pt(21.65, 14.7))
            p.addCurve(to: pt(20.05, 15.56), control1: pt(20.98, 15.37), control2: pt(20.52, 15.56))
            p.addLine(to: pt(3.94, 15.56))
            p.addCurve(to: pt(3.26, 15.42), control1: pt(3.71, 15.56), control2: pt(3.47, 15.51))
            p.addCurve(to: pt(2.68, 15.03), control1: pt(3.04, 15.33), control2: pt(2.84, 15.2))
            p.addCurve(to: pt(2.29, 14.45), control1: pt(2.51, 14.87), control2: pt(2.38, 14.67))
            p.addCurve(to: pt(2.15, 13.77), control1: pt(2.2, 14.24), control2: pt(2.15, 14))
            p.move(to: pt(2.15, 13.77))
            p.addLine(to: pt(2.15, 6.82))
            p.addCurve(to: pt(2.24, 6.39), control1: pt(2.15, 6.67), control2: pt(2.18, 6.53))
            p.addCurve(to: pt(2.48, 6.03), control1: pt(2.29, 6.26), control2: pt(2.37, 6.14))
            p.addCurve(to: pt(2.84, 5.8), control1: pt(2.58, 5.93), control2: pt(2.71, 5.85))
            p.addCurve(to: pt(3.27, 5.71), control1: pt(2.98, 5.74), control2: pt(3.12, 5.71))
            p.addCurve(to: pt(3.8, 5.86), control1: pt(3.45, 5.72), control2: pt(3.64, 5.77))
            p.addCurve(to: pt(4.2, 6.23), control1: pt(3.96, 5.95), control2: pt(4.1, 6.07))
            p.addCurve(to: pt(10.2, 5.71), control1: pt(5.58, 8.25), control2: pt(10.2, 7.37))
            p.move(to: pt(2.15, 13.77))
            p.addLine(to: pt(2.15, 17.34))
            p.addCurve(to: pt(2.29, 18.03), control1: pt(2.15, 17.57), control2: pt(2.2, 17.81))
            p.addCurve(to: pt(2.67, 18.61), control1: pt(2.37, 18.24), control2: pt(2.51, 18.44))
            p.addCurve(to: pt(3.26, 19), control1: pt(2.84, 18.77), control2: pt(3.04, 18.91))
            p.addCurve(to: pt(3.94, 19.13), control1: pt(3.47, 19.09), control2: pt(3.71, 19.13))
            p.addLine(to: pt(18.26, 19.13))
            p.addCurve(to: pt(20.79, 18.08), control1: pt(19.21, 19.13), control2: pt(20.12, 18.75))
            p.addCurve(to: pt(21.84, 15.56), control1: pt(21.46, 17.41), control2: pt(21.84, 16.51))
            p.addLine(to: pt(21.84, 13.77))
            p.move(to: pt(10.2, 5.71))
            p.addLine(to: pt(9.31, 3.92))
            p.move(to: pt(12, 10.19))
            p.addLine(to: pt(13.79, 7.5))
            p.move(to: pt(14.68, 11.98))
            p.addLine(to: pt(16.47, 9.29))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let accessories: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(3.01, 13.8))
            p.addLine(to: pt(8.25, 13.8))
            p.addCurve(to: pt(8.99, 13.94), control1: pt(8.5, 13.79), control2: pt(8.76, 13.84))
            p.addCurve(to: pt(9.63, 14.36), control1: pt(9.23, 14.04), control2: pt(9.45, 14.18))
            p.addCurve(to: pt(10.05, 15), control1: pt(9.81, 14.54), control2: pt(9.95, 14.76))
            p.addCurve(to: pt(10.2, 15.75), control1: pt(10.15, 15.23), control2: pt(10.2, 15.49))
            p.addLine(to: pt(10.2, 17.18))
            p.addCurve(to: pt(9.35, 19.23), control1: pt(10.19, 17.95), control2: pt(9.89, 18.68))
            p.addCurve(to: pt(7.31, 20.09), control1: pt(8.81, 19.77), control2: pt(8.07, 20.08))
            p.addLine(to: pt(5.92, 20.09))
            p.addCurve(to: pt(3.86, 19.23), control1: pt(5.15, 20.09), control2: pt(4.41, 19.78))
            p.addCurve(to: pt(3, 17.17), control1: pt(3.31, 18.69), control2: pt(3, 17.94))
            p.addLine(to: pt(3, 13.8))
            p.addLine(to: pt(3.01, 13.8))
            p.closeSubpath()
            p.move(to: pt(3.01, 13.8))
            p.addLine(to: pt(1.21, 13.8))
            p.move(to: pt(10.2, 16.49))
            p.addCurve(to: pt(10.72, 15.21), control1: pt(10.2, 16.01), control2: pt(10.38, 15.55))
            p.addCurve(to: pt(12, 14.69), control1: pt(11.06, 14.88), control2: pt(11.52, 14.69))
            p.addCurve(to: pt(13.27, 15.21), control1: pt(12.47, 14.69), control2: pt(12.93, 14.88))
            p.addCurve(to: pt(13.8, 16.49), control1: pt(13.61, 15.55), control2: pt(13.8, 16.01))
            p.move(to: pt(22.78, 13.8))
            p.addLine(to: pt(20.98, 13.8))
            p.move(to: pt(2.11, 13.8))
            p.addLine(to: pt(4.84, 6.3))
            p.addCurve(to: pt(6.16, 4.56), control1: pt(5.09, 5.59), control2: pt(5.55, 4.99))
            p.addCurve(to: pt(8.25, 3.91), control1: pt(6.77, 4.13), control2: pt(7.5, 3.91))
            p.addLine(to: pt(10.21, 3.91))
            p.move(to: pt(21.88, 13.8))
            p.addLine(to: pt(19.15, 6.3))
            p.addCurve(to: pt(17.83, 4.56), control1: pt(18.9, 5.59), control2: pt(18.44, 4.99))
            p.addCurve(to: pt(15.75, 3.9), control1: pt(17.22, 4.13), control2: pt(16.49, 3.9))
            p.addLine(to: pt(13.78, 3.9))
            p.move(to: pt(15.75, 13.8))
            p.addLine(to: pt(21, 13.8))
            p.addLine(to: pt(21, 17.17))
            p.addCurve(to: pt(20.14, 19.23), control1: pt(21, 17.94), control2: pt(20.69, 18.69))
            p.addCurve(to: pt(18.08, 20.09), control1: pt(19.59, 19.78), control2: pt(18.85, 20.09))
            p.addLine(to: pt(16.68, 20.09))
            p.addCurve(to: pt(14.62, 19.23), control1: pt(15.91, 20.09), control2: pt(15.17, 19.78))
            p.addCurve(to: pt(13.77, 17.17), control1: pt(14.07, 18.69), control2: pt(13.77, 17.94))
            p.addLine(to: pt(13.77, 15.75))
            p.addCurve(to: pt(13.92, 14.99), control1: pt(13.77, 15.49), control2: pt(13.82, 15.23))
            p.addCurve(to: pt(14.35, 14.35), control1: pt(14.01, 14.75), control2: pt(14.16, 14.54))
            p.addCurve(to: pt(14.99, 13.93), control1: pt(14.53, 14.17), control2: pt(14.75, 14.03))
            p.addCurve(to: pt(15.75, 13.8), control1: pt(15.23, 13.84), control2: pt(15.49, 13.79))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let placeholder: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(22, 12))
            p.addCurve(to: pt(12, 22), control1: pt(22, 17.52), control2: pt(17.52, 22))
            p.addCurve(to: pt(2, 12), control1: pt(6.47, 22), control2: pt(2, 17.52))
            p.addCurve(to: pt(12, 2), control1: pt(2, 6.47), control2: pt(6.47, 2))
            p.addCurve(to: pt(22, 12), control1: pt(17.52, 2), control2: pt(22, 6.47))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let check: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(18, 7.62))
            p.addLine(to: pt(9.75, 16.65))
            p.addLine(to: pt(6, 12.54))
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .miter, dash: []),
    ]

    private static let apple: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(17.04, 12.04))
            p.addCurve(to: pt(19.26, 8.13), control1: pt(17.01, 9.44), control2: pt(19.16, 8.19))
            p.addCurve(to: pt(15.49, 6.09), control1: pt(18.05, 6.36), control2: pt(16.16, 6.12))
            p.addCurve(to: pt(11.55, 7.03), control1: pt(13.89, 5.93), control2: pt(12.36, 7.03))
            p.addCurve(to: pt(8.15, 6.13), control1: pt(10.74, 7.03), control2: pt(9.48, 6.11))
            p.addCurve(to: pt(3.89, 8.71), control1: pt(6.4, 6.16), control2: pt(4.79, 7.15))
            p.addCurve(to: pt(5.19, 19.11), control1: pt(2.07, 11.87), control2: pt(3.42, 16.54))
            p.addCurve(to: pt(8.45, 21.71), control1: pt(6.06, 20.36), control2: pt(7.09, 21.77))
            p.addCurve(to: pt(11.84, 20.87), control1: pt(9.76, 21.66), control2: pt(10.25, 20.87))
            p.addCurve(to: pt(15.24, 21.69), control1: pt(13.42, 20.87), control2: pt(13.87, 21.71))
            p.addCurve(to: pt(18.39, 19.16), control1: pt(16.64, 21.66), control2: pt(17.53, 20.42))
            p.addCurve(to: pt(19.81, 16.23), control1: pt(19.38, 17.71), control2: pt(19.79, 16.3))
            p.addCurve(to: pt(17.06, 12.08), control1: pt(19.78, 16.22), control2: pt(17.09, 15.19))
            p.addLine(to: pt(17.04, 12.04))
            p.closeSubpath()
            p.move(to: pt(14.69, 4.6))
            p.addCurve(to: pt(15.76, 1.32), control1: pt(15.41, 3.73), control2: pt(15.89, 2.52))
            p.addCurve(to: pt(12.74, 2.88), control1: pt(14.73, 1.36), control2: pt(13.48, 2.01))
            p.addCurve(to: pt(11.66, 6.06), control1: pt(12.08, 3.65), control2: pt(11.5, 4.88))
            p.addCurve(to: pt(14.69, 4.6), control1: pt(12.81, 6.15), control2: pt(13.97, 5.48))
            p.closeSubpath()
        }, stroke: false, fill: true, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let thumbDown: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(6.63, 4.09))
            p.addLine(to: pt(8.72, 4.09))
            p.addLine(to: pt(10.9, 3.2))
            p.addLine(to: pt(18.33, 3.2))
            p.addCurve(to: pt(20.13, 3.9), control1: pt(19, 3.2), control2: pt(19.64, 3.45))
            p.addCurve(to: pt(21, 5.63), control1: pt(20.63, 4.35), control2: pt(20.94, 4.96))
            p.addLine(to: pt(21.83, 14.19))
            p.addLine(to: pt(21.83, 14.58))
            p.addCurve(to: pt(21.23, 16.03), control1: pt(21.83, 15.12), control2: pt(21.61, 15.64))
            p.addCurve(to: pt(19.78, 16.63), control1: pt(20.84, 16.41), control2: pt(20.32, 16.63))
            p.addLine(to: pt(15.4, 16.63))
            p.addLine(to: pt(15.89, 17.65))
            p.addCurve(to: pt(16.47, 20.21), control1: pt(16.28, 18.45), control2: pt(16.47, 19.32))
            p.addCurve(to: pt(15.69, 22.1), control1: pt(16.47, 20.92), control2: pt(16.19, 21.6))
            p.addCurve(to: pt(13.79, 22.89), control1: pt(15.18, 22.61), control2: pt(14.5, 22.89))
            p.addCurve(to: pt(13.1, 22.75), control1: pt(13.56, 22.89), control2: pt(13.32, 22.84))
            p.addCurve(to: pt(12.52, 22.37), control1: pt(12.89, 22.66), control2: pt(12.69, 22.53))
            p.addCurve(to: pt(12.13, 21.78), control1: pt(12.36, 22.2), control2: pt(12.22, 22))
            p.addCurve(to: pt(12, 21.1), control1: pt(12.04, 21.57), control2: pt(12, 21.33))
            p.addCurve(to: pt(10.83, 17.67), control1: pt(12, 19.86), control2: pt(11.59, 18.65))
            p.addLine(to: pt(8.64, 14.85))
            p.addLine(to: pt(6.63, 14.85))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
        YeetIconLayer(path: Path { p in
            p.move(to: pt(2.16, 15.73))
            p.addLine(to: pt(6.63, 15.73))
            p.addLine(to: pt(6.63, 3.2))
            p.addLine(to: pt(2.16, 3.2))
            p.addLine(to: pt(2.16, 15.73))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let undo: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(6.3, 8))
            p.addLine(to: pt(14.78, 8))
            p.addCurve(to: pt(18.47, 9.46), control1: pt(16.16, 8), control2: pt(17.49, 8.52))
            p.addCurve(to: pt(20, 13), control1: pt(19.45, 10.4), control2: pt(20, 11.67))
            p.addCurve(to: pt(18.47, 16.53), control1: pt(20, 14.32), control2: pt(19.45, 15.59))
            p.addCurve(to: pt(14.78, 18), control1: pt(17.49, 17.47), control2: pt(16.16, 18))
            p.addLine(to: pt(5, 18))
            p.move(to: pt(10, 4))
            p.addLine(to: pt(6, 8))
            p.addLine(to: pt(10, 12))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let eyeOff: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(10.74, 5.09))
            p.addCurve(to: pt(12, 5), control1: pt(11.15, 5.03), control2: pt(11.57, 5))
            p.addCurve(to: pt(21.58, 11.29), control1: pt(17.1, 5), control2: pt(20.46, 9.5))
            p.addCurve(to: pt(21.82, 11.78), control1: pt(21.72, 11.5), control2: pt(21.79, 11.61))
            p.addCurve(to: pt(21.82, 12.22), control1: pt(21.85, 11.9), control2: pt(21.85, 12.1))
            p.addCurve(to: pt(21.58, 12.72), control1: pt(21.78, 12.39), control2: pt(21.72, 12.5))
            p.addCurve(to: pt(20.22, 14.58), control1: pt(21.28, 13.19), control2: pt(20.82, 13.86))
            p.move(to: pt(6.72, 6.72))
            p.addCurve(to: pt(2.42, 11.29), control1: pt(4.56, 8.19), control2: pt(3.09, 10.22))
            p.addCurve(to: pt(2.18, 11.78), control1: pt(2.28, 11.5), control2: pt(2.22, 11.61))
            p.addCurve(to: pt(2.18, 12.22), control1: pt(2.15, 11.9), control2: pt(2.15, 12.1))
            p.addCurve(to: pt(2.42, 12.71), control1: pt(2.22, 12.39), control2: pt(2.28, 12.5))
            p.addCurve(to: pt(12, 19), control1: pt(3.55, 14.5), control2: pt(6.9, 19))
            p.addCurve(to: pt(17.28, 17.28), control1: pt(14.06, 19), control2: pt(15.83, 18.27))
            p.move(to: pt(6.72, 6.72))
            p.addLine(to: pt(3, 3))
            p.move(to: pt(6.72, 6.72))
            p.addLine(to: pt(9.88, 9.88))
            p.move(to: pt(17.28, 17.28))
            p.addLine(to: pt(21, 21))
            p.move(to: pt(17.28, 17.28))
            p.addLine(to: pt(14.12, 14.12))
            p.move(to: pt(9.88, 9.88))
            p.addCurve(to: pt(9, 12), control1: pt(9.34, 10.42), control2: pt(9, 11.17))
            p.addCurve(to: pt(12, 15), control1: pt(9, 13.66), control2: pt(10.34, 15))
            p.addCurve(to: pt(14.12, 14.12), control1: pt(12.83, 15), control2: pt(13.58, 14.66))
            p.move(to: pt(9.88, 9.88))
            p.addLine(to: pt(14.12, 14.12))
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .miter, dash: []),
    ]

    private static let bagCheck: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(7.53, 10.21))
            p.addLine(to: pt(7.53, 6.63))
            p.addCurve(to: pt(8.84, 3.47), control1: pt(7.53, 5.44), control2: pt(8, 4.3))
            p.addCurve(to: pt(12, 2.16), control1: pt(9.68, 2.63), control2: pt(10.81, 2.16))
            p.addCurve(to: pt(15.16, 3.47), control1: pt(13.19, 2.16), control2: pt(14.32, 2.63))
            p.addCurve(to: pt(16.47, 6.63), control1: pt(16, 4.3), control2: pt(16.47, 5.44))
            p.addLine(to: pt(16.47, 10.21))
            p.move(to: pt(15.69, 12.5))
            p.addLine(to: pt(11.19, 16.99))
            p.addLine(to: pt(8.5, 14.3))
            p.move(to: pt(3.95, 7.53))
            p.addLine(to: pt(20.05, 7.53))
            p.addLine(to: pt(20.05, 19.16))
            p.addCurve(to: pt(19.27, 21.06), control1: pt(20.05, 19.87), control2: pt(19.77, 20.56))
            p.addCurve(to: pt(17.37, 21.84), control1: pt(18.76, 21.56), control2: pt(18.08, 21.84))
            p.addLine(to: pt(6.63, 21.84))
            p.addCurve(to: pt(4.73, 21.06), control1: pt(5.92, 21.84), control2: pt(5.23, 21.56))
            p.addCurve(to: pt(3.95, 19.16), control1: pt(4.23, 20.56), control2: pt(3.95, 19.87))
            p.addLine(to: pt(3.95, 7.53))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let horizontalDrag: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(15, 6))
            p.addLine(to: pt(15, 18))
            p.move(to: pt(9, 6))
            p.addLine(to: pt(9, 18))
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .miter, dash: []),
    ]

    private static let info: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.addEllipse(in: CGRect(x: 3, y: 3, width: 18, height: 18))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
        YeetIconLayer(path: Path { p in
            p.move(to: pt(12, 11))
            p.addLine(to: pt(12, 16.5))
            p.move(to: pt(12, 7.5))
            p.addLine(to: pt(12, 8.2))
        }, stroke: true, fill: false, lineCap: .square, lineJoin: .miter, dash: []),
    ]

    private static let edit: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(6.53, 20.05))
            p.addLine(to: pt(2.05, 20.99))
            p.addLine(to: pt(2.98, 16.51))
            p.addLine(to: pt(16.52, 2.9))
            p.addCurve(to: pt(17.34, 2.35), control1: pt(16.76, 2.66), control2: pt(17.04, 2.47))
            p.addCurve(to: pt(18.31, 2.16), control1: pt(17.65, 2.22), control2: pt(17.98, 2.16))
            p.addCurve(to: pt(20.1, 2.9), control1: pt(18.98, 2.16), control2: pt(19.63, 2.42))
            p.addCurve(to: pt(20.84, 4.69), control1: pt(20.58, 3.37), control2: pt(20.84, 4.02))
            p.addCurve(to: pt(20.65, 5.66), control1: pt(20.84, 5.02), control2: pt(20.78, 5.35))
            p.addCurve(to: pt(20.1, 6.48), control1: pt(20.53, 5.96), control2: pt(20.34, 6.24))
            p.addLine(to: pt(6.53, 20.05))
            p.closeSubpath()
            p.move(to: pt(10, 21))
            p.addLine(to: pt(21, 21))
            p.move(to: pt(18.16, 8.42))
            p.addLine(to: pt(14.58, 4.84))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let settings: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(8, 5))
            p.addLine(to: pt(21, 5))
            p.move(to: pt(3, 5))
            p.addLine(to: pt(6, 5))
            p.move(to: pt(18, 12))
            p.addLine(to: pt(21, 12))
            p.move(to: pt(3, 12))
            p.addLine(to: pt(16, 12))
            p.move(to: pt(14, 19))
            p.addLine(to: pt(21, 19))
            p.move(to: pt(3, 19))
            p.addLine(to: pt(11, 19))
            p.move(to: pt(6, 2))
            p.addLine(to: pt(6, 8))
            p.move(to: pt(16, 9))
            p.addLine(to: pt(16, 15))
            p.move(to: pt(11, 16))
            p.addLine(to: pt(11, 22))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let logOut: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(13.77, 15.58))
            p.addLine(to: pt(13.77, 21.84))
            p.addLine(to: pt(2.13, 21.84))
            p.addLine(to: pt(2.13, 2.15))
            p.addLine(to: pt(13.77, 2.15))
            p.addLine(to: pt(13.77, 8.41))
            p.move(to: pt(8.4, 12))
            p.addLine(to: pt(20.92, 12))
            p.move(to: pt(16.45, 16.47))
            p.addLine(to: pt(20.92, 11.99))
            p.addLine(to: pt(16.45, 7.52))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let sun: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(12, 1.67))
            p.addLine(to: pt(12, 3.39))
            p.move(to: pt(12, 20.61))
            p.addLine(to: pt(12, 22.33))
            p.move(to: pt(22.33, 12))
            p.addLine(to: pt(20.61, 12))
            p.move(to: pt(3.39, 12))
            p.addLine(to: pt(1.67, 12))
            p.move(to: pt(19.3, 4.7))
            p.addLine(to: pt(18.09, 5.91))
            p.move(to: pt(5.91, 18.09))
            p.addLine(to: pt(4.7, 19.3))
            p.move(to: pt(19.3, 19.3))
            p.addLine(to: pt(18.09, 18.09))
            p.move(to: pt(5.91, 5.91))
            p.addLine(to: pt(4.7, 4.7))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
        YeetIconLayer(path: Path { p in
            p.addEllipse(in: CGRect(x: 5.97, y: 5.97, width: 12.06, height: 12.06))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let snowflake: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(12, 22.33))
            p.addLine(to: pt(12, 14.98))
            p.move(to: pt(12, 9.02))
            p.addLine(to: pt(12, 1.67))
            p.move(to: pt(15.44, 3.39))
            p.addLine(to: pt(12, 6.83))
            p.addLine(to: pt(8.56, 3.39))
            p.move(to: pt(8.56, 20.61))
            p.addLine(to: pt(12, 17.17))
            p.addLine(to: pt(15.44, 20.61))
            p.move(to: pt(20.95, 17.17))
            p.addLine(to: pt(14.59, 13.49))
            p.move(to: pt(9.42, 10.51))
            p.addLine(to: pt(3.05, 6.83))
            p.move(to: pt(6.27, 4.71))
            p.addLine(to: pt(7.53, 9.42))
            p.addLine(to: pt(2.82, 10.68))
            p.move(to: pt(17.73, 19.29))
            p.addLine(to: pt(16.47, 14.59))
            p.addLine(to: pt(21.18, 13.32))
            p.move(to: pt(3.05, 17.17))
            p.addLine(to: pt(9.42, 13.49))
            p.move(to: pt(14.59, 10.51))
            p.addLine(to: pt(20.95, 6.83))
            p.move(to: pt(17.73, 4.71))
            p.addLine(to: pt(16.47, 9.42))
            p.addLine(to: pt(21.18, 10.68))
            p.move(to: pt(6.27, 19.29))
            p.addLine(to: pt(7.53, 14.59))
            p.addLine(to: pt(2.82, 13.32))
            p.move(to: pt(14.59, 10.51))
            p.addLine(to: pt(14.59, 13.49))
            p.addLine(to: pt(12, 14.98))
            p.addLine(to: pt(9.42, 13.49))
            p.addLine(to: pt(9.42, 10.51))
            p.addLine(to: pt(12, 9.02))
            p.addLine(to: pt(14.59, 10.51))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let leaf: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(19.5, 8.69))
            p.addCurve(to: pt(19.09, 7.7), control1: pt(19.5, 8.32), control2: pt(19.35, 7.97))
            p.addCurve(to: pt(18.1, 7.29), control1: pt(18.82, 7.44), control2: pt(18.47, 7.29))
            p.addCurve(to: pt(16.69, 5.88), control1: pt(17.32, 7.3), control2: pt(16.68, 6.66))
            p.addCurve(to: pt(12.47, 1.67), control1: pt(16.69, 3.55), control2: pt(14.8, 1.67))
            p.addLine(to: pt(11.49, 1.67))
            p.addCurve(to: pt(7.28, 5.88), control1: pt(9.16, 1.67), control2: pt(7.28, 3.55))
            p.addCurve(to: pt(5.91, 7.29), control1: pt(7.28, 6.64), control2: pt(6.67, 7.27))
            p.addCurve(to: pt(4.5, 8.69), control1: pt(5.13, 7.29), control2: pt(4.5, 7.92))
            p.addCurve(to: pt(5.84, 10.55), control1: pt(4.5, 9.55), control2: pt(5.05, 10.27))
            p.addLine(to: pt(6.2, 10.67))
            p.addCurve(to: pt(7.32, 12.22), control1: pt(6.88, 10.9), control2: pt(7.32, 11.52))
            p.addCurve(to: pt(5.68, 13.85), control1: pt(7.32, 13.12), control2: pt(6.58, 13.85))
            p.addCurve(to: pt(4.35, 15.81), control1: pt(4.71, 13.86), control2: pt(4, 14.9))
            p.addCurve(to: pt(8.37, 18.54), control1: pt(5.03, 17.52), control2: pt(6.68, 18.54))
            p.addLine(to: pt(15.63, 18.54))
            p.addCurve(to: pt(19.65, 15.82), control1: pt(17.43, 18.55), control2: pt(18.99, 17.49))
            p.addCurve(to: pt(18.32, 13.86), control1: pt(20.01, 14.91), control2: pt(19.3, 13.86))
            p.addCurve(to: pt(16.69, 12.23), control1: pt(17.42, 13.86), control2: pt(16.69, 13.13))
            p.addCurve(to: pt(17.8, 10.68), control1: pt(16.68, 11.53), control2: pt(17.13, 10.91))
            p.addLine(to: pt(18.17, 10.56))
            p.addCurve(to: pt(19.5, 8.69), control1: pt(18.96, 10.29), control2: pt(19.5, 9.55))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
        YeetIconLayer(path: Path { p in
            p.move(to: pt(12, 6.36))
            p.addLine(to: pt(12, 23.23))
            p.move(to: pt(9.19, 8.23))
            p.addLine(to: pt(12, 10.11))
            p.move(to: pt(9.19, 13.85))
            p.addLine(to: pt(12, 15.73))
            p.move(to: pt(12, 12.92))
            p.addLine(to: pt(14.81, 10.11))
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]

    private static let flower: [YeetIconLayer] = [
        YeetIconLayer(path: Path { p in
            p.move(to: pt(12, 3.15))
            p.addCurve(to: pt(15.88, 7.02), control1: pt(14.14, 3.15), control2: pt(15.88, 4.88))
            p.addCurve(to: pt(15.85, 7.45), control1: pt(15.88, 7.17), control2: pt(15.87, 7.31))
            p.addCurve(to: pt(17.62, 7.02), control1: pt(16.38, 7.18), control2: pt(16.99, 7.02))
            p.addCurve(to: pt(21.5, 10.9), control1: pt(19.77, 7.02), control2: pt(21.5, 8.76))
            p.addCurve(to: pt(18.7, 14.62), control1: pt(21.5, 12.66), control2: pt(20.32, 14.15))
            p.addCurve(to: pt(19.5, 16.98), control1: pt(19.2, 15.27), control2: pt(19.5, 16.09))
            p.addCurve(to: pt(15.63, 20.85), control1: pt(19.5, 19.12), control2: pt(17.77, 20.85))
            p.addCurve(to: pt(12, 18.35), control1: pt(13.97, 20.85), control2: pt(12.55, 19.81))
            p.addCurve(to: pt(8.37, 20.85), control1: pt(11.45, 19.81), control2: pt(10.03, 20.85))
            p.addCurve(to: pt(4.5, 16.98), control1: pt(6.23, 20.85), control2: pt(4.5, 19.12))
            p.addCurve(to: pt(5.3, 14.62), control1: pt(4.5, 16.09), control2: pt(4.8, 15.27))
            p.addCurve(to: pt(2.5, 10.9), control1: pt(3.68, 14.15), control2: pt(2.5, 12.66))
            p.addCurve(to: pt(6.37, 7.02), control1: pt(2.5, 8.76), control2: pt(4.23, 7.02))
            p.addCurve(to: pt(8.15, 7.45), control1: pt(7.01, 7.02), control2: pt(7.62, 7.18))
            p.addCurve(to: pt(8.12, 7.02), control1: pt(8.13, 7.31), control2: pt(8.12, 7.17))
            p.addCurve(to: pt(12, 3.15), control1: pt(8.12, 4.88), control2: pt(9.86, 3.15))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
        YeetIconLayer(path: Path { p in
            p.move(to: pt(12, 14.85))
            p.addCurve(to: pt(14.32, 12.53), control1: pt(13.48, 14.85), control2: pt(14.32, 14.02))
            p.addCurve(to: pt(12, 10.22), control1: pt(14.32, 11.05), control2: pt(13.48, 10.22))
            p.addCurve(to: pt(9.68, 12.53), control1: pt(10.52, 10.22), control2: pt(9.68, 11.05))
            p.addCurve(to: pt(12, 14.85), control1: pt(9.68, 14.02), control2: pt(10.52, 14.85))
            p.closeSubpath()
        }, stroke: true, fill: false, lineCap: .butt, lineJoin: .miter, dash: []),
    ]
}

/// Фирменная графика: звезда штампа (`shapes / main-action`) и словесный знак `yeet`.
public enum YeetBrandPath {
    /// viewBox звезды штампа.
    public static let stampStarViewBox = CGSize(width: 144, height: 144)
    public static let stampStar: Path = Path { p in
        p.move(to: pt(67.15, 2.84))
        p.addCurve(to: pt(76.85, 2.84), control1: pt(69.27, -0.95), control2: pt(74.73, -0.95))
        p.addLine(to: pt(83.31, 14.39))
        p.addCurve(to: pt(91.01, 16.45), control1: pt(84.84, 17.12), control2: pt(88.32, 18.06))
        p.addLine(to: pt(102.38, 9.68))
        p.addCurve(to: pt(110.78, 14.54), control1: pt(106.11, 7.46), control2: pt(110.84, 10.19))
        p.addLine(to: pt(110.6, 27.77))
        p.addCurve(to: pt(116.23, 33.4), control1: pt(110.56, 30.9), control2: pt(113.11, 33.44))
        p.addLine(to: pt(129.46, 33.22))
        p.addCurve(to: pt(134.32, 41.62), control1: pt(133.81, 33.16), control2: pt(136.54, 37.89))
        p.addLine(to: pt(127.55, 52.99))
        p.addCurve(to: pt(129.61, 60.69), control1: pt(125.94, 55.68), control2: pt(126.88, 59.16))
        p.addLine(to: pt(141.16, 67.15))
        p.addCurve(to: pt(141.16, 76.85), control1: pt(144.95, 69.27), control2: pt(144.95, 74.73))
        p.addLine(to: pt(129.61, 83.31))
        p.addCurve(to: pt(127.55, 91.01), control1: pt(126.88, 84.84), control2: pt(125.94, 88.32))
        p.addLine(to: pt(134.32, 102.38))
        p.addCurve(to: pt(129.46, 110.78), control1: pt(136.54, 106.11), control2: pt(133.81, 110.84))
        p.addLine(to: pt(116.23, 110.6))
        p.addCurve(to: pt(110.6, 116.23), control1: pt(113.11, 110.56), control2: pt(110.56, 113.11))
        p.addLine(to: pt(110.78, 129.46))
        p.addCurve(to: pt(102.38, 134.32), control1: pt(110.84, 133.81), control2: pt(106.11, 136.54))
        p.addLine(to: pt(91.01, 127.55))
        p.addCurve(to: pt(83.31, 129.61), control1: pt(88.32, 125.94), control2: pt(84.84, 126.88))
        p.addLine(to: pt(76.85, 141.16))
        p.addCurve(to: pt(67.15, 141.16), control1: pt(74.73, 144.95), control2: pt(69.27, 144.95))
        p.addLine(to: pt(60.69, 129.61))
        p.addCurve(to: pt(52.99, 127.55), control1: pt(59.16, 126.88), control2: pt(55.68, 125.94))
        p.addLine(to: pt(41.62, 134.32))
        p.addCurve(to: pt(33.22, 129.46), control1: pt(37.89, 136.54), control2: pt(33.16, 133.81))
        p.addLine(to: pt(33.4, 116.23))
        p.addCurve(to: pt(27.77, 110.6), control1: pt(33.44, 113.11), control2: pt(30.9, 110.56))
        p.addLine(to: pt(14.54, 110.78))
        p.addCurve(to: pt(9.68, 102.38), control1: pt(10.19, 110.84), control2: pt(7.46, 106.11))
        p.addLine(to: pt(16.45, 91.01))
        p.addCurve(to: pt(14.39, 83.31), control1: pt(18.06, 88.32), control2: pt(17.12, 84.84))
        p.addLine(to: pt(2.84, 76.85))
        p.addCurve(to: pt(2.84, 67.15), control1: pt(-0.95, 74.73), control2: pt(-0.95, 69.27))
        p.addLine(to: pt(14.39, 60.69))
        p.addCurve(to: pt(16.45, 52.99), control1: pt(17.12, 59.16), control2: pt(18.06, 55.68))
        p.addLine(to: pt(9.68, 41.62))
        p.addCurve(to: pt(14.54, 33.22), control1: pt(7.46, 37.89), control2: pt(10.19, 33.16))
        p.addLine(to: pt(27.77, 33.4))
        p.addCurve(to: pt(33.4, 27.77), control1: pt(30.9, 33.44), control2: pt(33.44, 30.9))
        p.addLine(to: pt(33.22, 14.54))
        p.addCurve(to: pt(41.62, 9.68), control1: pt(33.16, 10.19), control2: pt(37.89, 7.46))
        p.addLine(to: pt(52.99, 16.45))
        p.addCurve(to: pt(60.69, 14.39), control1: pt(55.68, 18.06), control2: pt(59.16, 17.12))
        p.closeSubpath()
    }
    /// viewBox словесного знака (в web — "0 14 136 64", здесь сдвинут к нулю).
    public static let logoViewBox = CGSize(width: 136, height: 64)
    public static let logo: Path = Path { p in
        p.move(to: pt(130.62, 38.82))
        p.addCurve(to: pt(133, 41.2), control1: pt(132.21, 39), control2: pt(133, 39.8))
        p.addCurve(to: pt(132.12, 43.59), control1: pt(133, 41.98), control2: pt(132.71, 42.77))
        p.addCurve(to: pt(129.6, 45.57), control1: pt(131.57, 44.36), control2: pt(130.74, 45.02))
        p.addCurve(to: pt(125.66, 46.32), control1: pt(128.51, 46.07), control2: pt(127.2, 46.32))
        p.addCurve(to: pt(118.8, 43.66), control1: pt(122.76, 46.32), control2: pt(120.47, 45.43))
        p.addCurve(to: pt(116.35, 36.09), control1: pt(117.16, 41.89), control2: pt(116.35, 39.36))
        p.addLine(to: pt(116.35, 15.98))
        p.addLine(to: pt(112.68, 15.98))
        p.addCurve(to: pt(110.57, 15.3), control1: pt(111.77, 15.98), control2: pt(111.07, 15.75))
        p.addCurve(to: pt(109.89, 13.59), control1: pt(110.12, 14.84), control2: pt(109.89, 14.27))
        p.addCurve(to: pt(110.57, 11.89), control1: pt(109.89, 12.91), control2: pt(110.12, 12.34))
        p.addCurve(to: pt(113.22, 12.23), control1: pt(111.25, 12.11), control2: pt(112.14, 12.23))
        p.addLine(to: pt(116.35, 12.23))
        p.addLine(to: pt(116.35, 4.39))
        p.addCurve(to: pt(117.16, 2.68), control1: pt(116.35, 3.66), control2: pt(116.62, 3.09))
        p.addCurve(to: pt(119.41, 2), control1: pt(117.71, 2.23), control2: pt(118.46, 2))
        p.addLine(to: pt(120.43, 2))
        p.addLine(to: pt(120.43, 12.23))
        p.addLine(to: pt(127.29, 12.23))
        p.addCurve(to: pt(128.99, 12.91), control1: pt(128.06, 12.23), control2: pt(128.63, 12.45))
        p.addCurve(to: pt(129.6, 14.61), control1: pt(129.4, 13.32), control2: pt(129.6, 13.89))
        p.addCurve(to: pt(129.26, 15.98), control1: pt(129.6, 15.07), control2: pt(129.49, 15.52))
        p.addLine(to: pt(120.43, 15.98))
        p.addLine(to: pt(120.43, 36.09))
        p.addCurve(to: pt(121.85, 40.93), control1: pt(120.43, 38.18), control2: pt(120.9, 39.8))
        p.addCurve(to: pt(125.66, 42.57), control1: pt(122.85, 42.02), control2: pt(124.12, 42.57))
        p.addCurve(to: pt(129.06, 41.48), control1: pt(127.06, 42.57), control2: pt(128.2, 42.2))
        p.addCurve(to: pt(130.62, 38.82), control1: pt(129.92, 40.75), control2: pt(130.44, 39.86))
        p.closeSubpath()
        p.move(to: pt(107.79, 28.25))
        p.addCurve(to: pt(107.45, 30.98), control1: pt(107.79, 29.2), control2: pt(107.68, 30.11))
        p.addLine(to: pt(79.86, 30.77))
        p.addCurve(to: pt(84.34, 39.43), control1: pt(80.31, 34.45), control2: pt(81.81, 37.34))
        p.addCurve(to: pt(93.59, 42.57), control1: pt(86.88, 41.52), control2: pt(89.96, 42.57))
        p.addCurve(to: pt(100.25, 40.93), control1: pt(96.13, 42.57), control2: pt(98.35, 42.02))
        p.addCurve(to: pt(104.67, 36.77), control1: pt(102.15, 39.84), control2: pt(103.62, 38.45))
        p.addCurve(to: pt(106.23, 37.32), control1: pt(105.3, 36.77), control2: pt(105.82, 36.95))
        p.addCurve(to: pt(106.84, 38.48), control1: pt(106.64, 37.64), control2: pt(106.84, 38.02))
        p.addCurve(to: pt(105.21, 41.95), control1: pt(106.84, 39.57), control2: pt(106.3, 40.73))
        p.addCurve(to: pt(100.45, 45.09), control1: pt(104.12, 43.18), control2: pt(102.54, 44.23))
        p.addCurve(to: pt(93.32, 46.32), control1: pt(98.41, 45.91), control2: pt(96.03, 46.32))
        p.addCurve(to: pt(84.14, 44.07), control1: pt(89.87, 46.32), control2: pt(86.81, 45.57))
        p.addCurve(to: pt(78.02, 37.93), control1: pt(81.51, 42.57), control2: pt(79.47, 40.52))
        p.addCurve(to: pt(75.85, 29.27), control1: pt(76.57, 35.29), control2: pt(75.85, 32.41))
        p.addCurve(to: pt(78.02, 20), control1: pt(75.85, 25.77), control2: pt(76.57, 22.68))
        p.addCurve(to: pt(84, 13.79), control1: pt(79.47, 17.32), control2: pt(81.47, 15.25))
        p.addCurve(to: pt(92.5, 11.54), control1: pt(86.54, 12.29), control2: pt(89.37, 11.54))
        p.addCurve(to: pt(100.59, 13.73), control1: pt(95.58, 11.54), control2: pt(98.28, 12.27))
        p.addCurve(to: pt(105.89, 19.66), control1: pt(102.9, 15.14), control2: pt(104.67, 17.11))
        p.addCurve(to: pt(107.79, 28.25), control1: pt(107.16, 22.16), control2: pt(107.79, 25.02))
        p.closeSubpath()
        p.move(to: pt(92.16, 15.29))
        p.addCurve(to: pt(86.38, 16.79), control1: pt(90.12, 15.29), control2: pt(88.2, 15.79))
        p.addCurve(to: pt(81.9, 20.89), control1: pt(84.62, 17.75), control2: pt(83.12, 19.11))
        p.addCurve(to: pt(79.79, 27.09), control1: pt(80.72, 22.66), control2: pt(80.02, 24.73))
        p.addLine(to: pt(103.99, 26.95))
        p.addCurve(to: pt(100.59, 18.57), control1: pt(103.81, 23.5), control2: pt(102.67, 20.7))
        p.addCurve(to: pt(92.16, 15.29), control1: pt(98.5, 16.39), control2: pt(95.69, 15.29))
        p.closeSubpath()
        p.move(to: pt(71.4, 28.25))
        p.addCurve(to: pt(71.06, 30.98), control1: pt(71.4, 29.2), control2: pt(71.28, 30.11))
        p.addLine(to: pt(43.46, 30.77))
        p.addCurve(to: pt(47.95, 39.43), control1: pt(43.92, 34.45), control2: pt(45.41, 37.34))
        p.addCurve(to: pt(57.19, 42.57), control1: pt(50.49, 41.52), control2: pt(53.57, 42.57))
        p.addCurve(to: pt(63.85, 40.93), control1: pt(59.73, 42.57), control2: pt(61.95, 42.02))
        p.addCurve(to: pt(68.27, 36.77), control1: pt(65.75, 39.84), control2: pt(67.23, 38.45))
        p.addCurve(to: pt(69.83, 37.32), control1: pt(68.9, 36.77), control2: pt(69.42, 36.95))
        p.addCurve(to: pt(70.44, 38.48), control1: pt(70.24, 37.64), control2: pt(70.44, 38.02))
        p.addCurve(to: pt(68.81, 41.95), control1: pt(70.44, 39.57), control2: pt(69.9, 40.73))
        p.addCurve(to: pt(64.06, 45.09), control1: pt(67.73, 43.18), control2: pt(66.14, 44.23))
        p.addCurve(to: pt(56.92, 46.32), control1: pt(62.02, 45.91), control2: pt(59.64, 46.32))
        p.addCurve(to: pt(47.74, 44.07), control1: pt(53.48, 46.32), control2: pt(50.42, 45.57))
        p.addCurve(to: pt(41.63, 37.93), control1: pt(45.12, 42.57), control2: pt(43.08, 40.52))
        p.addCurve(to: pt(39.45, 29.27), control1: pt(40.18, 35.29), control2: pt(39.45, 32.41))
        p.addCurve(to: pt(41.63, 20), control1: pt(39.45, 25.77), control2: pt(40.18, 22.68))
        p.addCurve(to: pt(47.61, 13.79), control1: pt(43.08, 17.32), control2: pt(45.07, 15.25))
        p.addCurve(to: pt(56.1, 11.54), control1: pt(50.15, 12.29), control2: pt(52.98, 11.54))
        p.addCurve(to: pt(64.19, 13.73), control1: pt(59.18, 11.54), control2: pt(61.88, 12.27))
        p.addCurve(to: pt(69.49, 19.66), control1: pt(66.5, 15.14), control2: pt(68.27, 17.11))
        p.addCurve(to: pt(71.4, 28.25), control1: pt(70.76, 22.16), control2: pt(71.4, 25.02))
        p.closeSubpath()
        p.move(to: pt(55.76, 15.29))
        p.addCurve(to: pt(49.99, 16.79), control1: pt(53.72, 15.29), control2: pt(51.8, 15.79))
        p.addCurve(to: pt(45.5, 20.89), control1: pt(48.22, 17.75), control2: pt(46.72, 19.11))
        p.addCurve(to: pt(43.39, 27.09), control1: pt(44.32, 22.66), control2: pt(43.62, 24.73))
        p.addLine(to: pt(67.59, 26.95))
        p.addCurve(to: pt(64.19, 18.57), control1: pt(67.41, 23.5), control2: pt(66.28, 20.7))
        p.addCurve(to: pt(55.76, 15.29), control1: pt(62.11, 16.39), control2: pt(59.3, 15.29))
        p.closeSubpath()
        p.move(to: pt(36.37, 11.89))
        p.addCurve(to: pt(38.34, 13.25), control1: pt(37.68, 11.89), control2: pt(38.34, 12.34))
        p.addCurve(to: pt(38, 14.61), control1: pt(38.34, 13.7), control2: pt(38.23, 14.16))
        p.addCurve(to: pt(35.22, 15.77), control1: pt(36.73, 14.89), control2: pt(35.8, 15.27))
        p.addCurve(to: pt(33.79, 18.02), control1: pt(34.67, 16.23), control2: pt(34.2, 16.98))
        p.addLine(to: pt(20.06, 53.82))
        p.addCurve(to: pt(16.46, 60.16), control1: pt(18.93, 56.82), control2: pt(17.73, 58.93))
        p.addCurve(to: pt(11.22, 62), control1: pt(15.23, 61.39), control2: pt(13.49, 62))
        p.addCurve(to: pt(7.28, 60.7), control1: pt(9.68, 62), control2: pt(8.37, 61.57))
        p.addCurve(to: pt(5.72, 57.57), control1: pt(6.24, 59.84), control2: pt(5.72, 58.8))
        p.addCurve(to: pt(7.76, 54.16), control1: pt(5.72, 56.07), control2: pt(6.4, 54.93))
        p.addCurve(to: pt(9.18, 56.34), control1: pt(8.07, 55.07), control2: pt(8.55, 55.8))
        p.addCurve(to: pt(11.56, 57.23), control1: pt(9.86, 56.93), control2: pt(10.66, 57.23))
        p.addCurve(to: pt(14.15, 56.2), control1: pt(12.61, 57.23), control2: pt(13.47, 56.89))
        p.addCurve(to: pt(16.39, 52.45), control1: pt(14.87, 55.57), control2: pt(15.62, 54.32))
        p.addLine(to: pt(18.9, 46.18))
        p.addLine(to: pt(6.47, 15.64))
        p.addCurve(to: pt(3.82, 14.75), control1: pt(5.29, 15.41), control2: pt(4.4, 15.11))
        p.addCurve(to: pt(3, 13.25), control1: pt(3.27, 14.39), control2: pt(3, 13.89))
        p.addCurve(to: pt(3.48, 11.89), control1: pt(3, 12.7), control2: pt(3.16, 12.25))
        p.addCurve(to: pt(8.1, 12.23), control1: pt(5.15, 12.11), control2: pt(6.69, 12.23))
        p.addCurve(to: pt(11.36, 12.02), control1: pt(9.32, 12.23), control2: pt(10.41, 12.16))
        p.addCurve(to: pt(13.94, 11.89), control1: pt(12.54, 11.93), control2: pt(13.4, 11.89))
        p.addCurve(to: pt(15.91, 13.25), control1: pt(15.26, 11.89), control2: pt(15.91, 12.34))
        p.addCurve(to: pt(15.57, 14.61), control1: pt(15.91, 13.7), control2: pt(15.8, 14.16))
        p.addCurve(to: pt(11.56, 17.07), control1: pt(12.9, 14.98), control2: pt(11.56, 15.8))
        p.addCurve(to: pt(11.77, 18.02), control1: pt(11.56, 17.34), control2: pt(11.63, 17.66))
        p.addLine(to: pt(20.94, 40.86))
        p.addLine(to: pt(21.28, 40.86))
        p.addLine(to: pt(30.73, 15.64))
        p.addCurve(to: pt(27.26, 14.82), control1: pt(29.19, 15.45), control2: pt(28.03, 15.18))
        p.addCurve(to: pt(26.11, 13.25), control1: pt(26.49, 14.45), control2: pt(26.11, 13.93))
        p.addCurve(to: pt(26.58, 11.89), control1: pt(26.11, 12.7), control2: pt(26.27, 12.25))
        p.addCurve(to: pt(31.21, 12.23), control1: pt(28.26, 12.11), control2: pt(29.8, 12.23))
        p.addCurve(to: pt(34.6, 12.02), control1: pt(31.7, 12.23), control2: pt(32.84, 12.16))
        p.addCurve(to: pt(36.37, 11.89), control1: pt(35.51, 11.93), control2: pt(36.1, 11.89))
        p.closeSubpath()
    }
}
