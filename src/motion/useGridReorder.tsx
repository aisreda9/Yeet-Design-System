import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { gesture } from '../utils/gesture';
import { haptic } from '../utils/haptic';
import { VisuallyHidden } from '../utils/VisuallyHidden';
import { useReducedMotion } from './useReducedMotion';
import './reorder.css';

/** Автоскролл у краёв скролла при перетаскивании: зона у края и скорость в самом краю (`--gesture-autoscroll-edge` / `-speed`). */
const AUTOSCROLL_EDGE = gesture.autoscrollEdge; // px
const AUTOSCROLL_SPEED = gesture.autoscrollSpeed; // px за кадр в самом краю
/** «Далеко за сетку»: палец ушёл за её край дальше размера карточки — перестановка отменяется. */
const CANCEL_CARDS = 1;

export type GridReorderOptions<T> = {
  items: readonly T[];
  getKey: (item: T) => string;
  /** Новый порядок — после отпускания или Space / Enter с клавиатуры. Во время жеста порядок живёт внутри хука. */
  onReorder: (next: T[]) => void;
  /** Имя элемента для скринридера («Верх», «Nike Ava Edge»). */
  getLabel?: (item: T) => string;
};

export type GridReorder<T> = {
  /** Элементы в текущем порядке (во время жеста — с перестановкой «на лету»). Рендерить их, а не `items`. */
  items: T[];
  /** На контейнер сетки. */
  gridProps: { ref: (n: HTMLElement | null) => void; 'data-reorder': '' };
  /** На каждый элемент сетки (прямой потомок контейнера): ItemCard, ProductCard. */
  itemProps: (key: string) => {
    ref: (n: HTMLElement | null) => void;
    'data-reorder-key': string;
    className: string;
    onPointerDown: (e: PointerEvent<HTMLElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
    onKeyUp: (e: KeyboardEvent<HTMLElement>) => void;
  };
  /** Подсказка и aria-live — положить внутрь сетки (визуально скрыты, места не занимают). */
  announcer: ReactNode;
  /** Ключ поднятого элемента. */
  lifted: string | null;
};

type Slot = { cx: number; cy: number; w: number; h: number };
type Drag = {
  key: string;
  id: number;
  type: string;
  x0: number;
  y0: number;
  x: number;
  y: number;
  phase: 'pending' | 'armed' | 'lifted';
  timer: number;
  /** Палец относительно центра карточки в момент подъёма. */
  grab: { x: number; y: number };
};
type Pick = { key: string; mode: 'pointer' | 'keyboard'; from: number; origin: string[] };

const FOCUSABLE = 'button, [href], input, [tabindex]:not([tabindex="-1"])';
const focusableOf = (n: HTMLElement) => (n.matches(FOCUSABLE) ? n : n.querySelector<HTMLElement>(FOCUSABLE));

/** Ближайший предок, который прокручивается по вертикали (экран `Screen`), иначе — документ. */
function scrollerOf(el: HTMLElement): HTMLElement {
  for (let n = el.parentElement; n; n = n.parentElement) {
    const o = getComputedStyle(n).overflowY;
    if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight) return n;
  }
  return (document.scrollingElement as HTMLElement) ?? document.documentElement;
}

/**
 * Перестановка элементов сетки долгим тапом (#209): Гардероб и Вишлист.
 *
 * - **Тап** (< `--gesture-long-press`, сдвиг < `--gesture-touch-slop`) — обычный клик карточки.
 * - **Удержание без движения** — хук ничего не делает: хозяин (прототип) открывает шторку действий на отпускании.
 * - **Удержание и сдвиг дальше slop** — подъём: scale `--gesture-lift-scale`, тень `--shadow-floating`, хаптика `lift`.
 *   Карточка ведётся пальцем 1 : 1, соседи раздвигаются FLIP на `--motion-drop`, на каждой новой позиции — `select`.
 *   У краёв скролла — автоскролл. Отпускание — карточка садится (`drop`); Esc или палец далеко за сеткой — всё назад на `--motion-return`.
 * - **Клавиатура:** Space — взять, стрелки — двигать, Space / Enter — поставить, Esc — отменить; объявления через aria-live.
 * - **«Уменьшение движения»:** токены `--motion-*` мгновенные, подъём без масштаба; соседи встают сразу.
 */
