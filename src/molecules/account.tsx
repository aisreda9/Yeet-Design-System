import type { ComponentPropsWithRef, Ref } from 'react';
import { Avatar, Icon, IconButton, type AvatarColor } from '../atoms';
import { cx } from '../utils/cx';
import { avatarColor } from '../tokens/tokens';

/* ─── Account ───────────────────────────────────────────────────────── */

/** `color` — из палитры аккаунтов (tokens.avatar.palette); без него цвет выбирается по `id`. */
export type Account = { id: string; name: string; email: string; initial?: string; photo?: string; color?: AvatarColor };

// Имя написано рядом с аватаром (или в aria-label кнопки), поэтому сам аватар декоративный — без повтора имени
const avatarOf = (a: Account) => <Avatar size="M" src={a.photo} initial={a.initial ?? a.name[0]} color={a.color ?? (avatarColor(a.id) as AvatarColor)} />;

export type AccountCardProps = Omit<ComponentPropsWithRef<'div'>, 'ref' | 'children' | 'onClick'> & {
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
  /** `button` у `kind="other"`, `div` у остальных. */
  ref?: Ref<HTMLElement>;
};

/** Карточка аккаунта 72: light-grey, радиус 20, паддинг 16/20, аватар 40 + имя Body и почта Caption. */
export function AccountCard({ account, kind = 'current', onClick, onEdit, onSettings, onSignOut, className, ref, ...rest }: AccountCardProps) {
  const text = (
    <span className="y-account__text">
      <span className="y-body">{account.name}</span>
      <span className="y-caption y-text--secondary">{account.email}</span>
    </span>
  );
  if (kind === 'other')
    return (
      <button ref={ref as Ref<HTMLButtonElement>} type="button" className={cx('y-account', className)} onClick={onClick} aria-label={`Переключиться на ${account.name}`} {...(rest as ComponentPropsWithRef<'button'>)}>
        {avatarOf(account)}
        {text}
        <Icon name="chevron-right" />
      </button>
    );
  return (
    <div ref={ref as Ref<HTMLDivElement>} className={cx('y-account', className)} {...rest}>
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
export type AvatarStackProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & { accounts: Account[]; onOpen?: () => void; onAdd?: () => void };

export function AvatarStack({ accounts, onOpen, onAdd, className, ...rest }: AvatarStackProps) {
  return (
    <div className={cx('y-avatar-stack', className)} {...rest}>
      <button type="button" className="y-avatar-stack__people" onClick={onOpen} aria-label={`Аккаунты: ${accounts.map((a) => a.name).join(', ')}`}>
        {accounts.map((a) => <span key={a.id} className="y-avatar-stack__item">{avatarOf(a)}</span>)}
      </button>
      <IconButton className="y-avatar-stack__item" icon="plus" label="Добавить аккаунт" variant="tertiary" size="S" onClick={onAdd} />
    </div>
  );
}
