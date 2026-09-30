import { useState, type ComponentPropsWithRef, type InputHTMLAttributes, type KeyboardEvent, type TextareaHTMLAttributes } from 'react';
import { ColorDot, Icon, IconButton, type ButtonStyle } from '../atoms';
import type { IconName } from '../icons/icons';
import type { ItemColor } from '../tokens/tokens';
import { cx } from '../utils/cx';

/* ─── Field ─────────────────────────────────────────────────────────── */

export type FieldProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'onClick' | 'defaultValue'> & {
  /** Лейбл слева (grey). В режиме ввода — плейсхолдер. */
  label: string;
  /** Выбранное значение справа (режим «ключ — значение»). */
  value?: string;
  /** Свотч цвета вещи перед значением. */
  colorDot?: ItemColor;
  /** Иконка справа: `chevron-up-down` — выбор (24, как в строках-селекторах DS 0.2), `eye` / `eye-off` — пароль, `external-link` — ссылка (20). */
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
export function Field({ label, value, colorDot, trailingIcon, onTrailingClick, trailingLabel, input, multiline, error, onClick, className, onKeyDown: onKeyDownProp, ...rest }: FieldProps) {
  const [shown, setShown] = useState(false);
  // Раскрывашка ⇕ в строке-селекторе — 24 (DS 0.2 new-item 1174:19818: стрелки 8 × 5 через 2, правый край — на поле 20); остальные иконки — 20
  const trailingSize = trailingIcon === 'chevron-up-down' ? 24 : 20;
  if (multiline)
    return (
      <div className={cx('y-field', 'y-field--multiline', error && 'y-field--error', className)} {...rest}>
        <textarea className="y-field__input" placeholder={label} aria-label={label} aria-invalid={error || undefined} rows={4} {...multiline} />
      </div>
    );
  // Пароль: свой переключатель, если потребитель не повесил на иконку свой обработчик
  const password = input?.type === 'password' && !onTrailingClick;
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDownProp?.(e);
    if (!onClick || e.defaultPrevented || e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    onClick();
  };
  return (
    <div className={cx('y-field', error && 'y-field--error', className)} onClick={onClick} onKeyDown={onKeyDown} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} {...rest}>
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
        <button type="button" className={cx('y-field__trailing', trailingSize === 24 && 'y-field__trailing--24')} aria-label={trailingLabel ?? label} onClick={(e) => { e.stopPropagation(); onTrailingClick(); }}>
          <Icon name={trailingIcon} size={trailingSize} />
        </button>
      ) : trailingIcon ? (
        <span className="y-field__trailing" aria-hidden>
          <Icon name={trailingIcon} size={trailingSize} />
        </span>
      ) : null}
    </div>
  );
}

/* ─── InputGroup ────────────────────────────────────────────────────── */

/** Группа полей на `--input-bg`, радиус 20, строки разделены линией. Вход, детали вещи, настройки. */
export type InputGroupProps = ComponentPropsWithRef<'div'> & { size?: 'M' | 'L' | 'XL' };

export function InputGroup({ size = 'XL', className, ...rest }: InputGroupProps) {
  return <div className={cx('y-input-group', `y-input-group--${size}`, className)} {...rest} />;
}

/* ─── InputBar ──────────────────────────────────────────────────────── */

/** Кнопка сбоку `InputBar`: иконка или превью фото. */
export type InputBarAction = {
  icon: IconName;
  label: string;
  variant?: ButtonStyle;
  onClick?: () => void;
  /** Превью фото вместо иконки: круг 48 с картинкой (Figma: input-bar · Right=Photo) — поиск по фото, фото уже выбрано. */
  image?: string;
};

/** Кнопка сбоку поля: круглая иконка или превью фото. */
function SideButton({ action, size }: { action: InputBarAction; size: 'M' | 'L' }) {
  if (action.image)
    return (
      <button type="button" className={cx('y-input-bar__photo', size === 'L' && 'y-input-bar__photo--l')} aria-label={action.label} title={action.label} onClick={action.onClick}>
        <img src={action.image} alt="" />
      </button>
    );
  return <IconButton icon={action.icon} label={action.label} variant={action.variant ?? 'tertiary'} size={size} onClick={action.onClick} />;
}

export type InputBarProps = Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'defaultValue' | 'children'> & {
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  /** Иконка внутри поля. Для поиска — `search`, для чата — нет. */
  fieldIcon?: IconName;
  leading?: InputBarAction;
  trailing?: InputBarAction;
  /** Чат со стилистом: кнопка отправки 44 (иконка 24) внутри поля (primary, когда есть текст), поле 52 на подложке с тенью. */
  send?: { label: string; onClick?: () => void };
  /** L — 52 (поле поиска на экране), по умолчанию 48 (в шапке). */
  size?: 'M' | 'L';
  /** Состояние фокуса без фокуса (экраны флоу «Query Focused»): обводка акцентом и каретка в начале пустого поля. */
  focused?: boolean;
};

/**
 * Панель ввода: [кнопка] поле [кнопка].
 * В фокусе поле обводится акцентом 1.5 (Figma: input-bar · State=Focus), каретка — акцентная.
 * **Контексты:** поиск («Назад» + поле + поиск по фото; после выбора фото справа — его превью 48), чат со стилистом (поле + «Отправить» Primary), поиск по гардеробу.
 */
export function InputBar({ placeholder, value, onChange, fieldIcon, leading, trailing, send, size = 'M', focused, className, ...rest }: InputBarProps) {
  return (
    <div className={cx('y-input-bar', send && 'y-input-bar--chat', size === 'L' && 'y-input-bar--l', focused && 'is-focused', className)} {...rest}>
      {leading && <SideButton action={leading} size={size} />}
      <label className="y-input-bar__field">
        {fieldIcon && <Icon name={fieldIcon} />}
        {focused && !value && <span className="y-input-bar__caret" aria-hidden />}
        <input className="y-field__input" placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} readOnly={!onChange} />
        {/* флоу Search / Text / Results: очистка «×» 20 серым, пока в поле есть текст */}
        {value && !send && <button type="button" className="y-input-bar__clear" aria-label="Очистить" onClick={() => onChange?.('')}><Icon name="cross" size={20} /></button>}
        {send && <IconButton className="y-input-bar__send" icon="arrow-up" label={send.label} variant={value ? 'primary' : 'tertiary'} size="S" iconSize={24} onClick={send.onClick} disabled={!value} />}
      </label>
      {trailing && <SideButton action={trailing} size={size} />}
    </div>
  );
}
