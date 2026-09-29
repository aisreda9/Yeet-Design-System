import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Badge, IconButton } from '../atoms';
import { cx } from '../utils/cx';
import { plural } from '../utils/plural';
import { CollageLayer, type CollageItem } from './cards';

/* ─── Stylist & trips ───────────────────────────────────────────────── */

/**
 * Превью образа 138×138 (радиус 20) — несколько вещей на `--card-bg`.
 * **Контексты:** «предыдущий / следующий образ» на экране Образов, списки образов в поездке.
 */
export type OutfitThumbnailProps = Omit<ComponentPropsWithRef<'button'>, 'children'> & { items: CollageItem[]; /** Сторона в px. */ size?: number };

export function OutfitThumbnail({ items, size = 138, className, style, ...rest }: OutfitThumbnailProps) {
  return (
    <button type="button" className={cx('y-outfit-thumb', className)} style={{ width: size, height: size, ...style }} aria-label="Открыть образ" {...rest}>
      <CollageLayer items={items} defaultSize={size * 0.4} base={size} />
    </button>
  );
}

/**
 * Карточка функции стилиста (флоу Stylist / Catalog): H3 + описание Caption сверху, паддинг 20, радиус 20.
 * `wide` — на всю ширину 353×172, иначе половина 173×220. `soon` — функция ещё недоступна: текст серым, бейдж «Скоро».
 * `art` — иллюстрация в правом нижнем углу (чемодан у «Для поездок»).
 * **Контексты:** Стилист — Конструктор, Удиви меня, С чем носить, Для поездок, Оживи гардероб, Докупить, Оцени лук.
 */
export type StylistPromptCardProps = Omit<ComponentPropsWithRef<'button'>, 'children' | 'title'> & { title: string; description?: string; wide?: boolean; soon?: boolean; art?: ReactNode };

export function StylistPromptCard({ title, description, wide, soon, art, className, ...rest }: StylistPromptCardProps) {
  return (
    <button type="button" className={cx('y-prompt-card', wide && 'y-prompt-card--wide', soon && 'y-prompt-card--soon', className)} disabled={soon} aria-label={soon ? `${title} — скоро` : undefined} {...rest}>
      <span className="y-h3">{title}</span>
      {description && <span className="y-caption y-text--secondary">{description}</span>}
      {soon && <Badge variant="muted" className="y-prompt-card__soon">Скоро</Badge>}
      {art && <span className="y-prompt-card__art" aria-hidden>{art}</span>}
    </button>
  );
}

type TripCardRoot = Omit<ComponentPropsWithRef<'button'>, 'children'>;
type TripCardFields = { add: true; label?: ReactNode } | { add?: false; city: string; items: number; outfits: number; art?: CollageItem[] };

export type TripCardProps = TripCardRoot & TripCardFields;

/**
 * Карточка поездки в сетке 2 колонки: город H3, счётчики вещей и образов Body серым,
 * вещи снизу — поле 141×120 в 16 от боков и 20 от низа (Figma: trip-card · art).
 * `add` — первая карточка «Собрать новый чемодан» с Primary-кнопкой «+».
 * **Контексты:** Стилист / Поездки.
 */
export function TripCard(props: TripCardProps) {
  const { add, label, city, items, outfits, art, className, ...rest } = props as TripCardRoot & Partial<{ add: boolean; label: ReactNode; city: string; items: number; outfits: number; art: CollageItem[] }>;
  if (add)
    return (
      <button type="button" className={cx('y-trip-card', 'y-trip-card--add', className)} {...rest}>
        <IconButton icon="plus" label="Новая поездка" variant="primary" size="L" decorative />
        <span className="y-body">{label ?? <>Собрать<br />новый чемодан</>}</span>
      </button>
    );
  return (
    <button type="button" className={cx('y-trip-card', className)} {...rest}>
      <span className="y-h3">{city}</span>
      <span className="y-body y-text--secondary">
        {plural(items ?? 0, ['вещь', 'вещи', 'вещей'])}
        <br />
        {plural(outfits ?? 0, ['образ', 'образа', 'образов'])}
      </span>
      {art && (
        <span className="y-trip-card__art">
          <CollageLayer items={art} defaultSize={64} base={141} />
        </span>
      )}
    </button>
  );
}
