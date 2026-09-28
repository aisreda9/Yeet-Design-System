import type { ReactNode } from 'react';
import { Button, Icon } from '../atoms';
import type { IconName } from '../icons/icons';

/* ─── Hint ──────────────────────────────────────────────────────────── */

/** Подсказка поверх холста или фото: пилюля `elevated` с тенью. */
export function Hint({ icon = 'fingers-pinch', children }: { icon?: IconName; children: ReactNode }) {
  return (
    <span className="y-hint" role="note">
      <Icon name={icon} size={16} />
      {children}
    </span>
  );
}

/* ─── Snackbar ──────────────────────────────────────────────────────── */

/** Тост-подтверждение над нижней навигацией. Инвертированный фон, исчезает сам. */
export function Snackbar({ children, onClose, onUndo }: { children: ReactNode; onClose?: () => void; /** «Отменить» — изогнутая стрелка справа (флоу: «Вещь перемещена в архив»). */ onUndo?: () => void }) {
  return (
    <div className="y-snackbar" role="status">
      <span>{children}</span>
      {onUndo && (
        <button type="button" aria-label="Отменить" onClick={onUndo}>
          <Icon name="undo" />
        </button>
      )}
      {onClose && (
        <button type="button" aria-label="Закрыть" onClick={onClose}>
          <Icon name="cross" />
        </button>
      )}
    </div>
  );
}

/* ─── EmptyState ────────────────────────────────────────────────────── */

/** Пустое состояние и «ничего не найдено». Ставится по центру свободной области экрана. */
export function EmptyState({ title, description, action }: { title: string; description: ReactNode; /** Кнопка L через 32: «Добавить вещь» (primary), «Сбросить фильтры» (tertiary, по умолчанию). */ action?: { label: string; variant?: 'primary' | 'tertiary'; onClick?: () => void } }) {
  return (
    <div className="y-empty">
      <h2 className="y-h1 y-text--primary">{title}</h2>
      <p className="y-body y-text--secondary">{description}</p>
      {action && (
        <Button variant={action.variant ?? 'tertiary'} size="L" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

/* ─── LoadingState ──────────────────────────────────────────────────── */

/** Загрузка внутри области: крутящаяся `spin` + подпись. */
export function LoadingState({ label }: { label: string }) {
  return (
    <span className="y-loading" role="status" aria-live="polite">
      <Icon name="spin" />
      {label}
    </span>
  );
}

/* ─── PhotoTile ─────────────────────────────────────────────────────── */

/** Плитка выбора источника фото в Photo sheet. */
export function PhotoTile({ source, label, onClick }: { source: 'gallery' | 'camera'; label?: string; onClick?: () => void }) {
  return (
    <button type="button" className="y-photo-tile" onClick={onClick}>
      <span className="y-photo-tile__art" aria-hidden>
        <Icon name={source === 'camera' ? 'camera' : 'collage'} size={48} strokeWidth={1} />
      </span>
      {label ?? (source === 'camera' ? <>Сделать<br />фото</> : <>Выбрать<br />из галереи</>)}
    </button>
  );
}
