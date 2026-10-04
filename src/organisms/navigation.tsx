import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { Button, Icon, IconButton, ScrollEdge } from '../atoms';
import type { IconName } from '../icons/icons';
import { ChipGroup, InputBar, type Chip } from '../molecules';
import { cx } from '../utils/cx';
import { haptic } from '../utils/haptic';
import { StatusBar } from './system';

/* ─── Header ────────────────────────────────────────────────────────── */

type Action = { icon: IconName; label: string; onClick?: () => void };

type HeaderFields = {
  large: { title: string; subtitle?: ReactNode; /** Вторая строка H1 акцентом с раскрывашкой: «на каждый день ⌃» (выбор повода на главной). */ accent?: { label: string; onClick?: () => void }; action?: Action };
  bar: { /** Заголовок простым текстом по центру (Настройки). */ title?: string; titleChip?: string; /** Вторая строка в пилюле заголовка: «8–13 сент · 5 ночей». */ titleChipSub?: string; /** Вместо чипа: шаги создания образа (`SegmentControl` M `fit` с иконками, Figma `414:1386`). */ center?: ReactNode; /** Появляется по центру, когда контент прокручен (Screen → data-collapsed): миниатюра фото вещи или образа. */ centerOnScroll?: ReactNode; onBack?: () => void; actions?: Action[] };
  back: { title: string; /** Подзаголовок Body серым через 12 под заголовком (Password Recovery, First Item Prompt). */ subtitle?: ReactNode; onBack?: () => void; /** Текстовое действие справа — Tertiary M с отступами 20: «Пропустить». */ textAction?: { label: string; onClick?: () => void } };
  search: { query?: string; placeholder?: string; onBack?: () => void; onQueryChange?: (v: string) => void; filters?: Chip[]; /** Поиск по фото: превью выбранного снимка 48 вместо кнопки «Поиск по фото». */ photo?: string; /** Кнопка «Поиск по фото» справа; `false` — поиск по своим вещам (Wardrobe / Item Search). */ photoSearch?: boolean; /** Поле в состоянии фокуса (InputBar `focused`). */ focused?: boolean };
};

/**
 * Вид шапки: `large` — корневые вкладки, `bar` — экраны с «назад» и пилюлей, `back` — вход и онбординг, `search` — поиск.
 * `back` в `Screen`: ряд «назад» закреплён, большой заголовок уезжает с контентом, в ряду проявляется компактный (#203).
 */
export type HeaderVariant = keyof HeaderFields;

type HeaderOf<V extends HeaderVariant> = HeaderFields[V] &
  ({ variant: V; type?: never } | { /** @deprecated Используйте `variant`: `type` в системе — атрибут HTML. */ type: V; variant?: never });

/** Все поля всех видов — чтобы не утекали в `<header>` вместе с `...rest`. */
type HeaderAllFields = Partial<HeaderFields['large'] & HeaderFields['bar'] & HeaderFields['back'] & HeaderFields['search']>;

export type HeaderProps = Omit<ComponentPropsWithRef<'header'>, 'title' | 'children' | 'placeholder'> & { [V in HeaderVariant]: HeaderOf<V> }[HeaderVariant];

/** Пропсы шапки одного вида после разбора `variant` / `type`. */
type HeaderView = { [V in HeaderVariant]: HeaderFields[V] & { variant: V } }[HeaderVariant];

