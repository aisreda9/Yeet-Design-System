---
"yeet-design-system": minor
---

Хаптика: в iOS и Android 5 событий (`select`, `toggle`, `threshold`, `stamp`, `skip`); `lift`, `drop`, `target`, `delete`, `success`, `error` — только веб (решение владельца, #130). В `tokens.json` у них `$extensions["com.yeet"].platforms: ["web"]` и нет нативных полей, в Swift / Kotlin они не генерируются. Миграция: в нативе эти события не вызывались — менять нечего; `YeetHapticEvent.Lift` и т. п. и `YeetHaptic.lift()` / `YeetHaptic.lift` и т. п. удалены. Единственный нативный вызов — `YeetHaptic.error()` в iOS `YeetField` при ошибке — убран: как в вебе и на Android, поле с ошибкой не вибрирует.
