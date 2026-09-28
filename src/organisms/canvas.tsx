import { useRef, type PointerEvent, type ReactNode, type WheelEvent } from 'react';
import { ItemArt, type CollageItem } from './cards';
import { cx } from '../utils/cx';
import { useFitScale } from '../utils/useFitScale';

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
 * **Контексты:** Outfit Creation / Canvas. Figma: экран Canvas (площадка — pattern как у outfit-collage).
 */
export function OutfitCanvas({ items, onChange, selectedId, onSelect, hint }: OutfitCanvasProps) {
  const board = useRef<HTMLDivElement>(null);
  // размеры вещей хранятся в единицах макета 353, на экране — × ширина холста / 353
  const k = useFitScale(board, 353);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ id: string; start: CanvasItem; dist?: number; origin: { x: number; y: number } } | null>(null);

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
  };

  const move = (e: PointerEvent) => {
    const g = gesture.current, rect = board.current?.getBoundingClientRect();
    if (!g || !rect || !pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length > 1 && g.dist) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      update(g.id, { size: clamp((g.start.size ?? 96) * (d / g.dist), MIN, MAX) }); // отношение расстояний — не зависит от масштаба
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
    gesture.current = rest.length ? { id: g.id, start: current, origin: rest[0] } : null;
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
          className={cx('y-collage__item', 'y-canvas__item', it.id === selectedId && 'is-selected')}
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
