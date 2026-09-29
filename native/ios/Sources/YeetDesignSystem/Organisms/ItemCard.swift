import SwiftUI

/// Категория вещи (React: тип `Garment`); иконка категории — одноимённая иконка ui-icons.
public enum YeetGarment: String, CaseIterable, Identifiable {
    case top, bottom, outerwear, shoe, accessories, container

    public var id: String { rawValue }

    public var icon: YeetIconName {
        switch self {
        case .top: return .top
        case .bottom: return .bottom
        case .outerwear: return .outerwear
        case .shoe: return .shoe
        case .accessories: return .accessories
        case .container: return .container
        }
    }

    public var title: String {
        switch self {
        case .top: return "Верх"
        case .bottom: return "Низ"
        case .outerwear: return "Верхняя одежда"
        case .shoe: return "Обувь"
        case .accessories: return "Аксессуары"
        case .container: return "Сумка"
        }
    }
}

/// Вещь (React: `ItemArt`): фото без фона (`src`) или иллюстрация по категории со свотчем цвета.
/// Толщина линии иллюстрации — 1.3 pt при любом размере.
public struct YeetItemArt: View {
    private let kind: YeetGarment
    private let color: YeetItemColor?
    private let size: CGFloat
    private let src: Image?
    private let alt: String

    public init(kind: YeetGarment, color: YeetItemColor? = nil, size: CGFloat = 88, src: Image? = nil, alt: String = "") {
        self.kind = kind
        self.color = color
        self.size = size
        self.src = src
        self.alt = alt
    }

    public var body: some View {
        ZStack(alignment: .bottomTrailing) {
            if let src {
                src.resizable()
                    .scaledToFit()
                    .frame(width: size, height: size)
                    .accessibilityLabel(Text(alt))
                    .accessibilityHidden(alt.isEmpty)
            } else {
                YeetIcon(name: kind.icon, size: size, strokeWidth: max(0.35, 1.3 * 24 / max(size, 1)))
                if let color {
                    YeetColorDot(color: color, size: max(10, size / 7))
                        .padding(YeetSpace.s4)
                }
            }
        }
        .frame(width: size, height: size)
    }
}

/// Карточка вещи 173 × 172 в сетке 2 колонки (React: `ItemCard`). Фото без фона на `cardBg`; карточка резиновая,
/// вещь масштабируется пропорционально ширине (88, фото 138 при 173).
///
/// Контексты: Гардероб (сетка), результаты поиска (`discount`), создание образа (`selected`), профиль (`label`).
public struct YeetItemCard: View {
    private let kind: YeetGarment
    private let color: YeetItemColor?
    private let image: Image?
    private let discount: String?
    private let label: String?
    private let name: String?
    private let selected: Bool?
    private let onClick: (() -> Void)?
    private let onRemove: (() -> Void)?
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// - Parameters:
    ///   - image: фото вещи без фона. Без него — иллюстрация по `kind`.
    ///   - discount: скидка на товаре: «-10%» (Figma: Show Discount + Discount).
    ///   - label: метка-счётчик: «30 раз», «20 дней».
    ///   - name: название для VoiceOver: «Чёрная сумка». По умолчанию — категория.
    ///   - selected: режим выбора (создание образа); `nil` — без галочки.
    ///   - onRemove: убрать вещь из образа: «×» 20 серым в правом верхнем углу.
    public init(
        kind: YeetGarment,
        color: YeetItemColor? = nil,
        image: Image? = nil,
        discount: String? = nil,
        label: String? = nil,
        name: String? = nil,
        selected: Bool? = nil,
        onClick: (() -> Void)? = nil,
        onRemove: (() -> Void)? = nil
    ) {
        self.kind = kind
        self.color = color
        self.image = image
        self.discount = discount
        self.label = label
        self.name = name
        self.selected = selected
        self.onClick = onClick
        self.onRemove = onRemove
    }

    private var accessibilityText: String {
        [name ?? kind.title, discount.map { "скидка \($0)" }, label].compactMap { $0 }.joined(separator: ", ")
    }

    private var shape: RoundedRectangle {
        RoundedRectangle(cornerRadius: YeetComponent.cardRadius, style: .continuous)
    }

    public var body: some View {
        let card = Button {
            if selected != nil { YeetHaptic.toggle() }
            onClick?()
        } label: {
            GeometryReader { proxy in
                let k = proxy.size.width / 173
                YeetItemArt(kind: kind, color: color, size: (image == nil ? 88 : 138) * k, src: image)
                    .frame(width: proxy.size.width, height: proxy.size.height)
            }
            .aspectRatio(173.0 / 172.0, contentMode: .fit)
            .overlay(alignment: .topLeading) { badge.padding(YeetSpace.s16) }
            .overlay(alignment: .topTrailing) {
                if selected == true {
                    check
                        .padding(YeetSpace.s16)
                        .transition(.scale(scale: 0.4).combined(with: .opacity))
                }
            }
            .animation(reduceMotion ? nil : YeetMotion.drop, value: selected)
            .foregroundStyle(YeetColor.textPrimary)
            .background(shape.fill(YeetComponent.cardBg))
            .clipShape(shape)
            .contentShape(shape)
        }
        .buttonStyle(YeetPressStyle(scale: YeetGesture.pressScaleCard))
        .accessibilityLabel(Text(accessibilityText))
        .accessibilityAddTraits(selected == true ? [.isSelected] : [])

        if let onRemove {
            // «×» — отдельная кнопка поверх карточки, не внутри неё
            card.overlay(alignment: .topTrailing) {
                Button(action: onRemove) {
                    YeetIcon(name: .cross, size: 20)
                        .foregroundStyle(YeetColor.textSecondary)
                        .frame(width: 44, height: 44)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .padding(YeetSpace.s4)
                .accessibilityLabel(Text("Убрать: \(accessibilityText)"))
            }
        } else {
            card
        }
    }

    @ViewBuilder
    private var badge: some View {
        if let discount {
            YeetBadge(discount, variant: .danger)
        } else if let label {
            YeetBadge(label, variant: .secondary)
        }
    }

    private var check: some View {
        YeetIcon(name: .check, size: 16, strokeWidth: 2)
            .foregroundStyle(YeetColor.textOnAccent)
            .frame(width: 24, height: 24)
            .background(Circle().fill(YeetColor.accent))
            .accessibilityHidden(true)
    }
}

#if DEBUG
#Preview("ItemCard") {
    LazyVGrid(columns: [GridItem(.flexible(), spacing: 7), GridItem(.flexible())], spacing: 7) {
        YeetItemCard(kind: .top, color: .blue)
        YeetItemCard(kind: .shoe, discount: "-10%")
        YeetItemCard(kind: .container, color: .black, label: "30 раз", name: "Чёрная сумка")
        YeetItemCard(kind: .bottom, selected: true)
        YeetItemCard(kind: .outerwear, selected: false, onRemove: {})
        YeetItemCard(kind: .accessories, color: .beige)
    }
    .padding(20)
    .background(YeetColor.bgCanvas)
}
#endif
