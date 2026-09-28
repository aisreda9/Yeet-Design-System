import type { ButtonHTMLAttributes } from 'react';
import type { IconName } from '../icons/icons';
import { stampStar } from '../icons/brand';
import { cx } from '../utils/cx';
import { Icon } from './icon';

/* ─── Button ────────────────────────────────────────────────────────── */

export type ButtonStyle = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'ghost' | 'soft' | 'destructive';
export type ControlSize = 'S' | 'M' | 'L' | 'XL';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Семантический стиль. Один `primary` на экран; удаление — всегда `destructive`. */
  variant?: ButtonStyle;
  size?: ControlSize;
  leftIcon?: IconName;
  rightIcon?: IconName;
  /** Растянуть на ширину контейнера (CTA, пара кнопок в sheet). */
  fullWidth?: boolean;
  /** Плавающая кнопка поверх контента — тень `--shadow-floating`. */
  floating?: boolean;
};

/**
 * Кнопка-капсула с текстом.
 *
 * **Контексты во флоу:** главный CTA онбординга и входа (Primary XL), пара действий в sheet (Tertiary + Primary L),
 * фильтры-дропдауны (Tertiary / Soft S + `chevron-up-down`), теги (Tertiary S + `cross`), «Пропустить» (Ghost M).
 */
export function Button({ variant = 'primary', size = 'L', leftIcon, rightIcon, fullWidth, floating, className, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx('y-button', `y-button--${size}`, `y-style--${variant}`, fullWidth && 'y-button--full', floating && 'y-button--floating', className)}
      {...rest}
    >
      {leftIcon && <Icon name={leftIcon} />}
      {children}
      {rightIcon && <Icon name={rightIcon} />}
    </button>
  );
}

/* ─── IconButton ────────────────────────────────────────────────────── */

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: IconName;
  /** Обязательное описание действия для скринридеров: «Назад», «Ещё», «Добавить». */
  label: string;
  variant?: ButtonStyle;
  size?: ControlSize;
  floating?: boolean;
  /** Только вид кнопки внутри другой кнопки (карточка «+», зона фото): рендерится `<span aria-hidden>`, без вложенного интерактива. */
  decorative?: boolean;
};

/**
 * Круглая кнопка с иконкой. Те же стили и размеры, что у `Button`.
 *
 * **Контексты во флоу:** «Назад» и «Ещё» в шапке (Tertiary M), FAB «+» (Primary XL, floating),
 * «Отправить» в чате (Primary M), поделиться (Secondary XL), фильтры гардероба (Tertiary S).
 */
export function IconButton({ icon, label, variant = 'tertiary', size = 'M', floating, decorative, className, ...rest }: IconButtonProps) {
  const cls = cx('y-icon-button', `y-icon-button--${size}`, `y-style--${variant}`, floating && 'y-icon-button--floating', className);
  if (decorative)
    return (
      <span className={cls} aria-hidden>
        <Icon name={icon} size={size === 'S' ? 20 : 24} />
      </span>
    );
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cls}
      {...rest}
    >
      <Icon name={icon} size={size === 'S' ? 20 : 24} />
    </button>
  );
}

/* ─── Stamp ─────────────────────────────────────────────────────────── */


export type StampProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** Текст действия: «Надеть», «Сохранить». У `secondary` не показывается (только иконка), но озвучивается. */
  label: string;
  /**
   * Как в Figma (stamp · Tone): размер задаётся тоном.
   * `primary` — главное действие, синий 148 с текстом; `secondary` — вспомогательное, чёрный 48 с иконкой («Не нравится»).
   */
  tone?: 'primary' | 'secondary';
  /** Иконка малого штампа (`secondary`), по умолчанию `thumb-down`. */
  icon?: IconName;
  /** Действие выполнено: штамп сжимается, поворачивается на −60° и становится «×» (отменить). */
  done?: boolean;
};

/**
 * Штамп — фирменная кнопка главного действия поверх коллажа. Одна на экран.
 * Нажатие анимируется пружиной `--motion-stamp` (bouncy, 958 мс).
 *
 * **Контексты:** Образы на сегодня — «Надеть»; Стилист / С чем носить — «Сохранить» + малый чёрный штамп «Не нравится» (палец вниз).
 */
export function Stamp({ label, tone = 'primary', icon = 'thumb-down', done, className, ...rest }: StampProps) {
  const size = tone === 'secondary' ? 'S' : 'L';
  return (
    <button
      type="button"
      aria-label={done ? `Отменить: ${label}` : label}
      aria-pressed={done}
      className={cx('y-stamp', `y-stamp--${size}`, `y-stamp--${tone}`, done && 'y-stamp--done', className)}
      {...rest}
    >
      <svg className="y-stamp__shape" viewBox="0 0 144 144" aria-hidden>
        <path d={stampStar} fill="currentColor" />
      </svg>
      <span className="y-stamp__label">{size === 'S' ? <Icon name={icon} size={20} /> : label}</span>
      <span className="y-stamp__done" aria-hidden><Icon name="cross" /></span>
    </button>
  );
}
