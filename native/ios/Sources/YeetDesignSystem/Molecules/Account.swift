import SwiftUI

/// Аккаунт (React: тип `Account`). `photo` — готовое изображение (в React — URL).
public struct YeetAccount: Identifiable {
    public var id: String
    public var name: String
    public var email: String
    public var initial: String?
    public var photo: Image?
    public var color: YeetItemColor?

    public init(id: String, name: String, email: String, initial: String? = nil, photo: Image? = nil, color: YeetItemColor? = nil) {
        self.id = id
        self.name = name
        self.email = email
        self.initial = initial
        self.photo = photo
        self.color = color
    }

    var avatar: YeetAvatar {
        YeetAvatar(size: .m, initial: initial ?? name.first.map(String.init), src: photo, alt: name, color: color)
    }
}

/// Вид карточки аккаунта (React: `AccountCardProps.kind`, Figma: account-card · Kind).
public enum YeetAccountCardKind: String, CaseIterable, Identifiable {
    /// Текущий аккаунт в шторке «Аккаунты»: «Редактировать профиль» и «Настройки».
    case current
    /// Другой аккаунт: вся карточка — переход (chevron).
    case other
    /// Строка аккаунта в Настройках с «Выйти».
    case settings

    public var id: String { rawValue }
}

/// Карточка аккаунта 72 (React: `AccountCard`): light-grey, радиус 20, паддинг 16 / 20, аватар 40 + имя Body и почта Caption.
public struct YeetAccountCard: View {
    private let account: YeetAccount
    private let kind: YeetAccountCardKind
    private let onClick: (() -> Void)?
    private let onEdit: (() -> Void)?
    private let onSettings: (() -> Void)?
    private let onSignOut: (() -> Void)?

    public init(
        account: YeetAccount,
        kind: YeetAccountCardKind = .current,
        onClick: (() -> Void)? = nil,
        onEdit: (() -> Void)? = nil,
        onSettings: (() -> Void)? = nil,
        onSignOut: (() -> Void)? = nil
    ) {
        self.account = account
        self.kind = kind
        self.onClick = onClick
        self.onEdit = onEdit
        self.onSettings = onSettings
        self.onSignOut = onSignOut
    }

    public var body: some View {
        if kind == .other {
            Button { onClick?() } label: {
                card { YeetIcon(name: .chevronRight) }
            }
            .buttonStyle(YeetPressStyle(scale: YeetGesture.pressScaleCard))
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Text("Переключиться на \(account.name)"))
            .accessibilityAddTraits(.isButton)
        } else {
            card {
                HStack(spacing: YeetSpace.s4) {
                    if kind == .current {
                        action(.edit, label: "Редактировать профиль", onEdit)
                        action(.settings, label: "Настройки", onSettings)
                    } else {
                        action(.logOut, label: "Выйти", onSignOut)
                    }
                }
            }
        }
    }

    private func action(_ icon: YeetIconName, label: String, _ handler: (() -> Void)?) -> some View {
        YeetIconButton(icon: icon, label: label, variant: .ghost, size: .s) { handler?() }
            .sized(iconSize: 24)
    }

    private func card<Trailing: View>(@ViewBuilder trailing: () -> Trailing) -> some View {
        HStack(spacing: YeetSpace.s12) {
            account.avatar
            VStack(alignment: .leading, spacing: 2) {
                Text(account.name).yeetText(YeetType.body).lineLimit(1)
                Text(account.email).yeetText(YeetType.caption).foregroundStyle(YeetColor.textSecondary).lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .accessibilityElement(children: .combine)
            trailing()
        }
        .padding(.horizontal, YeetSpace.s20)
        .padding(.vertical, YeetSpace.s16)
        .frame(minHeight: 72)
        .foregroundStyle(YeetColor.textPrimary)
        .background(RoundedRectangle(cornerRadius: YeetComponent.cardRadius, style: .continuous).fill(YeetComponent.cardBg))
        .contentShape(RoundedRectangle(cornerRadius: YeetComponent.cardRadius, style: .continuous))
    }
}

/// Аккаунты в шапке профиля (React: `AvatarStack`, Figma: avatar-stack): аватары 40 с кольцом цвета фона 2,
/// внахлёст −8, в конце «+» Tertiary S. Нажатие на аватары открывает шторку «Аккаунты», «+» — добавление аккаунта.
public struct YeetAvatarStack: View {
    private let accounts: [YeetAccount]
    private let onOpen: (() -> Void)?
    private let onAdd: (() -> Void)?

    public init(accounts: [YeetAccount], onOpen: (() -> Void)? = nil, onAdd: (() -> Void)? = nil) {
        self.accounts = accounts
        self.onOpen = onOpen
        self.onAdd = onAdd
    }

    public var body: some View {
        HStack(spacing: -8) {
            Button { onOpen?() } label: {
                HStack(spacing: -8) {
                    ForEach(accounts) { account in
                        account.avatar.overlay(ring)
                    }
                }
            }
            .buttonStyle(YeetPressStyle())
            .yeetHitArea(height: 40)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Text("Аккаунты: \(accounts.map(\.name).joined(separator: ", "))"))
            .accessibilityAddTraits(.isButton)
            YeetIconButton(icon: .plus, label: "Добавить аккаунт", variant: .tertiary, size: .s) { onAdd?() }
                .overlay(ring.allowsHitTesting(false))
        }
    }

    /// Figma: кольцо 2 цвета фона внутри аватара 40.
    private var ring: some View {
        Circle().strokeBorder(YeetColor.bgCanvas, lineWidth: 2).accessibilityHidden(true)
    }
}

#if DEBUG
#Preview("Account") {
    let anna = YeetAccount(id: "1", name: "Анна Смирнова", email: "anna@example.com")
    let tanya = YeetAccount(id: "2", name: "Таня", email: "tanya@example.com", initial: "Т", color: .orange)
    VStack(spacing: 8) {
        YeetAvatarStack(accounts: [anna, tanya])
        YeetAccountCard(account: anna, kind: .current)
        YeetAccountCard(account: tanya, kind: .other)
        YeetAccountCard(account: anna, kind: .settings)
    }
    .padding(20)
    .background(YeetColor.bgCanvas)
}
#endif
