import { useRef, useState, type PointerEvent } from 'react';
import { gesture, rubberBand, velocityTracker } from '../utils/gesture';
import { haptic, type HapticEvent } from '../utils/haptic';

export type SwipePagerOptions = {
  /** Ось листания: `x` — лента поводов (Figma «Stylist / Trips / List»), `y` — стопка образов (Figma «scale»). */
  axis: 'x' | 'y';
  /** Сколько страниц. */
  count: number;
  /** Текущая страница (контролируемая). */
  index: number;
  /** Жест решил перелистнуть: `next` — соседняя страница, всегда в пределах `0…count − 1`. */
  onChange: (next: number) => void;
  /** Размер страницы по оси, px: от него порог 30 % и резинка на краях. На экране — 353 (ширина коллажа). */
  size: number;
  /** Хаптика при смене страницы жестом. По умолчанию `skip` (смена образа); `false` — хаптику даёт `onChange`. */
  changeHaptic?: HapticEvent | false;
  /** Выключить жест (например, пока открыта шторка). */
  disabled?: boolean;
};

export type SwipePager = {
  /** Сдвиг за пальцем, px (с резинкой на краях); `null` — палец не ведёт, страница стоит на месте. */
  drag: number | null;
  /** Удобный флаг для `data-dragging`: во время жеста переходы выключаются, лента едет 1 : 1. */
  dragging: boolean;
  /** Обработчики на контейнер ленты: `<div {...pager.bind}>`. */
  bind: {
    onPointerDown: (e: PointerEvent) => void;
    onPointerMove: (e: PointerEvent) => void;
    onPointerUp: (e: PointerEvent) => void;
    onPointerCancel: (e: PointerEvent) => void;
  };
};

type Gesture = { x: number; y: number; axis?: 'x' | 'y'; crossed: boolean };

/**
 * Листание жестом: лента или стопка едет за пальцем, отпустил — перелистнули или вернули.
 *
 * - Жест начинается после `touch-slop` (10 px) и закрепляется за доминирующей осью. Движение поперёк оси
 *   отдаётся странице (вертикальный скролл под горизонтальной лентой не ломается).
 * - Дальше 30 % размера (`--gesture-swipe-distance`) или бросок быстрее 500 pt/с (`--gesture-swipe-velocity`) —
 *   следующая страница; назад к началу ленты — предыдущая. Иначе страница возвращается.
 * - На первой и последней странице — резинка (`--gesture-rubber-band`), перелистнуть нельзя.
 * - Хаптика `threshold` — один раз при пересечении порога; при смене — `changeHaptic` (`skip`).
 * - Доводка после отпускания — переходом CSS на токене (`--motion-page` / `--motion-swap`), поэтому при
 *   «Уменьшении движения» она мгновенная, а палец по-прежнему ведёт 1 : 1.
 *
 * Хук не рисует ничего сам: отдаёт `drag` и обработчики, раскладку делает вызывающий.
 * Контейнеру нужен `touch-action: pan-y` для оси `x` (или `none` для `y`), иначе браузер заберёт жест под скролл,
 * и `user-select: none`: иначе мышь выделяет текст, следующий жест становится нативным drag и приходит `pointercancel`.
 */
export function useSwipePager({ axis, count, index, onChange, size, changeHaptic = 'skip', disabled }: SwipePagerOptions): SwipePager {
  const [drag, setDrag] = useState<number | null>(null);
  const g = useRef<Gesture | null>(null);
  const speed = useRef(velocityTracker());
  const along = (dx: number, dy: number) => (axis === 'x' ? dx : dy);

  const onPointerDown = (e: PointerEvent) => {
    if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
    g.current = { x: e.clientX, y: e.clientY, crossed: false };
    speed.current.reset();
    speed.current.add(e.clientX, e.clientY, e.timeStamp);
  };

  const onPointerMove = (e: PointerEvent) => {
    const s = g.current;
    if (!s) return;
    speed.current.add(e.clientX, e.clientY, e.timeStamp);
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (!s.axis) {
      if (Math.hypot(dx, dy) < gesture.slop) return;
      s.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (s.axis !== axis) { g.current = null; return; } // жест поперёк — не наш
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    }
    const d = along(dx, dy);
    const edge = (d > 0 && index === 0) || (d < 0 && index === count - 1);
    const crossed = !edge && Math.abs(d) > size * gesture.swipeDistance;
    if (crossed && !s.crossed) haptic('threshold'); // один раз на пороге
    s.crossed = crossed;
    setDrag(edge ? rubberBand(d, size) : d); // на краях — сопротивление
  };

  const finish = (e: PointerEvent, cancelled: boolean) => {
    const s = g.current;
    g.current = null;
    setDrag(null); // отпускаем из текущего положения — доводку делает переход CSS
    if (!s?.axis || cancelled) return;
    speed.current.add(e.clientX, e.clientY, e.timeStamp); // точка отпускания: палец мог стоять перед подъёмом
    const vel = speed.current.get(e.timeStamp);
    const d = along(e.clientX - s.x, e.clientY - s.y), v = along(vel.x, vel.y);
    const flick = Math.abs(v) > gesture.swipeVelocity && Math.sign(v) === Math.sign(d);
    if (!(Math.abs(d) > size * gesture.swipeDistance || flick)) return;
    const target = index + (d < 0 ? 1 : -1);
    if (target < 0 || target >= count) return;
    if (changeHaptic) haptic(changeHaptic);
    onChange(target);
  };

  return {
    drag,
    dragging: drag !== null,
    bind: { onPointerDown, onPointerMove, onPointerUp: (e) => finish(e, false), onPointerCancel: (e) => finish(e, true) },
  };
}
