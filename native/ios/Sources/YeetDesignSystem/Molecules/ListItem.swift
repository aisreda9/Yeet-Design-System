import SwiftUI

/// Тип строки (React: `ListItemProps.type`, Figma: list-item · Type).
public enum YeetListItemType: String, CaseIterable, Identifiable {
    /// Действие с вещью: создать образ, редактировать, удалить.
    case action
    /// Категории одежды: шеврон вверх / вниз.
    case expandable
    /// Одиночный выбор: год рождения, страна, пол.
    case radio

    public var id: String { rawValue }
}

/// Строка списка (React: `ListItem`): высота 24, gap 12; в `YeetListGroup` — 56 (72 с описанием), паддинги 16 / 20.
/// Строка `action` без `onClick` — не кнопка (например, с кнопкой «Выйти» в `trailing`).
public struct YeetListItem: View {
    private let type: YeetListItemType
    private let label: String
    private let icon: YeetIconName?
    private let expanded: Bool
    private let checked: Bool
    private let description: String?
    private let leading: AnyView?
    private let trailing: AnyView?
    private let onClick: (() -> Void)?
    @Environment(\.yeetInListGroup) private var inGroup

    /// - Parameters:
    ///   - expanded: expandable — раскрыта ли строка.
    ///   - checked: radio — выбрана ли строка.
    ///   - description: вторая строка Caption (почта в профиле).
    ///   - leading: элемент слева вместо иконки (аватар 40).
    ///   - trailing: элемент справа (флаг страны, счётчик).
    public init(
        type: YeetListItemType = .action,
        label: String,
        icon: YeetIconName? = nil,
        expanded: Bool = false,
        checked: Bool = false,
        description: String? = nil,
        leading: AnyView? = nil,
        trailing: AnyView? = nil,
        onClick: (() -> Void)? = nil
    ) {
        self.type = type
        self.label = label
        self.icon = icon
        self.expanded = expanded
        self.checked = checked
        self.description = description
        self.leading = leading
        self.trailing = trailing
        self.onClick = onClick
    }

    public var body: some View {
        Group {
            if type == .action && onClick == nil {
                row.accessibilityElement(children: .combine)
            } else {
                Button {
                    if type == .radio && !checked { YeetHaptic.select() }
                    onClick?()
                } label: {
                    row
                }
                .buttonStyle(YeetRowStyle(highlight: inGroup))
                .modifier(YeetListHitArea(inGroup: inGroup))
                .accessibilityAddTraits(type == .radio && checked ? [.isSelected] : [])
                .accessibilityValue(accessibilityState)
            }
        }
        .overlay(alignment: .top) {
            if inGroup { YeetRowDivider() }
        }
    }

    /// Строка вне группы — 24 по высоте: зона нажатия 44 заходит в зазор 20 до соседей, вид не меняется.
    private struct YeetListHitArea: ViewModifier {
        let inGroup: Bool

        @ViewBuilder
        func body(content: Content) -> some View {
            if inGroup { content } else { content.yeetHitArea(height: 24) }
        }
    }

    private var accessibilityState: Text {
        switch type {
        case .expandable: return Text(expanded ? "развёрнуто" : "свёрнуто")
        case .radio: return Text(checked ? "выбрано" : "не выбрано")
        case .action: return Text("")
        }
    }

    private var row: some View {
        HStack(spacing: YeetSpace.s12) {
            if type == .radio {
                YeetRadio(checked: checked)
            } else if let leading {
                leading
            } else if let icon {
                YeetIcon(name: icon)
            }
            text.frame(maxWidth: .infinity, alignment: .leading)
            if type == .expandable {
                YeetIcon(name: expanded ? .chevronUp : .chevronDown, size: inGroup ? 20 : 24)
            } else if let trailing {
                trailing
            }
        }
        .frame(minHeight: 24)
        .padding(.vertical, inGroup ? YeetSpace.s16 : 0)
        .padding(.horizontal, inGroup ? YeetSpace.s20 : 0)
        .frame(minHeight: inGroup ? (description == nil ? 56 : 72) : 0)
        .foregroundStyle(YeetColor.textPrimary)
        .contentShape(Rectangle())
    }

    @ViewBuilder
    private var text: some View {
        if let description {
            VStack(alignment: .leading, spacing: 2) {
                Text(label).yeetText(YeetType.body)
                Text(description).yeetText(YeetType.caption).foregroundStyle(YeetColor.textSecondary)
            }
        } else {
            Text(label).yeetText(YeetType.body)
        }
    }
}

/// Радио: круг 24 `bgSubtle`; выбран — синий круг с галочкой (не точка).
struct YeetRadio: View {
    let checked: Bool

    var body: some View {
        ZStack {
            Circle().fill(checked ? YeetColor.accent : YeetColor.bgSubtle)
            if checked {
                YeetIcon(name: .check, size: 16).foregroundStyle(YeetColor.textOnAccent)
            }
        }
        .frame(width: 24, height: 24)
        .accessibilityHidden(true)
    }
}

/// Вертикальный список строк с gap 20 (React: `List`).
public struct YeetList<Content: View>: View {
    private let content: Content

    public init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: YeetSpace.s20) { content }
    }
}

/// Группа строк-переходов на карточке с разделителями (React: `ListGroup`): «Корзина вещей →», «Язык ↗».
/// Для пар «ключ — значение» — `YeetInputGroup` + `YeetField`.
public struct YeetListGroup<Content: View>: View {
    private let content: Content

    public init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    public var body: some View {
        VStack(spacing: 0) { content }
            .environment(\.yeetInListGroup, true)
            .frame(maxWidth: .infinity)
            .background(YeetComponent.cardBg)
            // Разделитель рисует каждая строка сверху; у первой он закрыт полосой фона карточки
            .overlay(alignment: .top) { YeetComponent.cardBg.frame(height: 1).accessibilityHidden(true) }
            .clipShape(RoundedRectangle(cornerRadius: YeetComponent.cardRadius, style: .continuous))
    }
}

#if DEBUG
private struct ListPreview: View {
    @State private var year = "1995"
    @State private var open = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                YeetList {
                    YeetListItem(label: "Создать образ", icon: .collage, onClick: {})
                    YeetListItem(label: "Редактировать", icon: .edit, onClick: {})
                    YeetListItem(label: "Удалить", icon: .trash, onClick: {})
                    YeetListItem(type: .expandable, label: "Верх", expanded: open, onClick: { open.toggle() })
                    ForEach(["1994", "1995", "1996"], id: \.self) { y in
                        YeetListItem(type: .radio, label: y, checked: year == y, onClick: { year = y })
                    }
                }
                YeetListGroup {
                    YeetListItem(label: "Корзина вещей", trailing: AnyView(YeetIcon(name: .chevronRight, size: 20)), onClick: {})
                    YeetListItem(label: "Язык", trailing: AnyView(YeetIcon(name: .externalLink, size: 20)), onClick: {})
                    YeetListItem(label: "Анна", description: "anna@example.com", leading: AnyView(YeetAvatar(initial: "А")))
                }
            }
            .padding(20)
        }
        .background(YeetColor.bgCanvas)
    }
}

#Preview("ListItem · Light") { ListPreview().preferredColorScheme(.light) }
#Preview("ListItem · Dark") { ListPreview().preferredColorScheme(.dark) }
#endif
