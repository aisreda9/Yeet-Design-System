import { useSlidingPill } from '../utils/useSlidingPill';
import type { ComponentPropsWithRef, KeyboardEvent, ReactNode, Ref } from 'react';
import { Button, ColorDot, Icon, IconButton, type ControlSize } from '../atoms';
import type { IconName } from '../icons/icons';
import type { ItemColor } from '../tokens/tokens';
import { cx } from '../utils/cx';
import { haptic } from '../utils/haptic';
import { useControllableState } from '../utils/useControllableState';

/* ─── SegmentControl ────────────────────────────────────────────────── */

export type Segment = {
  value: string;
  label?: string;
  icon?: IconName;
  /** Имя для скринридера у сегмента-иконки без `label`: «Гардероб», «Коллаж». Без него озвучивается `value`. */
  ariaLabel?: string;
};

const segmentKeys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

export type SegmentControlProps = Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'defaultValue' | 'children'> & {
  segments: Segment[];
  /** Выбранный сегмент (controlled). Без него — uncontrolled: начинает с `defaultValue` и переключается сам. */
  value?: string;
  /** Начальный сегмент в uncontrolled-режиме. По умолчанию — первый. */
  defaultValue?: string;
  onChange?: (v: string) => void;
  size?: ControlSize;
  /** По ширине содержимого (вложенный переключатель «Вещи / Образы» в Вишлисте). */ fit?: boolean;
  /** Имя группы для скринридера: «Раздел гардероба». То же, что `aria-label`. */ label?: string;
};

/**
 * Переключатель вкладок: под активным сегментом — пилюля `inverse`, которая переезжает между пунктами (`--motion-nav`).
 * Для скринридера — `radiogroup`: стрелки (и Home / End) переключают сегмент, Tab попадает только в выбранный (roving tabindex).
 * Controlled (`value` + `onChange`) или uncontrolled (`defaultValue`); `ref`, `className` и атрибуты `<div>` пробрасываются.
 * **Контексты:** «Вещи / Образы / Вишлист» в Гардеробе, «Образы · 1 / Вещи» в поездке, режимы создания образа (иконки).
 */
export function SegmentControl({ segments, value: valueProp, defaultValue, onChange, size = 'L', fit, label, className, ref: outerRef, onKeyDown: onKeyDownProp, ...rest }: SegmentControlProps) {
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue: defaultValue ?? segments[0]?.value ?? '', onChange });
  const index = segments.findIndex((s) => s.value === value);
  const [ref, pill] = useSlidingPill<HTMLDivElement>(index);
  const setRef = (node: HTMLDivElement | null) => { ref.current = node; assignRef(outerRef, node); };
  const select = (s: Segment) => { if (s.value !== value) haptic('select'); setValue(s.value); };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDownProp?.(e);
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>(':scope > [data-pill-item]') ?? []);
    const from = items.indexOf(e.target as HTMLElement);
    if (from < 0 || e.defaultPrevented) return;
    const n = items.length;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : e.key in segmentKeys ? (from + segmentKeys[e.key] + n) % n : -1;
    if (to < 0) return;
    e.preventDefault();
    items[to].focus();
    select(segments[to]);
  };
  return (
    <div ref={setRef} className={cx('y-segment', `y-segment--${size}`, fit && 'y-segment--fit', className)} role="radiogroup" aria-label={label} onKeyDown={onKeyDown} {...rest}>
      <span className="y-segment__pill" style={pill} aria-hidden />
      {segments.map((s, i) => {
        const active = s.value === value;
        const common = { role: 'radio', 'aria-checked': active, tabIndex: i === Math.max(index, 0) ? 0 : -1, 'data-pill-item': true, onClick: () => select(s) } as const;
        return s.icon && !s.label ? (
          <IconButton key={s.value} {...common} icon={s.icon} label={s.ariaLabel ?? s.value} size={size} variant="ghost" />
        ) : (
          <Button key={s.value} {...common} size={size} variant="ghost" leftIcon={s.icon}>
            {s.label}
          </Button>
        );
      })}
    </div>
  );
}

