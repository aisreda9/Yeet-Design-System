import SwiftUI

/// Кнопка-иконка в шапке (React: `Action` в `HeaderProps`).
public struct YeetHeaderAction {
    public var icon: YeetIconName
    public var label: String
    public var onClick: (() -> Void)?

    public init(icon: YeetIconName, label: String, onClick: (() -> Void)? = nil) {
        self.icon = icon
        self.label = label
        self.onClick = onClick
    }
}

/// Текстовое действие: вторая строка H1 акцентом (`accent`) или ghost-кнопка справа (`textAction`).
public struct YeetHeaderTextAction {
    public var label: String
    public var onClick: (() -> Void)?

    public init(label: String, onClick: (() -> Void)? = nil) {
        self.label = label
        self.onClick = onClick
    }
}

/// Тип шапки и его свойства (React: дискриминированный `HeaderProps`, prop `type`).
///
/// | type | Где |
/// |---|---|
/// | `large` | Корневые вкладки: Гардероб, Стилист, Профиль, Поиск |
/// | `bar` | Новая вещь, Архив, Корзина, детали вещи и образа, создание образа |
/// | `back` | Вход, восстановление пароля, онбординг |
/// | `search` | Поиск, результаты, поиск по гардеробу |
public enum YeetHeaderType {
    /// `accent` — вторая строка H1 акцентом с раскрывашкой: «на каждый день ⌃» (выбор повода на главной).
    case large(title: String, subtitle: String? = nil, accent: YeetHeaderTextAction? = nil, action: YeetHeaderAction? = nil)
    /// `title` — простым текстом по центру (Настройки); `titleChip` — пилюля, `titleChipSub` — её вторая строка («8-13 сент · 5 ночей»);
    /// `center` — свой центр (шаги создания образа: `YeetSegmentControl` S с иконками).
    case bar(title: String? = nil, titleChip: String? = nil, titleChipSub: String? = nil, center: AnyView? = nil, onBack: (() -> Void)? = nil, actions: [YeetHeaderAction] = [])
    case back(title: String, onBack: (() -> Void)? = nil, textAction: YeetHeaderTextAction? = nil)
    case search(query: Binding<String>, placeholder: String = "Уточните текстом", onBack: (() -> Void)? = nil, filters: [YeetChip] = [])
}

/// Закреплённая шапка экрана (React: `Header`): сплошная подложка `bgCanvas` и полоса затухания 24 снизу —
/// контент скроллится под шапку и плавно гаснет. Статус-бар — системный (в React он только для макетов).
public struct YeetHeader: View {
    private let type: YeetHeaderType

