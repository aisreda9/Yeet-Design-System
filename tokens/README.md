# tokens/ — источник токенов

`tokens.json` — единый источник для web, iOS и Android в формате **DTCG** ([designtokens.org](https://www.designtokens.org/), 2025.10).
`npm run tokens` собирает из него через **Style Dictionary v5**:

| Вывод | Формат |
|---|---|
| `src/tokens/tokens.generated.css` | CSS-переменные, темы `[data-theme]`, бренды `[data-brand]` |
| `tokens/ios/YeetTokens.swift`, `native/ios/…/Generated/YeetTokens.swift` | SwiftUI |
| `tokens/android/YeetTokens.kt`, `native/android/…/YeetTokens.kt` | Jetpack Compose |

Сгенерированные файлы руками не правятся. CI пересобирает их и падает, если они разошлись с `tokens.json`.

## Как устроен токен

```json
"bg-canvas": {
  "$value": "{primitive.neutral-0}",
  "$description": "Фон экрана",
  "$extensions": { "com.yeet": { "figma": "ui-colors/white", "modes": { "dark": "{primitive.graphite-950}" } } }
}
```

- `$type` задаётся у токена или у группы (наследуется). Типы — из DTCG (`color`, `dimension`, `duration`, `cubicBezier`, `number`, `fontFamily`, `typography`, `shadow`, `transition`, …) и два своих: `spring`, `haptic` (описаны в корневом `$extensions["com.yeet"].customTypes`).
- Цвет — `{ "colorSpace": "srgb", "components": [r, g, b], "alpha"?: a, "hex": "#RRGGBB" }`; прозрачный — `alpha: 0`.
- Размеры и время — `{ "value": 16, "unit": "px" }`, `{ "value": 150, "unit": "ms" }`.
- Ссылка — полный путь: `{color.content.text-accent}`, `{radius.lg}`.
- **Темы:** `$value` — светлая, `$extensions["com.yeet"].modes.dark` — тёмная (если нет — как светлая).
- **Бренды:** группа `brand.<id>` переопределяет семантические цвета `color.*` по имени; название и описание — `$extensions["com.yeet"].brand`.
- Метаданные проекта (роль в Figma, название цвета вещи, iOS/Android-детали) — только в `$extensions["com.yeet"]`.

## Проверка

`scripts/tokens/dtcg.mjs` проверяет схему до сборки: неизвестный `$type`, значение не по типу, битая ссылка, ссылка на токен другого типа, цикл, неизвестная тема, бренд с несуществующим цветом — сборка падает со списком ошибок. Тесты валидатора: `node --test scripts/tokens/dtcg.test.mjs` (в CI — `qa.yml`).

## Код сборки

- `scripts/build-tokens.mjs` — конфигурация Style Dictionary.
- `scripts/tokens/transforms.mjs` — трансформы: пружина → CSS `linear()`, px → pt / dp / sp, цвета под платформы, имена с экранированием ключевых слов Swift / Kotlin.
- `scripts/tokens/formats.mjs` — форматы CSS / Swift / Kotlin.
- `src/tokens/model.js` — чтение токенов из кода (Storybook, утилиты, скрипты контраста и DESIGN.md) в плоской форме: `tokens.color`, `tokens.brand`, `tokens.motion.gesture`… Типы — `model.d.ts`.