/** Внутренний ref (замер пилюли, фокус) и ref потребителя на одном узле. */
function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
}

/* ─── ChipGroup ─────────────────────────────────────────────────────── */

export type Chip = {
  label: string;
  /** Идентичность чипса для `onToggle` / `onRemove` и ключа; по умолчанию — `label`. */
  value?: string;
  selected?: boolean;
  removable?: boolean;
  /** Свотч цвета вещи 16 перед текстом (Figma: chip · Show Color Dot). */
  colorDot?: ItemColor;
  dropdown?: boolean;
  /**
   * Chip · State=Editing: чипс превращается в поле ввода по ширине текста — свой повод или тег
   * (флоу Outfit Creation / Custom Occasion Name). `label` — введённый текст, `placeholder` — подсказка серым.
   */
  editing?: boolean;
  placeholder?: string;
};

export type ChipGroupProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'children' | 'onToggle'> & {
  chips: Chip[];
  /**
   * Выбранные чипсы по `value` (или `label`) — controlled. Вместе с `defaultValue` включает режим выбора:
   * `selected` у самих чипсов тогда не читается.
   */
  value?: string[];
  /** Uncontrolled: начальный выбор, дальше группа переключает чипсы сама и сообщает в `onValueChange`. */
  defaultValue?: string[];
  /** Новый выбор целиком (в режиме `value` / `defaultValue`). */
  onValueChange?: (value: string[]) => void;
  /** `false` — одиночный выбор (повод, категория): новый чипс снимает прежний. По умолчанию множественный. */
  multiple?: boolean;
  /** Нажатие на чипс: приходит `value` (или `label`). */
  onToggle?: (value: string) => void;
  /** Крестик у `removable`: приходит `value` (или `label`). */
  onRemove?: (value: string) => void;
  onAdd?: () => void;
  /** Ввод в редактируемом чипсе (`editing`). */
  onEdit?: (value: string) => void;
  /** Enter или уход фокуса из редактируемого чипса: сохранить введённое. */
  onEditDone?: (value: string) => void;
  wrap?: boolean;
  /** Подсказки по центру (Поиск в сторах). */ center?: boolean;
};

const chipId = (c: Chip) => c.value ?? c.label;

/**
 * Группа чипсов на базе `Button S`: не выбран — `tertiary`, выбран — `soft`.
 * `wrap` — перенос строк (теги, цвета), иначе горизонтальный скролл (фильтры, поводы).
 * С `onToggle` (или `value` / `defaultValue`) чипс — переключатель (`aria-pressed`); без них — статичный текст, действуют только «×» у `removable` (отдельная кнопка «Удалить: …») и «+» (`onAdd`).
 *
 * **Выбор:** по-старому — `chips[].selected` + `onToggle` (состояние снаружи); либо `value` + `onValueChange` (controlled)
 * или `defaultValue` (uncontrolled: группа хранит выбор сама), `multiple={false}` — один выбранный.
 * `ref`, `className` и атрибуты `<div>` пробрасываются.
 */
