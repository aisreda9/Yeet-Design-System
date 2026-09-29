import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { Icon } from '../atoms';
import { Snackbar } from '../molecules';
import { ItemCard, type Garment } from '../organisms';
import type { ItemColor } from '../tokens/tokens';
import { gesture, motionMs } from '../utils/gesture';
import { haptic } from '../utils/haptic';

type Cell = { id: string; kind: Garment; color: ItemColor };
const initial: Cell[] = [
  { id: 'a', kind: 'outerwear', color: 'beige' },
  { id: 'b', kind: 'top', color: 'green' },
  { id: 'c', kind: 'bottom', color: 'blue' },
  { id: 'd', kind: 'shoe', color: 'white' },
  { id: 'e', kind: 'container', color: 'black' },
  { id: 'f', kind: 'accessories', color: 'brown' },
];

const LONG_PRESS = gesture.longPress; // --gesture-long-press
const SLOP = gesture.slop; // --gesture-touch-slop

/**
 * Демо правил перетаскивания: долгое нажатие → подъём → цель подсвечивается → бросок / возврат / удаление.
 * Порядок меняется с FLIP-анимацией: соседи «доезжают» на пружине drop.
 */
export function DragGrid() {
  const [cells, setCells] = useState(initial);
  const [lifted, setLifted] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const [delta, setDelta] = useState({ x: 0, y: 0 });
  const [over, setOver] = useState<string | 'trash' | null>(null);
  const [returning, setReturning] = useState<string | null>(null);
  const [removed, setRemoved] = useState<Cell | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const timer = useRef<number>(0);
  const nodes = useRef(new Map<string, HTMLElement>());
  const rects = useRef(new Map<string, DOMRect>());
  // Отложенное удаление и кадры FLIP: при размонтировании снимаем, чтобы не трогать state и узлы после ухода
  const later = useRef({ timeouts: new Set<number>(), frames: new Set<number>() });
  useEffect(() => {
    const { timeouts, frames } = later.current;
    return () => {
      window.clearTimeout(timer.current);
      timeouts.forEach((t) => window.clearTimeout(t));
      frames.forEach((f) => cancelAnimationFrame(f));
    };
  }, []);

  // FLIP: запомнили старые позиции → после перестановки сдвигаем назад и отпускаем на пружине
  const snapshot = () => nodes.current.forEach((n, id) => rects.current.set(id, n.getBoundingClientRect()));
  useLayoutEffect(() => {
    nodes.current.forEach((n, id) => {
      const was = rects.current.get(id);
      if (!was) return;
      const now = n.getBoundingClientRect();
      const dx = was.left - now.left, dy = was.top - now.top;
      if (!dx && !dy) return;
      n.style.transition = 'none';
      n.style.transform = `translate(${dx}px, ${dy}px)`;
      const f = requestAnimationFrame(() => {
        later.current.frames.delete(f);
        n.style.transition = 'transform var(--motion-drop)';
        n.style.transform = '';
      });
      later.current.frames.add(f);
    });
    rects.current.clear();
  }, [cells]);

  const targetAt = (x: number, y: number) => {
    // под пальцем — сама поднятая карточка, поэтому ищем первый элемент под ней
    for (const hit of document.elementsFromPoint(x, y)) {
      const el = hit.closest<HTMLElement>('[data-cell], [data-trash]');
      if (!el) continue;
      if (el.dataset.trash !== undefined) return 'trash';
      if (el.dataset.cell !== lifted) return el.dataset.cell ?? null;
    }
    return null;
  };

  const down = (id: string) => (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setPressed(id);
    window.clearTimeout(timer.current); // второй палец не оставляет висящий таймер первого
    timer.current = window.setTimeout(() => { setLifted(id); setPressed(null); haptic('lift'); }, LONG_PRESS);
  };
  const move = (e: PointerEvent) => {
    const d = { x: e.clientX - start.current.x, y: e.clientY - start.current.y };
    if (!lifted) {
      if (Math.hypot(d.x, d.y) > SLOP) { clearTimeout(timer.current); setPressed(null); } // это скролл, а не нажатие
      return;
    }
    setDelta(d);
    const t = targetAt(e.clientX, e.clientY);
    if (t && t !== over) haptic('target'); // только при входе в новую цель, не при движении внутри
    setOver(t);
  };
  const up = () => {
    clearTimeout(timer.current);
    setPressed(null);
    if (!lifted) return;
    const id = lifted;
    if (over === 'trash') {
      // уходит сжимаясь (exit, 150 мс), потом соседи съезжают на освободившееся место
      setRemoving(id);
      haptic('delete');
      const t = window.setTimeout(() => {
        later.current.timeouts.delete(t);
        snapshot();
        setRemoved(cells.find((c) => c.id === id) ?? null);
        setCells((cs) => cs.filter((c) => c.id !== id));
        setRemoving(null);
      }, motionMs('--motion-exit'));
      later.current.timeouts.add(t);
    } else if (over) {
      haptic('drop');
      snapshot();
      setCells((cs) => {
        const a = cs.findIndex((c) => c.id === id), b = cs.findIndex((c) => c.id === over);
        const next = [...cs];
        [next[a], next[b]] = [next[b], next[a]];
        return next;
      });
    } else setReturning(id); // мимо цели — назад на пружине return
    setLifted(null);
    setOver(null);
    setDelta({ x: 0, y: 0 });
  };
  const undo = () => {
    if (!removed) return;
    snapshot();
    setCells((cs) => [...cs, removed]);
    setRemoved(null);
  };

  return (
    <div className="y-drag">
      <div className="y-drag__grid">
        {cells.map((c) => {
          const isLifted = lifted === c.id;
          return (
            <div
              key={c.id}
              data-cell={c.id}
              ref={(n) => { if (n) nodes.current.set(c.id, n); else nodes.current.delete(c.id); }}
              className="y-drag__cell"
              style={isLifted ? { transform: `translate(${delta.x}px, ${delta.y}px)`, transition: 'none', zIndex: 2 } : returning === c.id ? { transition: 'transform var(--motion-return)' } : undefined}
              onTransitionEnd={() => returning === c.id && setReturning(null)}
              onPointerDown={down(c.id)}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
            >
              <div className={`y-drag__lift${isLifted ? ' is-lifted' : ''}${pressed === c.id ? ' is-pressed' : ''}${over === c.id ? ' is-target' : ''}${removing === c.id ? ' is-removing' : ''}`}>
                <ItemCard kind={c.kind} color={c.color} />
              </div>
            </div>
          );
        })}
      </div>
      <div data-trash className={`y-drag__trash${lifted ? ' is-visible' : ''}${over === 'trash' ? ' is-target' : ''}`}>
        <Icon name="trash" /> Отпусти, чтобы удалить
      </div>
      {removed && (
        <Snackbar key={removed.id} autoHide onClose={() => setRemoved(null)} onUndo={undo}>
          Вещь удалена
        </Snackbar>
      )}
    </div>
  );
}
