import { isValidElement, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { ScrollEdge } from '../atoms';
import { Header, StatusBar } from '../organisms';
import { cx } from '../utils/cx';
import { LeavingContext, usePresence } from '../utils/usePresence';
import '../styles.css';

export type ScreenProps = {
  /**
   * Шапка (`Header`). Если нет — рисуется статус-бар.
   * Большой заголовок (`Header variant="large"`) уезжает вместе с контентом, остальные шапки закреплены — см. `pinHeader`.
   */
  header?: ReactNode;
  /**
   * Закрепить шапку над скроллом. По умолчанию закреплены все шапки, кроме большого заголовка (`variant="large"`):
   * он уезжает с контентом, а закреплён только статус-бар (#170). `DetailsScreen` закрепляет шапку явно.
   */
  pinHeader?: boolean;
  /** Закреплённый низ: `BottomNav` или `BottomBar`. */
  bottom?: ReactNode;
  /** Модальный слой (`Overlay` со `Sheet` / `Dialog`). */
  overlay?: ReactNode;
  /** Плавающий элемент над низом экрана: `Snackbar`, `Hint`, «Показать ещё». */
  floating?: ReactNode;
  floatingOffset?: number;
  /** Центрировать контент по вертикали (пустые состояния, загрузка). */
  center?: boolean;
  /** Контент без боковых полей (фото на всю ширину, панели). */
  flush?: boolean;
  /** Контент прижат к низу экрана, в 20 от края (кнопка поверх фото). */
  end?: boolean;
  /**
   * Фон экрана: `canvas` (по умолчанию), `accent` — сплэш на цвете бренда, `photo` — фото на весь экран (кадрирование).
   * На `accent` и `photo` статус-бар и текст белые.
   */
  background?: 'canvas' | 'accent' | 'photo';
  /** Фото для `background="photo"`. */
  photo?: string;
  /**
   * Слой над фоном и под контентом, вне скролла (`position: absolute` внутри экрана):
   * фото деталей, которое сворачивается в шапку (`DetailsScreen`).
   */
  backdrop?: ReactNode;
  /** Скролл-контейнер экрана — для хуков скролла и историй в прокрученном состоянии. */
  scrollRef?: RefObject<HTMLElement | null>;
  className?: string;
  children?: ReactNode;
};

/** Большой заголовок корневой вкладки: `<Header variant="large">` (или устаревшее `type="large"`). */
function isLargeHeader(header: ReactNode) {
  if (!isValidElement(header) || header.type !== Header) return false;
  const { variant, type } = header.props as { variant?: string; type?: string };
  return (variant ?? type) === 'large';
}

/**
 * Шаблон экрана iPhone 393×852.
 *
 * Правило скролла (#170): контент скроллится и **уходит под закреплённые края** — статус-бар сверху, `BottomNav` / `BottomBar` снизу.
 * - Большой заголовок (`Header variant="large"`) не закреплён и не сворачивается: уезжает вместе с контентом.
 * - Ряд фильтров в `<Sticky>` прилипает сразу под статус-бар (фильтры на y70); сегмент и остальное уезжают.
 * - Шапки с «назад», поиском и детали (`bar`, `back`, `search`, `DetailsScreen`) закреплены, как раньше (`pinHeader`).
 *
 * Полосы затухания появляются, только когда под краем действительно есть контент:
 * верхняя — после начала скролла (под статус-баром или под прилипшими фильтрами), нижняя — пока список не докручен до конца.
 * Если под краем панель (`Sheet type="panel"`, bg-elevated) — подложка края и затухание берут цвет панели (`--screen-edge-bg`).
 */
export function Screen({ header, pinHeader, bottom, overlay, floating, floatingOffset = 132, center, flush, end, background = 'canvas', photo, backdrop, scrollRef, className, children }: ScreenProps) {
  const own = useRef<HTMLElement>(null);
  const ref = scrollRef ?? own;
  // шапка в скролле: закреплён только статус-бар, заголовок уезжает с контентом
  const scrolls = header != null && !(pinHeader ?? !isLargeHeader(header));
  const [edges, setEdges] = useState({ top: false, bottom: false, collapsed: false, stuck: false, panelTop: false, panelBottom: false });
  const frame = useRef(0);
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // stuck — липкие фильтры прижаты к верху скролла: под ними проявляется затухание
    const sticky = el.querySelector<HTMLElement>(':scope > .y-sticky');
    const box = el.getBoundingClientRect();
    const stuck = !!sticky && el.scrollTop > 1 && sticky.getBoundingClientRect().top - box.top < 1;
    // панель (Sheet type="panel", bg-elevated) под краем: подложка и затухание края берут её цвет, а не bg-canvas (#181)
    const panel = el.querySelector<HTMLElement>(':scope > .y-sheet--panel')?.getBoundingClientRect();
    const panelTop = !!panel && el.scrollTop > 1 && panel.top - box.top < 1 && panel.bottom > box.top;
    const panelBottom = !!panel && panel.top < box.bottom && panel.bottom > box.bottom - 1;
    setEdges((prev) => {
      // collapsed — для закреплённой шапки: фото деталей → миниатюра, заголовок `back` → пилюля (у шапки в скролле не выставляется).
      // Гистерезис 24 / 8: шапка при сворачивании меняет высоту, и без запаса заголовок дрожал бы на границе
      const collapsed = prev.collapsed ? el.scrollTop > 8 : el.scrollTop > 24;
      const next = { top: el.scrollTop > 1, bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 1, collapsed, stuck, panelTop, panelBottom };
      // тот же объект — React не перерисовывает экран на каждое событие скролла
      return (Object.keys(next) as (keyof typeof next)[]).every((k) => next[k] === prev[k]) ? prev : next;
    });
  // ref.current читается в момент вызова; с [ref] React Compiler не сохраняет мемоизацию (preserve-manual-memoization)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // скролл читается раз в кадр: чтение scrollTop / scrollHeight — после отрисовки, без дёрганья layout
  const onScroll = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(update);
  }, [update]);
  useEffect(() => {
    update();
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { ro.disconnect(); cancelAnimationFrame(frame.current); };
  }, [update, ref]);
  // убранные overlay и floating доигрывают уход (--motion-exit), а не исчезают мгновенно
  const layer = usePresence(overlay);
  const toast = usePresence(floating);

  return (
    <div
      className={cx('y-screen', background !== 'canvas' && `y-screen--${background}`, className)}
      style={photo ? { ['--screen-photo' as string]: `url("${photo}")` } : undefined}
      data-edge-top={edges.top || undefined} data-edge-bottom={edges.bottom || undefined} data-collapsed={(!scrolls && edges.collapsed) || undefined} data-stuck={edges.stuck || undefined}
      data-panel-top={edges.panelTop || undefined} data-panel-bottom={edges.panelBottom || undefined}>
      {scrolls ? (
        <div className="y-screen__top">
          <StatusBar onAccent={background === 'accent'} onPhoto={background === 'photo'} />
          <ScrollEdge position="top" size={24} />
        </div>
      ) : header ?? <StatusBar onAccent={background === 'accent'} onPhoto={background === 'photo'} />}
      {backdrop}
      {/* tabIndex у прокручиваемой области — прокрутка с клавиатуры (axe scrollable-region-focusable) */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <main ref={ref} onScroll={onScroll} tabIndex={0} className={cx('y-screen__content', center && 'y-screen__content--center', end && 'y-screen__content--end', flush && 'y-screen__content--flush', scrolls && 'y-screen__content--header')}>
        {scrolls && header}
        {children}
      </main>
      {bottom}
      {toast.node && (
        <div className="y-screen__floating" style={{ bottom: floatingOffset }} data-leaving={toast.leaving || undefined}>
          <LeavingContext.Provider value={toast.leaving}>{toast.node}</LeavingContext.Provider>
        </div>
      )}
      {layer.node && <LeavingContext.Provider value={layer.leaving}>{layer.node}</LeavingContext.Provider>}
    </div>
  );
}

