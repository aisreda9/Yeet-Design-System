import type { InputHTMLAttributes, ReactNode } from 'react';
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
  /** Иконка справа: `chevron-up-down` — выбор, `eye` — пароль, `external-link` — ссылка. */
  trailingIcon?: IconName;
  onTrailingClick?: () => void;
  /** Поле ввода вместо статичного лейбла. */
  input?: InputHTMLAttributes<HTMLInputElement>;
  error?: boolean;
  onClick?: () => void;
};

/**
 * Строка поля (Figma: `input` + `input-value`). Живёт внутри `InputGroup`.
 * Три паттерна: ввод текста, «ключ — значение» с выбором в sheet, пароль с глазом.
 */
export function Field({ label, value, colorDot, trailingIcon, onTrailingClick, input, error, onClick }: FieldProps) {
  return (
    <div className={cx('y-field', error && 'y-field--error')} onClick={onClick} role={onClick ? 'button' : undefined}>
      <div className="y-field__main">
        {input ? (
          <input className="y-field__input" placeholder={label} aria-label={label} aria-invalid={error || undefined} {...input} />
        ) : (
          <span className="y-field__label">{label}</span>
        )}
        {value && (
          <span className="y-field__value">
            {colorDot && <ColorDot color={colorDot} size={16} />}
            {value}
          </span>
        )}
      </div>
      {trailingIcon && (
        <button type="button" className="y-field__trailing" onClick={onTrailingClick} tabIndex={onTrailingClick ? 0 : -1} aria-hidden={!onTrailingClick}>
          <Icon name={trailingIcon} size={trailingIcon === 'chevron-up-down' ? 20 : 24} />
        </button>
      )}
    </div>
  );
}

/* ─── InputGroup ────────────────────────────────────────────────────── */

/** Группа полей на `--input-bg`, радиус 20, строки разделены линией. Вход, детали вещи, настройки. */
export function InputGroup({ size = 'XL', children }: { size?: 'M' | 'L' | 'XL'; children: ReactNode }) {
  return <div className={cx('y-input-group', `y-input-group--${size}`)}>{children}</div>;
}

/* ─── InputBar ──────────────────────────────────────────────────────── */

type BarAction = { icon: IconName; label: string; variant?: ButtonStyle; onClick?: () => void };

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
 * **Контексты:** поиск («Назад» + поле + поиск по фото), чат со стилистом (поле + «Отправить» Primary), поиск по гардеробу.
 */
export function InputBar({ placeholder, value, onChange, fieldIcon, leading, trailing, send, size = 'M' }: InputBarProps) {
  return (
    <div className={cx('y-input-bar', send && 'y-input-bar--chat', size === 'L' && 'y-input-bar--l')}>
      {leading && <IconButton icon={leading.icon} label={leading.label} variant={leading.variant ?? 'tertiary'} size={size === 'L' ? 'L' : 'M'} onClick={leading.onClick} />}
      <label className="y-input-bar__field">
        {fieldIcon && <Icon name={fieldIcon} />}
        <input className="y-field__input" placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} readOnly={!onChange} />
        {/* флоу Search / Text / Results: очистка «×» 20 серым, пока в поле есть текст */}
        {value && !send && <button type="button" className="y-input-bar__clear" aria-label="Очистить" onClick={() => onChange?.('')}><Icon name="cross" size={20} /></button>}
        {send && <IconButton className="y-input-bar__send" icon="arrow-up" label={send.label} variant={value ? 'primary' : 'tertiary'} size="S" onClick={send.onClick} disabled={!value} />}
      </label>
      {trailing && <IconButton icon={trailing.icon} label={trailing.label} variant={trailing.variant ?? 'tertiary'} size={size === 'L' ? 'L' : 'M'} onClick={trailing.onClick} />}
    </div>
  );
}
