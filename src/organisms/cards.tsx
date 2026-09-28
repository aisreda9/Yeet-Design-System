import { useRef, useState, type ReactNode } from 'react';
import { Badge, ColorDot, Icon, IconButton, WeatherIcon, type Weather } from '../atoms';
import type { IconName } from '../icons/icons';
import type { ItemColor } from '../tokens/tokens';
import { cx } from '../utils/cx';
import { useFitScale } from '../utils/useFitScale';
import { haptic } from '../utils/haptic';

/* ─── Cards ─────────────────────────────────────────────────────────── */

export type Garment = 'top' | 'bottom' | 'outerwear' | 'shoe' | 'accessories' | 'container';

/** Вещь: фото без фона (`src`) или, в Storybook, иллюстрация по категории. */
export function ItemArt({ kind, color, size = 88, src, alt = '' }: { kind: Garment; color?: ItemColor; size?: number; /** Фото вещи без фона (PNG с прозрачностью). */ src?: string; alt?: string }) {
  return (
    <span className="y-item-art" style={{ width: size, height: size }}>
      {src ? <img className="y-item-art__img" src={src} alt={alt} /> : <Icon name={kind} size={size} strokeWidth={Math.max(0.35, (1.3 * 24) / size)} />}
      {color && !src && (
        <span className="y-item-art__dot">
          <ColorDot color={color} size={Math.max(10, size / 7)} />
        </span>
      )}
    </span>
  );
}

/**
 * Карточка вещи 173×172 в сетке 2 колонки. Фото без фона на `--card-bg`.
 * **Контексты:** Гардероб (сетка), результаты поиска (`discount`), создание образа (`selected`).
 */
export type ItemCardProps = {
  kind: Garment;
  color?: ItemColor;
  /** Фото вещи без фона. Без него — иллюстрация по `kind`. */
  image?: string;
  /** Скидка на товаре: «-10%». Figma: Show Discount + Discount. */
  discount?: string;
  /** Метка-счётчик: «30 раз», «20 дней» (Профиль). */
  label?: string;
  /** Название для скринридера: «Чёрная сумка». По умолчанию — категория по `kind`. */
  name?: string;
  /** Режим выбора (создание образа): undefined — нет чекбокса. Figma: Selected. */
  selected?: boolean;
  onClick?: () => void;
  /** Убрать вещь из образа: «×» 20 серым в правом верхнем углу (флоу Outfit Creation / Item Selection). */
  onRemove?: () => void;
};

const kindNames: Record<Garment, string> = { top: 'Верх', bottom: 'Низ', outerwear: 'Верхняя одежда', shoe: 'Обувь', accessories: 'Аксессуары', container: 'Сумка' };

export function ItemCard({ kind, color, image, name, discount, label, selected, onClick, onRemove }: ItemCardProps) {
  const a11y = [name ?? kindNames[kind], discount && `скидка ${discount}`, label].filter(Boolean).join(', ');
  // карточка резиновая (ширина колонки), вещь в ней — пропорционально: 88 (фото 138) при ширине 173
  const ref = useRef<HTMLButtonElement>(null);
  const k = useFitScale(ref, 173);
  const card = (
    <button ref={ref} type="button" className={cx('y-item-card', selected && 'y-item-card--selected')} onClick={() => { if (selected !== undefined) haptic('toggle'); onClick?.(); }} aria-pressed={selected} aria-label={a11y}>
      <ItemArt kind={kind} color={color} src={image} size={(image ? 138 : 88) * k} />
      {discount && <Badge variant="danger" className="y-item-card__badge">{discount}</Badge>}
      {label && !discount && <Badge variant="secondary" className="y-item-card__badge">{label}</Badge>}
      {selected && <span className="y-item-card__check" aria-hidden><Icon name="check" size={16} strokeWidth={2} /></span>}
    </button>
  );
  if (!onRemove) return card;
  // «×» — отдельная кнопка рядом с карточкой, не внутри неё (вложенные кнопки ломают доступность)
  return (
    <div className="y-item-card-wrap">
      {card}
      <button type="button" className="y-item-card__remove" aria-label={`Убрать: ${a11y}`} onClick={onRemove}><Icon name="cross" size={20} /></button>
    </div>
  );
}

/** Карточка товара в поиске: фото + название, цена, магазин. */
export function ProductCard({ kind, image, name, price, discount, liked, showLike = true, onLike }: { kind: Garment; image?: string; name: string; price: string; discount?: string; liked?: boolean; showLike?: boolean; onLike?: () => void }) {
  // сердце подпрыгивает только от нажатия «лайк», а не при загрузке уже лайкнутого товара
  const [pop, setPop] = useState(false);
  const like = () => { haptic('toggle'); setPop(!liked); onLike?.(); };
  return (
    <article className="y-product-card">
      <div style={{ position: 'relative' }}>
        <ItemCard kind={kind} image={image} name={name} discount={discount} />
        {showLike && (
          <button type="button" className={cx('y-product-card__like', 'y-icon-button', liked && 'is-on', pop && liked && 'is-popping')} aria-label={liked ? 'Убрать из вишлиста' : 'В вишлист'} aria-pressed={liked} onClick={like} onAnimationEnd={() => setPop(false)}>
            <Icon name="heart" />
          </button>
        )}
      </div>
      <div className="y-product-card__meta">
        <span className="y-caption y-text--secondary">{name}</span>
        <span className="y-body">{price}</span>
      </div>
    </article>
  );
}

