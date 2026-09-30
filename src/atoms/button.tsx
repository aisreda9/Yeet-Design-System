import { useEffect, useRef, type ComponentPropsWithRef, type MouseEvent } from 'react';
import type { IconName } from '../icons/icons';
import { stampStar } from '../icons/brand';
import { cx } from '../utils/cx';
import { haptic } from '../utils/haptic';
import { VisuallyHidden } from '../utils/VisuallyHidden';
import { Icon } from './icon';

/* ─── Button ────────────────────────────────────────────────────────── */

export type ButtonStyle = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'ghost' | 'soft' | 'destructive';
/** Шкала габаритов контролов: S 40 · M 48 · L 52 · XL 56. */
export type ControlSize = 'S' | 'M' | 'L' | 'XL';

/** Общее для Button и IconButton: `loading` блокирует повторное нажатие, но оставляет кнопку в фокусе. */
type LoadingProps = {
  /**
   * Действие выполняется (вход, сохранение, удаление фона): вместо содержимого — спиннер, `aria-busy`,
   * повторные нажатия не проходят. Кнопка остаётся фокусируемой и сохраняет ширину — макет не прыгает.
   */
  loading?: boolean;
  /** Что озвучить во время `loading`. По умолчанию «Загрузка». */
  loadingLabel?: string;
};

export type ButtonProps = ComponentPropsWithRef<'button'> & LoadingProps & {
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

/** Нажатие во время загрузки гасится: ни `onClick`, ни отправки формы. */
const guard = (loading: boolean | undefined, onClick: ButtonProps['onClick']) =>
  loading ? (e: MouseEvent<HTMLButtonElement>) => e.preventDefault() : onClick;

const spinner = (label: string | undefined, size: number) => (
  <>
    <Icon name="spin" size={size} className="y-button__spinner" />
    <VisuallyHidden>{label ?? 'Загрузка'}</VisuallyHidden>
  </>
);

/**
 * Кнопка-капсула с текстом. `ref`, `className` и любые атрибуты `<button>` пробрасываются.
 *
 * **Контексты во флоу:** главный CTA онбординга и входа (Primary XL), пара действий в sheet (Tertiary + Primary L),
 * фильтры-дропдауны (Tertiary / Soft S + `chevron-up-down`), теги (Tertiary S + `cross`), «Пропустить» (Ghost M).
 * **Загрузка:** `loading` — «Войти» пока идёт запрос, «Сохранить» вещь, «Удалить аккаунт».
 */
export function Button({ variant = 'primary', size = 'L', leftIcon, rightIcon, fullWidth, floating, loading, loadingLabel, className, children, onClick, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cx('y-button', `y-button--${size}`, `y-style--${variant}`, fullWidth && 'y-button--full', floating && 'y-button--floating', loading && 'y-button--loading', className)}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={guard(loading, onClick)}
      {...rest}
    >
      {leftIcon && <Icon name={leftIcon} />}
      {children}
      {rightIcon && <Icon name={rightIcon} />}
      {loading && spinner(loadingLabel, size === 'S' ? 20 : 24)}
    </button>
  );
}

/* ─── IconButton ────────────────────────────────────────────────────── */

export type IconButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children'> & LoadingProps & {
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
 * Круглая кнопка с иконкой. Те же стили и размеры, что у `Button`; `ref`, `className` и атрибуты `<button>` пробрасываются.
 *
 * **Контексты во флоу:** «Назад» и «Ещё» в шапке (Tertiary M), FAB «+» (Primary XL, floating),
 * «Отправить» в чате (Primary M, `loading` пока сообщение уходит), поделиться (Secondary XL), фильтры гардероба (Tertiary S).
 */
export function IconButton({ icon, label, variant = 'tertiary', size = 'M', floating, decorative, loading, loadingLabel, className, onClick, ...rest }: IconButtonProps) {
  const cls = cx('y-icon-button', `y-icon-button--${size}`, `y-style--${variant}`, floating && 'y-icon-button--floating', loading && 'y-button--loading', className);
  const iconSize = size === 'S' ? 20 : 24;
  if (decorative)
    return (
      <span className={cls} aria-hidden>
        <Icon name={icon} size={iconSize} />
      </span>
    );
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cls}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={guard(loading, onClick)}
      {...rest}
    >
      <Icon name={icon} size={iconSize} />
      {loading && spinner(loadingLabel, iconSize)}
    </button>
  );
}

