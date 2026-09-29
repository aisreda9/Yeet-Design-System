import { Children, useEffect, useRef, type ComponentPropsWithRef, type KeyboardEvent, type ReactNode } from 'react';
import { IconButton } from '../atoms';
import { cx } from '../utils/cx';
import { haptic } from '../utils/haptic';
import { useReducedMotion } from '../motion';

/**
 * Выбор вещей в образ (Outfit Creation / Item Selection `414:1459`, пустой `414:1541`): панель с секциями «Верх / Низ / Обувь»,
 * между секциями — разделитель с полями 20. Фон `elevated`, радиус сверху, тень — как у панели шторки.
 */
export type ItemSlotsProps = ComponentPropsWithRef<'div'>;

export function ItemSlots({ className, ...rest }: ItemSlotsProps) {
  return <div className={cx('y-item-slots', className)} {...rest} />;
}

export type ItemSlotProps = Omit<ComponentPropsWithRef<'section'>, 'children' | 'title'> & {
  /** Заголовок секции H2: «Верх», «Низ», «Обувь». */
  title: string;
  /** Карточки вещей (`ItemCard` 173 × 172, обычно с `onRemove`). Пусто — только карточка «+» по центру (`414:1491`). */
  children?: ReactNode;
  /** Какая вещь выбрана — стоит по центру ряда. */
  index?: number;
  /** Ряд пролистали (свайп, стрелки) — по центру другая вещь. */
  onIndexChange?: (index: number) => void;
  /** Карточка «+» в конце ряда. Без обработчика карточки нет. */
  onAdd?: () => void;
  /** Подпись «+» для скринридера. По умолчанию «Добавить: <title>». */
  addLabel?: string;
};

/**
 * Секция выбора: горизонтальный ряд со снапом по центру. Выбранная карточка 173 по центру экрана, соседние обрезаны краем,
 * в конце — карточка «+» (кнопка L 52 в 22 от её края, рядом с последней вещью). Ряд выходит на поля экрана.
 *
 * - Свайп листает со снапом (`scroll-snap`), выбор — по карточке в центре после остановки, хаптика `select`.
 * - Клавиатура: ряд в порядке Tab, ← / → — соседняя вещь.
 * - Смена `index` снаружи прокручивает ряд плавно, при «Уменьшении движения» — сразу.
 */
export function ItemSlot({ title, children, index = 0, onIndexChange, onAdd, addLabel, className, ...rest }: ItemSlotProps) {
  const row = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const items = Children.toArray(children);
  const count = items.length;
  const current = useRef(index);
  const first = useRef(true);

  // выбранная карточка — по центру ряда
  useEffect(() => {
    const el = row.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (!el || !card || index >= count) return;
    current.current = index;
    const left = card.offsetLeft + card.offsetWidth / 2 - el.clientWidth / 2;
    if (Math.abs(el.scrollLeft - left) < 1) return;
    el.scrollTo({ left, behavior: first.current || reduced ? 'auto' : 'smooth' });
    first.current = false;
  }, [index, count, reduced]);

  // после остановки скролла — какая карточка в центре
  useEffect(() => {
    const el = row.current;
    if (!el || !onIndexChange || count < 2) return;
    let t = 0;
    const settle = () => {
      window.clearTimeout(t);
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0, dist = Infinity;
      for (let k = 0; k < count; k++) {
        const c = el.children[k] as HTMLElement;
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < dist) { dist = d; best = k; }
      }
      if (best !== current.current) { current.current = best; haptic('select'); onIndexChange(best); }
    };
    const onScroll = () => { window.clearTimeout(t); t = window.setTimeout(settle, 120); }; // запасной путь, где нет scrollend
    el.addEventListener('scrollend', settle);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.clearTimeout(t); el.removeEventListener('scrollend', settle); el.removeEventListener('scroll', onScroll); };
  }, [count, onIndexChange]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.target !== e.currentTarget || count < 2) return;
    const to = e.key === 'ArrowLeft' ? index - 1 : e.key === 'ArrowRight' ? index + 1 : null;
    if (to === null || to < 0 || to >= count) return;
    e.preventDefault();
    haptic('select');
    onIndexChange?.(to);
  };

  return (
    <section className={cx('y-item-slot', className)} {...rest}>
      <h2 className="y-h2">{title}</h2>
      <div
        ref={row}
        className={cx('y-item-slot__row', count === 0 && 'y-item-slot__row--empty')}
        tabIndex={count > 1 ? 0 : undefined}
        role={count > 1 ? 'group' : undefined}
        aria-label={count > 1 ? `${title}: ${index + 1} из ${count}, ← → — листать` : undefined}
        onKeyDown={onKeyDown}
      >
        {items.map((item, k) => <div key={k} className={cx('y-item-slot__item', k === index && 'is-current')}>{item}</div>)}
        {onAdd && (
          <div className="y-item-slot__add">
            <IconButton icon="plus" label={addLabel ?? `Добавить: ${title.toLowerCase()}`} size="L" onClick={onAdd} />
          </div>
        )}
      </div>
    </section>
  );
}
