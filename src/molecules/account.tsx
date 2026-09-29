import { Avatar, Icon, IconButton } from '../atoms';
import { avatarColor, type ItemColor } from '../tokens/tokens';

/* ─── Account ───────────────────────────────────────────────────────── */

/** `color` — из палитры аккаунтов (tokens.avatar.palette); без него цвет выбирается по `id`. */
export type Account = { id: string; name: string; email: string; initial?: string; photo?: string; color?: ItemColor };

// Имя написано рядом с аватаром (или в aria-label кнопки), поэтому сам аватар декоративный — без повтора имени
const avatarOf = (a: Account) => <Avatar size="M" src={a.photo} initial={a.initial ?? a.name[0]} color={a.color ?? avatarColor(a.id)} />;

export type AccountCardProps = {
  account: Account;
  /**
   * Figma: account-card · Kind.
   * `current` — текущий аккаунт в шторке «Аккаунты»: «Редактировать профиль» и «Настройки».
   * `other` — другой аккаунт: вся карточка — переход (chevron).
   * `settings` — строка аккаунта в Настройках с «Выйти».
   */
  kind?: 'current' | 'other' | 'settings';
  onClick?: () => void;
  onEdit?: () => void;
  onSettings?: () => void;
  onSignOut?: () => void;
};

/** Карточка аккаунта 72: light-grey, радиус 20, паддинг 16/20, аватар 40 + имя Body и почта Caption. */
export function AccountCard({ account, kind = 'current', onClick, onEdit, onSettings, onSignOut }: AccountCardProps) {
  const text = (
    <span className="y-account__text">
      <span className="y-body">{account.name}</span>
      <span className="y-caption y-text--secondary">{account.email}</span>
    </span>
  );
  if (kind === 'other')
    return (
      <button type="button" className="y-account" onClick={onClick} aria-label={`Переключиться на ${account.name}`}>
        {avatarOf(account)}
        {text}
        <Icon name="chevron-right" />
      </button>
    );
  return (
    <div className="y-account">
      {avatarOf(account)}
      {text}
      <span className="y-account__actions">
        {kind === 'current' ? (
          <>
            <IconButton icon="edit" label="Редактировать профиль" variant="ghost" size="S" onClick={onEdit} />
            <IconButton icon="settings" label="Настройки" variant="ghost" size="S" onClick={onSettings} />
          </>
        ) : (
          <IconButton icon="log-out" label="Выйти" variant="ghost" size="S" onClick={onSignOut} />
        )}
      </span>
    </div>
  );
}

/**
 * Аккаунты в шапке профиля (Figma: avatar-stack): аватары 40 с кольцом цвета фона 2, внахлёст −8, в конце «+».
 * Нажатие на аватары открывает шторку «Аккаунты», «+» — добавление аккаунта.
 */
export function AvatarStack({ accounts, onOpen, onAdd }: { accounts: Account[]; onOpen?: () => void; onAdd?: () => void }) {
  return (
    <div className="y-avatar-stack">
      <button type="button" className="y-avatar-stack__people" onClick={onOpen} aria-label={`Аккаунты: ${accounts.map((a) => a.name).join(', ')}`}>
        {accounts.map((a) => <span key={a.id} className="y-avatar-stack__item">{avatarOf(a)}</span>)}
      </button>
      <IconButton className="y-avatar-stack__item" icon="plus" label="Добавить аккаунт" variant="tertiary" size="S" onClick={onAdd} />
    </div>
  );
}