export function ChipGroup({ chips, value: valueProp, defaultValue, onValueChange, multiple = true, onToggle, onRemove, onAdd, onEdit, onEditDone, wrap = false, center, className, ...rest }: ChipGroupProps) {
  const managed = valueProp !== undefined || defaultValue !== undefined;
  const [value, setValue] = useControllableState<string[]>({ value: valueProp, defaultValue: defaultValue ?? [], onChange: onValueChange });
  const isSelected = (c: Chip) => (managed ? value.includes(chipId(c)) : !!c.selected);
  const toggleable = managed || !!onToggle;
  // Лента без единого интерактивного элемента всё равно скроллится: фокус на самой ленте (axe scrollable-region-focusable)
  const hasFocusable = toggleable || !!onAdd || chips.some((c) => c.dropdown || c.removable || c.editing);
  return (
    <div tabIndex={!wrap && !hasFocusable ? 0 : undefined} className={cx('y-chip-group', wrap ? 'y-chip-group--wrap' : 'y-chip-group--scroll', center && 'y-chip-group--center', className)} {...rest}>
      {onAdd && <IconButton icon="plus" label="Добавить" variant="primary" size="S" onClick={onAdd} />}
      {chips.map((c) => {
        if (c.editing)
          return (
            <label key="editing" className="y-button y-button--S y-style--tertiary y-chip--editing">
              <input
                className="y-chip__input"
                value={c.label}
                placeholder={c.placeholder}
                aria-label={c.placeholder ?? 'Название'}
                size={Math.max(c.label.length, c.placeholder?.length ?? 0, 1)}
                onChange={(e) => onEdit?.(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onEditDone?.(e.currentTarget.value)}
                onBlur={(e) => onEditDone?.(e.currentTarget.value)}
                readOnly={!onEdit}
              />
            </label>
          );
        const id = chipId(c);
        const selected = isSelected(c);
        const toggle = () => {
          haptic('select');
          if (managed && !c.dropdown) setValue((cur) => (cur.includes(id) ? cur.filter((v) => v !== id) : multiple ? [...cur, id] : [id]));
          onToggle?.(id);
        };
        // Фильтр-дропдаун открывает sheet, это не переключатель
        const pressed = toggleable && !c.dropdown ? selected : undefined;
        const content = <>{c.colorDot && <ColorDot color={c.colorDot} size={16} />}{c.label}</>;
        // Без onToggle / выбора тело чипса — статичный текст: действуют только «×» и «+»
        const isStatic = !toggleable && !c.dropdown;
        // Две кнопки в одной капсуле: вложить «удалить» в кнопку чипса нельзя
        if (c.removable)
          return (
            <span key={id} className={cx('y-button y-button--S', `y-style--${selected ? 'soft' : 'tertiary'}`, 'y-chip--trailing y-chip--removable')}>
              {isStatic ? (
                <span className="y-chip__toggle">{content}</span>
              ) : (
                <button type="button" className="y-chip__toggle" aria-pressed={pressed} onClick={toggle}>{content}</button>
              )}
              <button type="button" className="y-chip__remove" aria-label={`Удалить: ${c.label}`} onClick={() => onRemove?.(id)}>
                <Icon name="cross" />
              </button>
            </span>
          );
        if (isStatic)
          return (
            <span key={id} className={cx('y-button y-button--S', `y-style--${selected ? 'soft' : 'tertiary'}`, 'y-chip--static')}>
              {content}
            </span>
          );
        return (
          <Button
            key={id}
            size="S"
            variant={selected ? 'soft' : 'tertiary'}
            rightIcon={c.dropdown ? 'chevron-up-down' : undefined}
            className={cx(c.dropdown && 'y-chip--trailing')}
            aria-pressed={pressed}
            onClick={toggle}
          >
            {content}
          </Button>
        );
      })}
    </div>
  );
}

/* ─── ListItem ──────────────────────────────────────────────────────── */

export type ListItemVariant = 'action' | 'expandable' | 'radio';

export type ListItemProps = Omit<ComponentPropsWithRef<'button'>, 'type' | 'children' | 'onClick'> & {
  /** Вид строки. */
  variant?: ListItemVariant;
  /** @deprecated Используйте `variant`: `type` у кнопки — атрибут HTML (`button` / `submit`). */
  type?: ListItemVariant;
  label: string;
  /** Вторая строка под label — Caption серым (Figma: list-item · Show Description, Description). */
  description?: ReactNode;
  icon?: IconName;
  /** expandable: раскрыта ли строка */
  expanded?: boolean;
  /** radio: выбрана ли строка */
  checked?: boolean;
  /** Элемент справа: флаг страны (`Flag`), счётчик. Строка — текст Body серым: валюта «₽ · RUB» (Figma: list-item · Trailing=Text). */
  trailing?: ReactNode;
  onClick?: () => void;
};

/**
 * Строка списка в sheet, высота 24, gap 12. С `description` — вторая строка Caption серым через 2, строка растёт по высоте.
 * **action** — действие с вещью (создать образ, редактировать, удалить), **expandable** — категории одежды,
 * **radio** — одиночный выбор (год рождения, пол; страна — с флагом, валюта — с кодом серым справа).
 * Группу radio-строк собирает `RadioList` (radiogroup, стрелки, uncontrolled). `ref`, `className` и атрибуты пробрасываются.
 */
export function ListItem({ variant, type, label, description, icon, expanded, checked, trailing, onClick, className, ref, ...rest }: ListItemProps) {
  const kind = variant ?? type ?? 'action';
  const end = typeof trailing === 'string' ? <span className="y-list-item__trailing">{trailing}</span> : trailing;
  const text = description ? (
    <span className="y-list-item__text">
      <span className="y-list-item__label">{label}</span>
      <span className="y-list-item__description y-caption">{description}</span>
    </span>
  ) : (
    <span className="y-list-item__label">{label}</span>
  );
  // Строка без действия (например, с кнопкой «Выйти» в trailing) — не кнопка: вложенный интерактив ломает скринридеры
  if (kind === 'action' && !onClick)
    return (
      <div ref={ref as Ref<HTMLDivElement>} className={cx('y-list-item', className)} {...(rest as ComponentPropsWithRef<'div'>)}>
        {icon && <Icon name={icon} />}
        {text}
        {end}
      </div>
    );
  return (
    <button
      ref={ref}
      type="button"
      className={cx('y-list-item', className)}
      onClick={() => { if (kind === 'radio' && !checked) haptic('select'); onClick?.(); }}
      role={kind === 'radio' ? 'radio' : undefined}
      aria-checked={kind === 'radio' ? !!checked : undefined}
      aria-expanded={kind === 'expandable' ? !!expanded : undefined}
      {...rest}
    >
      {kind === 'radio' ? <span className={cx('y-radio', checked && 'y-radio--on')}>{checked && <Icon name="check" size={16} />}</span> : icon && <Icon name={icon} />}
      {text}
      {kind === 'expandable' ? <Icon name={expanded ? 'chevron-up' : 'chevron-down'} /> : end}
    </button>
  );
}

export type ListProps = ComponentPropsWithRef<'div'>;

/** Вертикальный список строк с gap 20. */
export function List({ className, ...rest }: ListProps) {
  return <div className={cx('y-list', className)} {...rest} />;
}

/* ─── RadioList ─────────────────────────────────────────────────────── */

export type RadioOption = {
  value: string;
  label: string;
  /** Флаг, код валюты «₽ · RUB» — как `ListItem trailing`. */
  trailing?: ReactNode;
};

export type RadioListProps = Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'defaultValue' | 'children'> & {
  options: RadioOption[];
  /** Выбранное значение (controlled). Без него — uncontrolled с `defaultValue`. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Имя группы для скринридера: «Год рождения», «Страна». То же, что `aria-label`. */
  label?: string;
};

/**
 * Одиночный выбор строками `ListItem variant="radio"` (Figma: list-item · Type=Radio) в колонке `List`.
 * Для скринридера — `radiogroup`: Tab попадает в выбранную строку, стрелки ↑↓ (и ←→, Home / End) выбирают соседнюю.
 * Controlled (`value` + `onChange`) или uncontrolled (`defaultValue`).
 * **Контексты:** год рождения, пол, страна (с флагом), валюта (с кодом справа).
 */
export function RadioList({ options, value: valueProp, defaultValue, onChange, label, className, onKeyDown: onKeyDownProp, ...rest }: RadioListProps) {
  const [value, setValue] = useControllableState<string | undefined>({ value: valueProp, defaultValue, onChange: onChange as ((v: string | undefined) => void) | undefined });
  const index = options.findIndex((o) => o.value === value);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDownProp?.(e);
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(':scope > [role="radio"]'));
    const from = items.indexOf(e.target as HTMLElement);
    if (from < 0 || e.defaultPrevented) return;
    const n = items.length;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : e.key in segmentKeys ? (from + segmentKeys[e.key] + n) % n : -1;
    if (to < 0) return;
    e.preventDefault();
    items[to].focus();
    haptic('select');
    setValue(options[to].value);
  };
  return (
    <List role="radiogroup" aria-label={label} className={className} onKeyDown={onKeyDown} {...rest}>
      {options.map((o, i) => (
        <ListItem
          key={o.value}
          variant="radio"
          label={o.label}
          trailing={o.trailing}
          checked={o.value === value}
          tabIndex={i === Math.max(index, 0) ? 0 : -1}
          onClick={() => setValue(o.value)}
        />
      ))}
    </List>
  );
}

