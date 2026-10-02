import { useLayoutEffect, useRef, useState, type ComponentPropsWithRef, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { IconButton } from '../atoms';
import { cx } from '../utils/cx';
import { gesture } from '../utils/gesture';
import { haptic } from '../utils/haptic';
import { useSwipePager } from '../motion';
import { OutfitCollage, type AutoCollageItem, type CollageItem } from './cards';
import { setRef } from './refs';

export type PagerLook = {
  /** Стабильный ключ образа: по нему превью «переезжает» в коллаж, а не перерисовывается. */
  id: string;
  items: CollageItem[] | AutoCollageItem[];
  /** Повод-бейдж на коллаже. */
  label?: string;
  /** Имя для скринридера: «Образ 2 из 5» + это имя. */
  name?: string;
};

export type OutfitPagerProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  looks: PagerLook[];
  /** `y` — стопка образов (главная, «Удиви меня»): превью сверху и снизу заполняют место до шапки и таб-бара. `x` — лента («С чем носить»): соседние за краем. */
  axis?: 'x' | 'y';
  /**
   * Превью стопки, когда пейджеру нечего заполнять (стоит не в `Screen`, а в обычном блоке): 96 — как на главной, 150 — как в «Удиви меня».
   * В `Screen` превью считается от свободной высоты и проп не нужен.
   */
  preview?: number;
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
  /** Слот у левого нижнего угла: `Stamp variant="secondary"` «Не нравится» (лента «С чем носить»). */
  skip?: ReactNode;
  /** Выключить жест и кнопки (например, пока открыта шторка). */
  disabled?: boolean;
  /** Подпись группы для скринридера. */
  'aria-label'?: string;
};

/** Ширина макета Figma: коллаж 353 при экране 393. Смещения из Figma (уход стопки, штамп) масштабируются на размер / 353. */
const BASE = 353;
/** Превью стопки не меньше 48: видно, что образ есть. */
const MIN_PREVIEW = 48;

type Fit = { size: number; preview: number };

/**
 * Геометрия стопки по месту: коллаж — квадрат во всю ширину контента, превью = (высота − коллаж − 2 × зазор − низ) / 2,
 * не больше коллажа. Если превью выходит меньше 48, оно остаётся 48, а коллаж уменьшается до оставшейся высоты:
 * стопка всегда помещается между шапкой и таб-баром, экран не скроллится.
 */
function fitStack(width: number, height: number, gap: number, end: number): Fit {
  const preview = (height - width - 2 * gap - end) / 2;
  if (preview >= MIN_PREVIEW) return { size: width, preview: Math.min(preview, width) };
  return { size: Math.max(height - 2 * (MIN_PREVIEW + gap) - end, MIN_PREVIEW), preview: MIN_PREVIEW };
}

/**
 * Размер коллажа и превью от контейнера. Лента и стопка вне экрана: коллаж = ширина, превью = `preview`.
 * Стопка, которая растягивается в колонке (`flex-grow` > 0 — так её ставит `Screen`), заполняет высоту: `fitStack`.
 */
/** Коллаж уже 90 % макетного (≈ 318 при 353): погода не помещается над коллажем — скрываем (решение владельца, 02.10). */
const COMPACT = 0.9;

function useFit(ref: { current: HTMLElement | null }, axis: 'x' | 'y', preview: number): Fit {
  const [fit, setFit] = useState<Fit>({ size: BASE, preview });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      const width = el.clientWidth; // до transform: размер раскладки, а не на экране
      if (!width) return;
      const fills = axis === 'y' && Number(cs.flexGrow) > 0;
      const next = fills
        ? fitStack(width, el.clientHeight, parseFloat(cs.getPropertyValue('--pager-gap')) || 0, parseFloat(cs.getPropertyValue('--pager-end')) || 0)
        : { size: width, preview };
      setFit((cur) => (cur.size === next.size && cur.preview === next.preview ? cur : next));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, axis, preview]);
  return fit;
}

const place = (k: number, i: number) => (k === i ? 'is-current' : k === i - 1 ? 'is-prev' : k === i + 1 ? 'is-next' : k < i ? 'is-above' : 'is-below');

