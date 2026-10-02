import { useCallback, useContext, useEffect, useRef, useState, type ComponentPropsWithRef, type FocusEvent, type PointerEvent, type ReactNode } from 'react';
import { ArtPlaceholder, Button, Icon } from '../atoms';
import type { IconName } from '../icons/icons';
import { cx } from '../utils/cx';
import { gesture, motionMs } from '../utils/gesture';
import { SHOW_ILLUSTRATIONS } from '../utils/illustrations';
import { LeavingContext } from '../utils/usePresence';
import photoCamera from '../icons/art/photo-camera.png';
import photoGallery from '../icons/art/photo-gallery.png';

/* ─── Hint ──────────────────────────────────────────────────────────── */

/**
 * Подсказка поверх холста или фото, Body 14.
 * `default` — пилюля `elevated` с тенью, иконка 16, gap 6; `onPhoto` — без подложки, иконка 24, gap 8, белый текст и иконка
 * поверх фото `--color-text-on-photo` (Figma: hint · On Photo `1183:20594`, флоу Search / Photo / Crop).
 */
export type HintProps = ComponentPropsWithRef<'span'> & { icon?: IconName; /** Окраска относительно фона. */ tone?: 'default' | 'onPhoto' };

export function Hint({ icon = 'fingers-pinch', tone = 'default', children, className, ...rest }: HintProps) {
  return (
    <span className={cx('y-hint', tone === 'onPhoto' && 'y-hint--on-photo', className)} role="note" {...rest}>
      <Icon name={icon} size={tone === 'onPhoto' ? 24 : 16} />
      {children}
    </span>
  );
}

/* ─── Snackbar ──────────────────────────────────────────────────────── */

/**
 * Тост-подтверждение над нижней навигацией. Инвертированный фон.
 *
 * **Движение:** появляется снизу на 16 pt + прозрачность (`--motion-appear`, 240 мс), уходит вниз на 8 pt быстрее
 * (`--motion-exit`, 150 мс). С `autoHide` закрывается сам через `--gesture-snackbar` 4 с, с «Отменить» — 6 с;
 * пока на тосте курсор или фокус, таймер стоит (успеть прочитать и нажать — WCAG 2.2.1).
 * «Отменить» и «×» сначала доигрывают уход, потом вызывают `onClose`.
 * `size`: **M** — 52, паддинг 20, gap 12 (тост над таб-баром); **S** — 48, паддинг 16, gap 20 (подсказка на холсте образа, 313 при отступах 20).
 */
export type SnackbarProps = ComponentPropsWithRef<'div'> & {
  onClose?: () => void;
  /** «Отменить» — изогнутая стрелка справа (флоу: «Вещь перемещена в архив»). */
  onUndo?: () => void;
  /** Закрыться самому через 4 с (с «Отменить» — 6 с). Нужен `onClose`. */
  autoHide?: boolean;
  /** S — подсказка на холсте образа. */
  size?: 'M' | 'S';
};

export function Snackbar({ children, onClose, onUndo, autoHide, size = 'M', className, ...rest }: SnackbarProps) {
  const [closing, setClosing] = useState(false);
  const leaving = useContext(LeavingContext) || closing;
  const [paused, setPaused] = useState(false);
  const exit = useRef(0);
  const leave = useCallback((then?: () => void) => {
    setClosing(true);
    if (exit.current) return; // двойное нажатие не вызывает onUndo / onClose дважды; после размонтирования таймер доигрывает — «Отменить» не теряется
    exit.current = window.setTimeout(() => { then?.(); onClose?.(); }, motionMs('--motion-exit'));
  }, [onClose]);
  useEffect(() => {
    if (!autoHide || !onClose || paused || leaving) return;
    const t = window.setTimeout(() => leave(), onUndo ? gesture.snackbarAction : gesture.snackbar);
    return () => window.clearTimeout(t);
  }, [autoHide, onClose, onUndo, paused, leaving, leave]);
  // пауза таймера не отнимает у потребителя его обработчики
  const hold = {
    onPointerEnter: (e: PointerEvent<HTMLDivElement>) => { setPaused(true); rest.onPointerEnter?.(e); },
    onPointerLeave: (e: PointerEvent<HTMLDivElement>) => { setPaused(false); rest.onPointerLeave?.(e); },
    onFocus: (e: FocusEvent<HTMLDivElement>) => { setPaused(true); rest.onFocus?.(e); },
    onBlur: (e: FocusEvent<HTMLDivElement>) => { setPaused(false); rest.onBlur?.(e); },
  };
  return (
    <div className={cx('y-snackbar', size === 'S' && 'y-snackbar--S', leaving && 'is-leaving', className)} role="status" {...rest} {...(autoHide ? hold : {})}>
      <span>{children}</span>
      {onUndo && (
        <button type="button" aria-label="Отменить" onClick={() => leave(onUndo)}>
          <Icon name="undo" />
        </button>
      )}
      {onClose && (
        <button type="button" aria-label="Закрыть" onClick={() => leave()}>
          <Icon name="cross" />
        </button>
      )}
    </div>
  );
}