/* ─── ListGroup ─────────────────────────────────────────────────────── */

/**
 * Группа строк-переходов на карточке с разделителями: «Корзина вещей →», «Язык ↗», «Поддержка ↗».
 * Для пар «ключ — значение» (Страна: Россия) — `InputGroup` + `Field`, не этот компонент.
 * **Контексты:** Настройки.
 */
export function ListGroup({ className, ...rest }: ListProps) {
  return <div className={cx('y-list-group', className)} {...rest} />;
}

/* ─── RangeSlider ───────────────────────────────────────────────────── */

export type RangeSliderProps = Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'defaultValue' | 'children'> & {
  min: number;
  max: number;
  value: [number, number];
  onChange?: (v: [number, number]) => void;
  step?: number;
  /** Распределение товаров по цене — серая гистограмма под треком; выбранный диапазон темнее. */
  histogram?: number[];
  format?: (v: number) => string;
  /** Подпись для скринридера: «Цена». */
  label: string;
};

const rub = (v: number) => `${v.toLocaleString('ru-RU')} ₽`;

/**
 * Двойной ползунок диапазона с гистограммой. Ручки — Primary 24 с иконкой `horizontal-drag`,
 * трек выбранного диапазона — чёрная линия `--color-text-primary` (не accent). Под ним — границы диапазона.
 * **Контексты:** Search / Results / Sheet / Price Filter.
 */
