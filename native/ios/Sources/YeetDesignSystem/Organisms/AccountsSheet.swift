import SwiftUI

/// Шторка «Аккаунты» (React: `AccountsSheet`; Figma: Profile / Accounts / Sheet / List): открывается по аватарам в шапке профиля.
/// Текущий аккаунт — «Редактировать профиль» и «Настройки», остальные — переключение, внизу «Добавить аккаунт» (Tertiary L).
/// Карточки и кнопка идут через 8. Показ — `.yeetOverlay(isPresented:) { YeetAccountsSheet(...) }`.
public struct YeetAccountsSheet: View {
    private let accounts: [YeetAccount]
    private let onEdit: (() -> Void)?
    private let onSettings: (() -> Void)?
    private let onSwitch: ((String) -> Void)?
    private let onAdd: (() -> Void)?

    /// - Parameter accounts: первый — текущий аккаунт. Один аккаунт — только он и «Добавить аккаунт».
    public init(
        accounts: [YeetAccount],
        onEdit: (() -> Void)? = nil,
        onSettings: (() -> Void)? = nil,
        onSwitch: ((String) -> Void)? = nil,
        onAdd: (() -> Void)? = nil
    ) {
        self.accounts = accounts
        self.onEdit = onEdit
        self.onSettings = onSettings
        self.onSwitch = onSwitch
        self.onAdd = onAdd
    }

    public var body: some View {
        if let current = accounts.first {
            YeetSheet(title: "Аккаунты") {
                VStack(spacing: YeetSpace.s8) {
                    YeetAccountCard(account: current, kind: .current, onEdit: onEdit, onSettings: onSettings)
                    ForEach(accounts.dropFirst()) { account in
                        YeetAccountCard(account: account, kind: .other, onClick: { onSwitch?(account.id) })
                    }
                    YeetButton("Добавить аккаунт", variant: .tertiary, size: .l, fullWidth: true) { onAdd?() }
                }
            }
        }
    }
}

#if DEBUG
#Preview("AccountsSheet") {
    ZStack(alignment: .bottom) {
        YeetColor.bgOverlay.ignoresSafeArea()
        YeetAccountsSheet(accounts: [
            YeetAccount(id: "1", name: "Анна Смирнова", email: "anna@example.com"),
            YeetAccount(id: "2", name: "Таня", email: "tanya@example.com", initial: "Т", color: .orange),
        ])
        .padding(8)
    }
}
#endif