    public init(type: YeetHeaderType) {
        self.type = type
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: YeetSpace.s8) {
            content
        }
        .padding(.top, YeetSpace.s8)
        .padding(.horizontal, YeetSpace.screenGutter)
        .padding(.bottom, bottomPadding)
        .frame(maxWidth: .infinity, alignment: .leading)
        .foregroundStyle(YeetColor.textPrimary)
        .background(YeetColor.bgCanvas)
        .overlay(alignment: .bottom) {
            LinearGradient(colors: [YeetColor.bgCanvas, YeetColor.bgCanvas.opacity(0)], startPoint: .top, endPoint: .bottom)
                .frame(height: 24)
                .offset(y: 24)
                .allowsHitTesting(false)
                .accessibilityHidden(true)
        }
        .zIndex(1)
    }

    private var bottomPadding: CGFloat {
        if case .back = type { return YeetSpace.s4 }
        return 0
    }

    @ViewBuilder
    private var content: some View {
        switch type {
        case let .large(title, subtitle, accent, action):
            large(title: title, subtitle: subtitle, accent: accent, action: action)
        case let .bar(title, titleChip, titleChipSub, center, onBack, actions):
            bar(title: title, titleChip: titleChip, titleChipSub: titleChipSub, center: center, onBack: onBack, actions: actions)
        case let .back(title, onBack, textAction):
            back(title: title, onBack: onBack, textAction: textAction)
        case let .search(query, placeholder, onBack, filters):
            search(query: query, placeholder: placeholder, onBack: onBack, filters: filters)
        }
    }

    // MARK: large

    @ViewBuilder
    private func large(title: String, subtitle: String?, accent: YeetHeaderTextAction?, action: YeetHeaderAction?) -> some View {
        HStack(spacing: YeetSpace.s8) {
            Text(title)
                .yeetText(YeetType.h1)
                .accessibilityAddTraits(.isHeader)
                .frame(maxWidth: .infinity, alignment: .leading)
            if let action {
                YeetIconButton(icon: action.icon, label: action.label) { action.onClick?() }
            }
        }
        .frame(minHeight: action == nil ? 36 : 48)
        if let accent {
            Button { accent.onClick?() } label: {
                HStack(spacing: YeetSpace.s8) {
                    Text(accent.label).yeetText(YeetType.h1).multilineTextAlignment(.leading)
                    YeetIcon(name: .chevronUpDown, size: 20)
                }
                .foregroundStyle(YeetColor.textAccent)
                .contentShape(Rectangle())
            }
            .buttonStyle(YeetPressStyle())
            .padding(.top, -YeetSpace.s8)
        }
        if let subtitle {
            Text(subtitle)
                .yeetText(YeetType.body)
                .foregroundStyle(YeetColor.textSecondary)
                .padding(.vertical, YeetSpace.s4)
        }
    }

    // MARK: bar

    private func bar(title: String?, titleChip: String?, titleChipSub: String?, center: AnyView?, onBack: (() -> Void)?, actions: [YeetHeaderAction]) -> some View {
        HStack(spacing: YeetSpace.s8) {
            YeetIconButton(icon: .chevronLeft, label: "Назад") { onBack?() }
                .frame(maxWidth: .infinity, alignment: .leading)
            barCenter(title: title, titleChip: titleChip, titleChipSub: titleChipSub, center: center)
                .layoutPriority(1)
            HStack(spacing: YeetSpace.s8) {
                ForEach(Array(actions.enumerated()), id: \.offset) { _, action in
                    YeetIconButton(icon: action.icon, label: action.label) { action.onClick?() }
                }
            }
            .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .frame(minHeight: 48)
    }

    @ViewBuilder
    private func barCenter(title: String?, titleChip: String?, titleChipSub: String?, center: AnyView?) -> some View {
        if let center {
            center
        } else if let titleChip {
            Group {
                if let titleChipSub {
                    VStack(alignment: .leading, spacing: 0) {
                        Text(titleChip).yeetText(YeetType.body)
                        Text(titleChipSub).yeetText(YeetType.caption).foregroundStyle(YeetColor.textSecondary)
                    }
                } else {
                    Text(titleChip).yeetText(YeetType.body)
                }
            }
            .lineLimit(1)
            .padding(.horizontal, YeetSpace.s20)
            .frame(minHeight: 48)
            .background(Capsule().fill(YeetComponent.buttonTertiaryBg))
            .accessibilityElement(children: .combine)
            .accessibilityAddTraits(.isHeader)
        } else if let title {
            Text(title)
                .yeetText(YeetType.body)
                .lineLimit(1)
                .truncationMode(.tail)
                .accessibilityAddTraits(.isHeader)
        }
    }

    // MARK: back

    @ViewBuilder
    private func back(title: String, onBack: (() -> Void)?, textAction: YeetHeaderTextAction?) -> some View {
        HStack(spacing: YeetSpace.s8) {
            YeetIconButton(icon: .chevronLeft, label: "Назад") { onBack?() }
            Spacer(minLength: 0)
            if let textAction {
                YeetButton(textAction.label, variant: .ghost, size: .m) { textAction.onClick?() }
            }
        }
        .frame(minHeight: 48)
        Text(title)
            .yeetText(YeetType.h1)
            .accessibilityAddTraits(.isHeader)
            .padding(.top, YeetSpace.s12)
    }

    // MARK: search

    @ViewBuilder
    private func search(query: Binding<String>, placeholder: String, onBack: (() -> Void)?, filters: [YeetChip]) -> some View {
        YeetInputBar(
            placeholder: placeholder,
            value: query,
            fieldIcon: .search,
            leading: YeetBarAction(icon: .chevronLeft, label: "Назад", onClick: onBack),
            trailing: YeetBarAction(icon: .imageAdd, label: "Поиск по фото")
        )
        if !filters.isEmpty {
            // флоу: фильтры на 20 ниже поля
            YeetChipGroup(chips: filters.map { YeetChip(label: $0.label, selected: $0.selected, colorDot: $0.colorDot, dropdown: true) })
                .padding(.top, YeetSpace.s12)
        }
    }
}

#if DEBUG
#Preview("Header") {
    ScrollView {
        VStack(spacing: 32) {
            YeetHeader(type: .large(title: "Гардероб", action: YeetHeaderAction(icon: .search, label: "Поиск")))
            YeetHeader(type: .large(title: "Образы", subtitle: "Сегодня +18°, солнечно", accent: YeetHeaderTextAction(label: "на каждый день")))
            YeetHeader(type: .bar(titleChip: "Архив вещей", actions: [YeetHeaderAction(icon: .more, label: "Ещё")]))
            YeetHeader(type: .bar(titleChip: "Тбилиси", titleChipSub: "8-13 сент · 5 ночей"))
            YeetHeader(type: .bar(title: "Настройки"))
            YeetHeader(type: .back(title: "Вход", textAction: YeetHeaderTextAction(label: "Пропустить")))
            YeetHeader(type: .search(query: .constant("Белая рубашка"), filters: [YeetChip(label: "Цена"), YeetChip(label: "Размер")]))
        }
    }
    .background(YeetColor.bgCanvas)
}
#endif