export function RangeSlider({ min, max, value, onChange, step = 100, histogram, format = rub, label, className, style, ...rest }: RangeSliderProps) {
  const [lo, hi] = value;
  // min = max (одна цена в выдаче): доля 0, а не NaN %
  const pct = (v: number) => (max > min ? Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100)) : 0);
  const area = histogram?.length ? histogramPath(histogram) : undefined;
  return (
    <div className={cx('y-range', className)} style={{ ['--lo' as string]: `${pct(lo)}%`, ['--hi' as string]: `${pct(hi)}%`, ...style }} {...rest}>
      {area && (
        <svg className="y-range__hist" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
          <path d={area} className="y-range__hist-all" />
          <path d={area} className="y-range__hist-on" />
        </svg>
      )}
      <div className="y-range__track">
        <span className="y-range__fill" />
        {[0, 1].map((i) => (
          <span key={i} className="y-range__thumb" style={{ left: `${pct(value[i])}%` }} aria-hidden>
            <Icon name="horizontal-drag" size={14} />
          </span>
        ))}
        <input type="range" aria-label={`${label}: от`} min={min} max={max} step={step} value={lo} onChange={(e) => onChange?.([Math.min(+e.target.value, hi - step), hi])} />
        <input type="range" aria-label={`${label}: до`} min={min} max={max} step={step} value={hi} onChange={(e) => onChange?.([lo, Math.max(+e.target.value, lo + step)])} />
      </div>
      <div className="y-range__labels y-caption">
        <span>{format(lo)}</span>
        <span>{format(hi)}</span>
      </div>
    </div>
  );
}

/** Сглаженная площадь гистограммы в координатах 100×40. */
function histogramPath(bins: number[]): string {
  if (bins.length === 1) bins = [bins[0], bins[0]]; // одна корзина — ровная площадь, а не деление на 0
  const top = Math.max(...bins, 1);
  const pts = bins.map((b, i) => [(i / (bins.length - 1)) * 100, 40 - (b / top) * 36] as const);
  const d = pts.map(([x, y], i) => {
    if (!i) return `M${x},${y}`;
    const [px, py] = pts[i - 1];
    const mx = (px + x) / 2;
    return `C${mx},${py} ${mx},${y} ${x},${y}`;
  });
  return `M0,40 L${pts[0][0]},${pts[0][1]} ${d.slice(1).join(' ')} L100,40 Z`;
}
