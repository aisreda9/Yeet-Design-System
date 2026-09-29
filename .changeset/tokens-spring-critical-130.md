---
'yeet-design-system': minor
---

Пружина шторки без перелёта (#130): `motion.spring.critical` (k 300, c 2·√300 ≈ 34.641, ζ = 1, 540 мс) → `--spring-critical`, `--spring-critical-duration`, `YeetSpring.critical`, `YeetSpring.criticalDampingRatio` / `criticalStiffness`; переход `motion.transition.sheet` → `--motion-sheet`, `YeetMotion.sheet` (Swift и Kotlin), `YeetMotionScheme.sheet()`. Генератор `linear()` считает критическое и передемпфированное затухание. Натив: шторка iOS и Android — на `YeetMotion.sheet`; Android при «Уменьшении движения» — растворение `fade` 240 мс вместо мгновенного появления.
