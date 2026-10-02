import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Header, type HeaderProps, Sheet } from '../organisms';
import { tokens } from '../tokens/model';
import { cx } from '../utils/cx';
import { gesture, reducedMotion, velocityTracker } from '../utils/gesture';
import { Screen } from '.';

type BarProps = Extract<HeaderProps, { type: 'bar' }>;

export type DetailsScreenProps = {
  /** Фото вещи, коллаж образа или `PhotoArea` — квадрат во всю ширину под шапкой. */
  media: ReactNode;
  /**
   * Миниатюра 48 в шапке, когда фото свёрнуто. По умолчанию — само фото, уменьшенное до 48:
   * у вещи — вещь на подложке, у образа — мини-коллаж (Figma `349:10424`, `349:10441`).
   */
  thumb?: ReactNode;
  /** Заголовок панели (H2). */
  title?: string;
  /** Пилюля по центру шапки в покое («Новая вещь»); при сворачивании её место занимает миниатюра. */
  titleChip?: string;
  /** Кнопки справа в шапке. По умолчанию — «Ещё». */
  actions?: BarProps['actions'];
  onBack?: () => void;
  /** Закреплённый низ: `BottomBar`. */
  bottom?: ReactNode;
  /** Штамп «Надеть»: закреплён поверх контента справа внизу и не едет со скроллом (Figma `1371:41156`, `1371:41329`). */
  stamp?: ReactNode;
  overlay?: ReactNode;
  scrollRef?: RefObject<HTMLElement | null>;
  /** Содержимое панели. */
  children?: ReactNode;
};

/** Пружина доводки — та же, что `--motion-sheet` (`motion.transition.sheet` → `motion.spring.critical`, ζ = 1, без перелёта). */
const spring = tokens.motion.spring[tokens.motion.transition.sheet.spring as keyof typeof tokens.motion.spring];
/** Колесо молчит дольше — жест колесом закончен, панель доводится. Пауза ввода, а не длительность движения, мс. */
const WHEEL_IDLE = 120;
/** Поля и ползунки — свои жесты: панель за них не тянется. */
const OWN_GESTURE = 'input, textarea, select, [role=slider], [contenteditable]';
/** Инерция контента после жеста: замедление за 1 мс (0,998 — `UIScrollView.DecelerationRate.normal`) и скорость остановки, pt/мс. */
const COAST_DECAY = 0.998;
const COAST_MIN = 0.02;

/**
 * Детали вещи и образа (Figma: Wardrobe / Item Details `1371:41024 → 1371:41076`, Outfit Details `1371:41156 → 1371:41329`,
 * Animations «new things» `354:17405 → 354:17449`).
 *
 * **Шторка.** Панель — шторка над фото с прогрессом p ∈ [0, 1] (`--details-p` на экране, пишется раз в кадр):
 * - p = 0 — покой: фото 353 на y138, панель с хэндлом на y511;
 * - p = 1 — свёрнуто: панель на y138 под шапкой, фото — миниатюра 48 по центру шапки (`Screen` → `data-collapsed`);
 * - между ними всё линейно по p: панель `translateY` на полный ход (фото + 20 = 373 на 393×852), фото — translate + scale
 *   в миниатюру, пилюля `titleChip` гаснет за первую половину хода. Только transform / opacity, раскладка не меняется.
 *
 * **Жест.** Палец (pointer) на панели или фото ведёт её 1 : 1 по вертикали, колесо — так же. Пока p < 1, жест двигает панель,
 * а не прокручивает её контент; при p = 1 прокручивается контент. Жест вниз при p = 1 сначала докручивает контент к началу,
 * а дальше тем же движением тянет панель вниз (#234); мышью так же и вверх — прокрутки перетаскиванием у мыши нет.
 * Отпустили в контенте — он докатывается по инерции (замедление 0,998 / мс, как у прокрутки iOS). Пока тянут, текст не выделяется.
 * Отпускание: бросок быстрее `--gesture-swipe-velocity` (500 pt/с) — в сторону броска, иначе к ближайшему краю (p ≥ 0,5 → 1);
 * колесо доводится в сторону последней прокрутки. Доводка — пружина `--motion-sheet` без перелёта со скоростью пальца
 * (считается в JS: CSS-переход не принимает стартовую скорость). Пока палец на экране, переходов нет.
 *
 * **Клавиатура.** Прокрутка контента с клавиатуры или переход фокуса вглубь панели сворачивают фото; ↑ / PageUp / Home
 * у начала контента — разворачивают. Прокрутка снаружи (`scrollRef`, истории «Scrolled») до первого жеста — сразу свёрнутое
 * состояние. При «Уменьшении движения» доводка мгновенная, за пальцем — 1 : 1. Штамп и нижняя панель (`BottomBar`) — на месте.
 */
