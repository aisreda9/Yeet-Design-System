import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { cx } from '../utils/cx';
import { Icon } from './icon';

/* ─── ArtPlaceholder ────────────────────────────────────────────────── */

export type ArtPlaceholderProps = Omit<ComponentPropsWithRef<'span'>, 'children'> & {
  /** Сторона квадрата в px — как у заменяемого рисунка. */
  size?: number;
  /** Ширина, если заглушка не квадратная (px или CSS-длина). */
  width?: number | string;
  /** Высота, если заглушка не квадратная (px или CSS-длина). */
  height?: number | string;
  /** Растянуть на свободное место колонки (`flex: 1`, ширина 100 %): место под анимацию на экране приветствия. */
  stretch?: boolean;
};

/**
 * Временная заглушка иллюстрации (решение владельца, #220): фон `--color-bg-subtle`, иконка-картинка по центру
 * `--color-text-secondary`. Размер — как у заменяемого рисунка; скругление — `--card-radius`
 * (radius.lg 20), внутри карточки его задаёт карточка по правилу концентричности (плитка фото — `--radius-xs`).
 * Декоративная: скринридер её не озвучивает. Вернуть рисунки — `SHOW_ILLUSTRATIONS` в `src/utils/illustrations.ts`.
 * **Контексты:** экран приветствия, пустые состояния (120, над заголовком), плитки «Галерея» / «Камера», карточка «Для поездок» в каталоге стилиста.
 */
export function ArtPlaceholder({ size = 64, width, height, stretch, className, style, ...rest }: ArtPlaceholderProps) {
  const w = width ?? (stretch ? undefined : size);
  const h = height ?? (stretch ? undefined : size);
  const side = Math.min(typeof w === 'number' ? w : Infinity, typeof h === 'number' ? h : Infinity);
  // иконка — треть меньшей стороны, от 24 до 48; линия визуально 1.3, как у иконок 24
  const icon = Math.round(Math.min(48, Math.max(24, Number.isFinite(side) ? side / 3 : 48)));
  const box: CSSProperties = { width: w, height: h, ...style };
  return (
    <span
      className={cx('y-art-placeholder', stretch && 'y-art-placeholder--stretch', className)}
      style={box}
      aria-hidden
      {...rest}
    >
      <Icon name="image-add" size={icon} strokeWidth={(1.3 * 24) / icon} />
    </span>
  );
}
