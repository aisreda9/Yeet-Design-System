import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';
import type { ItemColor } from '../tokens/tokens';
import { cx } from '../utils/cx';
import { Icon } from './icon';

/* ─── Badge ─────────────────────────────────────────────────────────── */

export type BadgeProps = { variant?: 'primary' | 'danger' | 'secondary' | 'muted' | 'tertiary' | 'ghost'; children: ReactNode; className?: string };

/** Бейдж высотой 24. Скидка на товаре — `danger`, счётчик — `secondary`. */
export function Badge({ variant = 'primary', children, className }: BadgeProps) {
  return <span className={cx('y-badge', `y-badge--${variant}`, className)}>{children}</span>;
}

/* ─── Avatar ────────────────────────────────────────────────────────── */

export type AvatarProps = { size?: 'S' | 'M' | 'L'; initial?: string; src?: string; alt?: string; /** Фон буквы: у каждого аккаунта свой цвет (флоу Profile / Accounts: «Т» оранжевым). По умолчанию — акцент. */ color?: ItemColor; className?: string };

/** Аватар: L 96 (профиль), M 40 (аккаунты, настройки, чат), S 24. Без фото — буква Roboto Slab или иконка камеры. */
export function Avatar({ size = 'M', initial, src, alt = '', color, className }: AvatarProps) {
  return (
    <span className={cx('y-avatar', `y-avatar--${size}`, !src && initial && 'y-avatar--initial', className)} style={color && !src ? { background: `var(--yeet-item-${color})` } : undefined}>
      {src ? <img src={src} alt={alt} /> : initial ? initial : <Icon name="camera" size={size === 'S' ? 14 : 24} />}
    </span>
  );
}

/* ─── Divider ───────────────────────────────────────────────────────── */

/** Разделитель 1px `--color-border-subtle`. */
/** Линия-разделитель. С `label` — «— или —» между способами входа (флоу Auth / Sign In). */
export function Divider({ label, className }: { label?: string; className?: string }) {
  if (label)
    return (
      <div className={cx('y-divider-label', className)} role="separator">
        <span className="y-caption">{label}</span>
      </div>
    );
  return <hr className={cx('y-divider', className)} />;
}

/* ─── ColorDot ──────────────────────────────────────────────────────── */

/** Свотч цвета вещи. Только для атрибута «цвет вещи», не для интерфейса. */
export function ColorDot({ color, size = 12 }: { color: ItemColor; size?: number }) {
  return <span className="y-color-dot" style={{ width: size, height: size, background: `var(--yeet-item-${color})` }} />;
}

/* ─── ScrollEdge ────────────────────────────────────────────────────── */

/**
 * Полоса затухания: контент уходит под закреплённую шапку / нижнюю навигацию и плавно гаснет.
 * Уже встроена в `Header`, `BottomNav`, `BottomBar` — отдельно нужна редко.
 */
export function ScrollEdge({ position, size = 24, offset = 0 }: { position: 'top' | 'bottom'; size?: number; offset?: number }) {
  const style: CSSProperties = { height: size, [position === 'top' ? 'bottom' : 'top']: -size + offset };
  return <span aria-hidden className={cx('y-scroll-edge', `y-scroll-edge--${position}`)} style={style} />;
}

/* ─── Text ──────────────────────────────────────────────────────────── */

export type TextProps = HTMLAttributes<HTMLElement> & {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  tone?: 'primary' | 'secondary' | 'accent' | 'danger';
  as?: ElementType;
};

const defaultTag = { h1: 'h1', h2: 'h2', h3: 'h3', body: 'p', caption: 'span' } as const;

/** Текст в одном из 5 стилей. Заголовки — Roboto Slab, остальное — Inter. */
export function Text({ variant = 'body', tone = 'primary', as, className, ...rest }: TextProps) {
  const Tag = (as ?? defaultTag[variant]) as ElementType;
  return <Tag className={cx(`y-${variant}`, `y-text--${tone}`, className)} {...rest} />;
}
