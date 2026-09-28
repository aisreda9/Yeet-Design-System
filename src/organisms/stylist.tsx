import type { ReactNode } from 'react';
import { Badge, IconButton } from '../atoms';
import { cx } from '../utils/cx';
import { plural } from '../utils/plural';
import { CollageLayer, type CollageItem } from './cards';

/* ─── Stylist & trips ───────────────────────────────────────────────── */

/**
 * Превью образа 138×138 (радиус 20) — несколько вещей на `--card-bg`.
 * **Контексты:** «предыдущий / следующий образ» на экране Образов, списки образов в поездке.
 */
export function OutfitThumbnail({ items, size = 138, onClick }: { items: CollageItem[]; size?: number; onClick?: () => void }) {
  return (
    <button type="button" className="y-outfit-thumb" style={{ width: size, height: size }} onClick={onClick} aria-label="Открыть образ">
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
export function StylistPromptCard({ title, description, wide, soon, art, onClick }: { title: string; description?: string; wide?: boolean; soon?: boolean; art?: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" className={cx('y-prompt-card', wide && 'y-prompt-card--wide', soon && 'y-prompt-card--soon')} onClick={onClick} disabled={soon} aria-label={soon ? `${title} — скоро` : undefined}>
      <span className="y-h3">{title}</span>
      {description && <span className="y-caption y-text--secondary">{description}</span>}
      {soon && <Badge variant="muted" className="y-prompt-card__soon">Скоро</Badge>}
      {art && <span className="y-prompt-card__art" aria-hidden>{art}</span>}
    </button>
  );
}

export type TripCardProps =
  | { add: true; label?: ReactNode; onClick?: () => void }
  | { add?: false; city: string; items: number; outfits: number; art?: CollageItem[]; onClick?: () => void };

/**
 * Карточка поездки в сетке 2 колонки: город H3, счётчики вещей и образов Body серым,
 * вещи снизу — поле 141×120 в 16 от боков и 20 от низа (Figma: trip-card · art).
 * `add` — первая карточка «Собрать новый чемодан» с Primary-кнопкой «+».
 * **Контексты:** Стилист / Поездки.
 */
export function TripCard(props: TripCardProps) {
  if (props.add)
    return (
      <button type="button" className="y-trip-card y-trip-card--add" onClick={props.onClick}>
        <IconButton icon="plus" label="Новая поездка" variant="primary" size="L" decorative />
        <span className="y-body">{props.label ?? <>Собрать<br />новый чемодан</>}</span>
      </button>
    );
  return (
    <button type="button" className="y-trip-card" onClick={props.onClick}>
      <span className="y-h3">{props.city}</span>
      <span className="y-body y-text--secondary">
        {plural(props.items, ['вещь', 'вещи', 'вещей'])}
        <br />
        {plural(props.outfits, ['образ', 'образа', 'образов'])}
      </span>
      {props.art && (
        <span className="y-trip-card__art">
          <CollageLayer items={props.art} defaultSize={64} base={141} />
        </span>
      )}
    </button>
  );
}
