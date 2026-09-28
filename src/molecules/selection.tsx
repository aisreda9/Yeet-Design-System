import { useSlidingPill } from '../utils/useSlidingPill';
import type { KeyboardEvent, ReactNode } from 'react';
import { Button, ColorDot, Icon, IconButton, type ControlSize } from '../atoms';
import type { IconName } from '../icons/icons';
import type { ItemColor } from '../tokens/tokens';
import { cx } from '../utils/cx';
import { haptic } from '../utils/haptic';

/* ─── SegmentControl ────────────────────────────────────────────────── */

export type Segment = {
  value: string;
  label?: string;
  icon?: IconName;
  /** Имя для скринридера у сегмента-иконки без `label`: «Гардероб», «Коллаж». Без него озвучивается `value`. */
  ariaLabel?: string;
};

const segmentKeys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * Переключатель вкладок: под активным сегментом — пилюля `inverse`, которая переезжает между пунктами (`--motion-nav`).
 * Для скринридера — `radiogroup`: стрелки (и Home / End) переключают сегмент, Tab попадает только в выбранный (roving tabindex).
 * **Контексты:** «Вещи / Образы / Вишлист» в Гардеробе, «Образы · 1 / Вещи» в поездке, режимы создания образа (иконки).
 */
export function SegmentControl({ segments, value, onChange, size = 'L', fit, label }: {
  segments: Segment[];
  value: string;
  onChange?: (v: string) => void;
  size?: ControlSize;
  /** По ширине содержимого (вложенный переключатель «Вещи / Образы» в Вишлисте). */ fit?: boolean;
  /** Имя группы для скринридера: «Раздел гардероба». */ label?: string;
}) {
  const index = segments.findIndex((s) => s.value === value);
  const [ref, pill] = useSlidingPill<HTMLDivElement>(index);
  const select = (s: Segment) => { if (s.value !== value) haptic('select'); onChange?.(s.value); };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>(':scope > [data-pill-item]') ?? []);
    const from = items.indexOf(e.target as HTMLElement);
    if (from < 0) return;
    const n = items.length;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : e.key in segmentKeys ? (from + segmentKeys[e.key] + n) % n : -1;
    if (to < 0) return;
    e.preventDefault();
    items[to].focus();
    select(segments[to]);
  };
  return (
    <div ref={ref} className={cx('y-segment', `y-segment--${size}`, fit && 'y-segment--fit')} role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
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

/**
 * Группа чипсов на базе `Button S`: не выбран — `tertiary`, выбран — `soft`.
 * `wrap` — перенос строк (теги, цвета), иначе горизонтальный скролл (фильтры, поводы).
 * С `onToggle` чипс — переключатель (`aria-pressed`); крестик у `removable` — отдельная кнопка «Удалить: …».
 */
export function ChipGroup({ chips, onToggle, onRemove, onAdd, onEdit, onEditDone, wrap = false, center }: {
  chips: Chip[];
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
}) {
  return (
    <div className={cx('y-chip-group', wrap ? 'y-chip-group--wrap' : 'y-chip-group--scroll', center && 'y-chip-group--center')}>
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
        const id = c.value ?? c.label;
        const toggle = () => { haptic('select'); onToggle?.(id); };
        // Фильтр-дропдаун открывает sheet, это не переключатель
        const pressed = onToggle && !c.dropdown ? !!c.selected : undefined;
        const content = <>{c.colorDot && <ColorDot color={c.colorDot} size={16} />}{c.label}</>;
        // Две кнопки в одной капсуле: вложить «удалить» в кнопку чипса нельзя
        if (c.removable)
          return (
            <span key={id} className={cx('y-button y-button--S', `y-style--${c.selected ? 'soft' : 'tertiary'}`, 'y-chip--trailing y-chip--removable')}>
              <button type="button" className="y-chip__toggle" aria-pressed={pressed} onClick={toggle}>{content}</button>
              <button type="button" className="y-chip__remove" aria-label={`Удалить: ${c.label}`} onClick={() => onRemove?.(id)}>
                <Icon name="cross" />
              </button>
            </span>
          );
        return (
          <Button
            key={id}
            size="S"
            variant={c.selected ? 'soft' : 'tertiary'}
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

export type ListItemProps = {
  type?: 'action' | 'expandable' | 'radio';
  label: string;
  icon?: IconName;
  /** expandable: раскрыта ли строка */
  expanded?: boolean;
  /** radio: выбрана ли строка */
  checked?: boolean;
  /** Вторая строка Caption: почта в профиле. */
  description?: string;
  /** Элемент слева вместо иконки: аватар 40. */
  leading?: ReactNode;
  /** Элемент справа: флаг страны (`Flag`), счётчик. Строка — текст Body серым: валюта «₽ · RUB» (Figma: list-item · Trailing=Text). */
  trailing?: ReactNode;
  onClick?: () => void;
};

/**
 * Строка списка в sheet, высота 24, gap 12.
 * **action** — действие с вещью (создать образ, редактировать, удалить), **expandable** — категории одежды,
 * **radio** — одиночный выбор (год рождения, пол; страна — с флагом, валюта — с кодом серым справа).
 */
export function ListItem({ type = 'action', label, description, icon, leading, expanded, checked, trailing, onClick }: ListItemProps) {
  const end = typeof trailing === 'string' ? <span className="y-list-item__trailing">{trailing}</span> : trailing;
  const text = description ? (
    <span className="y-list-item__text"><span className="y-list-item__label">{label}</span><span className="y-caption y-text--secondary">{description}</span></span>
  ) : (
    <span className="y-list-item__label">{label}</span>
  );
  // Строка без действия (например, с кнопкой «Выйти» в trailing) — не кнопка: вложенный интерактив ломает скринридеры
  if (type === 'action' && !onClick)
    return (
      <div className="y-list-item">
        {leading ?? (icon && <Icon name={icon} />)}
        {text}
        {end}
      </div>
    );
  return (
    <button
      type="button"
      className="y-list-item"
      onClick={() => { if (type === 'radio' && !checked) haptic('select'); onClick?.(); }}
      role={type === 'radio' ? 'radio' : undefined}
      aria-checked={type === 'radio' ? !!checked : undefined}
      aria-expanded={type === 'expandable' ? !!expanded : undefined}
    >
      {type === 'radio' ? <span className={cx('y-radio', checked && 'y-radio--on')}>{checked && <Icon name="check" size={16} />}</span> : leading ?? (icon && <Icon name={icon} />)}
      {text}
      {type === 'expandable' ? <Icon name={expanded ? 'chevron-up' : 'chevron-down'} /> : end}
    </button>
  );
}

/** Вертикальный список строк с gap 20. */
export function List({ children }: { children: ReactNode }) {
  return <div className="y-list">{children}</div>;
}

/* ─── ListGroup ─────────────────────────────────────────────────────── */

/**
 * Группа строк-переходов на карточке с разделителями: «Корзина вещей →», «Язык ↗», «Поддержка ↗».
 * Для пар «ключ — значение» (Страна: Россия) — `InputGroup` + `Field`, не этот компонент.
 * **Контексты:** Настройки.
 */
export function ListGroup({ children }: { children: ReactNode }) {
  return <div className="y-list-group">{children}</div>;
}

/* ─── RangeSlider ───────────────────────────────────────────────────── */

export type RangeSliderProps = {
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
 * трек выбранного диапазона — `--color-accent`. Под ним — границы диапазона.
 * **Контексты:** Search / Results / Sheet / Price Filter.
 */
export function RangeSlider({ min, max, value, onChange, step = 100, histogram, format = rub, label }: RangeSliderProps) {
  const [lo, hi] = value;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const area = histogram && histogramPath(histogram);
  return (
    <div className="y-range" style={{ ['--lo' as string]: `${pct(lo)}%`, ['--hi' as string]: `${pct(hi)}%` }}>
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
