---
'yeet-design-system': minor
---

Организмы: `ref`, `className` и атрибуты корня у всех (кроме Sheet / Dialog / Overlay / AccountsSheet — следующим PR), экспорт типов `*Props`; `StatusBar tone` (`onAccent` / `onPhoto` — устарели), `Header variant` (`type` — устарел). Стили — одной точкой входа `src/styles.css` с каскадными слоями `yeet.tokens < yeet.atoms < yeet.molecules < yeet.organisms < yeet.templates`: CSS приложения вне слоёв перебивает систему без `!important`.