export function Header(allProps: HeaderProps) {
  const {
    variant, type, className,
    title, subtitle, accent, action, titleChip, titleChipSub, center, centerOnScroll, onBack, actions, textAction, query, placeholder, onQueryChange, filters, photo, photoSearch, focused,
    ...rest
  } = allProps as Omit<ComponentPropsWithRef<'header'>, 'title' | 'children' | 'placeholder'> & HeaderAllFields & { variant?: HeaderVariant; type?: HeaderVariant };
  const props = { title, subtitle, accent, action, titleChip, titleChipSub, center, centerOnScroll, onBack, actions, textAction, query, placeholder, onQueryChange, filters, photo, photoSearch, focused, variant: variant ?? type } as HeaderView;
  return (
    <header className={cx('y-header', className)} {...rest}>
      <StatusBar />
      <div className="y-header__body">
        {props.variant === 'large' && (
          <>
            <div className="y-header__title-row">
              {/* большой заголовок не сворачивается: в Screen он уезжает вместе с контентом (#170) */}
              <h1 className="y-h1 y-header__large-title">{props.title}</h1>
              {props.action && <IconButton icon={props.action.icon} label={props.action.label} onClick={props.action.onClick} />}
            </div>
            {props.accent && (
              <button type="button" className="y-header__accent y-h1" onClick={props.accent.onClick}>
                {props.accent.label}
                <Icon name="chevron-up-down" size={20} />
              </button>
            )}
            {props.subtitle && <p className="y-body y-text--secondary y-header__subtitle">{props.subtitle}</p>}
          </>
        )}
        {props.variant === 'bar' && (
          <div className="y-header__row y-header__row--bar">
            <div className="y-header__side">
              <IconButton icon="chevron-left" label="Назад" onClick={props.onBack} />
            </div>
            <div className="y-header__center">
              {props.center ?? (props.titleChip ? (props.titleChipSub ? <span className="y-header__chip2"><span className="y-body">{props.titleChip}</span><span className="y-caption y-text--secondary">{props.titleChipSub}</span></span> : <Button variant="tertiary" size="M" tabIndex={-1}>{props.titleChip}</Button>) : props.title && <span className="y-body">{props.title}</span>)}
              {props.centerOnScroll && <span className="y-header__on-scroll" aria-hidden>{props.centerOnScroll}</span>}
            </div>
            <div className="y-header__side y-header__side--end">
              {props.actions?.map((a) => <IconButton key={a.label} icon={a.icon} label={a.label} onClick={a.onClick} />)}
            </div>
          </div>
        )}
        {props.variant === 'back' && (
          <>
            <div className="y-header__row y-header__row--back">
              <IconButton icon="chevron-left" label="Назад" onClick={props.onBack} />
              {/* компактный заголовок: проявляется, когда большой уехал под ряд (Screen → data-collapsed) */}
              <span className="y-header__compact-title" aria-hidden>{props.title}</span>
              {props.textAction && (
                <Button variant="tertiary" size="M" className="y-header__text-action" onClick={props.textAction.onClick}>
                  {props.textAction.label}
                </Button>
              )}
            </div>
            <div className="y-header__collapse">
              <div className="y-header__back-text">
                <h1 className="y-h1 y-header__back-title">{props.title}</h1>
                {props.subtitle && <p className="y-body y-text--secondary">{props.subtitle}</p>}
              </div>
            </div>
          </>
        )}
        {props.variant === 'search' && (
          <>
            <InputBar
              placeholder={props.placeholder ?? 'Уточни текстом'}
              value={props.query}
              onChange={props.onQueryChange}
              fieldIcon="search"
              leading={{ icon: 'chevron-left', label: 'Назад', onClick: props.onBack }}
              trailing={props.photo ? { icon: 'search-by-image', label: 'Выбранное фото', image: props.photo } : props.photoSearch === false ? undefined : { icon: 'search-by-image', label: 'Поиск по фото' }}
              focused={props.focused}
            />
            {props.filters && <ChipGroup chips={props.filters.map((f) => ({ ...f, dropdown: true }))} />}
          </>
        )}
      </div>
      <ScrollEdge position="top" size={24} />
    </header>
  );
}

/* ─── TabBar & BottomNav ────────────────────────────────────────────── */

export type Tab = 'today' | 'search' | 'wardrobe' | 'stylist' | 'profile';

const tabs: { id: Tab; label: string; icon?: IconName }[] = [
  { id: 'today', label: 'Сегодня', icon: 'home' },
  { id: 'search', label: 'Поиск', icon: 'search-by-image' },
  { id: 'wardrobe', label: 'Гардероб', icon: 'wardrobe' },
  { id: 'stylist', label: 'Стилист', icon: 'ai' },
  { id: 'profile', label: 'Профиль' },
];

/**
 * Плавающий таб-бар: 5 вкладок-иконок, активная — подложка `--color-bg-subtle`; она переезжает к новой вкладке на пружине quick (`--motion-nav`).
 * Положение подложки задаёт CSS по индексу вкладки (`--tab-index`): ровно по ячейке и без отставания, пока таб-бар сжимается под FAB.
 * Вкладка «Профиль» — буква в кружке 20 или фото профиля (`avatarSrc`, Figma: avatar · Content=Photo).
 */
