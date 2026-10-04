---
'yeet-design-system': minor
---

Режим повышенного контраста (#117): токены `modes["contrast-light" | "contrast-dark"]` для `text-secondary`, `text-accent`, `text-danger`, `text-inverse-secondary`, `accent`, `border-subtle`, `divider` и `focus-ring.width` (текст на поверхностях ≥ 7 : 1, линии ≥ 3 : 1, фокус 3 px). Web — `@media (prefers-contrast: more)` и рамки системными цветами в `forced-colors: active`; iOS — `YeetColor` переключается по Increase Contrast, `YeetFocusRing.width(_:)`; Android — `YeetLightContrastColors` / `YeetDarkContrastColors`, `YeetTheme(highContrast)` (системная контрастность Android 14+), `YeetTheme.isHighContrast`. Обычный вид не меняется.