/* ─── Layout primitives ─────────────────────────────────────────────── */

/**
 * Липкая полоса внутри скролла — только ряд фильтров (поиск, архив, чипсы): прижимается под статус-бар
 * (под закреплённую шапку, если она есть) и остаётся на месте, пока контент едет под ней.
 * На фоне экрана, во всю ширину, с затуханием снизу, когда прижата (`Screen[data-stuck]`).
 * Сегмент «Вещи / Образы / Вишлист» и вложенные переключатели не прилипают — уезжают с контентом (#170).
 */
export function Sticky({ children }: { children: ReactNode }) {
  return <div className="y-sticky">{children}</div>;
}

/**
 * Сетка карточек в 2 колонки по ширине экрана (173 + 7 + 173). Вещи, товары, поездки, карточки стилиста.
 * `rowGap` — больше, если под карточкой есть подпись (товары в поиске).
 */
export function Grid({ rowGap, children }: { rowGap?: number; children: ReactNode }) {
  return <div className="y-grid" style={rowGap ? { rowGap } : undefined}>{children}</div>;
}

/**
 * Горизонтальный ряд: пара плиток фото, иконки-фильтры перед чипсами.
 * `justify="space-between"` — блоки по краям (аккаунты и период в Профиле), `center` — один блок по центру (аватар).
 */
export function Row({ gap = 8, align, justify, children }: { gap?: number; align?: CSSProperties['alignItems']; justify?: CSSProperties['justifyContent']; children: ReactNode }) {
  return <div className="y-row" style={{ gap, alignItems: align, justifyContent: justify }}>{children}</div>;
}

/**
 * Вертикальная группа с собственным шагом, когда шаг экрана 20 не подходит:
 * кнопка и ссылка под ней (8), заголовок и подзаголовок (12), цена и подпись (0).
 * `align="center"` — блоки по центру по своей ширине (ghost-кнопка «Не помнишь пароль?»).
 */
export function Stack({ gap = 8, align, className, children }: { gap?: number; align?: CSSProperties['alignItems']; className?: string; children: ReactNode }) {
  return <div className={cx('y-stack', className)} style={{ gap, alignItems: align }}>{children}</div>;
}

export { DetailsScreen, type DetailsScreenProps } from './details';
export { Prose, type ProseBlock, type ProseProps, type ProseSection } from './prose';
