import type { Ref } from 'react';

/** Передать узел в `ref` потребителя рядом со своим: `ref={(n) => { own.current = n; setRef(ref, n); }}`. */
export function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}
