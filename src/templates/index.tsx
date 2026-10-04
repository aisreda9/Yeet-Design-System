import { isValidElement, useCallback, useEffect, useRef, useState, type ComponentPropsWithRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { ScrollEdge } from '../atoms';
import { Header, StatusBar } from '../organisms';
import { cx } from '../utils/cx';
import { LeavingContext, usePresence } from '../utils/usePresence';
import '../styles.css';

export type ScreenProps = {
  /**
   * Шапка (`Header`). Если нет — рисуется статус-бар.
   * Большой заголовок (`Header variant="large"`) уезжает вместе с контентом; у `Header variant="back"` закреплён ряд «назад»,
   * а заголовок уезжает; остальные шапки закреплены — см. `pinHeader`.
   */
  header?: ReactNode;
  /**
   * Закрепить шапку над скроллом целиком. По умолчанию закреплены все шапки, кроме большого заголовка (`variant="large"`):
   * он уезжает с контентом, а закреплён только статус-бар (#170), — и шапки `variant="back"`: у неё закреплён только ряд
   * «назад», заголовок уезжает (#203). `DetailsScreen` закрепляет шапку явно.
   */
  pinHeader?: boolean;
  /** Закреплённый низ: `BottomNav` или `BottomBar`. */
  bottom?: ReactNode;
  /**
   * Панель-док (#114, Figma Outfit Creation / Canvas `1371:42129`, `1371:42202`): `Sheet type="panel"` под контентом до низа экрана
   * (`BottomBar` поверх него), вне скролла экрана. Контент над ней стоит; прокручивается только **последний блок панели** (сетка вещей),
   * хэндл, заголовок и фильтры над ним закреплены. Жеста закрытия нет, `role` и `aria-modal` не ставятся.
   */
  dock?: ReactNode;
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
  /**
   * Свёрнутое состояние закреплённой шапки (`data-collapsed`) задаёт шаблон, а не скролл: `DetailsScreen` — фото свёрнуто
   * шторкой (#220). Без него — по скроллу, гистерезис 24 / 8.
   */
  collapsed?: boolean;
  /** Скролл-контейнер экрана — для хуков скролла и историй в прокрученном состоянии. */
  scrollRef?: RefObject<HTMLElement | null>;
  className?: string;
  children?: ReactNode;
};

/** Вид шапки: `<Header variant="large">` (или устаревшее `type="large"`); не `Header` — `undefined`. */
function headerVariant(header: ReactNode) {
  if (!isValidElement(header) || header.type !== Header) return undefined;
  const { variant, type } = header.props as { variant?: string; type?: string };
  return variant ?? type;
}

/**
 * Шаблон экрана iPhone 393×852.
 *
 * Правило скролла (#170): контент скроллится и **уходит под закреплённые края** — статус-бар сверху, `BottomNav` / `BottomBar` снизу.
 * - Большой заголовок (`Header variant="large"`) не закреплён и не сворачивается: уезжает вместе с контентом.
 * - Ряд фильтров в `<Sticky>` прилипает сразу под статус-бар (фильтры на y70); сегмент и остальное уезжают.
 * - Шапка `back` (#203, как large title в iOS и top app bar в M3): ряд «назад» закреплён под статус-баром, «назад» всегда под рукой;
 *   большой заголовок и подзаголовок уезжают с контентом, а когда заголовок ушёл под ряд — в ряду проявляется компактный
 *   (`data-collapsed`). Фильтры в `<Sticky>` прилипают под ряд.
 * - Шапки `bar`, `search` и детали (`DetailsScreen`) закреплены целиком (`pinHeader`).
 * - Панель-док (`dock`, Canvas создания образа): контент над ней стоит, прокручивается только тело панели (#114).
 *
 * Полосы затухания появляются, только когда под краем действительно есть контент:
 * верхняя — после начала скролла (под статус-баром или под прилипшими фильтрами), нижняя — пока список не докручен до конца.
 * Если под краем панель (`Sheet type="panel"`, bg-elevated) — подложка края и затухание берут цвет панели (`--screen-edge-bg`).
 */
export function Screen({ header, pinHeader, bottom, dock, overlay, floating, floatingOffset = 132, center, flush, end, background = 'canvas', photo, backdrop, collapsed: collapsedProp, scrollRef, className, children }: ScreenProps) {
  const own = useRef<HTMLElement>(null);
  const ref = scrollRef ?? own;
  const dockRef = useRef<HTMLDivElement>(null);
  const kind = headerVariant(header);
  // шапка в скролле: закреплён только статус-бар, заголовок уезжает с контентом
  const scrolls = header != null && !(pinHeader ?? (kind !== 'large' && kind !== 'back'));
  // у шапки `back` в скролле ряд «назад» прилипает под статус-бар (position: sticky), заголовок уезжает
  const pinsBar = scrolls && kind === 'back';
  const [edges, setEdges] = useState({ top: false, bottom: false, collapsed: false, stuck: false, panelTop: false, panelBottom: false });
  const frame = useRef(0);
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    // закреплённый ряд шапки `back` внутри скролла: верхний край — под ним, а не у верха скролла (#203)
    const bar = el.querySelector<HTMLElement>(':scope > .y-header .y-header__row');
    const pin = bar ? bar.getBoundingClientRect().bottom - box.top : 0;
    // stuck — липкие фильтры прижаты к верху скролла (или к ряду «назад»): под ними проявляется затухание
    const sticky = el.querySelector<HTMLElement>(':scope > .y-sticky');
    const stuck = !!sticky && el.scrollTop > 1 && sticky.getBoundingClientRect().top - box.top < pin + 1;
    // панель (Sheet type="panel", bg-elevated) под краем: подложка и затухание края берут её цвет, а не bg-canvas (#181)
    const panel = el.querySelector<HTMLElement>(':scope > .y-sheet--panel')?.getBoundingClientRect();
    const panelTop = !!panel && el.scrollTop > 1 && panel.top - box.top < pin + 1 && panel.bottom > box.top + pin;
    // большой заголовок `back` целиком ушёл под ряд → компактный заголовок в ряду. Высота шапки не меняется — без гистерезиса
    const title = bar && el.querySelector<HTMLElement>(':scope > .y-header .y-header__back-title');
    // док: панель всегда доходит до низа, нижнее затухание — пока его прокрутка не докручена до конца
    const docked = dockRef.current?.querySelector<HTMLElement>(':scope > .y-sheet--panel > :last-child');
    const panelBottom = !!dockRef.current || (!!panel && panel.top < box.bottom && panel.bottom > box.bottom - 1);
    const below = docked ? docked.scrollTop + docked.clientHeight < docked.scrollHeight - 1 : el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    setEdges((prev) => {
      // collapsed — для закреплённой шапки: фото деталей → миниатюра, заголовок `back` схлопнут → компактный.
      // Гистерезис 24 / 8: шапка при сворачивании меняет высоту, и без запаса заголовок дрожал бы на границе
      const collapsed = title ? title.getBoundingClientRect().bottom <= box.top + pin : prev.collapsed ? el.scrollTop > 8 : el.scrollTop > 24;
      const next = { top: el.scrollTop > 1, bottom: below, collapsed, stuck, panelTop, panelBottom };
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
    if (dockRef.current) ro.observe(dockRef.current);
    return () => { ro.disconnect(); cancelAnimationFrame(frame.current); };
  }, [update, ref]);
  // убранные overlay и floating доигрывают уход (--motion-exit), а не исчезают мгновенно
  const layer = usePresence(overlay);
  const toast = usePresence(floating);

  return (
    <div
      className={cx('y-screen', background !== 'canvas' && `y-screen--${background}`, className)}
      style={photo ? { ['--screen-photo' as string]: `url("${photo}")` } : undefined}
      data-edge-top={edges.top || undefined} data-edge-bottom={edges.bottom || undefined} data-collapsed={(collapsedProp ?? ((!scrolls || pinsBar) && edges.collapsed)) || undefined} data-stuck={edges.stuck || undefined}
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
      <main ref={ref} onScroll={onScroll} tabIndex={0} className={cx('y-screen__content', center && 'y-screen__content--center', end && 'y-screen__content--end', flush && 'y-screen__content--flush', dock != null && 'y-screen__content--docked', scrolls && 'y-screen__content--header', pinsBar && 'y-screen__content--bar')}>
        {scrolls && header}
        {children}
      </main>
      {dock != null && (
        // прокрутка тела дока (scroll не всплывает — ловим на погружении): нижнее затухание у BottomBar
        <div ref={dockRef} className="y-screen__dock" onScrollCapture={onScroll}>{dock}</div>
      )}
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
export function Grid({ rowGap, children, className, style, ...rest }: { rowGap?: number; children: ReactNode } & Omit<ComponentPropsWithRef<'div'>, 'children'>) {
  // остальные атрибуты — на контейнер: перестановка долгим тапом (`useGridReorder` → gridProps, #209)
  return <div {...rest} className={cx('y-grid', className)} style={rowGap ? { rowGap, ...style } : style}>{children}</div>;
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
