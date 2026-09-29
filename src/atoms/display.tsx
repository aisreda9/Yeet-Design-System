import type { ComponentPropsWithRef, CSSProperties, Ref } from 'react';
import type { ItemColor } from '../tokens/tokens';
import { cx } from '../utils/cx';
import { Icon } from './icon';

/* ─── Badge ─────────────────────────────────────────────────────────── */

export type BadgeProps = ComponentPropsWithRef<'span'> & { variant?: 'primary' | 'danger' | 'secondary' | 'muted' | 'tertiary' | 'ghost' };

/** Бейдж высотой 24. Скидка на товаре — `danger`, счётчик — `secondary`. */
export function Badge({ variant = 'primary', className, ...rest }: BadgeProps) {
  return <span className={cx('y-badge', `y-badge--${variant}`, className)} {...rest} />;
}

/* ─── Avatar ────────────────────────────────────────────────────────── */

/** Цвета аккаунтов — 9 цветов из Figma `avatar` (tokens.avatar.palette): без grey, white, beige — теряются на белом фоне. */
export type AvatarColor = Exclude<ItemColor, 'grey' | 'white' | 'beige'>;

export type AvatarProps = Omit<ComponentPropsWithRef<'span'>, 'color' | 'children'> & {
  size?: 'S' | 'M' | 'L';
  initial?: string;
  src?: string;
  /** Чей аватар — для скринридера: «Сима». Без имени аватар декоративный и не озвучивается (буква одна ничего не говорит). */
  name?: string;
  /** @deprecated Бери `name`: он озвучивается и у фото, и у буквы. */
  alt?: string;
  /** Фон буквы: у каждого аккаунта свой цвет (флоу Profile / Accounts: «Т» оранжевым), 9 цветов из Figma. По умолчанию — акцент. */
  color?: AvatarColor;
};

/** Аватар: L 96 (профиль), M 40 (аккаунты, настройки, чат), S 24. Без фото — буква Roboto Slab или иконка камеры. */
export function Avatar({ size = 'M', initial, src, name, alt, color, className, style, ...rest }: AvatarProps) {
  const label = name ?? (alt || undefined);
  return (
    <span
      className={cx('y-avatar', `y-avatar--${size}`, !src && initial && 'y-avatar--initial', className)}
      style={color && !src ? { background: `var(--yeet-item-${color})`, color: `var(--yeet-on-item-${color})`, ...style } : style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      {src ? <img src={src} alt="" /> : initial ? initial : <Icon name="camera" size={size === 'S' ? 14 : 24} />}
    </span>
  );
}

/* ─── Divider ───────────────────────────────────────────────────────── */

/**
 * Линия-разделитель 1px `--color-border-subtle`. С `label` — «— или —» между способами входа (флоу Auth / Sign In):
 * подпись читается скринридером как обычный текст (у `role="separator"` содержимое не озвучивается), линии — декор.
 */
export type DividerProps = Omit<ComponentPropsWithRef<'div'>, 'ref' | 'children'> & { label?: string; ref?: Ref<HTMLElement> };

export function Divider({ label, className, ref, ...rest }: DividerProps) {
  if (label)
    return (
      <div ref={ref as Ref<HTMLDivElement>} className={cx('y-divider-label', className)} {...rest}>
        <span className="y-caption">{label}</span>
      </div>
    );
  return <hr ref={ref as Ref<HTMLHRElement>} className={cx('y-divider', className)} {...rest} />;
}

/* ─── ColorDot ──────────────────────────────────────────────────────── */

export type ColorDotProps = Omit<ComponentPropsWithRef<'span'>, 'color' | 'children'> & {
  color: ItemColor;
  /** Диаметр в px, по умолчанию 16 (графический примитив: число, а не шкала S–XL). */
  size?: number;
};

/** Светлые цвета, которые без обводки теряются на белом фоне — обводка только у них (Figma `color-dot`). */
const outlinedDots: ReadonlySet<ItemColor> = new Set<ItemColor>(['white', 'beige']);

/** Свотч цвета вещи, по умолчанию 16 (Figma `color-dot`). Только для атрибута «цвет вещи», не для интерфейса. */
export function ColorDot({ color, size = 16, className, style, ...rest }: ColorDotProps) {
  return <span className={cx('y-color-dot', outlinedDots.has(color) && 'y-color-dot--outlined', className)} style={{ width: size, height: size, background: `var(--yeet-item-${color})`, ...style }} {...rest} />;
}

/* ─── ScrollEdge ────────────────────────────────────────────────────── */

/**
 * Полоса затухания: контент уходит под закреплённую шапку / нижнюю навигацию и плавно гаснет.
 * Уже встроена в `Header`, `BottomNav`, `BottomBar` — отдельно нужна редко.
 */
export type ScrollEdgeProps = Omit<ComponentPropsWithRef<'span'>, 'children'> & { position: 'top' | 'bottom'; /** Высота полосы в px, по умолчанию 32 (Figma `scroll-edge`). */ size?: number; offset?: number };

export function ScrollEdge({ position, size = 32, offset = 0, className, style, ...rest }: ScrollEdgeProps) {
  const edge: CSSProperties = { height: size, [position === 'top' ? 'bottom' : 'top']: -size + offset, ...style };
  return <span aria-hidden className={cx('y-scroll-edge', `y-scroll-edge--${position}`, className)} style={edge} {...rest} />;
}