/** Коллаж образа 353×353: точечный фон, вещи раскладываются свободно (x, y в %). */
export type CollageItem = { kind: Garment; x: number; y: number; size?: number; color?: ItemColor; /** Фото вещи без фона. */ src?: string };

/** Вещи, свободно разложенные по площадке (x, y — центр в %). Общий слой коллажа, превью образа и карточки поездки. */
/** Слой вещей коллажа. `base` — ширина макета, в которой заданы размеры вещей: слой растягивается по контейнеру и масштабирует вещи. */
export function CollageLayer({ items, defaultSize = 96, base = 353 }: { items: CollageItem[]; defaultSize?: number; base?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const k = useFitScale(ref, base);
  return (
    <span ref={ref} className="y-collage__layer">
      {items.map((it, i) => (
        <span key={i} className="y-collage__item" style={{ left: `${it.x}%`, top: `${it.y}%` }}>
          <ItemArt kind={it.kind} color={it.color} src={it.src} size={(it.size ?? defaultSize) * k} />
        </span>
      ))}
    </span>
  );
}

export function OutfitCollage({ items, label, footer }: { items: CollageItem[]; /** Повод: «Прогулка», «Ужин». */ label?: string; /** Панель снизу: цена образа, переход. */ footer?: ReactNode }) {
  return (
    <div className="y-collage">
      {label && <Badge variant="secondary" className="y-collage__label">{label}</Badge>}
      {footer && <div className="y-collage__footer">{footer}</div>}
      <CollageLayer items={items} />
    </div>
  );
}

/** Область фото 353×353. Пусто — «Добавить фотографию»; с фото — вещь и кнопка удаления. */
export function PhotoArea({ kind, image, loading, onAdd, onRemove, children }: { kind?: Garment; /** Фото вещи после удаления фона. */ image?: string; loading?: boolean; onAdd?: () => void; onRemove?: () => void; children?: ReactNode }) {
  return (
    <div className={cx('y-photo-area', loading && 'is-loading')} aria-busy={loading || undefined}>
      {children ??
        (kind || image ? (
          <>
            <ItemArt kind={kind ?? 'top'} src={image} size={image ? 300 : 160} />
            {onRemove && <IconButton className="y-photo-area__close" icon="cross" label="Удалить фото" variant="ghost" size="S" onClick={onRemove} />}
          </>
        ) : (
          <button type="button" className="y-photo-area__add" onClick={onAdd} disabled={loading}>
            <IconButton icon="camera" label="Добавить фотографию" variant="primary" size="M" floating decorative />
            Добавить фотографию
          </button>
        ))}
    </div>
  );
}

/** Карточка погоды на экране «Сегодня»: температура + описание. Плавающая, инвертированная. */
export function WeatherCard({ temperature, description, weather = 'sunny', icon, alert, tilt }: { temperature: string; description: string; /** Цветная иконка погоды (как во флоу). */ weather?: Weather; /** Линейная иконка вместо цветной. */ icon?: IconName; /** Предупреждение второй строкой: «Через 1 час дождь, захвати зонт». */ alert?: string; /** Наклон 10° поверх коллажа (экран «Образы дня»). */ tilt?: boolean }) {
  return (
    <div className={cx('y-weather', tilt && 'y-weather--tilt')}>
      <span className="y-weather__temp">{icon ? <Icon name={icon} /> : <WeatherIcon kind={weather} />}{temperature}</span>
      <span className="y-caption y-weather__desc">{description}{alert && <span className="y-weather__alert">{alert}</span>}</span>
    </div>
  );
}

/** Сообщение в чате со стилистом. `from="user"` — сообщение пользователя (blue, справа). Figma: chat-bubble · From. */
export function ChatBubble({ from = 'stylist', avatar, children }: { from?: 'stylist' | 'user'; /** Аватар стилиста 64 слева, выровнен по низу (флоу Stylist / Home). */ avatar?: ReactNode; children: ReactNode }) {
  const bubble = <div className={cx('y-bubble', 'y-body', from === 'user' && 'y-bubble--own')}>{children}</div>;
  if (!avatar) return bubble;
  return (
    <div className="y-bubble-row">
      <span className="y-bubble-row__avatar" aria-hidden>{avatar}</span>
      {bubble}
    </div>
  );
}
