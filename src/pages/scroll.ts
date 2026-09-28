import { useEffect, useRef } from 'react';

/** Порог сворачивания шапки и фото деталей (Screen: 24 pt) + 1: состояние Figma «Scrolled». */
export const SCROLLED = 25;

/**
 * Скролл-контейнер экрана, прокрученный при открытии истории: для состояний Figma «Scrolled».
 * `<Screen scrollRef={useScrolled()}>` / `<DetailsScreen scrollRef={useScrolled()}>`.
 */
export function useScrolled(y = SCROLLED) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = y;
  }, [y]);
  return ref;
}
