import { useEffect, useState, type RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Геометрия морфа из Figma Animations «new things» `354:17405 → 354:17449` (экран 393 × 852):
 * фото 353 × 353 в (20, 150) сворачивается в миниатюру 52 × 52 в (171, 78) — по центру строки кнопок шапки;
 * панель деталей поднимается 523 → 150 (под шапку + 20). Масштаб 52 / 353 ≈ 0.147.
 */
export const photoCollapse = {
  photo: 353,
  thumb: 52,
  scale: 52 / 353,
  from: { x: 20, y: 150 },
  to: { x: 171, y: 78 },
  panelFrom: 523,
  panelTo: 150,
  figma: '354:17405 → 354:17449',
} as const;

export type PhotoCollapseOptions = {
  /** После скольких px скролла фото сворачивается целиком (состояние Figma), px. По умолчанию 24 — как у шапки. */
  threshold?: number;
  /**
   * Путь скролла, на котором `progress` идёт 0 → 1 (для морфа за пальцем), px.
   * По умолчанию равен `threshold`: морф щёлкает на пороге, остальное доводит переход `--motion-collapse`.
   */
  distance?: number;
  /** Куда писать CSS-переменную `--collapse` (0…1). По умолчанию — сам скролл-контейнер. */
  target?: RefObject<HTMLElement | null>;
};

export type PhotoCollapse = {
  /** Фото свёрнуто в миниатюру: класс `is-collapsed`, переход на `--motion-collapse`. */
  collapsed: boolean;
  /** «Уменьшение движения» включено: `--collapse` не следует за скроллом, только 0 или 1. */
  reduced: boolean;
};

/**
 * Сворачивание фото деталей в миниатюру шапки при скролле (Figma «new things»).
 *
 * Два слоя, можно взять любой:
 * - `collapsed` — дискретное состояние (скролл > `threshold`), на нём держится переход CSS `--motion-collapse`
 *   (300 мс ease-out; при «Уменьшении движения» токен = 1 мс);
 * - CSS-переменная `--collapse` 0…1 на `target` — прогресс за скроллом для морфа 1 : 1, без ре-рендера React.
 *   При `prefers-reduced-motion` прогресс не ведётся за пальцем: сразу 0 или 1.
 */
export function usePhotoCollapse(scrollRef: RefObject<HTMLElement | null>, { threshold = 24, distance = threshold, target }: PhotoCollapseOptions = {}): PhotoCollapse {
  const [collapsed, setCollapsed] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = el.scrollTop;
      const done = y > threshold;
      const p = reduced ? (done ? 1 : 0) : Math.min(1, Math.max(0, y / Math.max(1, distance)));
      (target?.current ?? el).style.setProperty('--collapse', String(p));
      setCollapsed(done);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [scrollRef, target, threshold, distance, reduced]);

  return { collapsed, reduced };
}
