---
'yeet-design-system': patch
---

Удалён неиспользуемый токен `sheet-radius-bottom` (`--sheet-radius-bottom`, iOS `YeetComponent.sheetRadiusBottom`, Android `sheetRadiusBottom`): после #121 все 4 угла шторки и диалога — `--radius-overlay` (48), ссылок на токен в web и нативе не осталось. Если он где-то нужен снаружи — замена `radius.bar` / `--radius-bar` (то же значение 48).
