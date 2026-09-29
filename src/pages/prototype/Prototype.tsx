import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { flushSync } from 'react-dom';
import { Snackbar } from '../../molecules';
import { cx } from '../../utils/cx';
import { gesture, motionMs, velocityTracker } from '../../utils/gesture';
import { auto, globalRoutes, HOME, label, LOOSE_DIALOGS, routes, START, type Go, type Nav, type Route } from './routes';
import { screens, type ScreenId } from './screens';
import './prototype.css';

/** Ссылки в `routes.ts` на экраны, которых нет в историях (переименовали или удалили) — в консоль, а не молчаливым тапом в пустоту. */
if (import.meta.env?.DEV) {
  const missing = new Set<string>();
  for (const [from, list] of Object.entries(routes)) {
    if (!screens[from]) missing.add(from);
    for (const r of list ?? []) if (typeof r.go === 'string' && !screens[r.go]) missing.add(r.go);
  }
  if (missing.size) console.warn(`[prototype] routes.ts ссылается на экраны без истории: ${[...missing].join(', ')}`);
}

/**
 * Кликабельный прототип приложения: экраны из «Pages / Экраны флоу», связанные переходами.
 *
 * Стек слоёв: экран поверх экрана (push / pop), шторки и диалоги поверх экрана, корни вкладок и сегменты — проявлением.
 * Компоненты экранов не меняются: элементы находятся по селектору и подписи (`routes.ts`), нативные жесты компонентов
 * (шторка профиля, холст, поля) работают как в историях.
 */

type Layer = { key: number; id: ScreenId; overlay: boolean };
type ToastState = { key: number; text: string; undo?: boolean; offset: number };

const INTERACTIVE = 'button, a[href], input, textarea, select, [role=slider], [role=switch], [role=checkbox]';
/** Контролы внутри карточек и экранов, у которых своё действие: тап по ним не ведёт по флоу. */
const NATIVE = 'input:not([readonly]), textarea:not([readonly]), select, [role=slider], [role=switch], [role=checkbox], .y-product-card__like, .y-item-card__remove, .y-photo-area__close, .y-photo-area__add, .y-chip__remove, .y-snackbar button, .y-stamp, .y-input-bar__clear';
const cssVar = (name: string, fallback: string) => (typeof document === 'undefined' ? fallback : getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback);
const anims = (el?: Element | null) => el?.getAnimations?.() ?? [];

const textOk = (r: Route, el: Element) => {
  if (r.text === undefined) return true;
  const l = label(el);
  return typeof r.text === 'string' ? l === r.text : r.text.test(l);
};

