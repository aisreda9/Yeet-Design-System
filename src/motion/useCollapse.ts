import { useEffect, useRef, useState, type RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Геометрия морфа для экранов (393 × 852), по кадру «Wardrobe / Outfit Details / Scrolled» `349:10430`:
 * миниатюра 48 × 48 в (173, 70) — по центру строки кнопок шапки 48; панель деталей под шапкой — y 138 (70 + 48 + 20).
 * Развёрнутое фото 353 стоит на том же отступе под шапкой (как в Figma Animations «new things» `354:17405`), панель — под фото + 20.
 * Кадр Animations `354:17449` — черновик с миниатюрой 52 и кнопками 52; на экранах DS 2.0 — 48 (`349:10424`, `503:1392`).
 * Масштаб 48 / 353 ≈ 0.136.
 */
export const photoCollapse = {
  photo: 353,
  thumb: 48,
  scale: 48 / 353,
  from: { x: 20, y: 138 },
  to: { x: 173, y: 70 },
  panelFrom: 138 + 353 + 20,
  panelTo: 138,
  figma: '349:10430 (экран, Scrolled) · Animations 354:17405 → 354:17449',
} as const;

export type PhotoCollapseOptions = {
  /** После скольких px скролла фото сворачивается целиком (состояние Figma), px. По умолчанию 24 — как у шапки (ADR 0004). */
  threshold?: number;
  /** Ниже скольких px скролла свёрнутое фото разворачивается обратно, px. По умолчанию 8 — гистерезис 24 / 8, как у шапки `Screen` (ADR 0004). */
  release?: number;
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
 * - `collapsed` — дискретное состояние: включается при скролле > `threshold` (24), снимается только при ≤ `release` (8) —
 *   гистерезис ADR 0004, чтобы на границе состояние не дребезжало; на нём держится переход CSS `--motion-collapse`
 *   (300 мс ease-out; при «Уменьшении движения» токен = 1 мс);
 * - CSS-переменная `--collapse` 0…1 на `target` — прогресс за скроллом для морфа 1 : 1, без ре-рендера React.
 *   При `prefers-reduced-motion` прогресс не ведётся за пальцем: сразу 0 или 1.
 */
export function usePhotoCollapse(scrollRef: RefObject<HTMLElement | null>, { threshold = 24, release = 8, distance = threshold, target }: PhotoCollapseOptions = {}): PhotoCollapse {
  const [collapsed, setCollapsed] = useState(false);
  const reduced = useReducedMotion();
  // прошлое состояние для гистерезиса — читается в обработчике скролла без пересоздания подписки
  const done = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = el.scrollTop;
      // гистерезис 24 / 8 (ADR 0004): свернуть после threshold, развернуть только ниже release
      done.current = done.current ? y > release : y > threshold;
      const p = reduced ? (done.current ? 1 : 0) : Math.min(1, Math.max(0, y / Math.max(1, distance)));
      (target?.current ?? el).style.setProperty('--collapse', String(p));
      setCollapsed(done.current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [scrollRef, target, threshold, release, distance, reduced]);

  return { collapsed, reduced };
}
