import SwiftUI

/// Вкладка основной навигации (React: тип `Tab`).
public enum YeetTab: String, CaseIterable, Identifiable {
    case today, search, wardrobe, stylist, profile

    public var id: String { rawValue }

    public var label: String {
        switch self {
        case .today: return "Сегодня"
        case .search: return "Поиск"
        case .wardrobe: return "Гардероб"
        case .stylist: return "Стилист"
        case .profile: return "Профиль"
        }
    }

    /// Иконка вкладки; у «Профиля» — буква аккаунта в кружке.
    public var icon: YeetIconName? {
        switch self {
        case .today: return .home
        case .search: return .searchByImage
        case .wardrobe: return .wardrobe
        case .stylist: return .ai
        case .profile: return nil
        }
    }
}

/// Плавающий таб-бар (React: `TabBar`): 5 вкладок-иконок, под активной — пилюля `bgSubtle`, которая переезжает
/// на пружине `YeetMotion.nav`. Неактивные иконки серые. React `active` + `onChange` → `Binding`.
public struct YeetTabBar: View {
    @Binding private var active: YeetTab
    private let initial: String
    @Namespace private var pill
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// - Parameter initial: буква аккаунта на вкладке «Профиль».
    public init(active: Binding<YeetTab>, initial: String = "С") {
        self._active = active
        self.initial = initial
    }

    public var body: some View {
        HStack(spacing: 3) {
            ForEach(YeetTab.allCases) { tab in
                tabButton(tab)
            }
        }
        .padding(YeetSpace.s4)
        .frame(height: 56)
        .frame(maxWidth: .infinity)
        .background(Capsule().fill(YeetComponent.tabBarBg))
        .yeetFloatingShadow()
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text("Основная навигация"))
    }

    private func tabButton(_ tab: YeetTab) -> some View {
        let isActive = tab == active
        return Button {
            guard !isActive else { return }
            YeetHaptic.select()
            withAnimation(reduceMotion ? nil : YeetMotion.nav) { active = tab }
        } label: {
            Group {
                if let icon = tab.icon {
                    YeetIcon(name: icon)
                } else {
                    // флоу: кружок 20 с обводкой 1.3 и буквой Roboto Slab 14 (стиль Initial, 500)
                    Text(initial)
                        .font(YeetTextStyle(family: YeetFonts.display, size: 14, lineHeight: 20, tracking: 0, weight: 500, textStyle: .body).fixedFont)
                        .frame(width: 20, height: 20)
                        .overlay(Circle().strokeBorder(lineWidth: 1.3))
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .foregroundStyle(isActive ? YeetColor.textPrimary : YeetColor.textSecondary)
            .background {
                if isActive {
                    Capsule()
                        .fill(YeetColor.bgSubtle)
                        .matchedGeometryEffect(id: "tab", in: pill)
                }
            }
            .contentShape(Capsule())
        }
        .buttonStyle(YeetPressStyle())
        .accessibilityLabel(Text(tab.label))
        .accessibilityAddTraits(isActive ? [.isSelected] : [])
    }
}

/// Нижняя навигация (React: `BottomNav`): TabBar (+ FAB «+» на экранах с добавлением) на подложке с затуханием сверху.
/// При появлении FAB таб-бар сжимается и уступает место кнопке — `YeetMotion.nav` (quick).
/// Ставить через `.safeAreaInset(edge: .bottom) { YeetBottomNav(...) }`.
public struct YeetBottomNav: View {
    @Binding private var active: YeetTab
    private let fab: Bool
    private let onFab: (() -> Void)?
    private let initial: String
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    /// - Parameter fab: «+» справа (Гардероб, Вишлист).
    public init(active: Binding<YeetTab>, fab: Bool = false, onFab: (() -> Void)? = nil, initial: String = "С") {
        self._active = active
        self.fab = fab
        self.onFab = onFab
        self.initial = initial
    }

    public var body: some View {
        HStack(spacing: 7) {
            YeetTabBar(active: $active, initial: initial)
            if fab {
                YeetIconButton(icon: .plus, label: "Добавить", variant: .primary, size: .xl, floating: true) { onFab?() }
                    .transition(.scale(scale: 0.4).combined(with: .opacity))
            }
        }
        .padding(.horizontal, YeetSpace.screenGutter)
        .padding(.bottom, YeetSpace.s20)
        .animation(reduceMotion ? nil : YeetMotion.nav, value: fab)
        .background(alignment: .top) {
            VStack(spacing: 0) {
                LinearGradient(colors: [YeetColor.bgCanvas.opacity(0), YeetColor.bgCanvas], startPoint: .top, endPoint: .bottom)
                    .frame(height: 40)
                YeetColor.bgCanvas
            }
            .padding(.top, -40)
            .ignoresSafeArea(edges: .bottom)
            .allowsHitTesting(false)
            .accessibilityHidden(true)
        }
    }
}

#if DEBUG
private struct BottomNavPreview: View {
    @State private var tab: YeetTab = .wardrobe

    var body: some View {
        VStack {
            Spacer()
            YeetTabBar(active: $tab).padding(.horizontal, 20)
            YeetBottomNav(active: $tab, fab: tab == .wardrobe)
        }
        .background(YeetColor.bgCanvas)
    }
}

#Preview("TabBar / BottomNav") { BottomNavPreview() }
#endif
