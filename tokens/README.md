# tokens/ — источник токенов

`tokens.json` — единый источник для web, iOS и Android в формате **DTCG** ([designtokens.org](https://www.designtokens.org/), 2025.10).
`npm run tokens` собирает из него через **Style Dictionary v5**:

| Вывод | Формат |
|---|---|
| `src/tokens/tokens.generated.css` | CSS-переменные, темы `[data-theme]` |
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
- Хаптика — `$extensions["com.yeet"].platforms` (`web` | `ios` | `android`, без поля — все): поля `ios` / `android` в `$value` есть ровно у своих платформ. В iOS и Android 5 событий (`select`, `toggle`, `threshold`, `stamp`, `skip`); `lift`, `drop`, `target`, `delete`, `success`, `error` — `platforms: ["web"]`, `$value: {}`, в Swift / Kotlin не генерируются (#130).
- Цвет — `{ "colorSpace": "srgb", "components": [r, g, b], "alpha"?: a, "hex": "#RRGGBB" }`; прозрачный — `alpha: 0`.
- Размеры и время — `{ "value": 16, "unit": "px" }`, `{ "value": 150, "unit": "ms" }`.
- Ссылка — полный путь: `{color.content.text-accent}`, `{radius.lg}`.
- **Темы:** `$value` — светлая, `$extensions["com.yeet"].modes.dark` — тёмная (если нет — как светлая).
- **Повышенный контраст** (#117, модификатор `contrast` в корневом `$extensions`): `modes["contrast-light"]` и `modes["contrast-dark"]`; если нет — значение своей темы. Значение — литерал или ссылка на токен без тем (примитив): иначе нативная сборка взяла бы светлое значение ссылки (валидатор проверяет). Вывод: web — `@media (prefers-contrast: more)` в конце `tokens.generated.css`, iOS — `YeetColor` с `accessibilityContrast == .high` и `YeetFocusRing.width(_:)`, Android — `YeetLightContrastColors` / `YeetDarkContrastColors` и `*HighContrast`. Нормы набора — `npm run contrast` (`contrast · light/dark`): текст на поверхностях ≥ 7 : 1, на цветных заливках ≥ 4,5 : 1, обводки и разделители ≥ 3 : 1.
- **Бренд один** — синий `color.emphasis.accent`; остальные палитры удалены ([ADR 0002](../design/adr/0002-brand-palettes-experiment.md)).
- Метаданные проекта (роль в Figma, название цвета вещи, iOS/Android-детали) — только в `$extensions["com.yeet"]`.

## Проверка

`scripts/tokens/dtcg.mjs` проверяет схему до сборки: неизвестный `$type`, значение не по типу, битая ссылка, ссылка на токен другого типа, цикл, неизвестная тема — сборка падает со списком ошибок. Тесты валидатора: `node --test scripts/tokens/dtcg.test.mjs` (в CI — `qa.yml`).

## Код сборки

- `scripts/build-tokens.mjs` — конфигурация Style Dictionary.
- `scripts/tokens/transforms.mjs` — трансформы: пружина → CSS `linear()`, px → pt / dp / sp, цвета под платформы, имена с экранированием ключевых слов Swift / Kotlin.
- `scripts/tokens/formats.mjs` — форматы CSS / Swift / Kotlin.
- `src/tokens/model.js` — чтение токенов из кода (Storybook, утилиты, скрипты контраста и DESIGN.md) в плоской форме: `tokens.color`, `tokens.motion.gesture`… Типы — `model.d.ts`.
