import { createContext, useEffect, useReducer, useRef, type ReactNode } from 'react';
import { FRAME_SLACK_MS } from '../motion/timing';
import { motionMs } from './gesture';

/**
 * Уход со сцены: когда родитель убирает элемент (`overlay` → undefined), он ещё `--motion-exit` остаётся в DOM
 * с флагом `leaving`, чтобы CSS доиграл исчезновение. Если во время ухода элемент вернули — уход прерывается
 * и идёт обратно из текущего положения (переходы на transition, а не на keyframes).
 */
/* eslint-disable react-hooks/refs -- ref намеренно хранит последний показанный узел между рендерами: пока элемент уходит,
   рендерится он, а не undefined. Через state это лишний рендер на каждое обновление родителя. */
export function usePresence(node: ReactNode, token = '--motion-exit') {
  const last = useRef<ReactNode>(node);
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const present = !!node;
  if (present) last.current = node;
  useEffect(() => {
    if (present || !last.current) return;
    // запас на кадр; transitionend не ждём — его не будет, если элемент уже в конечном положении (закрыт жестом)
    const t = window.setTimeout(() => { last.current = undefined; rerender(); }, motionMs(token) + FRAME_SLACK_MS);
    return () => window.clearTimeout(t);
  }, [present, token]);
  return { node: present ? node : last.current, leaving: !present && !!last.current } as const;
}
/* eslint-enable react-hooks/refs */

/** Слой уходит (Screen → overlay / floating убраны): Overlay и Snackbar доигрывают исчезновение. */
export const LeavingContext = createContext(false);
