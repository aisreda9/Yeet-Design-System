import { useEffect, useId, useLayoutEffect, useRef, useState, type ComponentPropsWithRef, type KeyboardEvent, type PointerEvent, type ReactNode, type Ref } from 'react';
import { ItemArt, garmentNames, type CollageItem } from './cards';
import { cx } from '../utils/cx';
import { useFitScale } from '../utils/useFitScale';
import { rubberBand } from '../utils/gesture';
import { haptic } from '../utils/haptic';
import { VisuallyHidden } from '../utils/VisuallyHidden';

export type CanvasItem = CollageItem & {
  id: string;
  /** Название для скринридера и озвучки: «Чёрная сумка». По умолчанию — категория по `kind`. */
  label?: string;
};

export type OutfitCanvasProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'onChange' | 'onSelect'> & {
  items: CanvasItem[];
  /** Новые позиции, размеры и порядок после жеста или клавиши. `Delete` / `Backspace` — массив без вещи. */
  onChange?: (items: CanvasItem[]) => void;
  selectedId?: string;
  onSelect?: (id: string | undefined) => void;
  /** Подсказка поверх холста: `Snackbar size="S"` «Перемещай и масштабируй вещи» (313 × 48, 20 от боков). */
  hint?: ReactNode;
};

const MIN = 40, MAX = 300, SIZE = 96;
/** Шаг клавиатуры: стрелка — 1 % холста (Shift — 10 %), `+` / `−` — ×1.1. */
const STEP = 1, STEP_BIG = 10, ZOOM = 1.1;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const nameOf = (it: CanvasItem) => it.label ?? garmentNames[it.kind];
const where = (it: CanvasItem) => `${nameOf(it)}: ${Math.round(it.x)} % по горизонтали, ${Math.round(it.y)} % по вертикали, размер ${Math.round(it.size ?? SIZE)}`;

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

type Gesture = { id: string; start: CanvasItem; origin: { x: number; y: number }; dist?: number; limit?: boolean };

/**
 * Холст создания образа 353×353: вещи перетаскиваются пальцем, масштабируются щипком (или колесом мыши),
 * выбранная вещь поднимается наверх. Тап по пустому месту снимает выбор.
 *
 * **Движение.** Касание — подъём: scale 1.04 и тень на пружине quick (`--motion-lift`), хаптика `lift`. Ведение 1 : 1.
 * Отпускание — бросок: вещь «садится» на пружине quick (`--motion-drop`), хаптика `drop`. Щипок за 40 / 300 % —
 * сопротивление `--gesture-rubber-band` (резинка через scale, размер стоит на границе), хаптика `threshold` один раз;
 * после отпускания — назад к границе на пружине quick.
 * **Жесты — на уровне холста.** Второй палец может лечь куда угодно (на другую вещь или пустое место) — щипок
 * масштабирует вещь первого пальца; два пальца по пустому месту — выбранную вещь. Колесо мыши над холстом
 * масштабирует выбранную вещь и не прокручивает страницу.
 * **Клавиатура** (одна точка Tab, roving tabindex): стрелки — к соседней вещи; `Enter` / `Space` — выбрать;
 * у выбранной стрелки двигают (Shift — шаг 10 %), `+` / `−` — размер, `Delete` / `Backspace` — удалить, `Esc` — снять выбор.
 * Положение после каждой клавиши озвучивается (live region).
 * **Контексты:** Outfit Creation / Canvas. Figma: экран Canvas (площадка — pattern как у outfit-collage).
 */
