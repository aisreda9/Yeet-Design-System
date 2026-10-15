import SwiftUI

/// Нижний отступ закреплённых снизу панелей — `YeetBottomNav` (`bottom-nav` 967:3669) и `YeetBottomBar`
/// (`bottom-bar` 967:3694): капсула меню и кнопка стоят в **20 от края экрана**, а не в 20 над безопасной зоной.
/// Кадры 393×852 (iPhone с Face ID): капсула кончается на y 832 — внутри зоны индикатора «домой» (34).
///
/// Формула: от края — `max(20, зона − 14)`. Зона 34 (Face ID) → 20; зона 0 (кнопка «домой») → 20; будущая зона
/// больше 34 → капсула поднимается вместе с ней и не ложится на индикатор (его низ ~8–13 от края, высота ~5).
/// Панель остаётся в безопасной зоне, а вниз уходит отрицательным отступом: верх рамки панели = верх капсулы, —
/// поэтому всё, что встаёт над панелью по её высоте (отступы прокрутки, плашки), сдвигается вместе с ней.
/// С клавиатурой зона под панелью = 0 (панель над клавиатурой) → отступ 20, как прежде.
public enum YeetBottomEdge {
    /// Отступ капсулы от физического края экрана.
    public static func отКрая(безопаснаяЗона: CGFloat) -> CGFloat {
        max(YeetSpace.s20, безопаснаяЗона - 14)
    }

    /// Нижний отступ панели внутри безопасной зоны (может быть отрицательным).
    public static func отступ(безопаснаяЗона: CGFloat) -> CGFloat {
        отКрая(безопаснаяЗона: безопаснаяЗона) - безопаснаяЗона
    }
}

extension View {
    /// Нижний отступ по `YeetBottomEdge` от фактической нижней безопасной зоны панели.
    func yeetBottomEdgePadding() -> some View { modifier(BottomEdgePadding()) }
}

private struct BottomEdgePadding: ViewModifier {
    @State private var зона: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .padding(.bottom, YeetBottomEdge.отступ(безопаснаяЗона: зона))
            .onGeometryChange(for: CGFloat.self) { $0.safeAreaInsets.bottom } action: { зона = $0 }
    }
}
