import { tokens } from '../tokens/model';

/** События хаптики из tokens.json → motion.haptic (iOS / Android — см. таблицу «Хаптика»). */
export type HapticEvent = keyof typeof tokens.motion.haptic;

/** Длина импульса для демо в вебе (Android Chrome), мс: сила по смыслу, как в нативе. */
const pulse: Record<HapticEvent, number | number[]> = {
  select: 5, toggle: 8, lift: 15, target: 5, drop: 10, threshold: 12, stamp: [10, 40, 18], skip: 8, delete: [18, 50, 18], error: [20, 40, 20, 40, 20], success: [10, 40, 18],
};

/** Тикающие события: на каждом шаге слайдера / каждой новой цели при перетаскивании — их и прореживаем (как `YeetHaptics` на Android). */
const ticks: ReadonlySet<HapticEvent> = new Set<HapticEvent>(['select', 'target']);
let last = 0;

/**
 * Хаптика события. В продукте — нативная (`YeetHaptic.<событие>`); в вебе — короткий `navigator.vibrate`
 * и событие `yeet:haptic` на window: его слушают демо в Storybook, чтобы показать, что и когда вибрирует.
 * `select` и `target` — не чаще 1 раза в 50 мс (tokens.json → motion.haptic.select), иначе слайдер и перетаскивание
 * сливаются в дребезг. Остальные события редкие и значимые (штамп, бросок, порог) — не глушатся.
 */
export function haptic(event: HapticEvent) {
  if (typeof window === 'undefined') return;
  if (ticks.has(event)) {
    const now = performance.now();
    if (now - last < 50) return;
    last = now;
  }
  window.dispatchEvent(new CustomEvent('yeet:haptic', { detail: event }));
  // вибрация разрешена только после касания пользователя — иначе браузер её молча блокирует
  try { if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(pulse[event]); } catch { /* нет вибромотора */ }
}
