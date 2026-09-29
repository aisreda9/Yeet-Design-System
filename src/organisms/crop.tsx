import { useRef, useState, type ComponentPropsWithRef, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { Hint } from '../molecules';
import { cx } from '../utils/cx';
import { haptic } from '../utils/haptic';
import { setRef } from './refs';

/** Рамка в долях контейнера 0…1: левый верхний угол, ширина, высота. */
export type CropRect = { x: number; y: number; w: number; h: number };

/** Рамка из флоу Search / Photo / Crop `261:1590`: 353 × 226 в 20 от краёв экрана 393 × 852, верх на 315. */
export const cropDefault: CropRect = { x: 20 / 393, y: 315 / 852, w: 353 / 393, h: 226 / 852 };

export type CropFrameProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'onChange' | 'defaultValue'> & {
  /** Фото под рамкой (cover). Вместо него можно передать `children`. */
  src?: string;
  alt?: string;
  children?: ReactNode;
  /** Рамка (контролируемая). */
  value?: CropRect;
  /** Начальная рамка, если `value` не задан. По умолчанию — как во флоу. */
  defaultValue?: CropRect;
  onChange?: (rect: CropRect) => void;
  /** Подсказка `Hint onPhoto` внизу; `null` — без подсказки. */
  hint?: ReactNode;
  /** Минимальная сторона рамки, px. */
  min?: number;
};

type Drag = { mode: 'move' | 'nw' | 'ne' | 'sw' | 'se'; x: number; y: number; start: CropRect };
type Pinch = { d: number; start: CropRect };

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const corners = ['nw', 'ne', 'sw', 'se'] as const;

/**
 * Рамка обрезки фото: снаружи — затемнение, по углам — белые уголки. Рамку двигают пальцем, углы тянут, двумя пальцами
 * масштабируют вокруг центра; рамка не выходит за фото и не меньше `min`.
 *
 * Клавиатура: рамка в порядке Tab; стрелки двигают (Shift — шаг крупнее), `+` / `−` масштабируют.
 * Геометрия в долях контейнера, поэтому рамка остаётся на месте при любой ширине экрана.
 */
export function CropFrame({ src, alt = '', children, value, defaultValue = cropDefault, onChange, hint = 'Перемещай и масштабируй рамку', min = 64, ref, className, style: styleProp, ...rest }: CropFrameProps) {
  const [own, setOwn] = useState(defaultValue);
  const rect = value ?? own;
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<Pinch | null>(null);
  const [active, setActive] = useState(false);

  const size = () => { const r = box.current?.getBoundingClientRect(); return { w: r?.width || 1, h: r?.height || 1 }; };
  const fit = (r: CropRect): CropRect => {
    const s = size();
    const mw = Math.min(min / s.w, 1), mh = Math.min(min / s.h, 1);
    const w = clamp(r.w, mw, 1), h = clamp(r.h, mh, 1);
    return { w, h, x: clamp(r.x, 0, 1 - w), y: clamp(r.y, 0, 1 - h) };
  };
  const set = (r: CropRect) => {
    const next = fit(r);
    if (value === undefined) setOwn(next);
    onChange?.(next);
  };
  const scale = (start: CropRect, k: number) => {
    const cx0 = start.x + start.w / 2, cy0 = start.y + start.h / 2;
    const w = start.w * k, h = start.h * k;
    return { x: cx0 - w / 2, y: cy0 - h / 2, w, h };
  };

  const down = (mode: Drag['mode']) => (e: PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, start: rect };
      drag.current = null;
    } else {
      drag.current = { mode, x: e.clientX, y: e.clientY, start: rect };
      haptic('threshold');
    }
    setActive(true);
  };
  const move = (e: PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const s = size();
    if (pinch.current && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      set(scale(pinch.current.start, Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.d));
      return;
    }
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.x) / s.w, dy = (e.clientY - d.y) / s.h;
    const r = d.start;
    if (d.mode === 'move') return set({ ...r, x: r.x + dx, y: r.y + dy });
    // угол тянется, противоположный стоит на месте
    const left = d.mode === 'nw' || d.mode === 'sw', top = d.mode === 'nw' || d.mode === 'ne';
    const right = r.x + r.w, bottom = r.y + r.h;
    const mw = min / s.w, mh = min / s.h;
    const x = left ? clamp(r.x + dx, 0, right - mw) : r.x;
    const y = top ? clamp(r.y + dy, 0, bottom - mh) : r.y;
    const w = left ? right - x : clamp(r.w + dx, mw, 1 - r.x);
    const h = top ? bottom - y : clamp(r.h + dy, mh, 1 - r.y);
    set({ x, y, w, h });
  };
  const up = (e: PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) { drag.current = null; setActive(false); }
  };
  // второй палец может лечь и мимо рамки — щипок ловит весь контейнер; движение с захваченных рамки и углов всплывает сюда
  const root = { onPointerDown: (e: PointerEvent) => { if (pointers.current.size === 1) down('move')(e); }, onPointerMove: move, onPointerUp: up, onPointerCancel: up };

  const onKeyDown = (e: KeyboardEvent) => {
    const s = size();
    const step = (e.shiftKey ? 20 : 4);
    const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
    const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
    if (dx || dy) { e.preventDefault(); set({ ...rect, x: rect.x + dx / s.w, y: rect.y + dy / s.h }); return; }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); set(scale(rect, 1.05)); }
    if (e.key === '-' || e.key === '−') { e.preventDefault(); set(scale(rect, 1 / 1.05)); }
  };

  const style = { '--crop-x': rect.x, '--crop-y': rect.y, '--crop-w': rect.w, '--crop-h': rect.h } as CSSProperties;
  const pct = (v: number) => Math.round(v * 100);

  return (
    <div ref={(n) => { box.current = n; setRef(ref, n); }} className={cx('y-crop', active && 'is-active', className)} style={{ ...styleProp, ...style }} {...rest} {...root}>
      {src ? <img className="y-crop__photo" src={src} alt={alt} draggable={false} /> : children}
      {/* Рамка — виджет с клавиатурой (стрелки двигают, «+» / «−» масштабируют): фокус и обработчики у group намеренно */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="y-crop__frame"
        role="group"
        aria-roledescription="рамка обрезки"
        aria-label={`Рамка: ${pct(rect.w)} × ${pct(rect.h)} % фото, стрелки двигают, плюс и минус масштабируют`}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- см. комментарий над рамкой
        tabIndex={0}
        onPointerDown={(e) => down('move')(e)}
        onKeyDown={onKeyDown}
      >
        {corners.map((c) => (
          <span key={c} className={`y-crop__corner y-crop__corner--${c}`} aria-hidden onPointerDown={(e) => down(c)(e)} />
        ))}
      </div>
      {hint !== null && <div className="y-crop__hint"><Hint tone="onPhoto" icon="fingers-pinch">{hint}</Hint></div>}
    </div>
  );
}
