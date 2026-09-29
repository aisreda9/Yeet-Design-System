import { useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Button, Icon } from '../atoms';
import type { IconName } from '../icons/icons';
import { cx } from '../utils/cx';
import { gesture, motionMs } from '../utils/gesture';
import { LeavingContext } from '../utils/usePresence';
import photoCamera from '../icons/art/photo-camera.png';
import photoGallery from '../icons/art/photo-gallery.png';

/* ─── Hint ──────────────────────────────────────────────────────────── */

/**
 * Подсказка поверх холста или фото, Body 14 с иконкой 16.
 * `default` — пилюля `elevated` с тенью; `onPhoto` — без подложки, белый текст и иконка поверх фото (Figma: hint · On Photo, флоу Search / Photo / Crop).
 */
export function Hint({ icon = 'fingers-pinch', tone = 'default', children }: { icon?: IconName; tone?: 'default' | 'onPhoto'; children: ReactNode }) {
  return (
    <span className={cx('y-hint', tone === 'onPhoto' && 'y-hint--on-photo')} role="note">
      <Icon name={icon} size={16} />
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
 * `size`: **M** — 52, паддинг 20 (тост над таб-баром); **S** — 48, паддинг 16 (подсказка на холсте образа, 313 при отступах 20).
 */
export function Snackbar({ children, onClose, onUndo, autoHide, size = 'M' }: { children: ReactNode; onClose?: () => void; /** «Отменить» — изогнутая стрелка справа (флоу: «Вещь перемещена в архив»). */ onUndo?: () => void; /** Закрыться самому через 4 с (с «Отменить» — 6 с). Нужен `onClose`. */ autoHide?: boolean; /** S — подсказка на холсте образа. */ size?: 'M' | 'S' }) {
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
  const hold = { onPointerEnter: () => setPaused(true), onPointerLeave: () => setPaused(false), onFocus: () => setPaused(true), onBlur: () => setPaused(false) };
  return (
    <div className={cx('y-snackbar', size === 'S' && 'y-snackbar--S', leaving && 'is-leaving')} role="status" {...(autoHide ? hold : {})}>
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

/** 3D-иллюстрации из Figma (photo-tile · Source): рисунок выходит за рамку art 63 — смещение как в макете. */
const photoArt = {
  gallery: { src: photoGallery, size: 128, top: -27 },
  camera: { src: photoCamera, size: 95, top: -14 },
};

/** Плитка выбора источника фото (Figma: photo-tile · Source Gallery / Camera): 173×173, 3D-иллюстрация и подпись в две строки. */
export function PhotoTile({ source, label, onClick }: { source: 'gallery' | 'camera'; label?: string; onClick?: () => void }) {
  const art = photoArt[source];
  return (
    <button type="button" className="y-photo-tile" onClick={onClick}>
      <span className="y-photo-tile__art" aria-hidden>
        <img src={art.src} alt="" width={art.size} height={art.size} style={{ top: art.top, left: (63 - art.size) / 2 }} />
      </span>
      {label ?? (source === 'camera' ? <>Сделать<br />фото</> : <>Выбрать<br />из галереи</>)}
    </button>
  );
}