/**
 * Пейджер образов. Жест — `useSwipePager` (порог 30 % или бросок, резинка на краях, хаптика), доводка — переходом CSS
 * на `--motion-swap` (стопка) / `--motion-page` (лента), поэтому при «Уменьшении движения» смена мгновенная.
 *
 * - Стопка (`y`, Figma `1371:36589`, Animations «scale» `354:17678 → 354:17767`): текущий коллаж — квадрат во всю ширину контента
 *   (353 при 393), соседние — превью в 20 над и под ним. В `Screen` стопка занимает всё место между шапкой и таб-баром,
 *   превью растягиваются (`fitStack`): при 393 × 852 — 96 на главной и 150 в «Удиви меня» (`1371:42686`), как в Figma.
 *   Погода и штамп поверх, штамп поворачивается на 180° с каждой сменой.
 * - Лента (`x`, Figma `1371:42779`, Animations `798:2215 → 799:2433`): страницы во всю ширину контента через 20, соседние за краем экрана.
 * - Тап по превью (сдвиг пальца < `--gesture-touch-slop`) — листает к нему, хаптика `select`. Хозяин может перехватить тап
 *   раньше в фазе захвата (прототип открывает детали образа) — тогда листания нет.
 * - Клавиатура: кнопки «Предыдущий / Следующий образ» в порядке Tab, видны только при фокусе с клавиатуры; с них же листают
 *   стрелки по оси, Home и End.
 *   Скрытые образы — `aria-hidden` и `inert`, текущий объявляется через `aria-live`.
 */
export function OutfitPager({ looks, axis = 'y', preview = 96, index: controlled, defaultIndex = 0, onIndexChange, weather, stamp, skip, disabled, className, style: styleProp, 'aria-label': ariaLabel = 'Образы', ref, ...rest }: OutfitPagerProps) {
  const box = useRef<HTMLDivElement | null>(null);
  const fit = useFit(box, axis, preview);
  const [own, setOwn] = useState(defaultIndex);
  const count = looks.length;
  const index = Math.min(Math.max(controlled ?? own, 0), Math.max(count - 1, 0));
  const go = (next: number) => {
    if (next < 0 || next >= count || next === index) return;
    if (controlled === undefined) setOwn(next);
    onIndexChange?.(next);
  };
  // стопка: смена — хаптика skip (как у штампа «Не нравится»); лента: select, как тап по чипсу повода
  const { drag, dragging, bind } = useSwipePager({ axis, count, index, onChange: go, size: fit.size, changeHaptic: axis === 'y' ? 'skip' : 'select', disabled });

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

  /**
   * Тап по превью — к нему. Скрытые образы `inert`, клик до них не доходит, а приходит в саму ленту: ищем превью под пальцем
   * по координатам (как `throughPreview` прототипа). Палец сдвинулся на `--gesture-touch-slop` и больше — это свайп, не тап.
   * Хозяин может перехватить тап раньше (прототип в фазе захвата открывает детали образа и останавливает событие).
   */
  const downAt = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: PointerEvent) => { downAt.current = { x: e.clientX, y: e.clientY }; bind.onPointerDown(e); };
  const onClick = (e: MouseEvent) => {
    const d = downAt.current;
    if (disabled || !box.current || (e.target as Element).closest('.y-outfit-pager__look.is-current, .y-outfit-pager__frame, .y-outfit-pager__nav')) return;
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) >= gesture.slop) return;
    for (const look of box.current.querySelectorAll<HTMLElement>('.y-outfit-pager__look:is(.is-prev, .is-next)')) {
      const r = (look.querySelector('.y-collage') ?? look).getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) continue;
      haptic('select');
      go(index + (look.classList.contains('is-prev') ? -1 : 1));
      return;
    }
  };
  const style = {
    '--drag': `${drag ?? 0}px`, '--index': index, '--turn': `${index * 180}deg`,
    '--pager-size': `${fit.size}px`, '--pager-preview': `${fit.preview}px`, '--pager-scale': fit.preview / fit.size, '--pager-k': fit.size / BASE,
  } as CSSProperties;
  const current = looks[index];

  return (
    // Карусель: стрелки листают образы с фокуса на группе (паттерн ARIA carousel), свайп — pointer
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={(n) => { box.current = n; setRef(ref, n); }}
      className={cx('y-outfit-pager', `y-outfit-pager--${axis}`, className)}
      {...rest}
      data-dragging={dragging || undefined}
      data-compact={fit.size / BASE < COMPACT || undefined}
      style={{ ...styleProp, ...style }}
      role="group"
      aria-roledescription="карусель"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      {...bind}
      onPointerDown={onPointerDown}
      // тап по превью дублирует кнопки «Назад / Дальше» (.y-outfit-pager__nav) и стрелки — клавиатурный путь есть
      onClick={onClick}
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
