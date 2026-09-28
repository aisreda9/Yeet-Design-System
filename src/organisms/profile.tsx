import { Button } from '../atoms';
import { AccountCard, type Account } from '../molecules';
import { Sheet } from './overlays';

/* ─── Profile ───────────────────────────────────────────────────────── */

export type AccountsSheetProps = {
  /** Первый — текущий аккаунт. Один аккаунт — только он и «Добавить аккаунт». */
  accounts: Account[];
  onEdit?: () => void;
  onSettings?: () => void;
  onSwitch?: (id: string) => void;
  onAdd?: () => void;
};

/**
 * Шторка «Аккаунты» (Figma: Profile / Accounts / Sheet / List): открывается по аватарам в шапке профиля.
 * Текущий аккаунт — «Редактировать профиль» и «Настройки», остальные — переключение, внизу «Добавить аккаунт» (Tertiary L).
 * Карточки и кнопка идут через 8.
 */
export function AccountsSheet({ accounts, onEdit, onSettings, onSwitch, onAdd }: AccountsSheetProps) {
  const [current, ...others] = accounts;
  return (
    <Sheet title="Аккаунты">
      <div className="y-stack-8">
        <AccountCard account={current} kind="current" onEdit={onEdit} onSettings={onSettings} />
        {others.map((a) => <AccountCard key={a.id} account={a} kind="other" onClick={() => onSwitch?.(a.id)} />)}
        <Button variant="tertiary" size="L" fullWidth onClick={onAdd}>Добавить аккаунт</Button>
      </div>
    </Sheet>
  );
}