export type TabBarProps = Omit<ComponentPropsWithRef<'nav'>, 'children' | 'onChange'> & { active: Tab; initial?: string; /** Фото профиля во вкладке «Профиль». */ avatarSrc?: string; onChange?: (t: Tab) => void };

export function TabBar({ active, initial = 'С', avatarSrc, onChange, className, style, ...rest }: TabBarProps) {
  const index = Math.max(0, tabs.findIndex((t) => t.id === active));
  return (
    <nav className={cx('y-tab-bar', className)} aria-label="Основная навигация" style={{ ['--tab-index' as string]: index, ...style } as CSSProperties} {...rest}>
      <span className="y-tab-bar__pill" aria-hidden />
      {tabs.map((t) => (
        <button key={t.id} type="button" className="y-tab-bar__tab" aria-label={t.label} aria-current={t.id === active ? 'page' : undefined} onClick={() => { if (t.id !== active) haptic('select'); onChange?.(t.id); }}>
          {t.icon ? <Icon name={t.icon} /> : avatarSrc ? <span className="y-tab-bar__avatar y-tab-bar__avatar--photo"><img src={avatarSrc} alt="" /></span> : <span className="y-tab-bar__avatar"><span className="y-tab-bar__initial">{initial}</span></span>}
        </button>
      ))}
    </nav>
  );
}

/**
 * Нижняя навигация: TabBar (+ FAB «+» на экранах с добавлением) на подложке с затуханием сверху.
 * **Контексты:** все корневые вкладки; FAB — Гардероб и Вишлист.
 * При переходе на вкладку с FAB таб-бар сжимается и уступает место кнопке — `--motion-nav` (quick, 744 мс): «+» выезжает справа целиком, таб-бар перелетает в обе стороны.
 */
export type BottomNavProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & { active: Tab; fab?: boolean; onFab?: () => void; onTabChange?: (t: Tab) => void; /** Фото профиля во вкладке «Профиль». */ avatarSrc?: string };

export function BottomNav({ active, fab, onFab, onTabChange, avatarSrc, className, ...rest }: BottomNavProps) {
  return (
    <div className={cx('y-bottom-nav', className)} {...rest}>
      <ScrollEdge position="bottom" size={40} />
      <TabBar active={active} avatarSrc={avatarSrc} onChange={onTabChange} />
      <span className={cx('y-bottom-nav__fab', fab && 'is-open')} aria-hidden={!fab}>
        <IconButton icon="plus" label="Добавить" variant="primary" size="XL" floating onClick={onFab} tabIndex={fab ? undefined : -1} />
      </span>
    </div>
  );
}

/**
 * Закреплённая нижняя кнопка (CTA) поверх контента: «Добавить», «Создать образ», «Переместить в гардероб».
 * Справа опционально — вторичное действие `IconButton Secondary XL`.
 */
export type BottomBarProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'onClick'> & {
  label: string;
  /** Нажатие главной кнопки (не всей панели). */
  onClick?: () => void;
  secondary?: Action;
  disabled?: boolean;
};

export function BottomBar({ label, onClick, secondary, disabled, className, ...rest }: BottomBarProps) {
  return (
    <div className={cx('y-bottom-bar', className)} {...rest}>
      <ScrollEdge position="bottom" size={24} />
      <Button variant="primary" size="L" fullWidth onClick={onClick} disabled={disabled}>
        {label}
      </Button>
      {secondary && <IconButton icon={secondary.icon} label={secondary.label} variant="secondary" size="L" onClick={secondary.onClick} />}
    </div>
  );
}

/**
 * Нижняя панель стилиста (флоу Stylist / Catalog, Home): белая подложка со скруглением 32 сверху и тенью,
 * хэндл, поле «Спроси у стилиста» и таб-бар.
 */
export type StylistDockProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'onChange'> & { value?: string; onChange?: (v: string) => void; active?: Tab; onTabChange?: (t: Tab) => void };

export function StylistDock({ value, onChange, active = 'stylist', onTabChange, className, ...rest }: StylistDockProps) {
  return (
    <div className={cx('y-dock', className)} {...rest}>
      <span className="y-sheet__handle" aria-hidden />
      <InputBar placeholder="Спроси у стилиста" value={value} onChange={onChange} send={{ label: 'Отправить' }} />
      <TabBar active={active} onChange={onTabChange} />
    </div>
  );
}