export function OutfitCanvas({ items, onChange, selectedId, onSelect, hint, ref, className, 'aria-label': ariaLabel = 'Холст образа', ...rest }: OutfitCanvasProps) {
  const board = useRef<HTMLDivElement | null>(null);
  // размеры вещей хранятся в единицах макета 353, на экране — × ширина холста / 353
  const k = useFitScale(board, 353);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  /** Касание пустого места: снимет выбор при отпускании, если не стало щипком. */
  const emptyTap = useRef(false);
  const [lifted, setLifted] = useState<string>();
  const [pinching, setPinching] = useState(false);
  const [active, setActive] = useState<string>();
  const [status, setStatus] = useState('');
  const helpId = useId();
  const nodes = useRef(new Map<string, HTMLElement>());
  /** После удаления вещи с клавиатуры фокус переходит на соседнюю (или на холст). */
  const refocus = useRef(false);
  // последний рендер для нативных слушателей (wheel) и жестов между рендерами
  const latest = useRef({ items, selectedId, onChange });
  useLayoutEffect(() => { latest.current = { items, selectedId, onChange }; });

  const byId = (id: string | undefined) => (id === undefined ? undefined : latest.current.items.find((it) => it.id === id));
  /** Растяжение сверх границы — scale на картинке вещи, без перерисовки React. */
  const stretch = (id: string, s: number) => { const art = nodes.current.get(id)?.firstElementChild as HTMLElement | null; if (art) art.style.scale = s === 1 ? '' : String(s); };
  const update = (id: string, patch: Partial<CanvasItem>) => {
    const { items: list, onChange: change } = latest.current;
    if (!list.some((it) => it.id === id)) return; // вещь удалили посреди жеста
    const next = list.map((it) => (it.id === id ? { ...it, ...patch } : it));
    latest.current.items = next;
    change?.(next);
  };
  const toFront = (id: string) => {
    const { items: list, onChange: change } = latest.current;
    const it = list.find((i) => i.id === id);
    if (!it || list[list.length - 1] === it) return;
    const next = [...list.filter((i) => i !== it), it];
    latest.current.items = next;
    change?.(next);
  };
  const select = (id: string) => { if (latest.current.selectedId !== id) { onSelect?.(id); toFront(id); } };

  /** Порядок обхода с клавиатуры — как читаем: сверху вниз, слева направо. */
  const nav = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  // вещь, на которой стоит точка Tab: последняя в фокусе, выбранная или первая по обходу
  const tabStop = [active, selectedId].find((id) => id !== undefined && items.some((it) => it.id === id)) ?? nav[0]?.id;
  /**
   * DOM-порядок вещей постоянный (по id), а слои — через z-index по порядку `items`: вещь «наверх» не переставляет узел,
   * и фокус с клавиатуры не теряется.
   */
  const dom = [...items].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  useLayoutEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    const node = tabStop === undefined ? undefined : nodes.current.get(tabStop);
    if (node && document.activeElement !== node) node.focus({ preventScroll: true });
    else if (!node) board.current?.focus({ preventScroll: true });
  });

  /* ─── Жесты: на холсте, а не на вещи ─── */

  const pinchDist = () => { const [a, b] = [...pointers.current.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const hit = (e.target as Element).closest<HTMLElement>('.y-canvas__item');
    // подсказка и её кнопки — не жест холста
    if (!hit && (e.target as Element).closest('.y-canvas__hint')) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* указатель уже неактивен (синтетическое событие) — жест идёт и без захвата */ }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const count = pointers.current.size;
    if (count === 1) {
      const id = hit?.dataset.id;
      const item = byId(id);
      if (!id || !item) { emptyTap.current = true; return; }
      emptyTap.current = false;
      setActive(id);
      select(id);
      gesture.current = { id, start: item, origin: { x: e.clientX, y: e.clientY } };
      if (lifted !== id) { setLifted(id); haptic('lift'); } // на холсте нет скролла — подъём сразу, без долгого нажатия
      return;
    }
    if (count !== 2) return;
    // второй палец где угодно: щипок вещи первого пальца, а по пустому месту — выбранной вещи
    const id = g?.id ?? latest.current.selectedId;
    const item = byId(id);
    if (!id || !item) return;
    emptyTap.current = false;
    gesture.current = { id, start: item, origin: [...pointers.current.values()][0], dist: pinchDist() };
    setPinching(true);
    if (lifted !== id) { setLifted(id); haptic('lift'); }
  };

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current, rect = board.current?.getBoundingClientRect();
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!g || !rect) return;
    if (pointers.current.size > 1 && g.dist) {
      const raw = (g.start.size ?? SIZE) * (pinchDist() / g.dist); // отношение расстояний — не зависит от масштаба
      const size = clamp(raw, MIN, MAX);
      const limit = raw !== size;
      if (limit && !g.limit) haptic('threshold'); // упёрлись в 40 / 300 % — один раз
      g.limit = limit;
      stretch(g.id, limit ? (size + rubberBand(raw - size, size)) / size : 1);
      update(g.id, { size });
    } else {
      const p = pointers.current.get(e.pointerId)!;
      const dx = ((p.x - g.origin.x) / rect.width) * 100, dy = ((p.y - g.origin.y) / rect.height) * 100;
      update(g.id, { x: clamp(g.start.x + dx, 0, 100), y: clamp(g.start.y + dy, 0, 100) });
    }
  };

  const up = (e: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(e.pointerId)) return;
    const g = gesture.current;
    const rest = [...pointers.current.values()];
    if (!g) {
      if (!rest.length && emptyTap.current && e.type === 'pointerup') onSelect?.(undefined);
      if (!rest.length) emptyTap.current = false;
      return;
    }
    setPinching(false);
    stretch(g.id, 1); // резинка отпускается на пружине quick (transition scale в CSS)
    const current = byId(g.id);
    // оставшийся палец продолжает вести ту же вещь с текущего места; вещь удалили — жест кончился
    gesture.current = rest.length && current ? { id: g.id, start: current, origin: rest[0] } : null;
    if (!rest.length || !current) { setLifted(undefined); if (current) haptic('drop'); }
  };

  // Колесо мыши — масштаб выбранной вещи. Нативный слушатель: у React onWheel пассивный, preventDefault не работает
  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      const { selectedId: id } = latest.current;
      const it = byId(id);
      if (!id || !it) return;
      e.preventDefault(); // страница не прокручивается, пока крутим размер вещи
      update(id, { size: clamp((it.size ?? SIZE) * (e.deltaY < 0 ? 1.06 : 0.94), MIN, MAX) });
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
    // byId / update читают latest — слушатель ставится один раз
  }, []);

  /* ─── Клавиатура ─── */

  const keys = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    const id = e.currentTarget.dataset.id;
    const item = byId(id);
    if (!id || !item) return;
    const index = nav.indexOf(item);
    const selected = selectedId === id;
    const say = (it: CanvasItem) => setStatus(where(it));
    const go = (to: number) => {
      const next = nav[(to + nav.length) % nav.length];
      setActive(next.id);
      nodes.current.get(next.id)?.focus();
    };
    const arrows: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    let handled = true;
    if (e.key in arrows) {
      const [dx, dy] = arrows[e.key];
      if (!selected) go(index + (dx || dy));
      else {
        const step = e.shiftKey ? STEP_BIG : STEP;
        const x = clamp(item.x + dx * step, 0, 100), y = clamp(item.y + dy * step, 0, 100);
        update(id, { x, y });
        say({ ...item, x, y });
      }
    } else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(nav.length - 1);
    else if (e.key === 'Enter' || e.key === ' ') {
      if (selected) onSelect?.(undefined);
      else { select(id); say(item); }
    } else if (e.key === 'Escape' && selected) onSelect?.(undefined);
    else if ((e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_' || e.key === '−') && selected) {
      const grow = e.key === '+' || e.key === '=';
      const size = clamp((item.size ?? SIZE) * (grow ? ZOOM : 1 / ZOOM), MIN, MAX);
      if (size === (item.size ?? SIZE)) haptic('threshold');
      update(id, { size });
      say({ ...item, size });
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && onChange) {
      const next = items.filter((it) => it.id !== id);
      const rest = nav.filter((it) => it.id !== id);
      const neighbour = rest[Math.min(index, rest.length - 1)];
      setActive(neighbour?.id);
      refocus.current = true;
      if (selected) onSelect?.(undefined);
      latest.current.items = next;
      onChange(next);
      haptic('delete');
      setStatus(`Удалено: ${nameOf(item)}`);
    } else handled = false;
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  };

  return (
    <div
      ref={(n) => { board.current = n; setRef(ref, n); }}
      className={cx('y-collage', 'y-canvas', className)}
      role="application"
      aria-label={ariaLabel}
      aria-describedby={items.length ? helpId : undefined}
      tabIndex={items.length ? undefined : -1}
      {...rest}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      {dom.map((it) => (
        <span
          key={it.id}
          ref={(n) => { if (n) nodes.current.set(it.id, n); else nodes.current.delete(it.id); }}
          data-id={it.id}
          className={cx('y-collage__item', 'y-canvas__item', 'y-focus-ring', it.id === selectedId && 'is-selected', it.id === lifted && 'is-lifted', it.id === lifted && pinching && 'is-pinching')}
          style={{ left: `${it.x}%`, top: `${it.y}%`, zIndex: items.indexOf(it) + 1 }}
          role="button"
          aria-roledescription="вещь"
          aria-label={nameOf(it)}
          aria-pressed={it.id === selectedId}
          tabIndex={it.id === tabStop ? 0 : -1}
          onFocus={() => setActive(it.id)}
          onKeyDown={keys}
        >
          <ItemArt kind={it.kind} color={it.color} src={it.src} size={(it.size ?? SIZE) * k} />
        </span>
      ))}
      {hint && <div className="y-canvas__hint" style={{ zIndex: items.length + 1 }}>{hint}</div>}
      <VisuallyHidden id={helpId}>Стрелки — к соседней вещи. Enter — выбрать. У выбранной: стрелки двигают, плюс и минус меняют размер, Delete удаляет, Escape снимает выбор.</VisuallyHidden>
      <VisuallyHidden role="status" aria-live="polite">{status}</VisuallyHidden>
    </div>
  );
}