/* ─── EmptyState ────────────────────────────────────────────────────── */

/** Пустое состояние и «ничего не найдено». Ставится по центру свободной области экрана. */
export type EmptyStateProps = Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'> & {
  title: string;
  description: ReactNode;
  /** Кнопка L через 32 (Figma: empty-state · Action — Primary L): «Добавить вещь» (primary, по умолчанию), вторичное действие — `tertiary`. */
  action?: { label: string; variant?: 'primary' | 'tertiary'; onClick?: () => void };
  /** Заглушка иллюстрации над заголовком (#220): по умолчанию есть. Висит над блоком и не сдвигает тексты макета. */
  art?: boolean;
};

export function EmptyState({ title, description, action, art = true, className, ...rest }: EmptyStateProps) {
  return (
    <div className={cx('y-empty', className)} {...rest}>
      {art && <ArtPlaceholder size={120} className="y-empty__art" />}
      <h2 className="y-h1 y-text--primary">{title}</h2>
      <p className="y-body y-text--secondary">{description}</p>
      {action && (
        <Button variant={action.variant ?? 'primary'} size="L" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

/* ─── LoadingState ──────────────────────────────────────────────────── */

/** Загрузка внутри области: крутящаяся `spin` + подпись. */
export type LoadingStateProps = Omit<ComponentPropsWithRef<'span'>, 'children'> & { label: string };

export function LoadingState({ label, className, ...rest }: LoadingStateProps) {
  return (
    <span className={cx('y-loading', className)} role="status" aria-live="polite" {...rest}>
      <Icon name="spin" />
      {label}
    </span>
  );
}

/* ─── PhotoTile ─────────────────────────────────────────────────────── */

/** 3D-иллюстрации из Figma (photo-tile · Source): рисунок выходит за рамку art 63 — смещение как в макете. */
const photoArt = {
  gallery: { src: photoGallery, size: 128, top: -27 },
  camera: { src: photoCamera, size: 95, top: -14 },
};

/**
 * Плитка выбора источника фото (Figma: photo-tile · Source Gallery / Camera): квадрат (173 во флоу), в ряду плитки делят ширину;
 * арт 63 и подпись в две строки. Пока 3D-иллюстрации перерисовываются, вместо них — заглушка `ArtPlaceholder` 63 (решение владельца, #220).
 */
export type PhotoTileProps = Omit<ComponentPropsWithRef<'button'>, 'children'> & {
  source: 'gallery' | 'camera';
  label?: string;
  /** 3D-иллюстрация вместо заглушки. По умолчанию — `SHOW_ILLUSTRATIONS` (`src/utils/illustrations.ts`, сейчас выключено). */
  illustration?: boolean;
};

export function PhotoTile({ source, label, illustration = SHOW_ILLUSTRATIONS, className, ...rest }: PhotoTileProps) {
  const art = photoArt[source];
  return (
    <button type="button" className={cx('y-photo-tile', className)} {...rest}>
      <span className="y-photo-tile__art" aria-hidden>
        {illustration ? <img src={art.src} alt="" width={art.size} height={art.size} style={{ top: art.top }} /> : <ArtPlaceholder size={63} />}
      </span>
      {label ?? (source === 'camera' ? <>Сделать<br />фото</> : <>Выбрать<br />из галереи</>)}
    </button>
  );
}
