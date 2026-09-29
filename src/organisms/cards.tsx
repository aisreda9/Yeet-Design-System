import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Badge, ColorDot, Icon, IconButton, WeatherIcon, type Weather } from '../atoms';
import type { IconName } from '../icons/icons';
import type { ItemColor } from '../tokens/tokens';
import { cx } from '../utils/cx';
import { useFitScale } from '../utils/useFitScale';
import { haptic } from '../utils/haptic';
import { balanceArt, collageBalance, layoutCollage, measureArt, type ArtContext, type ArtMeta } from '../utils/artBalance';
import stylistAvatar from './art/stylist-avatar.png';

/* ─── Cards ─────────────────────────────────────────────────────────── */

export type Garment = 'top' | 'bottom' | 'outerwear' | 'shoe' | 'accessories' | 'container';

/** Метаданные фото, измеренные в браузере: кэш на всё приложение (одна и та же вещь в сетке, коллаже и шапке). */
const metaCache = new Map<string, ArtMeta | null>();

/** Измерить фото один раз на приложение; повторные вызовы ждут того же промиса. */
const pending = new Map<string, Promise<ArtMeta | null>>();
function loadMeta(src: string) {
  let p = pending.get(src);
  if (!p) {
    p = new Promise<ArtMeta | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(measureArt(img) ?? null);
      img.onerror = () => resolve(null);
      img.src = src;
    }).then((m) => { metaCache.set(src, m); return m; });
    pending.set(src, p);
  }
  return p;
}