export function useGridReorder<T>({ items, getKey, onReorder, getLabel }: GridReorderOptions<T>): GridReorder<T> {
  const reduced = useReducedMotion();
  const helpId = useId();
  const [order, setOrder] = useState<string[] | null>(null);
  const [pick, setPick] = useState<Pick | null>(null);
  const [status, setStatus] = useState('');

  const grid = useRef<HTMLElement | null>(null);
  const nodes = useRef(new Map<string, HTMLElement>());
  const slots = useRef<Slot[]>([]);
  const drag = useRef<Drag | null>(null);
  /** FLIP: положения до перестановки (центры) и элемент, который возвращается на `--motion-return`. */
  const flip = useRef<{ first: Map<string, { x: number; y: number }>; returning?: string } | null>(null);
  const frame = useRef(0);
  const refs = useRef(new Map<string, (n: HTMLElement | null) => void>());

  const byKey = new Map(items.map((it) => [getKey(it), it]));
  const keys = order ?? items.map(getKey);
  const list = keys.map((k) => byKey.get(k)).filter((it): it is T => it !== undefined);

  // свежие значения для слушателей на window (ставятся один раз на жест)
  const latest = useRef({ keys, items, pick, reduced, onReorder, getKey, getLabel });
  useLayoutEffect(() => {
    latest.current = { keys, items, pick, reduced, onReorder, getKey, getLabel };
  }); // до FLIP ниже

  const nameOf = (key: string) => {
    const it = latest.current.items.find((x) => latest.current.getKey(x) === key);
    return it !== undefined && latest.current.getLabel ? latest.current.getLabel(it) : 'Вещь';
  };
  const where = (i: number) => `позиция ${i + 1} из ${latest.current.keys.length}`;
  const onto = (i: number) => `на позицию ${i + 1} из ${latest.current.keys.length}`;

  /* ─── Геометрия ─── */

  /** Центры ячеек по порядку, в координатах сетки (без сдвигов: размер — offsetWidth, центр scale не сдвигает, translate вычитаем). */
  const measure = () => {
    const g = grid.current?.getBoundingClientRect();
    if (!g) return;
    slots.current = latest.current.keys.map((k) => {
      const n = nodes.current.get(k);
      if (!n || !n.offsetWidth) return { cx: NaN, cy: NaN, w: 0, h: 0 }; // скрытая (прототип убрал вещь) — не цель
      const r = n.getBoundingClientRect();
      // соседи могут ещё доезжать (FLIP): вычитаем текущий translate — нужна ячейка, а не видимое положение
      const t = getComputedStyle(n).translate,
        [tx = 0, ty = 0] = t === 'none' ? [] : t.split(' ').map(parseFloat);
      return {
        cx: r.left + r.width / 2 - tx - g.left,
        cy: r.top + r.height / 2 - ty - g.top,
        w: n.offsetWidth,
        h: n.offsetHeight,
      };
    });
  };

  /** Поднятая карточка — под пальцем (1 : 1), относительно своей ячейки в текущем порядке. */
  const place = () => {
    const d = drag.current,
      g = grid.current?.getBoundingClientRect();
    if (!d || d.phase !== 'lifted' || !g) return;
    const s = slots.current[latest.current.keys.indexOf(d.key)],
      n = nodes.current.get(d.key);
    if (!s || !n) return;
    n.style.translate = `${d.x - g.left - d.grab.x - s.cx}px ${d.y - g.top - d.grab.y - s.cy}px`;
  };

  const snapshot = (returning?: string) => {
    const first = new Map<string, { x: number; y: number }>();
    nodes.current.forEach((n, k) => {
      if (drag.current?.phase === 'lifted' && drag.current.key === k) return; // ведётся пальцем, FLIP не нужен
      const r = n.getBoundingClientRect();
      first.set(k, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    });
    flip.current = { first, returning };
  };

  /* FLIP после перестановки: сняли сдвиги → измерили ячейки → вернули на старые места → отпустили на `--motion-drop` */
  useLayoutEffect(() => {
    const f = flip.current;
    if (!f) return;
    flip.current = null;
    const live = drag.current?.phase === 'lifted' ? drag.current.key : null;
    const moved = new Set<string>();
    nodes.current.forEach((n, k) => {
      // translate — мгновенно (инверсия FLIP), подъём / посадка (scale, тень) — своим переходом
      const t = k === f.returning ? 'var(--motion-return)' : 'var(--motion-drop)';
      n.style.transition = `scale ${t}, box-shadow ${t}`;
      n.style.translate = '';
    });
    measure();
    nodes.current.forEach((n, k) => {
      const was = f.first.get(k);
      if (k === live || !was || reduced) return;
      const r = n.getBoundingClientRect();
      const dx = was.x - (r.left + r.width / 2),
        dy = was.y - (r.top + r.height / 2);
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      n.style.translate = `${dx}px ${dy}px`;
      moved.add(k);
    });
    void grid.current?.offsetWidth; // зафиксировать стартовое положение до перехода
    nodes.current.forEach((n, k) => {
      if (k === live) {
        n.style.transition = '';
        return;
      }
      if (k === f.returning && moved.has(k)) {
        // мимо цели или отмена — назад на пружине gentle; потом снова общие переходы из reorder.css
        n.style.transition =
          'translate var(--motion-return), scale var(--motion-return), box-shadow var(--motion-return)';
        const done = (ev: TransitionEvent) => {
          if (ev.target === n && ev.propertyName === 'translate') {
            n.style.transition = '';
            n.removeEventListener('transitionend', done);
          }
        };
        n.addEventListener('transitionend', done);
      } else n.style.transition = '';
      n.style.translate = '';
    });
    place();
    // клавиатура: DOM-узел переехал — фокус остаётся на нём
    const p = latest.current.pick;
    if (p?.mode === 'keyboard') {
      const n = nodes.current.get(p.key),
        t = n && focusableOf(n);
      if (t && !n.contains(document.activeElement)) t.focus();
    }
  });

  /** Подсказка для скринридера — на фокусируемом элементе карточки (у ProductCard это кнопка внутри). */
  useEffect(() => {
    nodes.current.forEach((n) => focusableOf(n)?.setAttribute('aria-describedby', helpId));
  });

  /* ─── Перестановка ─── */

  const moveTo = (to: number) => {
    const p = latest.current.pick;
    if (!p) return false;
    const cur = latest.current.keys.indexOf(p.key);
    to = Math.max(0, Math.min(latest.current.keys.length - 1, to));
    if (to === cur || cur < 0) return false;
    snapshot();
    const next = latest.current.keys.filter((k) => k !== p.key);
    next.splice(to, 0, p.key);
    latest.current.keys = next;
    setOrder(next);
    haptic('select');
    setStatus(`Перемещено ${onto(to)}`);
    return true;
  };

  const lift = (key: string, mode: Pick['mode']) => {
    const keysNow = latest.current.keys;
    const p: Pick = { key, mode, from: keysNow.indexOf(key), origin: keysNow };
    latest.current.pick = p;
    setPick(p);
    setOrder(keysNow);
    haptic('lift');
  };

  /** Поставить: новый порядок уходит хозяину; не сдвинули — карточка возвращается (без хаптики). */
  const drop = (cancel = false) => {
    const p = latest.current.pick;
    if (!p) return;
    const final = cancel ? p.origin : latest.current.keys;
    const to = final.indexOf(p.key),
      moved = to !== p.from;
    snapshot(moved ? undefined : p.key);
    if (moved) {
      haptic('drop');
      const map = new Map(latest.current.items.map((it) => [latest.current.getKey(it), it]));
      latest.current.onReorder(final.map((k) => map.get(k)).filter((it): it is T => it !== undefined));
      setStatus(`Перемещено ${onto(to)}`);
    } else
      setStatus(cancel ? `Перестановка отменена. ${nameOf(p.key)}: ${where(to)}` : `${nameOf(p.key)}: ${where(to)}`);
    latest.current.pick = null;
    setPick(null);
    setOrder(null);
  };

  /* ─── Указатель ─── */

  const stopListening = useRef<() => void>(() => undefined);
  const end = () => {
    const d = drag.current;
    if (d) window.clearTimeout(d.timer);
    cancelAnimationFrame(frame.current);
    stopListening.current();
    drag.current = null;
  };
  useEffect(() => end, []); // снять таймер и слушатели при уходе

  /** Клик после подъёма не открывает карточку: window в фазе захвата — раньше любого обработчика экрана. */
  const swallowClick = () => {
    const stop = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('click', stop, { capture: true, once: true });
    window.setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 0);
  };

  const hitTest = () => {
    const d = drag.current,
      g = grid.current?.getBoundingClientRect();
    if (!d || !g) return;
    const x = d.x - g.left,
      y = d.y - g.top,
      s0 = slots.current.find((s) => s.w) ?? { w: 0, h: 0 };
    const far =
      x < -s0.w * CANCEL_CARDS ||
      y < -s0.h * CANCEL_CARDS ||
      x > g.width + s0.w * CANCEL_CARDS ||
      y > g.height + s0.h * CANCEL_CARDS;
    if (far) {
      end();
      window.addEventListener('pointerup', swallowClick, { capture: true, once: true }); // палец ещё на экране: его отпускание — не клик
      drop(true);
      return;
    }
    const i = slots.current.findIndex((s) => s.w && Math.abs(x - s.cx) <= s.w / 2 && Math.abs(y - s.cy) <= s.h / 2);
    if (i >= 0) moveTo(i);
  };

  const autoscroll = () => {
    const d = drag.current,
      root = grid.current;
    if (!d || d.phase !== 'lifted' || !root) return;
    const sc = scrollerOf(root),
      doc = sc === document.scrollingElement;
    const r = doc ? { top: 0, bottom: window.innerHeight } : sc.getBoundingClientRect();
    // дальше краёв самой сетки не крутим: поднятая карточка своим сдвигом растягивает область прокрутки
    const g = root.getBoundingClientRect();
    let v = 0;
    if (d.y < r.top + AUTOSCROLL_EDGE && g.top < r.top)
      v = -AUTOSCROLL_SPEED * Math.min(1, (r.top + AUTOSCROLL_EDGE - d.y) / AUTOSCROLL_EDGE);
    else if (d.y > r.bottom - AUTOSCROLL_EDGE && g.bottom > r.bottom)
      v = AUTOSCROLL_SPEED * Math.min(1, (d.y - (r.bottom - AUTOSCROLL_EDGE)) / AUTOSCROLL_EDGE);
    if (v) {
      const before = sc.scrollTop;
      sc.scrollTop += v;
      if (sc.scrollTop !== before) {
        place();
        hitTest();
      }
    }
    frame.current = requestAnimationFrame(autoscroll);
  };

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if ((e.pointerType === 'mouse' && e.button !== 0) || drag.current || latest.current.pick) return;
    const key = e.currentTarget.dataset.reorderKey!;
    const d: Drag = {
      key,
      id: e.pointerId,
      type: e.pointerType,
      x0: e.clientX,
      y0: e.clientY,
      x: e.clientX,
      y: e.clientY,
      phase: 'pending',
      timer: 0,
      grab: { x: 0, y: 0 },
    };
    // удержание: ждём `--gesture-long-press`, палец не сдвинулся — «взведено»; поднимет только движение дальше slop
    d.timer = window.setTimeout(() => {
      if (drag.current === d) d.phase = 'armed';
    }, gesture.longPress);
    drag.current = d;

    const move = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== d.id || drag.current !== d) return;
      d.x = ev.clientX;
      d.y = ev.clientY;
      const far = Math.hypot(d.x - d.x0, d.y - d.y0) > gesture.slop;
      if (d.phase === 'pending') {
        if (far) end();
        return;
      } // сдвиг раньше долгого нажатия — это скролл
      if (d.phase === 'armed') {
        if (!far) return;
        measure();
        const g = grid.current!.getBoundingClientRect(),
          s = slots.current[latest.current.keys.indexOf(d.key)];
        d.grab = { x: d.x0 - g.left - s.cx, y: d.y0 - g.top - s.cy };
        d.phase = 'lifted';
        lift(d.key, 'pointer');
        frame.current = requestAnimationFrame(autoscroll);
      }
      ev.preventDefault();
      place();
      hitTest();
    };
    const up = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== d.id || drag.current !== d) return;
      const lifted = d.phase === 'lifted';
      end();
      if (!lifted) return; // тап или удержание без движения — решает хозяин (клик, шторка действий)
      swallowClick();
      drop(ev.type === 'pointercancel');
    };
    const key2 = (ev: globalThis.KeyboardEvent) => {
      if (ev.key !== 'Escape' || drag.current !== d || d.phase !== 'lifted') return;
      ev.preventDefault();
      ev.stopPropagation();
      end();
      swallowClick();
      drop(true);
    };
    // долгое нажатие на тач не должно стать системным меню; мышью правая кнопка остаётся (прототип: шторка действий)
    const menu = (ev: Event) => {
      if (d.type !== 'mouse' && drag.current === d) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    };
    const touch = (ev: TouchEvent) => {
      if (drag.current === d && d.phase !== 'pending') ev.preventDefault();
    }; // взвели — экран не скроллится
    const root = grid.current;
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('keydown', key2, true);
    root?.addEventListener('contextmenu', menu);
    root?.addEventListener('touchmove', touch, { passive: false });
    stopListening.current = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('keydown', key2, true);
      root?.removeEventListener('contextmenu', menu);
      root?.removeEventListener('touchmove', touch);
      stopListening.current = () => undefined;
    };
  };

  /* ─── Клавиатура ─── */

  const columns = () => {
    const s = slots.current.filter((x) => x.w);
    return Math.max(1, s.filter((x) => Math.abs(x.cy - s[0].cy) < 1).length);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey || drag.current) return;
    const key = e.currentTarget.dataset.reorderKey!,
      p = latest.current.pick;
    let handled = true;
    if (!p) {
      if (e.key === ' ') {
        measure();
        lift(key, 'keyboard');
        setStatus(
          `${nameOf(key)}: взято, ${where(latest.current.keys.indexOf(key))}. Стрелки — переместить, пробел или Enter — поставить, Escape — отменить.`,
        );
      } else handled = false;
    } else if (p.key !== key) handled = false;
    else {
      const cur = latest.current.keys.indexOf(key),
        cols = columns();
      const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols };
      if (e.key in step) moveTo(cur + step[e.key]);
      else if (e.key === 'Home') moveTo(0);
      else if (e.key === 'End') moveTo(latest.current.keys.length - 1);
      else if (e.key === ' ' || e.key === 'Enter') drop();
      else if (e.key === 'Escape') drop(true);
      else if (e.key === 'Tab') {
        drop();
        handled = false;
      } // уход фокуса — поставить, где стоит
      else handled = false;
    }
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  /** Space у кнопки срабатывает на keyup: гасим, иначе «взять» откроет карточку. */
  const onKeyUp = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === ' ') e.preventDefault();
  };

  const lifted = pick?.key ?? null;
  const itemProps = (key: string) => {
    let ref = refs.current.get(key);
    if (!ref) {
      ref = (n: HTMLElement | null) => {
        if (n) nodes.current.set(key, n);
        else nodes.current.delete(key);
      };
      refs.current.set(key, ref);
    }
    const cls = [
      'y-reorder-item',
      lifted === key && 'is-lifted',
      lifted === key && pick?.mode === 'pointer' && 'is-dragging',
    ]
      .filter(Boolean)
      .join(' ');
    return { ref, 'data-reorder-key': key, className: cls, onPointerDown, onKeyDown, onKeyUp };
  };

  return {
    items: list,
    gridProps: {
      ref: (n: HTMLElement | null) => {
        grid.current = n;
      },
      'data-reorder': '',
    },
    itemProps,
    announcer: (
      <>
        <VisuallyHidden id={helpId}>
          Пробел — взять и переставить: стрелки двигают, пробел или Enter ставит, Escape отменяет.
        </VisuallyHidden>
        <VisuallyHidden role="status" aria-live="polite">
          {status}
        </VisuallyHidden>
      </>
    ),
    lifted,
  };
}
