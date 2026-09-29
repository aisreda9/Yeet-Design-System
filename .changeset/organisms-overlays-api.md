---
'yeet-design-system': minor
---

Sheet, Dialog, Overlay, AccountsSheet: `ref`, `className` и атрибуты корня; `Sheet variant` (`type` — устарел), `Dialog variant` (`tone` — устарел). Модальная область фокуса вынесена в общий примитив `useFocusScope` (`src/utils`): фокус внутрь, `inert` фона, Tab по кругу, возврат фокуса.
