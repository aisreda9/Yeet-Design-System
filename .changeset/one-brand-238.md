---
'yeet-design-system': major
---

Один бренд — синий (решение владельца, ADR 0002 отменена): бренд-палитры удалены целиком. CSS больше не содержит блоков `[data-brand='lime' | 'butter' | 'cherry' | 'sage' | 'lilac']` (140 переопределений `--color-*`), Android — `enum class YeetBrand` и параметра `brand` у `YeetTheme`; из `src/tokens/model` убраны `tokens.brand` и тип `BrandKey`. В Storybook нет тулбара «Бренд» и страницы «Foundations / Бренд-палитры». `npm run contrast` проверяет светлую и тёмную темы, флага `--brands=error` нет. Миграция: убрать `data-brand` / `YeetTheme(brand = …)` — цвета станут базовыми синими.

`ArtPlaceholder`: скругление — прямо `--card-radius` (radius.lg 20), локальной переменной `--art-placeholder-radius` больше нет; контейнер задаёт радиус заглушки селектором (плитка фото — `--radius-xs`).
