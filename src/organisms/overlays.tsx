import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { Button, IconButton, type ButtonStyle } from '../atoms';
import { cx } from '../utils/cx';
import { gesture, motionMs, rubberBand, velocityTracker } from '../utils/gesture';
import { haptic } from '../utils/haptic';
import { LeavingContext, usePresence } from '../utils/usePresence';

/* ─── Sheet & Dialog ────────────────────────────────────────────────── */

type FooterAction = { label: string; variant?: ButtonStyle; onClick?: () => void };

/*
 * Решения дизайна из design/SHEETS-AUDIT.md — каждое переключается одной правкой:
 * D1 — подтверждение (Dialog) без хэндла: плавающая карточка, заголовок на 20 от верха. `true` — хэндл, если слой закрываемый.
 * D6 — рискованное подтверждение (`tone` destructive / danger) закрывается только кнопками и Escape: не свайпом и не тапом по затемнению.
 * D5 — пружина шторки без перелёта: `--sheet-spring` в organisms.css (вернуть `--motion-nav` — там же).
 */
const DIALOG_HANDLE = false;
const RISKY_DIALOG_BUTTONS_ONLY = true;

/** Что шторка сообщает слою: колбэк любого закрытия и можно ли закрыть свайпом / тапом по затемнению. */
type LayerOptions = { onDismiss?: () => void; swipe?: boolean; backdrop?: boolean };

/** Модальный слой вокруг шторки: закрыть его с анимацией ухода (`Overlay` с `onClose` / `onOpenChange`). */
const OverlayContext = createContext<{ dismiss?: () => void; register: (options: LayerOptions) => () => void } | null>(null);

/** Шторка регистрирует в слое свой колбэк закрытия (`onClose` / `onCancel`) и запреты жестов: закрытие любым путём идёт через него. */
function useLayerOptions({ onDismiss, swipe = true, backdrop = true }: LayerOptions) {
  const layer = useContext(OverlayContext);
  const register = layer?.register;
  useEffect(() => register?.({ onDismiss, swipe, backdrop }), [register, onDismiss, swipe, backdrop]);
  return layer;
}

/** Escape внутри шторки: закрывает её и не даёт закрыть слой второй раз. */
const onEscape = (close?: () => void) => (e: KeyboardEvent) => {
  if (e.key !== 'Escape' || !close || e.defaultPrevented) return;
  e.preventDefault();
  close();
};

function Footer({ actions, focusLast }: { actions: FooterAction[]; focusLast?: boolean }) {
  return (
    <div className="y-sheet__footer">
      {actions.map((a, i) => (
        <Button key={i} variant={a.variant ?? (i === 0 ? 'tertiary' : 'primary')} size="L" fullWidth={actions.length === 1} onClick={a.onClick} data-autofocus={(focusLast && i === actions.length - 1) || undefined}>
          <span className="y-sheet__footer-label">{a.label}</span>
        </Button>
      ))}
    </div>
  );
}

export type SheetProps = {
  title?: string;
  /** Абзац-пояснение под заголовком: Body серым, 12 под заголовком и 20 до контента (Settings / Currency `513:6256`). */
  description?: ReactNode;
  /**
   * `modal` — плавающая карточка поверх overlay: отступ 8 от краёв экрана, радиус 32 сверху и 48 снизу (концентрично углу экрана).
   * `panel` — постоянная панель деталей во всю ширину, 32 сверху, с тенью.
   */
  type?: 'modal' | 'panel';
  footer?: [FooterAction, FooterAction];
  /**
   * Крестик справа от заголовка вместо хэндла: высокая шторка со своим скроллом (Outfit Creation / Item Filter).
   * Escape тоже закрывает; внутри `Overlay` с `onClose` / `onOpenChange` Escape закрывает слой с анимацией ухода.
   */
  onClose?: () => void;
  /** Имя для скринридера, если у шторки нет заголовка. С `title` имя берётся из заголовка. */
  label?: string;
  /**
   * Показывать хэндл (Figma: sheet · Show Handle). По умолчанию — да, если нет крестика.
   * `false` — панель без хэндла (Outfit Creation / Item Selection).
   */
  handle?: boolean;
  className?: string;
  children?: ReactNode;
};

/**
 * Bottom sheet — основа всех выборов, действий и фильтров. Всё временное открывается sheet'ом, а не новым экраном.
 * Хэндл → 16 → заголовок H3 → 12 → контент → 16 → пара кнопок L через 7.
 * Контент: `ListItem` (действия, радио, категории), `ChipGroup` (фильтры), `PhotoTile` (фото), `InputBar` (поиск), `AccountCard` (аккаунты).
 */
