import { useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { IconButton } from '../atoms';
import { cx } from '../utils/cx';
import { haptic } from '../utils/haptic';
import { useSwipePager } from '../motion';
import { OutfitCollage, type AutoCollageItem, type CollageItem } from './cards';

export type PagerLook = {
  /** Стабильный ключ образа: по нему превью «переезжает» в коллаж, а не перерисовывается. */
  id: string;
  items: CollageItem[] | AutoCollageItem[];
  /** Повод-бейдж на коллаже. */
  label?: string;
  /** Имя для скринридера: «Образ 2 из 5» + это имя. */
  name?: string;
};

export type OutfitPagerProps = {
  looks: PagerLook[];
  /** `y` — стопка образов (главная, «Удиви меня»): превью 96 сверху и снизу. `x` — лента («С чем носить»): соседние за краем. */
  axis?: 'x' | 'y';
  /** Размер превью соседних образов в стопке: 96 — главная (`232:1355`), 150 — «Удиви меня» (`798:1741`). */
  preview?: 96 | 150;
  /** Текущий образ (контролируемый режим). */
  index?: number;
  /** Начальный образ, если `index` не задан. */
  defaultIndex?: number;
  /** Смена образа: жест, стрелки клавиатуры или кнопки «предыдущий / следующий». */
  onIndexChange?: (index: number) => void;
  /** Слот над левым верхним углом коллажа: `WeatherCard tilt`. */
  weather?: ReactNode;
  /** Слот у правого нижнего угла коллажа: `Stamp` «Надеть» / «Сохранить». Звезда поворачивается на 180° при смене образа. */
  stamp?: ReactNode;
  /** Слот у левого нижнего угла: `Stamp tone="secondary"` «Не нравится» (лента «С чем носить»). */
  skip?: ReactNode;
  /** Выключить жест и кнопки (например, пока открыта шторка). */
  disabled?: boolean;
  /** Подпись группы для скринридера. */
  'aria-label'?: string;
  className?: string;
};

/** Геометрия из Figma: коллаж 353, превью 96 (стопка) или шаг 353 + 20 (лента). */
const SIZE = 353;

const place = (k: number, i: number) => (k === i ? 'is-current' : k === i - 1 ? 'is-prev' : k === i + 1 ? 'is-next' : k < i ? 'is-above' : 'is-below');

/**
 * Пейджер образов. Жест — `useSwipePager` (порог 30 % или бросок, резинка на краях, хаптика), доводка — переходом CSS
 * на `--motion-swap` (стопка) / `--motion-page` (лента), поэтому при «Уменьшении движения» смена мгновенная.
 *
 * - Стопка (`y`, Figma `232:1355`, Animations «scale» `354:17678 → 354:17767`): текущий коллаж 353, соседние — превью 96
 *   (scale 0.272) в 20 над и под ним; в «Удиви меня» (`798:1741`) превью 150. Погода и штамп поверх, штамп поворачивается на 180° с каждой сменой.
 * - Лента (`x`, Figma `463:1534`, Animations `798:2215 → 799:2433`): страницы 353 через 20, соседние за краем экрана.
 * - Клавиатура: кнопки «Предыдущий / Следующий образ» в порядке Tab, видны только при фокусе с клавиатуры; с них же листают
 *   стрелки по оси, Home и End.
 *   Скрытые образы — `aria-hidden` и `inert`, текущий объявляется через `aria-live`.
 */
export function OutfitPager({ looks, axis = 'y', preview = 96, index: controlled, defaultIndex = 0, onIndexChange, weather, stamp, skip, disabled, className, 'aria-label': ariaLabel = 'Образы' }: OutfitPagerProps) {
  const [own, setOwn] = useState(defaultIndex);
  const count = looks.length;
  const index = Math.min(Math.max(controlled ?? own, 0), Math.max(count - 1, 0));
  const go = (next: number) => {
    if (next < 0 || next >= count || next === index) return;
    if (controlled === undefined) setOwn(next);
    onIndexChange?.(next);
  };
  // стопка: смена — хаптика skip (как у штампа «Не нравится»); лента: select, как тап по чипсу повода
  const { drag, dragging, bind } = useSwipePager({ axis, count, index, onChange: go, size: SIZE, changeHaptic: axis === 'y' ? 'skip' : 'select', disabled });

  const prevKey = axis === 'y' ? 'ArrowUp' : 'ArrowLeft';
  const nextKey = axis === 'y' ? 'ArrowDown' : 'ArrowRight';
  const onKeyDown = (e: KeyboardEvent) => {
    if (disabled || !(e.target as Element).closest?.('.y-outfit-pager__nav')) return; // стрелки — с кнопок навигации, не из штампа
    const to = e.key === prevKey ? index - 1 : e.key === nextKey ? index + 1 : e.key === 'Home' ? 0 : e.key === 'End' ? count - 1 : null;
    if (to === null) return;
    e.preventDefault();
    go(to);
  };
  const stop = { onPointerDown: (e: { stopPropagation: () => void }) => e.stopPropagation() }; // слоты жест не ловят
  const style = { '--drag': `${drag ?? 0}px`, '--index': index, '--turn': `${index * 180}deg` } as CSSProperties;
  const current = looks[index];

  return (
    <div
      className={cx('y-outfit-pager', `y-outfit-pager--${axis}`, axis === 'y' && preview === 150 && 'y-outfit-pager--preview-150', className)}
      data-dragging={dragging || undefined}
      style={style}
      role="group"
      aria-roledescription="карусель"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      {...bind}
    >
      <div className="y-outfit-pager__viewport">
        <div className="y-outfit-pager__track">
          {looks.map((look, k) => {
            const hidden = k !== index;
            return (
              <div
                key={look.id}
                className={cx('y-outfit-pager__look', place(k, index))}
                role="group"
                aria-roledescription="образ"
                aria-label={`${k + 1} из ${count}${look.name ? `: ${look.name}` : ''}`}
                aria-hidden={hidden || undefined}
                inert={hidden || undefined}
                onClick={hidden && !disabled && Math.abs(k - index) === 1 ? () => { haptic('select'); go(k); } : undefined} // тап по превью — к нему
                style={{ '--k': k } as CSSProperties}
              >
                <OutfitCollage items={look.items} label={look.label} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="y-outfit-pager__frame">
        {weather && <div className="y-outfit-pager__weather" {...stop}>{weather}</div>}
        {skip && <div className="y-outfit-pager__skip" {...stop}>{skip}</div>}
        {stamp && <div className="y-outfit-pager__stamp" {...stop}>{stamp}</div>}
      </div>
      <div className="y-outfit-pager__nav" {...stop}>
        <IconButton icon={axis === 'y' ? 'chevron-up' : 'chevron-left'} label="Предыдущий образ" variant="secondary" size="S" disabled={disabled} aria-disabled={index === 0 || undefined} onClick={() => go(index - 1)} />
        <IconButton icon={axis === 'y' ? 'chevron-down' : 'chevron-right'} label="Следующий образ" variant="secondary" size="S" disabled={disabled} aria-disabled={index === count - 1 || undefined} onClick={() => go(index + 1)} />
      </div>
      <span className="y-outfit-pager__live" aria-live="polite">{count ? `Образ ${index + 1} из ${count}${current?.name ? `: ${current.name}` : ''}` : ''}</span>
    </div>
  );
}
