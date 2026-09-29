import { Button } from '../atoms';
import { AccountCard, type Account } from '../molecules';
import { haptic } from '../utils/haptic';
import { Sheet, type SheetProps } from './overlays';

/* ─── Profile ───────────────────────────────────────────────────────── */

export type AccountsSheetProps = Omit<SheetProps, 'title' | 'description' | 'footer' | 'children' | 'variant' | 'type'> & {
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
/** `ref`, `className` и атрибуты — на шторку (`Sheet`). */
export function AccountsSheet({ accounts, onEdit, onSettings, onSwitch, onAdd, ...rest }: AccountsSheetProps) {
  const [current, ...others] = accounts;
  if (!current) return null;
  return (
    <Sheet title="Аккаунты" {...rest}>
      <div className="y-stack-8">
        <AccountCard account={current} kind="current" onEdit={onEdit} onSettings={onSettings} />
        {others.map((a) => <AccountCard key={a.id} account={a} kind="other" onClick={() => { haptic('select'); onSwitch?.(a.id); }} />)}
        <Button variant="tertiary" size="L" fullWidth onClick={onAdd}>Добавить аккаунт</Button>
      </div>
    </Sheet>
  );
}
