import { useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { ColorDot, Icon, IconButton, type ButtonStyle } from '../atoms';
import type { IconName } from '../icons/icons';
import type { ItemColor } from '../tokens/tokens';
import { cx } from '../utils/cx';

/* ─── Field ─────────────────────────────────────────────────────────── */

export type FieldProps = {
  /** Лейбл слева (grey). В режиме ввода — плейсхолдер. */
  label: string;
  /** Выбранное значение справа (режим «ключ — значение»). */
  value?: string;
  /** Свотч цвета вещи перед значением. */
  colorDot?: ItemColor;
  /** Иконка справа 20: `chevron-up-down` — выбор, `eye` / `eye-off` — пароль, `external-link` — ссылка. */
  trailingIcon?: IconName;
  onTrailingClick?: () => void;
  /** Имя кнопки-иконки для скринридера («Открыть ссылку»). Без `onTrailingClick` иконка декоративная и не озвучивается. */
  trailingLabel?: string;
  /** Поле ввода вместо статичного лейбла. */
  input?: InputHTMLAttributes<HTMLInputElement>;
  /**
   * Многострочное поле (Figma: input · Multiline): `textarea` высотой 104, текст сверху, паддинг 16/20.
   * **Контекст:** «Комментарий» / описание вещи. Лейбл — плейсхолдер.
   */
  multiline?: TextareaHTMLAttributes<HTMLTextAreaElement>;
  error?: boolean;
  onClick?: () => void;
};

/**
 * Строка поля (Figma: `input` + `input-value`). Живёт внутри `InputGroup`.
 * Три паттерна: ввод текста, «ключ — значение» с выбором в sheet, пароль с глазом.
 * - `onClick` — строка-выбор: фокусируется по Tab, срабатывает на Enter и пробел.
 * - `type="password"` — глаз справа встроен: показывает и скрывает пароль (`eye` ↔ `eye-off`, `aria-pressed`).
 * - Фокус виден: кольцо 1.5 акцентом по строке (как у InputBar в Figma · State=Focus).
 */
export function Field({ label, value, colorDot, trailingIcon, onTrailingClick, trailingLabel, input, multiline, error, onClick }: FieldProps) {
  const [shown, setShown] = useState(false);
  if (multiline)
    return (
      <div className={cx('y-field', 'y-field--multiline', error && 'y-field--error')}>
        <textarea className="y-field__input" placeholder={label} aria-label={label} aria-invalid={error || undefined} rows={4} {...multiline} />
      </div>
    );
  // Пароль: свой переключатель, если потребитель не повесил на иконку свой обработчик
  const password = input?.type === 'password' && !onTrailingClick;
  const onKeyDown = onClick
    ? (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        onClick();
      }
    : undefined;
  return (
    <div className={cx('y-field', error && 'y-field--error')} onClick={onClick} onKeyDown={onKeyDown} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="y-field__main">
        {input ? (
          <input className="y-field__input" placeholder={label} aria-label={label} aria-invalid={error || undefined} {...input} type={password && shown ? 'text' : input.type} />
        ) : (
          <span className="y-field__label">{label}</span>
        )}
        {value && (
          <span className="y-field__value">
            {colorDot && <ColorDot color={colorDot} size={16} />}
            <span className="y-field__value-text">{value}</span>
          </span>
        )}
      </div>
      {password ? (
        <button type="button" className="y-field__trailing" aria-label={shown ? 'Скрыть пароль' : 'Показать пароль'} aria-pressed={shown} onClick={(e) => { e.stopPropagation(); setShown((v) => !v); }}>
          <Icon name={shown ? 'eye-off' : 'eye'} size={20} />
        </button>
      ) : trailingIcon && onTrailingClick ? (
        <button type="button" className="y-field__trailing" aria-label={trailingLabel ?? label} onClick={(e) => { e.stopPropagation(); onTrailingClick(); }}>
          <Icon name={trailingIcon} size={20} />
        </button>
      ) : trailingIcon ? (
        <span className="y-field__trailing" aria-hidden>
          <Icon name={trailingIcon} size={20} />
        </span>
      ) : null}
    </div>
  );
}

/* ─── InputGroup ────────────────────────────────────────────────────── */

/** Группа полей на `--input-bg`, радиус 20, строки разделены линией. Вход, детали вещи, настройки. */
export function InputGroup({ size = 'XL', children }: { size?: 'M' | 'L' | 'XL'; children: ReactNode }) {
  return <div className={cx('y-input-group', `y-input-group--${size}`)}>{children}</div>;
}

/* ─── InputBar ──────────────────────────────────────────────────────── */

type BarAction = {
  icon: IconName;
  label: string;
  variant?: ButtonStyle;
  onClick?: () => void;
  /** Превью фото вместо иконки: круг 48 с картинкой (Figma: input-bar · Right=Photo) — поиск по фото, фото уже выбрано. */
  image?: string;
};

/** Кнопка сбоку поля: круглая иконка или превью фото. */
function SideButton({ action, size }: { action: BarAction; size: 'M' | 'L' }) {
  if (action.image)
    return (
      <button type="button" className={cx('y-input-bar__photo', size === 'L' && 'y-input-bar__photo--l')} aria-label={action.label} title={action.label} onClick={action.onClick}>
        <img src={action.image} alt="" />
      </button>
    );
  return <IconButton icon={action.icon} label={action.label} variant={action.variant ?? 'tertiary'} size={size} onClick={action.onClick} />;
}

export type InputBarProps = {
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  /** Иконка внутри поля. Для поиска — `search`, для чата — нет. */
  fieldIcon?: IconName;
  leading?: BarAction;
  trailing?: BarAction;
  /** Чат со стилистом: кнопка отправки 44 внутри поля (primary, когда есть текст), поле 52 на подложке с тенью. */
  send?: { label: string; onClick?: () => void };
  /** L — 52 (поле поиска на экране), по умолчанию 48 (в шапке). */
  size?: 'M' | 'L';
};

/**
 * Панель ввода: [кнопка] поле [кнопка].
 * В фокусе поле обводится акцентом 1.5 (Figma: input-bar · State=Focus), каретка — акцентная.
 * **Контексты:** поиск («Назад» + поле + поиск по фото; после выбора фото справа — его превью 48), чат со стилистом (поле + «Отправить» Primary), поиск по гардеробу.
 */
export function InputBar({ placeholder, value, onChange, fieldIcon, leading, trailing, send, size = 'M' }: InputBarProps) {
  return (
    <div className={cx('y-input-bar', send && 'y-input-bar--chat', size === 'L' && 'y-input-bar--l')}>
      {leading && <SideButton action={leading} size={size} />}
      <label className="y-input-bar__field">
        {fieldIcon && <Icon name={fieldIcon} />}
        <input className="y-field__input" placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} readOnly={!onChange} />
        {/* флоу Search / Text / Results: очистка «×» 20 серым, пока в поле есть текст */}
        {value && !send && <button type="button" className="y-input-bar__clear" aria-label="Очистить" onClick={() => onChange?.('')}><Icon name="cross" size={20} /></button>}
        {send && <IconButton className="y-input-bar__send" icon="arrow-up" label={send.label} variant={value ? 'primary' : 'tertiary'} size="S" onClick={send.onClick} disabled={!value} />}
      </label>
      {trailing && <SideButton action={trailing} size={size} />}
    </div>
  );
}
