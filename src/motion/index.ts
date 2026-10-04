/** Модуль движения: метаданные анимаций (motion.ts) и хуки жестов для организмов и экранов. */
export { curves, sample, motions, mechanics, type Curve, type MotionSpec, type Mechanic } from './motion';
export { useSwipePager, type SwipePager, type SwipePagerOptions } from './usePager';
export { useReducedMotion } from './useReducedMotion';
export { useScrollToActive } from './useScrollToActive';
export { useGridReorder, type GridReorder, type GridReorderOptions } from './useGridReorder';
export { FRAME_SLACK_MS, LONG_PRESS_CLICK_GUARD_MS } from './timing';
