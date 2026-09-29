import { useEffect, useState } from 'react';

const query = '(prefers-reduced-motion: reduce)';

/**
 * Системная настройка «Уменьшение движения», живая: меняется без перезагрузки.
 * Длительности `--motion-*` при ней уже 1 мс (токены), хук нужен там, где решение принимает код:
 * не вести морф за скроллом, не прыгать, а переключать состояние сразу.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches);
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia(query);
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}