export function Sheet({ title, description, type = 'modal', footer, onClose, label, handle = !onClose, className, children }: SheetProps) {
  const layer = useLayerOptions({ onDismiss: onClose });
  const titleId = useId();
  const descId = useId();
  const modal = type === 'modal';
  useEffect(() => {
    if (import.meta.env.DEV && modal && !title && !label) console.warn('Sheet: у модальной шторки нет имени — передайте `title` или `label`.');
  }, [modal, title, label]);
  const heading = type === 'panel' ? 'y-h2' : 'y-h3';
  const h2 = title && <h2 id={titleId} className={cx(heading, 'y-sheet__title')}>{title}</h2>;
  const desc = description && <p id={descId} className="y-body y-text--secondary y-sheet__description">{description}</p>;
  return (
    <section
      className={cx('y-sheet', `y-sheet--${type}`, !handle && 'y-sheet--no-handle', className)}
      role={modal ? 'dialog' : undefined}
      aria-modal={(modal && !!layer) || undefined} // модальна только в слое Overlay; в документации — обычный блок
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : label}
      aria-describedby={description ? descId : undefined}
      onKeyDown={modal ? onEscape(layer?.dismiss ?? onClose) : undefined}
    >
      {handle && <span className="y-sheet__handle" aria-hidden />}
      {onClose ? (
        <div className="y-sheet__head">
          {h2}
          <IconButton icon="cross" label="Закрыть" variant="ghost" size="S" onClick={layer?.dismiss ?? onClose} />
        </div>
      ) : (
        h2
      )}
      {modal ? (
        (description || children) && (
          // шапка и футер закреплены, прокручивается только тело (SHEETS-AUDIT C1–C3, D2)
          <div className="y-sheet__body">
            {desc}
            {children}
          </div>
        )
      ) : (
        <>
          {desc}
          {children}
        </>
      )}
      {footer && <Footer actions={footer} />}
    </section>
  );
}

export type DialogProps = {
  /**
   * `default` — Tertiary + Primary («Выйти / Сохранить и выйти»).
   * `destructive` — необратимое действие серым слева, безопасная «Отмена» синей справа («Очистить / Отмена»).
   * `danger` — удаление аккаунта: красная Destructive слева, «Отменить» синей справа.
   */
  tone?: 'default' | 'destructive' | 'danger';
  title: string;
  description?: ReactNode;
  /** Без `cancel` — диалог-уведомление с одной кнопкой `confirm` Tertiary на всю ширину («Ок!»). */
  cancel?: string;
  confirm: string;
  /**
   * Отмена — при любом закрытии, кроме `confirm`: кнопка `cancel`, Escape, а у нерискованного диалога и свайп, и тап по затемнению.
   * В закрываемом слое `Overlay` слой уходит с анимацией сам, `onCancel` вызывается вместе с его `onOpenChange(false)`.
   */
  onCancel?: () => void;
  onConfirm?: () => void;
  /** Хэндл (Figma: dialog · Show Handle). По умолчанию нет (решение D1): подтверждение — плавающая карточка, заголовок на 20 от верха. */
  handle?: boolean;
  /**
   * Закрывается ли свайпом и тапом по затемнению. По умолчанию — только нерискованный (`tone="default"`, решение D6):
   * `destructive` и `danger` закрываются только кнопками и Escape. Escape работает всегда.
   */
  dismissible?: boolean;
  children?: ReactNode;
};

/**
 * Подтверждение в той же плавающей форме, что и sheet. **Безопасное действие всегда синее справа.**
 * Одна кнопка (нет `cancel`) — уведомление: Tertiary L на всю ширину.
 * В слое `Overlay` фокус при открытии — на безопасном действии (правая кнопка), Escape — `onCancel`.
 */
