---
'yeet-design-system': minor
---

Токены и жесты (#237): компонентные токены `component.outfit-pager-end` (−3, `--outfit-pager-end`) и `outfit-pager-end-tab-bar` (5) — низ стопки образов без таб-бара и над ним; `motion.gesture.autoscroll-edge` (64) и `autoscroll-speed` (12 px/кадр) — автоскролл при перестановке вещей (`useGridReorder`). Генераторы Swift и Kotlin выводят компонентные размеры без ссылки. `OutfitPager`: тап по превью соседнего образа листает к нему (сдвиг меньше `--gesture-touch-slop`); штамп и «Не нравится» на низких экранах — не меньше 75 % (на 320 подпись читается). Демо `Motion.PhotoCollapse` показывает сам `DetailsScreen`; внутренний хук `usePhotoCollapse` и классы `.y-collapse*` удалены.