/** Метаданные вырезанных фото: из данных вещи (посчитаны при загрузке) или измерить здесь. Порядок как у `list`. */
export function useArtMetas(list: { src?: string; meta?: ArtMeta }[]): (ArtMeta | undefined)[] {
  const key = list.map((it) => (it.meta ? '' : it.src ?? '')).join('|');
  const [, rerender] = useState(0);
  useEffect(() => {
    let live = true;
    const todo = list.filter((it) => !it.meta && it.src && !metaCache.has(it.src));
    if (todo.length) Promise.all(todo.map((it) => loadMeta(it.src!))).then(() => { if (live) rerender((n) => n + 1); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return list.map((it) => it.meta ?? (it.src ? metaCache.get(it.src) ?? undefined : undefined));
}

export type ItemArtProps = {
  kind: Garment;
  color?: ItemColor;
  /** Сторона ячейки, px. Фото балансируется внутри неё, иллюстрация рисуется во всю ячейку. */
  size?: number;
  /** Фото вещи без фона (PNG с прозрачностью). Поля, размер холста и «масса» у фото разные — их выравнивает balanceArt. */
  src?: string;
  /** Метаданные фото (`measureArt` при загрузке вещи). Без них фото измеряется в браузере при первом показе. */
  meta?: ArtMeta;
  /** Контекст баланса: `card` — сетка (вещи почти одного веса), `collage` — образ (пропорции ближе к реальным). */
  context?: ArtContext;
  alt?: string;
};

/** Вещь: фото без фона (`src`), выровненное по визуальному весу и оптическому центру, или, в Storybook, иллюстрация по категории. */
export function ItemArt({ kind, color, size = 88, src, meta, context = 'card', alt = '' }: ItemArtProps) {
  const [m] = useArtMetas([{ src, meta }]);
  if (src) {
    const p = balanceArt(m, size, kind, context, context === 'collage' ? collageBalance : undefined);
    return (
      <span className="y-item-art y-item-art--photo" style={{ width: size, height: size }}>
        <img className="y-item-art__img" src={src} alt={alt} draggable={false} style={{ width: p.width, height: p.height, left: p.left, top: p.top }} />
      </span>
    );
  }
  return (
    <span className="y-item-art" style={{ width: size, height: size }}>
      <Icon name={kind} size={size} strokeWidth={Math.max(0.35, (1.3 * 24) / size)} />
      {color && (
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
  /** Метаданные фото (measureArt при загрузке вещи): без них фото измеряется при первом показе. */
  imageMeta?: ArtMeta;
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

/** Категория вещи словами — имя для скринридера по умолчанию. */
export const garmentNames: Record<Garment, string> = { top: 'Верх', bottom: 'Низ', outerwear: 'Верхняя одежда', shoe: 'Обувь', accessories: 'Аксессуары', container: 'Сумка' };

export function ItemCard({ kind, color, image, imageMeta, name, discount, label, selected, onClick, onRemove }: ItemCardProps) {
  const a11y = [name ?? garmentNames[kind], discount && `скидка ${discount}`, label].filter(Boolean).join(', ');
  // карточка резиновая (ширина колонки), вещь в ней — пропорционально: 88 (фото 138) при ширине 173
  const ref = useRef<HTMLButtonElement>(null);
  const k = useFitScale(ref, 173);
  const card = (
    <button ref={ref} type="button" className={cx('y-item-card', selected && 'y-item-card--selected')} onClick={() => { if (selected !== undefined) haptic('toggle'); onClick?.(); }} aria-pressed={selected} aria-label={a11y}>
      <ItemArt kind={kind} color={color} src={image} meta={imageMeta} size={(image ? 173 : 88) * k} />
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
export type CollageItem = { kind: Garment; x: number; y: number; size?: number; color?: ItemColor; /** Фото вещи без фона. */ src?: string; /** Метаданные фото (balanceArt). */ meta?: ArtMeta };
/** Вещь для автораскладки: положение и размер считает layoutCollage по обрезанным рамкам фото. */
export type AutoCollageItem = Omit<CollageItem, 'x' | 'y' | 'size'>;

const isPlaced = (items: CollageItem[] | AutoCollageItem[]): items is CollageItem[] => items.length > 0 && 'x' in items[0];

/**
 * Слой вещей коллажа: общий для коллажа, превью образа и карточки поездки. `base` — ширина макета, в которой заданы размеры вещей:
 * слой растягивается по контейнеру и масштабирует вещи.
 * Вещи с x, y — ручная раскладка (центр в %); без них — автораскладка с равными зазорами между силуэтами (`pad` — поля под бейдж и панель).
 */
export function CollageLayer({ items, defaultSize = 96, base = 353, pad }: { items: CollageItem[] | AutoCollageItem[]; defaultSize?: number; base?: number; pad?: number | [number, number, number, number] }) {
  const ref = useRef<HTMLSpanElement>(null);
  const k = useFitScale(ref, base);
  const metas = useArtMetas(items);
  const placed: CollageItem[] = isPlaced(items)
    ? items
    : (() => {
        const slots = layoutCollage(items.map((it, i) => ({ kind: it.kind, meta: metas[i] })), { base, pad });
        return items.map((it, i) => ({ ...it, ...slots[i] }));
      })();
  return (
    <span ref={ref} className="y-collage__layer">
      {placed.map((it, i) => (
        <span key={i} className="y-collage__item" style={{ left: `${it.x}%`, top: `${it.y}%` }}>
          <ItemArt kind={it.kind} color={it.color} src={it.src} meta={metas[i]} context="collage" size={(it.size ?? defaultSize) * k} />
        </span>
      ))}
    </span>
  );
}

/**
 * Коллаж образа: вещи на точечном фоне, повод-бейдж и панель снизу.
 * `plain` — без точек, просто карточка light-grey (Figma: outfit-collage · Pattern=None): одна вещь в «Лучшей инвестиции» профиля.
 */
export function OutfitCollage({ items, label, footer, plain }: { items: CollageItem[] | AutoCollageItem[]; /** Повод: «Прогулка», «Ужин». */ label?: string; /** Панель снизу: цена образа, переход. Паддинг 16/20, 8 от краёв. */ footer?: ReactNode; plain?: boolean }) {
  // автораскладка обходит бейдж повода (20 + 28 + 12) и панель цены (8 + 72 + 12)
  const pad: [number, number, number, number] = [label ? 60 : 24, 24, footer ? 92 : 24, 24];
  return (
    <div className={cx('y-collage', plain && 'y-collage--plain')}>
      {label && <Badge variant="secondary" className="y-collage__label">{label}</Badge>}
      {footer && <div className="y-collage__footer">{footer}</div>}
      <CollageLayer items={items} pad={pad} />
    </div>
  );
}

/** Область фото 353×353. Пусто — «+» Primary (иконка on-accent) и «Добавить фотографию» в две строки; с фото — вещь и «×» 24 серым в 20 от угла. */
export function PhotoArea({ kind, image, loading, onAdd, onRemove, children }: { kind?: Garment; /** Фото вещи после удаления фона. */ image?: string; loading?: boolean; onAdd?: () => void; onRemove?: () => void; children?: ReactNode }) {
  return (
    <div className={cx('y-photo-area', loading && 'is-loading')} aria-busy={loading || undefined}>
      {children ??
        (kind || image ? (
          <>
            <ItemArt kind={kind ?? 'top'} src={image} size={image ? 353 : 160} />
            {/* «×» 24 серым в 20 от угла; зона нажатия 44 */}
            {onRemove && <button type="button" className="y-photo-area__close" aria-label="Удалить фото" title="Удалить фото" onClick={onRemove}><Icon name="cross" /></button>}
          </>
        ) : (
          <button type="button" className="y-photo-area__add" onClick={onAdd} disabled={loading}>
            <IconButton icon="plus" label="Добавить фотографию" variant="primary" size="M" floating decorative />
            <span>Добавить<br />фотографию</span>
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
/** Аватар ИИ-стилиста 64: иллюстрация из флоу Stylist (`413:846`, `699:2858`). Декоративный — имя стилиста уже в тексте. */
export function StylistAvatar({ size = 64 }: { size?: number }) {
  return <img className="y-stylist-face" src={stylistAvatar} width={size} height={size} alt="" draggable={false} />;
}

export function ChatBubble({ from = 'stylist', avatar, children }: { from?: 'stylist' | 'user'; /** Аватар 64 слева, выровнен по низу (флоу Stylist / Home). `true` — аватар стилиста по умолчанию (`StylistAvatar`). */ avatar?: ReactNode | true; children: ReactNode }) {
  const bubble = <div className={cx('y-bubble', 'y-body', from === 'user' && 'y-bubble--own')}>{children}</div>;
  if (!avatar) return bubble;
  return (
    <div className="y-bubble-row">
      <span className="y-bubble-row__avatar" aria-hidden>{avatar === true ? <StylistAvatar /> : avatar}</span>
      {bubble}
    </div>
  );
}
