import SwiftUI
import UIKit

/// Нижний отступ закреплённых снизу панелей — `YeetBottomNav` (`bottom-nav` 967:3669) и `YeetBottomBar`
/// (`bottom-bar` 967:3694): капсула меню и кнопка стоят в **20 от края экрана**, а не в 20 над безопасной зоной.
/// Кадры 393×852 (iPhone с Face ID): капсула кончается на y 832 — внутри зоны индикатора «домой» (34).
///
/// Формула: от края — `max(20, зона − 14)`. Зона 34 (Face ID) → 20; зона 0 (кнопка «домой») → 20; будущая зона
/// больше 34 → капсула поднимается вместе с ней и не ложится на индикатор (его низ ~8–13 от края, высота ~5).
/// Панель остаётся в безопасной зоне, а вниз уходит отрицательным отступом: верх рамки панели = верх капсулы, —
/// поэтому всё, что встаёт над панелью по её высоте (отступы прокрутки, плашки), сдвигается вместе с ней.
/// С клавиатурой панель над ней с отступом 20, как прежде (зона под клавиатурой не считается).
public enum YeetBottomEdge {
    /// Отступ капсулы от физического края экрана.
    public static func отКрая(безопаснаяЗона: CGFloat) -> CGFloat {
        max(YeetSpace.s20, безопаснаяЗона - 14)
    }

    /// Шторка и диалог (`yeetOverlay` / `yeetDialog`): 16 от края экрана (Figma `sheet` 962:3095, `dialog` 962:3136).
    /// `max(16, зона − 18)`: Face ID (34) → 16, кнопка «домой» (0) → 16, зона больше — поднимается вместе с ней. Слой
    /// стоит над клавиатурой (её область не игнорирует), зона под ним тогда 0 → 16 над клавиатурой.
    public static func слойОтКрая(безопаснаяЗона: CGFloat) -> CGFloat {
        max(YeetOverlayToken.inset, безопаснаяЗона - 18)
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
    /// ⚠️ С клавиатурой панель стоит над ней, но её `safeAreaInsets.bottom` остаётся 34 (зона «домой» под клавиатурой) —
    /// отрицательный отступ увёл бы кнопку на 14 под клавиатуру (замер на стенде). Пока клавиатура открыта, зона = 0
    /// → отступ 20 над клавиатурой, как было до 20-от-края.
    @State private var клавиатура = false

    func body(content: Content) -> some View {
        content
            .padding(.bottom, YeetBottomEdge.отступ(безопаснаяЗона: клавиатура ? 0 : зона))
            .onGeometryChange(for: CGFloat.self) { $0.safeAreaInsets.bottom } action: { зона = $0 }
            .onReceive(NotificationCenter.default.publisher(for: UIResponder.keyboardWillShowNotification)) { _ in
                клавиатура = true
            }
            .onReceive(NotificationCenter.default.publisher(for: UIResponder.keyboardWillHideNotification)) { _ in
                клавиатура = false
            }
    }
}
