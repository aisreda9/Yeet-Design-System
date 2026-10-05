---
"yeet-design-system": minor
---

Хаптика: в Android 5 событий (`select`, `toggle`, `threshold`, `stamp`, `skip`), в iOS 6 — те же и `error` (поле ввода с ошибкой, `YeetField`); `lift`, `drop`, `target`, `delete`, `success` — только веб, `error` — веб и iOS (решение владельца: оставить работающие, #130). В `tokens.json` — `$extensions["com.yeet"].platforms`, нативные поля только у своих платформ; в Swift / Kotlin лишние события не генерируются. Миграция: в нативе эти события не вызывались — менять нечего; `YeetHapticEvent.Lift`, `.Drop`, `.Target`, `.Delete`, `.Success`, `.Error` и `YeetHaptic.lift` и т. п. (Android), `YeetHaptic.lift()`, `.drop()`, `.target()`, `.delete()`, `.success()` (iOS) удалены.
