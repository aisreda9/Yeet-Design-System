import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { StatusBar } from '../organisms';
import { cx } from '../utils/cx';
import './templates.css';

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
  children?: ReactNode;
};

/**
 * Шаблон экрана iPhone 393×852.
 *
 * Правило скролла: шапка и низ **закреплены**, контент скроллится между ними и **уходит под них**.
 * Полосы затухания появляются, только когда под краем действительно есть контент:
 * верхняя — после начала скролла, нижняя — пока список не докручен до конца.
 */
export function Screen({ header, bottom, overlay, floating, floatingOffset = 132, center, flush, children }: ScreenProps) {
  const ref = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false, collapsed: false });
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // collapsed — большой заголовок уехал: шапка показывает его пилюлей по центру, липкие фильтры прижаты к шапке
    setEdges({ top: el.scrollTop > 1, bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 1, collapsed: el.scrollTop > 24 });
  }, []);
  useEffect(() => {
    update();
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  return (
    <div className="y-screen" data-edge-top={edges.top || undefined} data-edge-bottom={edges.bottom || undefined} data-collapsed={edges.collapsed || undefined}>
      {header ?? <StatusBar />}
      <main ref={ref} onScroll={update} tabIndex={0} /* прокрутка с клавиатуры */ className={cx('y-screen__content', center && 'y-screen__content--center', flush && 'y-screen__content--flush')}>
        {children}
      </main>
      {bottom}
      {floating && (
        <div className="y-screen__floating" style={{ bottom: floatingOffset }}>
          {floating}
        </div>
      )}
      {overlay}
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

/** Горизонтальный ряд: пара плиток фото, иконки-фильтры перед чипсами. */
export function Row({ gap = 8, align, children }: { gap?: number; align?: CSSProperties['alignItems']; children: ReactNode }) {
  return <div className="y-row" style={{ gap, alignItems: align }}>{children}</div>;
}