export function DetailsScreen({ media, thumb, title, titleChip, actions = [{ icon: 'more', label: 'Ещё' }], onBack, bottom, stamp, overlay, scrollRef, children }: DetailsScreenProps) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useLayoutEffect(() => {
    const media = mediaRef.current, spacer = spacerRef.current;
    const root = media?.parentElement;
    const main = spacer?.parentElement;
    const panel = spacer?.nextElementSibling as HTMLElement | null | undefined;
    if (!media || !spacer || !root || !main || !panel) return;

    let p = 0, travel = 1, frame = 0, anim = 0, wheelTimer = 0, wheelDir = 0, shown = false, interacted = false, dragged = false;
    let drag: { id: number; x0: number; y0: number; p0: number; s0: number; mouse: boolean; active: boolean } | null = null;
    let coastFrame = 0;
    const speed = velocityTracker();

    // Цель морфа и ход панели — от раскладки (transform на неё не влияет): фото во всю ширину → квадрат 48 по центру шапки
    const measure = () => {
      const w = media.offsetWidth;
      if (!w) return;
      media.style.setProperty('--details-scale', String(48 / w));
      media.style.setProperty('--details-dx', `${(root.clientWidth - 48) / 2 - media.offsetLeft}px`);
      travel = Math.max(1, panel.offsetTop - spacer.offsetTop);
      root.style.setProperty('--details-travel', `${travel}px`);
    };

    // p — в CSS раз в кадр
    const write = () => { frame = 0; root.style.setProperty('--details-p', String(Math.round(p * 1e4) / 1e4)); };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(write); };
    const show = (c: boolean) => { if (c !== shown) { shown = c; setCollapsed(c); } };
    const stop = () => { cancelAnimationFrame(anim); anim = 0; };
    const stopCoast = () => { cancelAnimationFrame(coastFrame); coastFrame = 0; };
    /** Контент после жеста докатывается по инерции; `v` — скорость пальца в pt/мс, > 0 — вниз (контент — к началу). */
    const coast = (v: number) => {
      stopCoast();
      if (reducedMotion() || Math.abs(v) < COAST_MIN) return;
      let last = performance.now();
      const step = (now: number) => {
        const dt = Math.min(64, Math.max(0, now - last));
        last = now;
        main.scrollTop -= v * dt;
        v *= COAST_DECAY ** dt;
        const end = main.scrollTop <= 0 || main.scrollTop >= main.scrollHeight - main.clientHeight;
        coastFrame = Math.abs(v) < COAST_MIN || end ? 0 : requestAnimationFrame(step);
      };
      coastFrame = requestAnimationFrame(step);
    };
    /** За пальцем / колесом: состояние — по ближайшему краю. */
    const follow = (v: number) => { p = Math.min(1, Math.max(0, v)); schedule(); show(p >= 0.5); };

    /** Доводка к краю пружиной `--motion-sheet`; `v0` — скорость p в 1/мс. Перелёт за край срезается: шторка без перелёта. */
    const settle = (target: 0 | 1, v0 = 0) => {
      stop();
      show(target === 1);
      if (reducedMotion() || (p === target && !v0)) { p = target; schedule(); return; }
      const { mass: m, stiffness: k, damping: c } = spring;
      let x = p - target, v = v0 * 1000, last = performance.now();
      const step = (now: number) => {
        // полунеявный Эйлер шагами по 1 мс; кадр длиннее 64 мс (вкладка в фоне) не разгоняет пружину
        for (let dt = Math.min(64, Math.max(0, now - last)) / 1000; dt > 0; dt -= 0.001) {
          const h = Math.min(dt, 0.001);
          v += ((-k * x - c * v) / m) * h;
          x += v * h;
        }
        last = now;
        if ((target === 1 && x > 0) || (target === 0 && x < 0)) { x = 0; v = 0; }
        p = target + x;
        // ближе 0,5 pt к краю и почти стоит — на месте
        const done = Math.abs(x) * travel < 0.5 && Math.abs(v) * travel < 10;
        if (done) p = target;
        schedule();
        anim = done ? 0 : requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    };

    // Пока p < 1, контент не прокручивается: прокрутка с клавиатуры, фокусом или снаружи сворачивает фото
    const scroll = () => {
      if (drag?.active || p >= 1 || main.scrollTop <= 0) return;
      main.scrollTop = 0;
      if (interacted) settle(1);
      else { stop(); p = 1; schedule(); show(true); } // состояние «Scrolled» при открытии — сразу, без доводки
    };
    const keydown = (e: KeyboardEvent) => {
      interacted = true;
      if (e.target !== main || p < 1 || main.scrollTop > 0 || !['ArrowUp', 'PageUp', 'Home'].includes(e.key)) return;
      e.preventDefault();
      settle(0);
    };

    const wheel = (e: WheelEvent) => {
      const t = e.target as Element;
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || !(main.contains(t) || media.contains(t))) return;
      stopCoast();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? main.clientHeight : 1);
      // p < 1 — колесо двигает панель; p = 1 — прокручивает контент, а вверх от его начала — снова панель
      if (!dy || (dy > 0 && p >= 1) || (dy < 0 && (p <= 0 || main.scrollTop > 0))) return;
      e.preventDefault();
      interacted = true;
      stop();
      follow(p + dy / travel);
      wheelDir = Math.sign(dy);
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => { if (p > 0 && p < 1) settle(wheelDir > 0 ? 1 : 0); }, WHEEL_IDLE);
    };

    const down = (e: PointerEvent) => {
      dragged = false;
      interacted = true;
      if (drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const t = e.target as Element;
      if (!((main.contains(t) && panel.contains(t)) || media.contains(t)) || t.closest(OWN_GESTURE)) return;
      stopCoast(); // палец поймал докатывающийся контент
      // контент может быть прокручен (рывок вверх дальше полного хода): жест вниз сначала докрутит его к началу
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, p0: p, s0: 0, mouse: e.pointerType === 'mouse', active: false };
      speed.reset();
      speed.add(e.clientX, e.clientY, e.timeStamp);
    };
    const move = (e: PointerEvent) => {
      const d = drag;
      if (!d || e.pointerId !== d.id) return;
      speed.add(e.clientX, e.clientY, e.timeStamp);
      const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
      if (!d.active) {
        if (Math.hypot(dx, dy) < gesture.slop) return;
        // горизонтальный жест — лента чипсов; вверх при p = 1 пальцем — нативная прокрутка контента (у мыши её нет — ведём сами)
        if (Math.abs(dx) > Math.abs(dy) || (p >= 1 && dy < 0 && !d.mouse)) { drag = null; return; }
        stop(); // подхватили на доводке — с текущего места
        d.active = true;
        d.p0 = p;
        d.s0 = main.scrollTop;
        window.getSelection()?.removeAllRanges(); // мышь успела начать выделение до порога жеста
        d.y0 += Math.sign(dy) * gesture.slop; // без скачка на величину slop
        root.dataset.dragging = '';
        try { root.setPointerCapture(e.pointerId); } catch { /* синтетический указатель (play-тест) — захват не нужен */ }
      }
      // s — путь от покоя: ход панели + прокрутка контента. Сверх полного хода палец прокручивает контент, а вниз сначала
      // докручивает его к началу и дальше тянет панель — тем же движением
      const s = d.p0 * travel + d.s0 - (e.clientY - d.y0);
      follow(s / travel);
      main.scrollTop = Math.max(0, s - travel);
      // упёрлись в конец контента: лишний ход не копится, обратный жест сразу двигает контент
      const over = s - travel - main.scrollTop;
      if (over > 1) d.s0 -= over;
    };
    const up = (e: PointerEvent) => {
      const d = drag;
      if (!d || e.pointerId !== d.id) return;
      drag = null;
      if (!d.active) return;
      dragged = true;
      delete root.dataset.dragging;
      speed.add(e.clientX, e.clientY, e.timeStamp);
      const v = e.type === 'pointercancel' ? 0 : speed.get().y; // pt/мс, > 0 — вниз
      if (p >= 1 && main.scrollTop > 0) { coast(v); return; } // ушли в контент — панель уже наверху, контент докатывается
      const target = v > gesture.swipeVelocity ? 0 : v < -gesture.swipeVelocity ? 1 : p >= 0.5 ? 1 : 0;
      settle(target, -v / travel);
    };
    // Палец по панели: отменённый touchmove не даёт браузеру начать прокрутку (и pointercancel), pointermove идут дальше
    const touchmove = (e: TouchEvent) => {
      const d = drag, t = e.touches[0];
      if (!d || !t || !e.cancelable || e.touches.length > 1) return;
      const dx = t.clientX - d.x0, dy = t.clientY - d.y0;
      if (d.active || (Math.abs(dy) >= Math.abs(dx) && (p < 1 || dy > 0))) e.preventDefault();
    };
    // после жеста отпускание пальца не должно стать нажатием
    const click = (e: MouseEvent) => { if (dragged) { dragged = false; e.preventDefault(); e.stopPropagation(); } };
    // мышью панель тянут, а не выделяют текст: выделение не начинается, пока идёт жест
    const selectstart = (e: Event) => { if (drag?.active) e.preventDefault(); };

    measure();
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    ro?.observe(root);
    ro?.observe(spacer);
    main.addEventListener('scroll', scroll);
    main.addEventListener('keydown', keydown);
    root.addEventListener('wheel', wheel, { passive: false });
    root.addEventListener('pointerdown', down);
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerup', up);
    root.addEventListener('pointercancel', up);
    root.addEventListener('touchmove', touchmove, { passive: false });
    root.addEventListener('click', click, true);
    root.addEventListener('selectstart', selectstart);
    return () => {
      ro?.disconnect();
      stop();
      stopCoast();
      cancelAnimationFrame(frame);
      window.clearTimeout(wheelTimer);
      main.removeEventListener('scroll', scroll);
      main.removeEventListener('keydown', keydown);
      root.removeEventListener('wheel', wheel);
      root.removeEventListener('pointerdown', down);
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerup', up);
      root.removeEventListener('pointercancel', up);
      root.removeEventListener('touchmove', touchmove);
      root.removeEventListener('click', click, true);
      root.removeEventListener('selectstart', selectstart);
    };
  }, []);

  return (
    <Screen
      className={cx('y-details', thumb != null && 'y-details--thumb')}
      /* отдельный шаблон: шапка закреплена, фото сворачивается в миниатюру шторкой — правило #170 сюда не относится */
      pinHeader
      collapsed={collapsed}
      header={<Header type="bar" titleChip={titleChip} actions={actions} onBack={onBack} centerOnScroll={thumb} />}
      backdrop={
        <>
          <div ref={mediaRef} className="y-details__media">{media}</div>
          {stamp && <div className="y-details__stamp">{stamp}</div>}
        </>
      }
      bottom={bottom}
      overlay={overlay}
      scrollRef={scrollRef}
      flush
    >
      {/* место фото в потоке не меняется: панель едет по нему transform-ом */}
      <div ref={spacerRef} className="y-details__spacer" aria-hidden />
      <Sheet type="panel" title={title}>{children}</Sheet>
    </Screen>
  );
}
