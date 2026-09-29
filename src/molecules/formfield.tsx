import { cloneElement, isValidElement, useId, type ComponentPropsWithRef, type ReactElement, type ReactNode } from 'react';
import { cx } from '../utils/cx';

/* ─── FormField ─────────────────────────────────────────────────────── */

/** Что FormField передаёт полю: связь с лейблом, описанием и ошибкой. */
export type FormFieldControlProps = {
  id: string;
  'aria-labelledby': string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
};

export type FormFieldProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** Видимый лейбл над полем. Он же имя поля для скринридера (`aria-labelledby` сильнее `aria-label` у `Field`). */
  label: ReactNode;
  /** Лейбл только для скринридера — когда плейсхолдер в `Field` уже говорит, что вводить (вход, поиск). */
  hideLabel?: boolean;
  /** Подсказка под полем: «Мы пришлём код на эту почту». Связана через `aria-describedby`. */
  description?: ReactNode;
  /** Текст ошибки: поле получает `aria-invalid`, текст — `aria-describedby` и озвучивается при появлении. */
  error?: ReactNode;
  /** Обязательное поле: `aria-required` у поля. */
  required?: boolean;
  /** `id` поля. По умолчанию — сгенерированный. */
  controlId?: string;
  /**
   * Поле: элемент (получит пропсы через `cloneElement`) или функция — когда пропсы нужно положить глубже,
   * например в `Field input={…}`.
   */
  children: ReactElement<Partial<FormFieldControlProps>> | ((control: FormFieldControlProps) => ReactNode);
};

/**
 * Обёртка поля формы: лейбл, описание и текст ошибки, связанные с полем по `id` / `aria-describedby`.
 * Сама не рисует поле: внутри — `Field` в `InputGroup`, `InputBar`, `textarea` и т. п.
 *
 * ```tsx
 * <FormField label="Почта" description="Пришлём код для входа" error={bad && 'Проверьте адрес'}>
 *   {(control) => <InputGroup><Field label="Почта" error={bad} input={{ ...control, type: 'email' }} /></InputGroup>}
 * </FormField>
 * ```
 * **Контексты:** вход и регистрация (почта, пароль с ошибкой), профиль (имя), новая вещь (название, цена).
 */
export function FormField({ label, hideLabel, description, error, required, controlId, children, className, ...rest }: FormFieldProps) {
  const auto = useId();
  const id = controlId ?? `${auto}-control`;
  const labelId = `${auto}-label`, descId = `${auto}-description`, errorId = `${auto}-error`;
  const hasError = error != null && error !== false && error !== '';
  const describedBy = [description ? descId : undefined, hasError ? errorId : undefined].filter(Boolean).join(' ') || undefined;
  const control: FormFieldControlProps = {
    id,
    'aria-labelledby': labelId,
    'aria-describedby': describedBy,
    'aria-invalid': hasError ? true : undefined,
    'aria-required': required ? true : undefined,
  };
  return (
    <div className={cx('y-form-field', hasError && 'y-form-field--error', className)} {...rest}>
      <label id={labelId} htmlFor={id} className={cx('y-form-field__label', 'y-caption', hideLabel && 'y-visually-hidden')}>
        {label}
      </label>
      {typeof children === 'function' ? children(control) : isValidElement(children) ? cloneElement(children, control) : children}
      {description && <p id={descId} className="y-form-field__description y-caption">{description}</p>}
      {/* live-регион живёт всё время: ошибка, появившаяся после отправки, озвучивается */}
      <p id={errorId} className="y-form-field__error y-caption" aria-live="polite">
        {hasError ? error : null}
      </p>
    </div>
  );
}