export function Dialog({ tone = 'default', title, description, cancel, confirm, onCancel, onConfirm, handle, dismissible, children }: DialogProps) {
  const risky = tone !== 'default';
  const loose = dismissible ?? !(risky && RISKY_DIALOG_BUTTONS_ONLY);
  const layer = useLayerOptions({ onDismiss: onCancel, swipe: loose, backdrop: loose });
  const id = useId();
  const cancelAll = layer?.dismiss ?? onCancel; // через слой: уход с анимацией и onCancel один раз
  const showHandle = handle ?? (DIALOG_HANDLE && !!layer?.dismiss && loose);
  const described = [description && `${id}-text`, children && `${id}-more`].filter(Boolean).join(' ');
  return (
    <section
      className={cx('y-sheet', 'y-sheet--modal', !showHandle && 'y-sheet--no-handle')}
      role="alertdialog"
      aria-modal={!!layer || undefined}
      aria-labelledby={`${id}-title`}
      aria-describedby={described || undefined}
      onKeyDown={onEscape(cancelAll)}
    >
      {showHandle && <span className="y-sheet__handle" aria-hidden />}
      <div className="y-sheet__body">
        <div className="y-dialog__text">
          <h2 id={`${id}-title`} className="y-h3">{title}</h2>
          {description && <p id={`${id}-text`} className="y-body y-text--secondary">{description}</p>}
        </div>
        {children && <div id={`${id}-more`} className="y-dialog__more">{children}</div>}
      </div>
      <Footer
        focusLast // безопасное действие всегда справа
        actions={
          !cancel
            ? [{ label: confirm, variant: 'tertiary', onClick: onConfirm }]
            : risky
            ? [{ label: confirm, variant: tone === 'danger' ? 'destructive' : 'tertiary', onClick: onConfirm }, { label: cancel, onClick: cancelAll }]
            : [{ label: cancel, onClick: cancelAll }, { label: confirm, onClick: onConfirm }]
        }
      />
    </section>
  );
}

export type OverlayProps = {
  /** Показан ли слой. Без `open` — показан, пока смонтирован. */
  open?: boolean;
  /** Запрос закрыть: смахивание, тап по затемнению, Escape. Вызывается сразу, уход доигрывает сам слой. */
  onOpenChange?: (open: boolean) => void;
  /** Без `open`: вызывается после анимации ухода. С `open` — сразу, вместе с `onOpenChange(false)`. */
  onClose?: () => void;
  children: ReactNode;
};

/**
 * Модальный слой: затемнение `--color-bg-overlay` и прижатая к низу плавающая шторка.
 *
 * **Движение.** Появление — шторка снизу на пружине quick (`--motion-nav`), затемнение `--motion-fade`; уход быстрее —
 * `--motion-exit`, шторка уезжает целиком за край: 100 % + отступ 8. Всё на transition — появление и уход прерываются
 * и разворачиваются из текущего положения.
 *
 * **Смахивание** (если есть `onClose` или `onOpenChange`): тянется за пальцем 1 : 1 вниз и с сопротивлением `--gesture-rubber-band` вверх,
 * затемнение гаснет вместе с ней. Закрывается, если протянута дальше 30 % высоты (`--gesture-swipe-distance`, хаптика
 * `threshold` в момент пересечения) или брошена быстрее 500 pt/с; иначе возвращается на пружине quick.
 * Жест начинается только после сдвига на `--gesture-touch-slop` — кнопки и строки в шторке нажимаются как обычно.
 * Закрывают также тап по затемнению и Escape.
 *
 * **Модальность.** При открытии фокус переходит в шторку: на `[data-autofocus]` (в `Dialog` — безопасное действие),
 * иначе на первый интерактивный элемент, кроме полей и ползунков (на телефоне поле подняло бы клавиатуру), иначе на саму шторку. Tab и Shift+Tab ходят по кругу внутри слоя, фон (соседи слоя: шапка,
 * контент `Screen`, низ) получает `inert`. После закрытия фокус возвращается туда, откуда слой открыли.
 *
 * **Открытие.** `open` / `onOpenChange` — слой сам доигрывает уход (`is-leaving`, `--motion-exit`) и убирается из DOM:
 * `<Overlay open={open} onOpenChange={setOpen}>`. Без `open` слой показан всегда, а уход доигрывает `Screen`
 * (или `onClose` — вызывается после анимации ухода).
 */
export function Overlay({ open, ...props }: OverlayProps) {
  const presence = usePresence(open === false ? undefined : true);
  if (open === undefined) return <OverlayLayer {...props} />;
  return presence.node ? <OverlayLayer {...props} controlled leaving={presence.leaving} /> : null;
}

/** Последний ввод — клавиатура? Слой, открытый мышью, пальцем или сразу на экране, не рисует кольцо фокуса при открытии. */
let keyboardInput = false;
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => { if (!e.metaKey && !e.altKey && !e.ctrlKey) keyboardInput = true; }, true);
  document.addEventListener('pointerdown', () => { keyboardInput = false; }, true);
}

