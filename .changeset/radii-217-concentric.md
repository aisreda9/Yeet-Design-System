---
'yeet-design-system': minor
---

Концентрические скругления (#217): `radius.overlay` 48 → 40 (`--radius-overlay`, `YeetRadius.overlay`) — модальная шторка и диалог стоят в 16 от краёв и низа экрана (было 8), при 393 шторка 361, контент 321; натив (iOS `YeetOverlayToken.inset`, Android `OverlayInset`) — тоже 16. Плашка цены коллажа `.y-collage__footer` — радиус 12 (`--radius-sm`, было 16). `PhotoTile`: поля 20 / 12, содержимое по центру — квадрат ~157 в шторке 321 вмещает арт и подпись, в 173 арт по-прежнему на 28. Новый компонентный токен `component.header-compact-weight` (`$type: fontWeight`, 600): генератор поддерживает `fontWeight` в CSS (`--header-compact-weight`), Swift (`CGFloat`) и Kotlin (`FontWeight(600)`). QA: предупреждение «концентричность» в `npm run qa`.
