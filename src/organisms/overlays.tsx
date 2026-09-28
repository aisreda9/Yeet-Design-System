import type { ReactNode } from 'react';
import { Button, IconButton, type ButtonStyle } from '../atoms';
import { cx } from '../utils/cx';

/* ─── Sheet & Dialog ────────────────────────────────────────────────── */

type FooterAction = { label: string; variant?: ButtonStyle; onClick?: () => void };

function Footer({ actions }: { actions: [FooterAction, FooterAction] }) {
  return (
    <div className="y-sheet__footer">
      {actions.map((a, i) => (
        <Button key={a.label} variant={a.variant ?? (i === 0 ? 'tertiary' : 'primary')} size="L" onClick={a.onClick}>
          {a.label}
        </Button>
      ))}
    </div>
  );
}

export type SheetProps = {
  title?: string;
  /**
   * `modal` — плавающая карточка поверх overlay: отступ 8 от краёв экрана, радиус 32 сверху и 48 снизу (концентрично углу экрана).
   * `panel` — постоянная панель деталей во всю ширину, 32 сверху, с тенью.
   */
  type?: 'modal' | 'panel';
  footer?: [FooterAction, FooterAction];
  /** Крестик справа от заголовка вместо хэндла: высокая шторка со своим скроллом (Outfit Creation / Item Filter). */
  onClose?: () => void;
  children?: ReactNode;
};

/**
 * Bottom sheet — основа всех выборов, действий и фильтров. Всё временное открывается sheet'ом, а не новым экраном.
 * Хэндл → 16 → заголовок H3 → 12 → контент → 16 → пара кнопок L через 7.
 * Контент: `ListItem` (действия, радио, категории), `ChipGroup` (фильтры), `PhotoTile` (фото), `InputBar` (поиск), `AccountCard` (аккаунты).
 */
export function Sheet({ title, type = 'modal', footer, onClose, children }: SheetProps) {
  const heading = type === 'panel' ? 'y-h2' : 'y-h3';
  return (
    <section className={cx('y-sheet', `y-sheet--${type}`)} role={type === 'modal' ? 'dialog' : undefined} aria-label={title}>
      {!onClose && <span className="y-sheet__handle" aria-hidden />}
      {onClose ? (
        <div className="y-sheet__head">
          <h2 className={cx(heading, 'y-sheet__title')}>{title}</h2>
          <IconButton icon="cross" label="Закрыть" variant="ghost" size="S" onClick={onClose} />
        </div>
      ) : (
        title && <h2 className={cx(heading, 'y-sheet__title')}>{title}</h2>
      )}
      {children}
      {footer && <Footer actions={footer} />}
    </section>
  );
}

export type DialogProps = {
  /**
   * `default` — Tertiary + Primary («Выйти / Сохранить и выйти»).
   * `destructive` — необратимое действие серым слева, безопасная «Отмена» синей справа («Очистить / Отмена»).
   * `danger` — удаление аккаунта: красная Destructive слева, «Отменить» синей справа.
   */
  tone?: 'default' | 'destructive' | 'danger';
  title: string;
  description?: ReactNode;
  cancel: string;
  confirm: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  children?: ReactNode;
};

/**
 * Подтверждение в той же плавающей форме, что и sheet. **Безопасное действие всегда синее справа.**
 */
export function Dialog({ tone = 'default', title, description, cancel, confirm, onCancel, onConfirm, children }: DialogProps) {
  const risky = tone !== 'default';
  return (
    <section className="y-sheet y-sheet--modal" role="alertdialog" aria-label={title}>
      <span className="y-sheet__handle" aria-hidden />
      <div className="y-dialog__text">
        <h2 className="y-h3">{title}</h2>
        {description && <p className="y-body y-text--secondary">{description}</p>}
      </div>
      {children}
      <Footer
        actions={
          risky
            ? [{ label: confirm, variant: tone === 'danger' ? 'destructive' : 'tertiary', onClick: onConfirm }, { label: cancel, onClick: onCancel }]
            : [{ label: cancel, onClick: onCancel }, { label: confirm, onClick: onConfirm }]
        }
      />
    </section>
  );
}

/** Модальный слой: затемнение `--color-bg-overlay` и прижатая к низу плавающая шторка. */
export function Overlay({ children }: { children: ReactNode }) {
  return <div className="y-overlay">{children}</div>;
}
