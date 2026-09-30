import { type RefObject, useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/** Ближайший предок, который прокручивается по горизонтали. */
function scrollerOf(el: HTMLElement, root: HTMLElement): HTMLElement | null {
  for (let n: HTMLElement | null = el.parentElement; n; n = n.parentElement) {
    if (n.scrollWidth > n.clientWidth && getComputedStyle(n).overflowX !== 'visible') return n;
    if (n === root) break;
  }
  return null;
}

/**
 * Лента следует за активным элементом (Figma Animations `798:2215 → 798:2274 → 799:2433`, `--motion-page`):
 * при смене `index` горизонтальная лента внутри `ref` прокручивается так, чтобы активный элемент (`selector`) встал по центру.
 * Прокрутка только по горизонтали — экран по вертикали не двигается. Первый показ — сразу, дальше — плавно;
 * при «Уменьшении движения» — всегда сразу. `selector` получает индекс: `(i) => '[aria-pressed="true"]'` или `> :nth-child(i + 1)`.
 */
export function useScrollToActive(
  ref: RefObject<HTMLElement | null>,
  selector: (index: number) => string,
  index: number,
) {
  const reduced = useReducedMotion();
  const first = useRef(true);
  useEffect(() => {
    const root = ref.current;
    const el = root?.querySelector<HTMLElement>(selector(index));
    if (!root || !el) return;
    const scroller = scrollerOf(el, root);
    if (!scroller) return;
    const box = scroller.getBoundingClientRect(),
      r = el.getBoundingClientRect();
    const left = scroller.scrollLeft + (r.left - box.left) - (box.width - r.width) / 2;
    scroller.scrollTo({ left, behavior: first.current || reduced ? 'auto' : 'smooth' });
    first.current = false;
    // selector — чистая функция от индекса, в зависимостях не нужна
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, reduced, ref]);
}
