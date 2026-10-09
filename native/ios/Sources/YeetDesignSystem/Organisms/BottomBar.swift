import SwiftUI

/// Закреплённая нижняя кнопка (CTA) поверх контента (React: `BottomBar`): «Добавить», «Создать образ», «Переместить в гардероб».
/// Главная кнопка Primary L на всю ширину, справа опционально — вторичное действие `IconButton` Secondary L, зазор 7.
/// Поля — `screenGutter` по бокам и 20 снизу; подложка `bgCanvas` до низа экрана с полосой затухания 24 сверху.
/// Ставится в `.safeAreaInset(edge: .bottom)` экрана или в `YeetDetailsScreen(bottom:)`.
public struct YeetBottomBar: View {
    private let label: String
    private let disabled: Bool
    private let secondary: YeetHeaderAction?
    private let onClick: (() -> Void)?

    /// - Parameters:
    ///   - onClick: нажатие главной кнопки (не всей панели).
    ///   - secondary: вторичное действие справа (React: `secondary: Action`).
    ///   - disabled: главная кнопка недоступна.
    public init(label: String, disabled: Bool = false, secondary: YeetHeaderAction? = nil, onClick: (() -> Void)? = nil) {
        self.label = label
        self.disabled = disabled
        self.secondary = secondary
        self.onClick = onClick
    }

    public var body: some View {
        HStack(spacing: 7) {
            YeetButton(label, variant: .primary, size: .l, fullWidth: true) { onClick?() }
                .disabled(disabled)
            if let secondary {
                YeetIconButton(icon: secondary.icon, label: secondary.label, variant: .secondary, size: .l) { secondary.onClick?() }
            }
        }
        .padding(.horizontal, YeetSpace.screenGutter)
        .padding(.bottom, YeetSpace.s20)
        .background(alignment: .top) {
            VStack(spacing: 0) {
                LinearGradient(colors: [YeetColor.bgCanvas.opacity(0), YeetColor.bgCanvas], startPoint: .top, endPoint: .bottom)
                    .frame(height: 24)
                YeetColor.bgCanvas
            }
            .padding(.top, -24)
            .ignoresSafeArea(edges: .bottom)
            .allowsHitTesting(false)
            .accessibilityHidden(true)
        }
    }
}

#if DEBUG
private struct BottomBarPreview: View {
    var body: some View {
        VStack(spacing: 0) {
            Spacer()
            YeetBottomBar(label: "Создать образ", secondary: YeetHeaderAction(icon: .trash, label: "Удалить"))
            YeetBottomBar(label: "Добавить")
            YeetBottomBar(label: "Переместить в гардероб", disabled: true)
        }
        .background(YeetColor.bgCanvas)
    }
}

#Preview("BottomBar · Light") { BottomBarPreview().preferredColorScheme(.light) }
#Preview("BottomBar · Dark") { BottomBarPreview().preferredColorScheme(.dark) }
#endif
