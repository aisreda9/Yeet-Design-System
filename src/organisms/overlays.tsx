import { useCallback, useContext, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { Button, IconButton, type ButtonStyle } from '../atoms';
import { cx } from '../utils/cx';
import { gesture, motionMs, rubberBand, velocityTracker } from '../utils/gesture';
import { haptic } from '../utils/haptic';
import { LeavingContext } from '../utils/usePresence';

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
  className?: string;
  children?: ReactNode;
};

/**
 * Bottom sheet — основа всех выборов, действий и фильтров. Всё временное открывается sheet'ом, а не новым экраном.
 * Хэндл → 16 → заголовок H3 → 12 → контент → 16 → пара кнопок L через 7.
 * Контент: `ListItem` (действия, радио, категории), `ChipGroup` (фильтры), `PhotoTile` (фото), `InputBar` (поиск), `AccountCard` (аккаунты).
 */
export function Sheet({ title, type = 'modal', footer, onClose, className, children }: SheetProps) {
  const heading = type === 'panel' ? 'y-h2' : 'y-h3';
  return (
    <section className={cx('y-sheet', `y-sheet--${type}`, className)} role={type === 'modal' ? 'dialog' : undefined} aria-label={title}>
      {!onClose && <span className="y-sheet__handle" aria-hidden />}
      {onClose ? (
        <div className="y-sheet__head">
          {title && <h2 className={cx(heading, 'y-sheet__title')}>{title}</h2>}
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

/**
 * Модальный слой: затемнение `--color-bg-overlay` и прижатая к низу плавающая шторка.
 *
 * **Движение.** Появление — шторка снизу на пружине quick (`--motion-nav`), затемнение `--motion-fade`; уход быстрее —
 * `--motion-exit`, шторка уезжает целиком за край: 100 % + отступ 8. Всё на transition — появление и уход прерываются
 * и разворачиваются из текущего положения.
 *
 * **Смахивание** (если есть `onClose`): тянется за пальцем 1 : 1 вниз и с сопротивлением `--gesture-rubber-band` вверх,
 * затемнение гаснет вместе с ней. Закрывается, если протянута дальше 30 % высоты (`--gesture-swipe-distance`, хаптика
 * `threshold` в момент пересечения) или брошена быстрее 500 pt/с; иначе возвращается на пружине quick.
 * Жест начинается только после сдвига на `--gesture-touch-slop` — кнопки и строки в шторке нажимаются как обычно.
 * Закрывают также тап по затемнению и Escape.
 */
export function Overlay({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const leavingFromScreen = useContext(LeavingContext);
  const [closing, setClosing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; x0: number; y0: number; h: number; offset: number; active: boolean; crossed: boolean } | null>(null);
  const speed = useRef(velocityTracker());
  const dragged = useRef(false);
  const leaving = closing || leavingFromScreen;
  const sheet = () => ref.current?.querySelector<HTMLElement>('.y-sheet') ?? null;

  const close = useCallback(() => {
    if (!onClose) return;
    setClosing(true);
    // родитель убирает слой; если оставил (закрытие отклонено) — шторка возвращается
    window.setTimeout(() => { onClose(); setClosing(false); }, motionMs('--motion-exit'));
  }, [onClose]);

  useEffect(() => {
    if (!onClose) return;
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose, close]);

  const place = (offset: number) => {
    const s = sheet(), o = ref.current, d = drag.current;
    if (!s || !o || !d) return;
    d.offset = offset;
    s.style.transform = `translate3d(0, ${offset}px, 0)`;
    o.style.setProperty('--y-dim', String(Math.max(0, 1 - Math.max(0, offset) / d.h)));
  };
  const release = () => {
    const s = sheet(), o = ref.current;
    s?.style.removeProperty('transform');
    o?.style.removeProperty('--y-dim');
    setDragging(false);
  };

  const down = (e: PointerEvent<HTMLDivElement>) => {
    dragged.current = false;
    const s = sheet(), t = e.target as Element;
    if (!onClose || leaving || !s || !s.contains(t) || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (t.closest('input, textarea, select, [role=slider]')) return; // поле и ползунок — свои жесты
    // внутренний скролл, прокрученный вниз, сначала докручивается к началу
    for (let a: Element | null = t; a && a !== s; a = a.parentElement) if (a.scrollTop > 0) return;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, h: s.offsetHeight, offset: 0, active: false, crossed: false };
    speed.current.reset();
    speed.current.add(e.clientX, e.clientY, e.timeStamp);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    speed.current.add(e.clientX, e.clientY, e.timeStamp);
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    if (!d.active) {
      if (Math.hypot(dx, dy) < gesture.slop) return;
      if (Math.abs(dx) > Math.abs(dy)) { drag.current = null; return; } // горизонтальный жест — лента чипсов, не шторка
      d.active = true;
      d.y0 += Math.sign(dy) * gesture.slop; // без скачка на величину slop
      sheet()?.setPointerCapture(e.pointerId);
      setDragging(true);
    }
    const y = e.clientY - d.y0;
    place(y >= 0 ? y : rubberBand(y, d.h));
    const crossed = y > d.h * gesture.swipeDistance;
    if (crossed && !d.crossed) haptic('threshold'); // один раз при пересечении; обратно — без вибрации
    d.crossed = crossed;
  };
  const up = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    if (!d.active) return;
    dragged.current = true;
    const v = speed.current.get().y;
    const dismiss = e.type !== 'pointercancel' && (d.offset > d.h * gesture.swipeDistance || (v > gesture.swipeVelocity && d.offset > 0));
    release(); // закрытие продолжится из текущего положения (exit), возврат — на пружине quick
    if (dismiss) close();
  };

  return (
    <div
      ref={ref}
      className={cx('y-overlay', leaving && 'is-leaving', dragging && 'is-dragging')}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      // после смахивания отпускание пальца не должно стать нажатием
      onClickCapture={(e) => { if (dragged.current) { e.stopPropagation(); dragged.current = false; } }}
      onClick={onClose && ((e) => e.target === e.currentTarget && close())}
    >
      {children}
    </div>
  );
}