/* ─── Stamp ─────────────────────────────────────────────────────────── */


export type StampProps = Omit<ComponentPropsWithRef<'button'>, 'children'> & {
  /** Текст действия: «Надеть», «Сохранить». У `secondary` не показывается (только иконка), но озвучивается. */
  label: string;
  /**
   * Роль штампа (Figma: stamp · Tone), размер задаётся ею.
   * `primary` — главное действие, синий 148 с текстом; `secondary` — вспомогательное, чёрный 64 с белой иконкой 29, повёрнутой как подпись (rotation −15 в Figma), — «Не нравится».
   */
  variant?: 'primary' | 'secondary';
  /** @deprecated Бери `variant`: `tone` в системе — окраска относительно фона, а здесь это роль штампа. */
  tone?: 'primary' | 'secondary';
  /** Иконка малого штампа (`secondary`), по умолчанию `thumb-down`. */
  icon?: IconName;
  /** Действие выполнено: штамп сжимается до 78, поворачивается на −60°, чернеет и показывает «отменить» (флоу: Wear Action Active). */
  done?: boolean;
  /**
   * До какого размера сжимается выполненный штамп: `M` — 78 (главная, Outfits / Everyday `252:286`),
   * `S` — 56 (детали образа, Outfit Details / Variant 02 `440:3008`: плавающая кнопка в углу поверх панели, «отменить» 20).
   * Габарит кнопки не меняется (148), двигает её в угол экран.
   */
  doneSize?: 'M' | 'S';
};

/**
 * Штамп — фирменная кнопка главного действия поверх коллажа. Одна на экран.
 * Нажатие: сжатие 0.94 (`--gesture-press-scale-stamp`, press). Переход в «выполнено» — пружина `--motion-stamp`
 * (bouncy, 958 мс): звезда 148 → 78, −60°, чернеет, «Надеть» гаснет, появляется «отменить»; хаптика `stamp`
 * в пик пружины (~120 мс). Малый штамп — хаптика `skip` на нажатии.
 *
 * **Контексты:** Образы на сегодня — «Надеть»; Стилист / С чем носить — «Сохранить» + малый чёрный штамп «Не нравится» (палец вниз).
 * `ref`, `className` и атрибуты `<button>` пробрасываются.
 */
export function Stamp({ label, variant, tone, icon = 'thumb-down', done, doneSize = 'M', className, onClick, ...rest }: StampProps) {
  const kind = variant ?? tone ?? 'primary';
  const size = kind === 'secondary' ? 'S' : 'L';
  const was = useRef(done);
  useEffect(() => {
    if (done && !was.current) {
      const t = window.setTimeout(() => haptic('stamp'), 120); // пик пружины bouncy, а не касание
      was.current = done;
      return () => window.clearTimeout(t);
    }
    was.current = done;
  }, [done]);
  return (
    <button
      type="button"
      aria-label={done ? `Отменить: ${label}` : label}
      aria-pressed={done}
      className={cx('y-stamp', `y-stamp--${size}`, `y-stamp--${kind}`, done && 'y-stamp--done', doneSize === 'S' && 'y-stamp--done-S', className)}
      onClick={(e) => { if (kind === 'secondary') haptic('skip'); onClick?.(e); }}
      {...rest}
    >
      <svg className="y-stamp__shape" viewBox="0 0 144 144" aria-hidden>
        <path d={stampStar} fill="currentColor" />
      </svg>
      <span className="y-stamp__label">{size === 'S' ? <Icon name={icon} size={24} /> : label}</span>
      <span className="y-stamp__done" aria-hidden><Icon name="undo" size={doneSize === 'S' ? 20 : 24} /></span>
    </button>
  );
}
