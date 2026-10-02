---
'yeet-design-system': minor
---

Заглушка иллюстраций (#228, решение владельца #220): новый атом `ArtPlaceholder` (`size`, `width` / `height`, `stretch`) — фон `--color-bg-subtle`, иконка-картинка по центру, скругление `--art-placeholder-radius` (по умолчанию `--card-radius`), скринридер её не озвучивает. Стоит вместо рисунков на экране приветствия, в плитках фото (`PhotoTile`, новый проп `illustration` — вернуть 3D-рисунок точечно), в карточке «Для поездок» у стилиста и во всех пустых состояниях: у `EmptyState` новый проп `art` (по умолчанию `true`, заглушка 120 над заголовком, тексты макета не сдвигает). Вернуть рисунки везде — `SHOW_ILLUSTRATIONS` в `src/utils/illustrations.ts`. Playground: `Header` Large с «⋮».
