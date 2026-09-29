import { useCallback, useLayoutEffect, useRef, useState } from 'react';

export type ControllableStateProps<T> = {
  /** Значение снаружи (controlled). `undefined` — компонент хранит значение сам (uncontrolled). */
  value?: T;
  /** Начальное значение для uncontrolled-режима. */
  defaultValue: T;
  /** Вызывается при каждом изменении — в обоих режимах. */
  onChange?: (value: T) => void;
};

/**
 * Состояние, которое можно отдать наружу: если передан `value` — компонент controlled и только сообщает об изменениях
 * через `onChange`; если нет — хранит значение сам, начиная с `defaultValue`, и тоже сообщает.
 * Переключаться между режимами на лету нельзя (как у `<input>`): режим фиксируется на первом рендере.
 *
 * ```tsx
 * const [tab, setTab] = useControllableState({ value, defaultValue: 'items', onChange });
 * ```
 */
export function useControllableState<T>({ value, defaultValue, onChange }: ControllableStateProps<T>) {
  const [controlled] = useState(value !== undefined);
  const [inner, setInner] = useState(defaultValue);
  const current = controlled ? (value as T) : inner;
  // свежие значения без пересоздания setter: его можно отдавать в зависимости эффектов
  const latest = useRef({ current, onChange });
  useLayoutEffect(() => {
    latest.current = { current, onChange };
  });
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = latest.current.current;
      const v = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;
      if (Object.is(v, prev)) return;
      if (!controlled) setInner(v);
      latest.current.current = v; // два вызова подряд в одном обработчике видят друг друга
      latest.current.onChange?.(v);
    },
    [controlled],
  );
  return [current, set] as const;
}
