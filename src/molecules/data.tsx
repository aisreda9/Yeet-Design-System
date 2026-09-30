import type { ComponentPropsWithRef } from 'react';
import { ColorDot, Icon } from '../atoms';
import type { IconName } from '../icons/icons';
import type { ItemColor } from '../tokens/tokens';
import { cx } from '../utils/cx';

/* ─── StatTile ──────────────────────────────────────────────────────── */

/**
 * Плитка статистики: Caption grey + число H2, высота 80. Ставится в `StatRow` по 3 и тянется по ширине.
 * `size="L"` — число H1 32, высота 88 (Figma: stat-tile · Size=L): «Ты потеряешь» в диалоге удаления аккаунта.
 */
export type StatTileProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & { label: string; value: string | number; size?: 'M' | 'L' };

export function StatTile({ label, value, size = 'M', className, ...rest }: StatTileProps) {
  return (
    <div className={cx('y-stat', size === 'L' && 'y-stat--L', className)} {...rest}>
      <span className="y-caption y-text--secondary">{label}</span>
      <span className={cx(size === 'L' ? 'y-h1' : 'y-h2', 'y-text--primary')}>{value}</span>
    </div>
  );
}
export type StatRowProps = ComponentPropsWithRef<'div'>;

export function StatRow({ className, ...rest }: StatRowProps) {
  return <div className={cx('y-stat__row', className)} {...rest} />;
}

/* ─── Note ──────────────────────────────────────────────────────────── */

/**
 * Заметка — текст Body на карточке light-grey: паддинг 20 со всех сторон, радиус 20, ширина FILL (Figma: `note`).
 * **Контексты:** описание вещи в панели деталей (Wishlist / Item Details, Wardrobe / Item Details), комментарий к образу.
 */
export type NoteProps = ComponentPropsWithRef<'p'>;

export function Note({ className, ...rest }: NoteProps) {
  return <p className={cx('y-body', 'y-note', className)} {...rest} />;
}

/* ─── Carousel ──────────────────────────────────────────────────────── */

/**
 * Горизонтальная лента карточек со snap-скроллом. Выходит за поля экрана (bleed), чтобы было видно,
 * что ленту можно листать. **Контексты:** Профиль («Чаще всего надевалось», «Давно не надевалось»),
 * Поездки, выбор вещей по категории при создании образа.
 */
export type CarouselProps = Omit<ComponentPropsWithRef<'section'>, 'title'> & { title?: string; /** Ширина карточки в px. */ itemWidth?: number };

export function Carousel({ title, itemWidth = 173, children, className, style, ...rest }: CarouselProps) {
  return (
    <section className={cx('y-carousel', className)} style={{ ['--carousel-item' as string]: `${itemWidth}px`, ...style }} {...rest}>
      {title && <h2 className="y-h3">{title}</h2>}
      <div className="y-carousel__track">{children}</div>
    </section>
  );
}

/* ─── BarChart ──────────────────────────────────────────────────────── */

export type Bar = { value: number; icon?: IconName; color?: ItemColor; label: string };

/**
 * «Палитра» аналитики профиля (Figma, флоу Profile / Overview / Analytics → Abstract-Palette):
 * капсулы делят ширину поровну (gap 7) и центрируются по вертикали; высота от 100 (минимум: пилюля + число)
 * до `height` по значению. Сверху — белая пилюля 44 с иконкой категории / сезона или точкой цвета, снизу — число H2.
 * **Контексты:** Профиль / Аналитика — категории, цвета, сезоны.
 */
export type BarChartProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & { bars: Bar[]; /** Высота в px. */ height?: number };

export function BarChart({ bars, height = 300, className, style, ...rest }: BarChartProps) {
  // Пустой список и нечисловые значения не дают NaN в высоте: Math.min() без аргументов — Infinity
  const values = bars.map((b) => b.value).filter(Number.isFinite);
  const min = values.length ? Math.min(...values) : 0, max = values.length ? Math.max(...values) : 0;
  const MIN_H = 100;
  const h = (v: number) => (!Number.isFinite(v) ? MIN_H : max === min ? height : MIN_H + ((height - MIN_H) * (v - min)) / (max - min));
  return (
    <div className={cx('y-bar-chart', className)} style={{ height, ...style }} role="list" {...rest}>
      {bars.map((b) => (
        <div key={b.label} className="y-bar-chart__bar" role="listitem" aria-label={`${b.label}: ${b.value}`} style={{ height: h(b.value) }}>
          <span className="y-bar-chart__cap">{b.icon ? <Icon name={b.icon} /> : b.color ? <ColorDot color={b.color} size={15} /> : null}</span>
          <span className="y-bar-chart__value">{b.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── UsageMeter ────────────────────────────────────────────────────── */

const clampPercent = (p: number) => (Number.isFinite(p) ? Math.min(100, Math.max(0, p)) : 0);

/** Доля используемого гардероба: число H1 + точечная сетка, закрашенная акцентом. Профиль / Аналитика. */
export type UsageMeterProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & { percent: number; label?: string };

export function UsageMeter({ percent, label = 'гардероба используется', className, ...rest }: UsageMeterProps) {
  const cols = 52;
  const rows = 8;
  const onCols = Math.ceil((clampPercent(percent) / 100) * cols);
  return (
    <div className={cx('y-usage-meter', className)} {...rest}>
      <span className="y-h1">{Number.isFinite(percent) ? percent : 0}%</span>
      <span className="y-caption y-text--secondary">{label}</span>
      <div className="y-usage-meter__dots" aria-hidden>
        {Array.from({ length: cols * rows }, (_, i) => (
          <span key={i} className={cx(i % cols < onCols && 'is-on')} />
        ))}
      </div>
    </div>
  );
}
