import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { StatusBar } from '../organisms';
import { cx } from '../utils/cx';
import { LeavingContext, usePresence } from '../utils/usePresence';
import '../styles.css';

export type ScreenProps = {
  /** Закреплённая шапка (`Header`). Если нет — рисуется статус-бар. */
  header?: ReactNode;
  /** Закреплённый низ: `BottomNav` или `BottomBar`. */
  bottom?: ReactNode;
  /** Модальный слой (`Overlay` со `Sheet` / `Dialog`). */
  overlay?: ReactNode;
  /** Плавающий элемент над низом экрана: `Snackbar`, `Hint`, «Показать еще». */
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

/**
 * Шаблон экрана iPhone 393×852.
 *
 * Правило скролла: шапка и низ **закреплены**, контент скроллится между ними и **уходит под них**.
 * Полосы затухания появляются, только когда под краем действительно есть контент:
 * верхняя — после начала скролла, нижняя — пока список не докручен до конца.
 */
export function Screen({ header, bottom, overlay, floating, floatingOffset = 132, center, flush, end, background = 'canvas', photo, backdrop, scrollRef, className, children }: ScreenProps) {
  const own = useRef<HTMLElement>(null);
  const ref = scrollRef ?? own;
  const [edges, setEdges] = useState({ top: false, bottom: false, collapsed: false });
  const frame = useRef(0);
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges((prev) => {
      // collapsed — большой заголовок уехал: шапка показывает его пилюлей по центру, липкие фильтры прижаты к шапке.
      // Гистерезис 24 / 8: шапка при сворачивании меняет высоту, и без запаса заголовок дрожал бы на границе
      const collapsed = prev.collapsed ? el.scrollTop > 8 : el.scrollTop > 24;
      const next = { top: el.scrollTop > 1, bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 1, collapsed };
      // тот же объект — React не перерисовывает экран на каждое событие скролла
      return next.top === prev.top && next.bottom === prev.bottom && next.collapsed === prev.collapsed ? prev : next;
    });
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
      data-edge-top={edges.top || undefined} data-edge-bottom={edges.bottom || undefined} data-collapsed={edges.collapsed || undefined}>
      {header ?? <StatusBar onAccent={background === 'accent'} onPhoto={background === 'photo'} />}
      {backdrop}
      <main ref={ref} onScroll={onScroll} tabIndex={0} /* прокрутка с клавиатуры */ className={cx('y-screen__content', center && 'y-screen__content--center', end && 'y-screen__content--end', flush && 'y-screen__content--flush')}>
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
 * Липкая полоса внутри скролла: фильтры и чипсы прижимаются под шапку и остаются на месте,
 * пока контент едет под ними. На фоне экрана, во всю ширину, с затуханием снизу, когда прижата.
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
 * `align="center"` — блоки по центру по своей ширине (ghost-кнопка «Забыли пароль?»).
 */
export function Stack({ gap = 8, align, className, children }: { gap?: number; align?: CSSProperties['alignItems']; className?: string; children: ReactNode }) {
  return <div className={cx('y-stack', className)} style={{ gap, alignItems: align }}>{children}</div>;
}

export { DetailsScreen, type DetailsScreenProps } from './details';
export { Prose, type ProseBlock, type ProseProps, type ProseSection } from './prose';