export function Prototype({ start = START, panel = true }: { start?: ScreenId; panel?: boolean }) {
  const seq = useRef(1);
  const [layers, setLayers] = useState<Layer[]>(() => [{ key: 1, id: start, overlay: screens[start].overlay }]);
  const layersRef = useRef(layers);
  const frame = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<number, HTMLElement>());
  const busy = useRef(false);
  const suppress = useRef(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [hotspots, setHotspots] = useState(false);

  const commit = useCallback((next: Layer[]) => {
    layersRef.current = next;
    flushSync(() => setLayers(next));
  }, []);
  const top = () => layersRef.current[layersRef.current.length - 1];
  const el = (l?: Layer) => (l ? els.current.get(l.key) : undefined);
  const dimOf = (e?: HTMLElement) => e?.querySelector<HTMLElement>(':scope > [data-dim]') ?? undefined;
  const show = (e: HTMLElement | undefined, on: boolean) => { if (e) e.style.visibility = on ? 'visible' : ''; };
  const play = (e: Element | undefined | null, keyframes: Keyframe[], ms: number, easing: string, fill: FillMode = 'none') =>
    e ? e.animate(keyframes, { duration: ms, easing, fill }).finished.catch(() => undefined) : Promise.resolve();
  const focusTop = () => requestAnimationFrame(() => el(top())?.querySelector<HTMLElement>('.y-screen__content')?.focus({ preventScroll: true }));
  const make = (id: ScreenId): Layer => ({ key: ++seq.current, id, overlay: screens[id].overlay });
  const screenCount = () => layersRef.current.filter((l) => !l.overlay).length;

  const nav = useMemo<Nav>(() => {
    const api: Nav = {
      async push(id) {
        const prev = top();
        commit([...layersRef.current, make(id)]);
        const cur = top(), ce = el(cur), pe = el(prev), pd = dimOf(pe), ms = motionMs('--motion-page'), ease = cssVar('--ease-out', 'ease-out');
        show(pe, true);
        const shadow = '-12px 0 32px rgb(0 0 0 / 0.18)';
        await Promise.all([
          play(ce, [{ transform: 'translateX(100%)', boxShadow: shadow }, { transform: 'translateX(0)', boxShadow: shadow }], ms, ease),
          play(pe, [{ transform: 'translateX(0)' }, { transform: 'translateX(-30%)' }], ms, ease, 'forwards'),
          play(pd, [{ opacity: 0 }, { opacity: 0.14 }], ms, ease, 'forwards'),
        ]);
        anims(pe).concat(anims(pd)).forEach((a) => a.cancel());
        show(pe, false);
        focusTop();
      },
      async back() {
        const cur = top();
        if (cur.overlay) return api.close();
        if (screenCount() < 2) return cur.id === HOME ? undefined : api.root(HOME);
        const prev = layersRef.current[layersRef.current.length - 2];
        const ce = el(cur), pe = el(prev), pd = dimOf(pe), ms = motionMs('--motion-page'), ease = cssVar('--ease-out', 'ease-out');
        show(pe, true);
        const shadow = '-12px 0 32px rgb(0 0 0 / 0.18)';
        await Promise.all([
          play(ce, [{ transform: 'translateX(0)', boxShadow: shadow }, { transform: 'translateX(100%)', boxShadow: shadow }], ms, ease, 'forwards'),
          play(pe, [{ transform: 'translateX(-30%)' }, { transform: 'translateX(0)' }], ms, ease),
          play(pd, [{ opacity: 0.14 }, { opacity: 0 }], ms, ease),
        ]);
        commit(layersRef.current.filter((l) => l.key !== cur.key));
        show(pe, false);
        focusTop();
      },
      async swap(id) {
        const old = top(), layer = make(id);
        commit([...layersRef.current, layer]);
        const oe = el(old);
        show(oe, true);
        await play(el(layer), [{ opacity: 0 }, { opacity: 1 }], motionMs('--motion-appear'), cssVar('--ease-standard', 'ease'));
        show(oe, false);
        commit(layersRef.current.filter((l) => l.key !== old.key));
        focusTop();
      },
      async root(id) {
        const olds = layersRef.current, layer = make(id);
        commit([...olds, layer]);
        olds.forEach((o) => show(el(o), true));
        await play(el(layer), [{ opacity: 0 }, { opacity: 1 }], motionMs('--motion-appear'), cssVar('--ease-standard', 'ease'));
        olds.forEach((o) => show(el(o), false));
        commit([layer]);
        focusTop();
      },
      async leave(ids) {
        const l = layersRef.current;
        let i = l.length - 1;
        while (i >= 0 && ids.includes(l[i].id) && !l[i].overlay) i--;
        if (i === l.length - 1) return;
        if (i < 0) return api.root(HOME); // в цепочку попали из списка экранов — выходить некуда, кроме главной
        // промежуточные шаги уходят без анимации, верхний — обычным «назад» к экрану входа
        commit([...l.slice(0, i + 1), l[l.length - 1]]);
        return api.back();
      },
      async overlay(id) {
        commit([...layersRef.current, make(id)]);
      },
      async close() {
        const cur = top();
        if (!cur.overlay) return;
        el(cur)?.querySelector('.y-overlay')?.classList.add('is-leaving');
        await new Promise((r) => window.setTimeout(r, motionMs('--motion-exit') + 34));
        commit(layersRef.current.filter((l) => l.key !== cur.key));
      },
      toast(text, opts) {
        const t = el(top());
        const offset = t?.querySelector('.y-bottom-nav, .y-dock') ? 132 : t?.querySelector('.y-bottom-bar') ? 100 : 36;
        setToast({ key: ++seq.current, text, undo: opts?.undo, offset });
      },
      below() {
        const l = layersRef.current;
        return l[l.length - 1]?.overlay ? l[l.length - 2]?.id : undefined;
      },
      stack() {
        return layersRef.current.map((l) => l.id);
      },
      scrollTop() {
        el(top())?.querySelector('.y-screen__content')?.scrollTo({ top: 0, behavior: 'smooth' });
      },
    };
    return api;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commit]);

  /** Переход выполняется до конца; нажатия во время анимации не копятся. */
  const run = useCallback(async (go: Go, target: HTMLElement, ev?: MouseEvent) => {
    if (busy.current) return;
    busy.current = true;
    frame.current?.setAttribute('data-busy', ''); // play-тесты ждут конца перехода
    try {
      if (typeof go === 'string') await (screens[go].overlay ? nav.overlay(go) : nav.push(go));
      else await go(nav, target, ev);
    } finally {
      busy.current = false;
      frame.current?.removeAttribute('data-busy');
    }
  }, [nav]);

  /** Верхний слой закрывается тапом по затемнению и смахиванием: шторка или диалог без риска (#89). */
  const loose = (l: Layer) => l.overlay && (LOOSE_DIALOGS.has(l.id) || !el(l)?.querySelector('[role=alertdialog]'));

  /** Маршрут для элемента под пальцем: поля и контролы с собственным действием остаются нативными. */
  const resolve = (target: Element, kind: 'tap' | 'long') => {
    const layerEl = target.closest<HTMLElement>('[data-proto-layer]');
    const layer = layersRef.current.find((l) => String(l.key) === layerEl?.dataset.protoLayer);
    if (!layerEl || !layer) return null;
    const list = [...(routes[layer.id] ?? []), ...globalRoutes].filter((r) => (r.on ?? 'tap') === kind);
    for (let e: Element | null = target; e && e !== layerEl; e = e.parentElement) {
      const route = list.find((r) => e!.matches(r.sel) && textOk(r, e!) && !(r.not && target.closest(r.not)));
      if (route) return { route, target: e as HTMLElement };
      if (kind === 'tap' && e.matches(NATIVE)) return null;
    }
    return null;
  };

  const onClickCapture = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (suppress.current) { e.preventDefault(); e.stopPropagation(); suppress.current = false; return; }
    if (t.closest('a[href^="#"]')) e.preventDefault();
    const cur = top();
    // тап по затемнению закрывает шторку и безопасный диалог; рискованный — только кнопками и Escape (#89)
    if (t.classList.contains('y-overlay') && loose(cur)) { e.stopPropagation(); void run(() => nav.close(), t); return; }
    const hit = resolve(t, 'tap');
    if (!hit) return;
    if (!hit.route.native) { e.preventDefault(); e.stopPropagation(); }
    void run(hit.route.go, hit.target, e.nativeEvent);
  };

  const onKeyDownCapture = (e: React.KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (e.key === 'Escape' && top().overlay) { e.preventDefault(); e.stopPropagation(); void run(() => nav.close(), t); return; }
    // элементы-ссылки без собственной кнопки (коллаж, плитка) активируются с клавиатуры
    if ((e.key === 'Enter' || e.key === ' ') && t.hasAttribute('data-proto-link') && !t.matches(INTERACTIVE)) { e.preventDefault(); t.click(); }
  };

  /* ─── Жесты: долгое нажатие, свайп назад от левого края, смахивание шторки ─── */
  const press = useRef<{ id: number; x: number; y: number; timer: number; t: Element } | null>(null);
  const edge = useRef<{ id: number; x0: number; y0: number; active: boolean; w: number; cur: Layer; prev: Layer; speed: ReturnType<typeof velocityTracker> } | null>(null);
  const sheet = useRef<{ id: number; x0: number; y0: number; active: boolean; h: number; offset: number; ov: HTMLElement; s: HTMLElement; speed: ReturnType<typeof velocityTracker> } | null>(null);

  const cancelPress = () => { if (press.current) { window.clearTimeout(press.current.timer); press.current = null; } };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const t = e.target as HTMLElement, box = frame.current!.getBoundingClientRect(), cur = top();
    cancelPress();
    // долгое нажатие
    const hit = resolve(t, 'long');
    if (hit) {
      const timer = window.setTimeout(() => {
        press.current = null;
        suppress.current = true;
        window.setTimeout(() => { suppress.current = false; }, 400);
        void run(hit.route.go, hit.target);
      }, gesture.longPress);
      press.current = { id: e.pointerId, x: e.clientX, y: e.clientY, timer, t };
    }
    // свайп назад от левого края
    if (!cur.overlay && screenCount() > 1 && e.clientX - box.left < 24 && !busy.current) {
      edge.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, active: false, w: box.width, cur, prev: layersRef.current[layersRef.current.length - 2], speed: velocityTracker() };
      edge.current.speed.add(e.clientX, e.clientY, e.timeStamp);
    }
    // смахивание шторки вниз (рискованный диалог не смахивается)
    const ov = t.closest<HTMLElement>('.y-overlay'), s = t.closest<HTMLElement>('.y-sheet:is([role=dialog], [role=alertdialog])');
    if (loose(cur) && ov && s && !t.closest('input, textarea, select, [role=slider], .y-chip-group--scroll') && !busy.current) {
      let scrolled = false;
      for (let a: Element | null = t; a && a !== s.parentElement; a = a.parentElement) if (a.scrollTop > 0) scrolled = true;
      if (!scrolled) {
        sheet.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, active: false, h: s.offsetHeight, offset: 0, ov, s, speed: velocityTracker() };
        sheet.current.speed.add(e.clientX, e.clientY, e.timeStamp);
      }
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (press.current && e.pointerId === press.current.id && Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > gesture.slop) cancelPress();
    const g = edge.current;
    if (g && e.pointerId === g.id) {
      g.speed.add(e.clientX, e.clientY, e.timeStamp);
      const dx = e.clientX - g.x0, dy = e.clientY - g.y0;
      if (!g.active) {
        if (Math.hypot(dx, dy) < gesture.slop) return;
        if (Math.abs(dy) > Math.abs(dx) || dx < 0) { edge.current = null; return; }
        g.active = true;
        frame.current!.setPointerCapture(e.pointerId);
        show(el(g.prev), true);
        cancelPress();
      }
      const x = Math.max(0, dx), ce = el(g.cur), pe = el(g.prev), pd = dimOf(pe);
      if (ce) { ce.style.transform = `translateX(${x}px)`; ce.style.boxShadow = '-12px 0 32px rgb(0 0 0 / 0.18)'; }
      if (pe) pe.style.transform = `translateX(${-0.3 * (g.w - x)}px)`;
      if (pd) pd.style.opacity = String(0.14 * (1 - x / g.w));
      return;
    }
    const d = sheet.current;
    if (d && e.pointerId === d.id) {
      d.speed.add(e.clientX, e.clientY, e.timeStamp);
      const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
      if (!d.active) {
        if (Math.hypot(dx, dy) < gesture.slop) return;
        if (Math.abs(dx) > Math.abs(dy)) { sheet.current = null; return; } // горизонталь — лента чипсов
        d.active = true;
        d.y0 += Math.sign(dy) * gesture.slop;
        d.ov.classList.add('is-dragging');
        d.s.setPointerCapture(e.pointerId);
        cancelPress();
      }
      const y = e.clientY - d.y0;
      d.offset = y >= 0 ? y : -Math.sqrt(-y) * 2; // вверх — короткая резинка
      d.s.style.transform = `translate3d(0, ${d.offset}px, 0)`;
      d.ov.style.setProperty('--y-dim', String(Math.max(0, 1 - Math.max(0, d.offset) / d.h)));
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    cancelPress();
    const g = edge.current;
    if (g && e.pointerId === g.id) {
      edge.current = null;
      if (!g.active) return;
      suppress.current = true;
      window.setTimeout(() => { suppress.current = false; }, 0);
      const x = Math.max(0, e.clientX - g.x0), v = g.speed.get().x;
      const go = e.type !== 'pointercancel' && (x > g.w * gesture.swipeDistance || v > gesture.swipeVelocity);
      const ce = el(g.cur), pe = el(g.prev), pd = dimOf(pe), ms = motionMs('--motion-page'), ease = cssVar('--ease-out', 'ease-out');
      const from = { c: x, p: -0.3 * (g.w - x), d: 0.14 * (1 - x / g.w) };
      const to = go ? { c: g.w, p: 0, d: 0 } : { c: 0, p: -0.3 * g.w, d: 0.14 };
      busy.current = true;
      void Promise.all([
        play(ce, [{ transform: `translateX(${from.c}px)` }, { transform: `translateX(${to.c}px)` }], ms, ease, 'forwards'),
        play(pe, [{ transform: `translateX(${from.p}px)` }, { transform: `translateX(${to.p}px)` }], ms, ease, 'forwards'),
        play(pd, [{ opacity: from.d }, { opacity: to.d }], ms, ease, 'forwards'),
      ]).then(() => {
        for (const n of [ce, pe, pd]) { if (n) { n.style.transform = ''; n.style.boxShadow = ''; n.style.opacity = ''; } }
        if (go) commit(layersRef.current.filter((l) => l.key !== g.cur.key));
        [ce, pe, pd].forEach((n) => anims(n).forEach((a) => a.cancel()));
        show(pe, false);
        busy.current = false;
        focusTop();
      });
      return;
    }
    const d = sheet.current;
    if (d && e.pointerId === d.id) {
      sheet.current = null;
      if (!d.active) return;
      suppress.current = true;
      window.setTimeout(() => { suppress.current = false; }, 0);
      d.speed.add(e.clientX, e.clientY, e.timeStamp);
      const dismiss = e.type !== 'pointercancel' && (d.offset > d.h * gesture.swipeDistance || (d.speed.get().y > gesture.swipeVelocity && d.offset > 0));
      d.s.style.removeProperty('transform'); // уход или возврат продолжается из текущего положения
      d.ov.style.removeProperty('--y-dim');
      d.ov.classList.remove('is-dragging');
      if (dismiss) void run(() => nav.close(), d.s);
    }
  };

  const onContextMenu = (e: React.MouseEvent) => {
    const hit = resolve(e.target as Element, 'long');
    if (!hit) return;
    e.preventDefault();
    cancelPress();
    void run(hit.route.go, hit.target);
  };

  /* Сплэш и загрузка уходят сами */
  const topLayer = layers[layers.length - 1];
  useEffect(() => {
    const a = auto[topLayer.id];
    if (!a) return;
    const t = window.setTimeout(() => void run(a.go, frame.current!), a.after);
    return () => window.clearTimeout(t);
  }, [topLayer.key, topLayer.id, run]);

  /* Ссылки на экранах: курсор, подсветка «Показать переходы», доступ с клавиатуры для элементов без кнопки */
  useEffect(() => {
    const root = frame.current;
    if (!root) return;
    let raf = 0;
    const mark = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        for (const layer of layersRef.current) {
          const host = els.current.get(layer.key);
          if (!host) continue;
          for (const r of [...(routes[layer.id] ?? []), ...globalRoutes]) {
            host.querySelectorAll<HTMLElement>(r.sel).forEach((n) => {
              if (!textOk(r, n)) return;
              if (!n.hasAttribute('data-proto-link')) n.setAttribute('data-proto-link', r.on === 'long' ? 'long' : '');
              if (!n.matches(INTERACTIVE) && !n.hasAttribute('tabindex')) {
                n.tabIndex = 0;
                n.setAttribute('role', 'button');
                n.removeAttribute('aria-hidden'); // декоративный аватар становится кнопкой «Изменить фото»
                if (!n.hasAttribute('aria-label')) n.setAttribute('aria-label', r.name ?? (label(n) || 'Открыть'));
              }
            });
          }
        }
      });
    };
    mark();
    const mo = new MutationObserver(mark);
    mo.observe(root, { childList: true, subtree: true });
    return () => { mo.disconnect(); cancelAnimationFrame(raf); };
  }, [layers]);

  const belowOverlay = topLayer.overlay ? layers[layers.length - 2]?.key : undefined;
  const crumbs = layers.filter((l) => !l.overlay);
  const groups = useMemo(() => {
    const g = new Map<string, ScreenId[]>();
    for (const s of Object.values(screens)) {
      const head = s.name.split(' / ')[0];
      g.set(head, [...(g.get(head) ?? []), s.id]);
    }
    return [...g];
  }, []);

  return (
    <div className="y-proto">
      <div
        ref={frame}
        className="y-proto__frame"
        data-hotspots={hotspots || undefined}
        onClickCapture={onClickCapture}
        onKeyDownCapture={onKeyDownCapture}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={onContextMenu}
      >
        {layers.map((l, i) => {
          const Screen = screens[l.id].Component;
          const visible = i === layers.length - 1 || l.key === belowOverlay;
          return (
            <div
              key={l.key}
              ref={(node) => { if (node) els.current.set(l.key, node); else els.current.delete(l.key); }}
              className={cx('y-proto__layer', l.overlay && 'y-proto__layer--overlay')}
              data-proto-layer={l.key}
              data-screen={l.id}
              data-buried={!visible || undefined}
              inert={l.key === belowOverlay || !visible}
            >
              <Screen />
              <span className="y-proto__dim" data-dim aria-hidden />
            </div>
          );
        })}
        {toast && (
          <div key={toast.key} className="y-proto__toast" style={{ bottom: toast.offset }}>
            <Snackbar autoHide onClose={() => setToast((t) => (t?.key === toast.key ? null : t))} onUndo={toast.undo ? () => undefined : undefined}>{toast.text}</Snackbar>
          </div>
        )}
      </div>

      {panel && (
        <aside className="y-proto__panel" aria-label="Панель прототипа">
          <h2 className="y-h3">Прототип</h2>
          <p className="y-caption y-text--secondary">{crumbs.map((c) => screens[c.id].name).join(' → ')}</p>
          <div className="y-proto__actions">
            <button type="button" className="y-proto__btn" onClick={() => void run(() => nav.back(), frame.current!)}>Назад</button>
            <button type="button" className="y-proto__btn" onClick={() => void run(() => nav.root(START), frame.current!)}>С начала</button>
          </div>
          <button type="button" className="y-proto__btn" aria-pressed={hotspots} onClick={() => setHotspots((v) => !v)}>Подсветить переходы</button>
          <label className="y-caption y-text--secondary">
            Открыть экран
            <select className="y-proto__select" value="" onChange={(e) => { const id = e.target.value as ScreenId; if (id) void run(() => (screens[id].overlay ? nav.overlay(id) : nav.root(id)), frame.current!); }}>
              <option value="">Все экраны ({Object.keys(screens).length})</option>
              {groups.map(([g, ids]) => (
                <optgroup key={g} label={g}>
                  {ids.map((id) => <option key={id} value={id}>{screens[id].name}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <ul className="y-proto__hints y-caption y-text--secondary">
            <li>Таб-бар, «Назад», карточки, кнопки и чипсы ведут по флоу</li>
            <li>Свайп от левого края — назад, шторку смахни вниз или нажми на затемнение</li>
            <li>Долгое нажатие на вещь в гардеробе — действия, на пустой холст образа — очистить</li>
          </ul>
        </aside>
      )}
    </div>
  );
}
