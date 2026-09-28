import { useRef, useState, type PointerEvent, type ReactNode, type WheelEvent } from 'react';
import { ItemArt, type CollageItem } from './cards';
import { cx } from '../utils/cx';
import { useFitScale } from '../utils/useFitScale';
import { rubberBand } from '../utils/gesture';
import { haptic } from '../utils/haptic';

export type CanvasItem = CollageItem & { id: string };

export type OutfitCanvasProps = {
  items: CanvasItem[];
  /** Новые позиции и размеры после жеста. */
  onChange?: (items: CanvasItem[]) => void;
  selectedId?: string;
  onSelect?: (id: string | undefined) => void;
  /** Подсказка поверх холста: `Snackbar size="S"` «Перемещай и масштабируй вещи» (313 × 48, 20 от боков). */
  hint?: ReactNode;
};

const MIN = 40, MAX = 300;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Холст создания образа 353×353: вещи перетаскиваются пальцем, масштабируются щипком (или колесом мыши),
 * выбранная вещь поднимается наверх. Тап по пустому месту снимает выбор.
 *
 * **Движение.** Касание — подъём: scale 1.04 и тень на пружине quick (`--motion-lift`), хаптика `lift`. Ведение 1 : 1.
 * Отпускание — бросок: вещь «садится» на пружине quick (`--motion-drop`), хаптика `drop`. Щипок за 40 / 300 % —
 * сопротивление `--gesture-rubber-band` (резинка через scale, размер стоит на границе), хаптика `threshold` один раз;
 * после отпускания — назад к границе на пружине quick.
 * **Контексты:** Outfit Creation / Canvas. Figma: экран Canvas (площадка — pattern как у outfit-collage).
 */
export function OutfitCanvas({ items, onChange, selectedId, onSelect, hint }: OutfitCanvasProps) {
  const board = useRef<HTMLDivElement>(null);
  // размеры вещей хранятся в единицах макета 353, на экране — × ширина холста / 353
  const k = useFitScale(board, 353);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ id: string; start: CanvasItem; dist?: number; origin: { x: number; y: number }; limit?: boolean } | null>(null);
  const [lifted, setLifted] = useState<string>();
  const [pinching, setPinching] = useState(false);
  const nodes = useRef(new Map<string, HTMLElement>());
  /** Растяжение сверх границы — scale на картинке вещи, без перерисовки React. */
  const stretch = (id: string, k: number) => { const art = nodes.current.get(id)?.firstElementChild as HTMLElement | null; if (art) art.style.scale = k === 1 ? '' : String(k); };

  const update = (id: string, patch: Partial<CanvasItem>) => onChange?.(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const toFront = (id: string) => onChange?.([...items.filter((it) => it.id !== id), items.find((it) => it.id === id)!]);

  const down = (id: string) => (e: PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const item = items.find((it) => it.id === id)!;
    if (selectedId !== id) { onSelect?.(id); toFront(id); }
    const pts = [...pointers.current.values()];
    gesture.current = { id, start: item, origin: pts[0], dist: pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : undefined };
    if (pts.length > 1) setPinching(true);
    if (lifted !== id) { setLifted(id); haptic('lift'); } // на холсте нет скролла — подъём сразу, без долгого нажатия
  };

  const move = (e: PointerEvent) => {
    const g = gesture.current, rect = board.current?.getBoundingClientRect();
    if (!g || !rect || !pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length > 1 && g.dist) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const raw = (g.start.size ?? 96) * (d / g.dist); // отношение расстояний — не зависит от масштаба
      const size = clamp(raw, MIN, MAX);
      const limit = raw !== size;
      if (limit && !g.limit) haptic('threshold'); // упёрлись в 40 / 300 % — один раз
      g.limit = limit;
      stretch(g.id, limit ? (size + rubberBand(raw - size, size)) / size : 1);
      update(g.id, { size });
    } else {
      const dx = ((pts[0].x - g.origin.x) / rect.width) * 100, dy = ((pts[0].y - g.origin.y) / rect.height) * 100;
      update(g.id, { x: clamp(g.start.x + dx, 0, 100), y: clamp(g.start.y + dy, 0, 100) });
    }
  };

  const up = (e: PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (!g) return;
    const current = items.find((it) => it.id === g.id)!;
    const rest = [...pointers.current.values()];
    setPinching(false);
    stretch(g.id, 1); // резинка отпускается на пружине quick (transition scale в CSS)
    gesture.current = rest.length ? { id: g.id, start: current, origin: rest[0] } : null;
    if (!rest.length) { setLifted(undefined); haptic('drop'); }
  };

  const wheel = (e: WheelEvent) => {
    if (!selectedId) return;
    const it = items.find((i) => i.id === selectedId);
    if (it) update(selectedId, { size: clamp((it.size ?? 96) * (e.deltaY < 0 ? 1.06 : 0.94), MIN, MAX) });
  };

  return (
    <div ref={board} className="y-collage y-canvas" onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={wheel} onPointerDown={() => onSelect?.(undefined)} role="application" aria-label="Холст образа">
      {items.map((it) => (
        <span
          key={it.id}
          ref={(n) => { if (n) nodes.current.set(it.id, n); else nodes.current.delete(it.id); }}
          className={cx('y-collage__item', 'y-canvas__item', it.id === selectedId && 'is-selected', it.id === lifted && 'is-lifted', it.id === lifted && pinching && 'is-pinching')}
          style={{ left: `${it.x}%`, top: `${it.y}%` }}
          onPointerDown={down(it.id)}
        >
          <ItemArt kind={it.kind} color={it.color} src={it.src} size={(it.size ?? 96) * k} />
        </span>
      ))}
      {hint && <div className="y-canvas__hint">{hint}</div>}
    </div>
  );
}