const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const FIELD = 'input, textarea, select, [role=slider], [contenteditable]';
const tabbables = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>(TABBABLE)].filter((el) => el.tabIndex >= 0 && !el.closest('[inert]') && el.getClientRects().length > 0);

function OverlayLayer({ children, onClose, onOpenChange, controlled, leaving: leavingProp }: Omit<OverlayProps, 'open'> & { controlled?: boolean; leaving?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const leavingFromScreen = useContext(LeavingContext);
  const [closing, setClosing] = useState(false);
  const [dragging, setDragging] = useState(false);
  /** `body` — жест начат в теле прокрутки: шторку тянет только палец вниз, вверх — прокрутка тела. */
  const drag = useRef<{ id: number; x0: number; y0: number; h: number; offset: number; active: boolean; crossed: boolean; body: boolean } | null>(null);
  const speed = useRef(velocityTracker());
  const dragged = useRef(false);
  const leaving = closing || leavingFromScreen || !!leavingProp;
  const closable = !!(onClose || onOpenChange);
  const options = useRef<LayerOptions>({});
  const sheet = () => ref.current?.querySelector<HTMLElement>('.y-sheet') ?? null;

  // Один путь закрытия для свайпа, затемнения, Escape, крестика и «Отмены»: колбэк шторки (onClose / onCancel), затем слой
  const close = useCallback(() => {
    options.current.onDismiss?.();
    if (controlled) {
      // уход доигрывает сам слой (open → false); если родитель оставил слой открытым — ничего не происходит
      onOpenChange?.(false);
      onClose?.();
      return;
    }
    onOpenChange?.(false); // без open уход доигрывает Screen, когда родитель уберёт слой (C9)
    if (!onClose) return;
    setClosing(true);
    // родитель убирает слой; если оставил (закрытие отклонено) — шторка возвращается
    window.setTimeout(() => { onClose(); setClosing(false); }, motionMs('--motion-exit'));
  }, [controlled, onClose, onOpenChange]);

  // Модальность: фокус внутрь, фон inert; при уходе — фон обратно и фокус туда, откуда открыли
  useEffect(() => {
    const o = ref.current;
    if (!o || leaving) return;
    const opener = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    const background = [...(o.parentElement?.children ?? [])].filter((el): el is HTMLElement => el !== o && el instanceof HTMLElement && !el.inert);
    background.forEach((el) => { el.inert = true; });
    const focusInto = () => {
      if (o.contains(document.activeElement)) return;
      const s = sheet() ?? o;
      // поле и ползунок не берут фокус при открытии: на телефоне поле подняло бы клавиатуру
      const target = s.querySelector<HTMLElement>('[data-autofocus]') ?? tabbables(s).find((el) => !el.closest(FIELD)) ?? s;
      if (target === s && !s.hasAttribute('tabindex')) s.tabIndex = -1;
      if (!keyboardInput) {
        // кольцо фокуса — только когда пользователь идёт с клавиатуры (focus({ focusVisible }) Chromium пока не умеет)
        target.dataset.focusQuiet = '';
        const loud = () => { delete target.dataset.focusQuiet; target.removeEventListener('blur', loud); o.removeEventListener('keydown', loud); };
        target.addEventListener('blur', loud);
        o.addEventListener('keydown', loud);
      }
      target.focus({ preventScroll: true });
    };
    focusInto();
    // Sheet → Dialog в том же слое («Удалить навсегда» → подтверждение): фокус ушёл бы в body вместе со старой шторкой (C6)
    const swap = new MutationObserver(focusInto);
    swap.observe(o, { childList: true });
    return () => {
      swap.disconnect();
      background.forEach((el) => { el.inert = false; });
      const active = document.activeElement;
      if (opener?.isConnected && (!active || active === document.body || o.contains(active))) opener.focus({ preventScroll: true });
    };
  }, [leaving]);

  // Тело прокрутки — touch-action: pan-y, браузер сам ведёт прокрутку. Когда тело в самом верху и палец идёт вниз,
  // жест забирает шторка: отменённый touchmove не даёт браузеру начать прокрутку (и pointercancel) — pointermove идут дальше.
  // React вешает touchmove пассивно, поэтому слушатель — свой, { passive: false }.
  useEffect(() => {
    const o = ref.current;
    if (!o) return;
    const touchmove = (e: TouchEvent) => {
      const d = drag.current, p = e.touches[0];
      if (!d || !p || !e.cancelable || e.touches.length > 1) return;
      const dx = p.clientX - d.x0, dy = p.clientY - d.y0;
      if (d.active || (dy > 0 && dy >= Math.abs(dx))) e.preventDefault();
    };
    o.addEventListener('touchmove', touchmove, { passive: false });
    return () => o.removeEventListener('touchmove', touchmove);
  }, []);

  const register = useCallback((o: LayerOptions) => {
    options.current = o;
    return () => { if (options.current === o) options.current = {}; };
  }, []);
  const layer = useMemo(() => ({ dismiss: closable ? close : undefined, register }), [closable, close, register]);

  const keys = (e: KeyboardEvent<HTMLDivElement>) => {
    const o = ref.current;
    if (!o || leaving) return;
    if (e.key === 'Escape' && !e.defaultPrevented && closable) {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      // фокус-ловушка: по кругу внутри слоя
      const list = tabbables(o);
      const first = list[0], last = list[list.length - 1], active = document.activeElement;
      if (!first) { e.preventDefault(); return; }
      if (e.shiftKey && (active === first || !list.includes(active as HTMLElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || !list.includes(active as HTMLElement))) { e.preventDefault(); first.focus(); }
    }
  };

  const place = (offset: number) => {
    const s = sheet(), o = ref.current, d = drag.current;
    if (!s || !o || !d) return;
    d.offset = offset;
    s.style.transform = `translate3d(0, ${offset}px, 0)`;
    o.style.setProperty('--y-dim', String(Math.max(0, 1 - Math.max(0, offset) / d.h)));
  };
  const release = () => {
    const s = sheet(), o = ref.current;
    s?.style.removeProperty('transform');
    o?.style.removeProperty('--y-dim');
    setDragging(false);
  };

  const down = (e: PointerEvent<HTMLDivElement>) => {
    dragged.current = false;
    const s = sheet(), t = e.target as Element;
    if (!closable || leaving || !s || !s.contains(t) || options.current.swipe === false || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (t.closest('input, textarea, select, [role=slider]')) return; // поле и ползунок — свои жесты
    // прокрученное тело (и любой скролл внутри него) сначала докручивается к началу — включая саму шторку (C2)
    for (let a: Element | null = t; a; a = a === s ? null : a.parentElement) if (a.scrollTop > 0) return;
    const body = !!t.closest('.y-sheet__body');
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, h: s.offsetHeight, offset: 0, active: false, crossed: false, body };
    speed.current.reset();
    speed.current.add(e.clientX, e.clientY, e.timeStamp);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    speed.current.add(e.clientX, e.clientY, e.timeStamp);
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    if (!d.active) {
      if (Math.hypot(dx, dy) < gesture.slop) return;
      if (Math.abs(dx) > Math.abs(dy)) { drag.current = null; return; } // горизонтальный жест — лента чипсов, не шторка
      if (d.body && dy < 0) { drag.current = null; return; } // из тела вверх — прокрутка тела, не шторка
      d.active = true;
      d.y0 += Math.sign(dy) * gesture.slop; // без скачка на величину slop
      try { sheet()?.setPointerCapture(e.pointerId); } catch { /* синтетический указатель (play-тест) — захват не нужен */ }
      setDragging(true);
    }
    const y = e.clientY - d.y0;
    place(y >= 0 ? y : rubberBand(y, d.h));
    const crossed = y > d.h * gesture.swipeDistance;
    if (crossed && !d.crossed) haptic('threshold'); // один раз при пересечении; обратно — без вибрации
    d.crossed = crossed;
  };
  const up = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    if (!d.active) return;
    dragged.current = true;
    const v = speed.current.get().y;
    const dismiss = e.type !== 'pointercancel' && (d.offset > d.h * gesture.swipeDistance || (v > gesture.swipeVelocity && d.offset > 0));
    release(); // закрытие продолжится из текущего положения (exit), возврат — на пружине quick
    if (dismiss) close();
  };

  return (
    <div
      ref={ref}
      className={cx('y-overlay', leaving && 'is-leaving', dragging && 'is-dragging')}
      onKeyDown={keys}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      // после смахивания отпускание пальца не должно стать нажатием
      onClickCapture={(e) => { if (dragged.current) { e.stopPropagation(); dragged.current = false; } }}
      // нажатие на затемнение не уводит фокус из слоя в body — иначе у незакрываемого тапом диалога пропал бы Escape
      onMouseDown={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}
      onClick={closable ? (e) => e.target === e.currentTarget && options.current.backdrop !== false && close() : undefined}
    >
      <OverlayContext.Provider value={layer}>{children}</OverlayContext.Provider>
    </div>
  );
}
