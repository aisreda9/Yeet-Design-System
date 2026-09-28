import { useSlidingPill } from '../utils/useSlidingPill';
import type { ReactNode } from 'react';
import { Button, ColorDot, Icon, IconButton, type ControlSize } from '../atoms';
import type { IconName } from '../icons/icons';
import type { ItemColor } from '../tokens/tokens';
import { cx } from '../utils/cx';

/* ─── SegmentControl ────────────────────────────────────────────────── */

export type Segment = { value: string; label?: string; icon?: IconName };

/**
 * Переключатель вкладок: под активным сегментом — пилюля `inverse`, которая переезжает между пунктами (`--motion-nav`).
 * **Контексты:** «Вещи / Образы / Вишлист» в Гардеробе, «Образы · 1 / Вещи» в поездке, режимы создания образа (иконки).
 */
export function SegmentControl({ segments, value, onChange, size = 'L', fit }: { segments: Segment[]; value: string; onChange?: (v: string) => void; size?: ControlSize; /** По ширине содержимого (вложенный переключатель «Вещи / Образы» в Вишлисте). */ fit?: boolean }) {
  const [ref, pill] = useSlidingPill<HTMLDivElement>(segments.findIndex((s) => s.value === value));
  return (
    <div ref={ref} className={cx('y-segment', `y-segment--${size}`, fit && 'y-segment--fit')} role="tablist">
      <span className="y-segment__pill" style={pill} aria-hidden />
      {segments.map((s) => {
        const active = s.value === value;
        const common = { key: s.value, role: 'tab', 'aria-selected': active, 'data-pill-item': true, onClick: () => onChange?.(s.value) } as const;
        return s.icon && !s.label ? (
          <IconButton {...common} icon={s.icon} label={s.value} size={size} variant="ghost" />
        ) : (
          <Button {...common} size={size} variant="ghost" leftIcon={s.icon}>
            {s.label}
          </Button>
        );
      })}
    </div>
  );
}

/* ─── ChipGroup ─────────────────────────────────────────────────────── */

export type Chip = { label: string; selected?: boolean; removable?: boolean; colorDot?: ItemColor; dropdown?: boolean };

/**
 * Группа чипсов на базе `Button S`: не выбран — `tertiary`, выбран — `soft`.
 * `wrap` — перенос строк (теги, цвета), иначе горизонтальный скролл (фильтры, поводы).
 */
export function ChipGroup({ chips, onToggle, onAdd, wrap = false, center }: { chips: Chip[]; onToggle?: (label: string) => void; onAdd?: () => void; wrap?: boolean; /** Подсказки по центру (Поиск в сторах). */ center?: boolean }) {
  return (
    <div className={cx('y-chip-group', wrap ? 'y-chip-group--wrap' : 'y-chip-group--scroll', center && 'y-chip-group--center')}>
      {onAdd && <IconButton icon="plus" label="Добавить" variant="primary" size="S" onClick={onAdd} />}
      {chips.map((c) => (
        <Button
          key={c.label}
          size="S"
          variant={c.selected ? 'soft' : 'tertiary'}
          rightIcon={c.removable ? 'cross' : c.dropdown ? 'chevron-up-down' : undefined}
          className={cx((c.removable || c.dropdown) && 'y-chip--trailing', c.removable && 'y-chip--removable')}
          aria-pressed={c.selected}
          onClick={() => onToggle?.(c.label)}
        >
          {c.colorDot && <ColorDot color={c.colorDot} />}
          {c.label}
        </Button>
      ))}
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
  /** Элемент справа: флаг страны, счётчик. */
  trailing?: ReactNode;
  onClick?: () => void;
};

/**
 * Строка списка в sheet, высота 24, gap 12.
 * **action** — действие с вещью (создать образ, редактировать, удалить), **expandable** — категории одежды,
 * **radio** — одиночный выбор (год рождения, страна, пол).
 */
export function ListItem({ type = 'action', label, description, icon, leading, expanded, checked, trailing, onClick }: ListItemProps) {
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
        {trailing}
      </div>
    );
  return (
    <button
      type="button"
      className="y-list-item"
      onClick={onClick}
      role={type === 'radio' ? 'radio' : undefined}
      aria-checked={type === 'radio' ? !!checked : undefined}
      aria-expanded={type === 'expandable' ? !!expanded : undefined}
    >
      {type === 'radio' ? <span className={cx('y-radio', checked && 'y-radio--on')}>{checked && <Icon name="check" size={16} />}</span> : leading ?? (icon && <Icon name={icon} />)}
      {text}
      {type === 'expandable' ? <Icon name={expanded ? 'chevron-up' : 'chevron-down'} /> : trailing}
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
