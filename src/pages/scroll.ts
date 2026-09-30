import { useEffect, useRef } from 'react';

/** Порог сворачивания шапки и фото деталей (Screen: 24 pt) + 1: состояние Figma «Scrolled». */
export const SCROLLED = 25;

/**
 * Прокрутка списков корневых вкладок для состояний «Scrolled» (#170): большой заголовок и сегмент уехали,
 * ряд фильтров прилип под статус-бар.
 */
export const SCROLLED_LIST = 300;

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
