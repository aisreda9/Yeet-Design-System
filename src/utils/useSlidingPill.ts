import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

/**
 * Пилюля выбранного пункта, которая переезжает между пунктами (сегмент, таб-бар).
 * Меряет активный элемент `[data-pill-item]` внутри контейнера и двигает к нему `transform` + `width`.
 * Первый замер — без анимации, дальше переход `--motion-nav` (пружина quick).
 */
export function useSlidingPill<T extends HTMLElement>(index: number) {
  const ref = useRef<T>(null);
  const [style, setStyle] = useState<CSSProperties>({ opacity: 0 });
  const ready = useRef(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      const item = el.querySelectorAll<HTMLElement>(':scope > [data-pill-item]')[index];
      if (!item) return setStyle({ opacity: 0 });
      setStyle({
        width: item.offsetWidth,
        height: item.offsetHeight,
        transform: `translate(${item.offsetLeft}px, ${item.offsetTop}px)`,
        transition: ready.current ? undefined : 'none',
      });
      if (!ready.current && !frame) frame = requestAnimationFrame(() => (ready.current = true));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => { ro.disconnect(); cancelAnimationFrame(frame); };
  }, [index]);
  return [ref, style] as const;
}
