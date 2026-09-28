import tokens from '../../tokens/tokens.json';

/**
 * Числа жестов из tokens.json → motion.gesture (тот же источник, что `--gesture-*` в CSS и YeetGesture в нативе).
 * В JS нужны там, где решение принимает код: порог свайпа, скорость броска, сопротивление.
 */
const g = tokens.motion.gesture;
export const gesture = {
  /** Сдвиг пальца, после которого нажатие отменяется и начинается жест, px. */
  slop: g['touch-slop'].value,
  /** Долгое нажатие до подъёма, мс. */
  longPress: g['long-press'].value,
  /** Доля размера: свайп дальше — перелистывание / закрытие. */
  swipeDistance: g['swipe-distance'].value,
  /** Бросок быстрее — засчитан при любой дистанции, px/мс (500 px/с). */
  swipeVelocity: g['swipe-velocity'].value / 1000,
  /** Сопротивление за границей. */
  rubberBand: g['rubber-band'].value,
  /** Показ snackbar без действия / с действием, мс. */
  snackbar: g.snackbar.value,
  snackbarAction: 6000,
} as const;

/**
 * Резинка за границей (как UIScrollView): чем дальше тянешь, тем меньше отдаёт.
 * `offset` — сколько палец прошёл за границу, `size` — размер объекта по оси. Результат всегда < size.
 */
export function rubberBand(offset: number, size: number, c = gesture.rubberBand) {
  const sign = Math.sign(offset), x = Math.abs(offset);
  return sign * (1 - 1 / ((x * c) / size + 1)) * size;
}

/**
 * Скорость пальца по последним ~80 мс, px/мс. Средняя по всему жесту врёт: палец мог долго стоять,
 * а потом резко бросить — бросок должен засчитаться.
 */
export function velocityTracker() {
  let samples: { t: number; x: number; y: number }[] = [];
  return {
    reset() { samples = []; },
    add(x: number, y: number, t: number) {
      samples.push({ t, x, y });
      while (samples.length > 2 && t - samples[0].t > 80) samples.shift();
    },
    get() {
      if (samples.length < 2) return { x: 0, y: 0 };
      const a = samples[0], b = samples[samples.length - 1], dt = Math.max(1, b.t - a.t);
      return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt };
    },
  };
}

/**
 * Длительность токена движения в мс из CSS (`--motion-exit` → 150, при «Уменьшении движения» → 1).
 * Нужна таймерам, которые ждут конца перехода: берём число из токена, а не пишем 150 руками.
 */
export function motionMs(token: string, fallback = 150) {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const n = parseFloat(v);
  if (Number.isNaN(n)) return fallback;
  return /^[\d.]+s\b/.test(v) ? n * 1000 : n;
}

/** Системная настройка «Уменьшение движения». */
export const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
