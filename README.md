# yeet · Design System

Дизайн-система приложения **YeetStyle** — умного гардероба.

| Где | Что |
|---|---|
| **Storybook** · GitHub Pages | Живые компоненты, правила, «В флоу» — для продукта, разработки и дизайна |
| **Figma** · YeetStyle 2.0 → «Design System 2.0 (Claude)» | Компоненты и варианты, переменные Yeet DS 2.0 (Light / Dark) |
| [`DESIGN.md`](./DESIGN.md) | Указатель: что где лежит, ID страниц Figma, таблицы токенов (генерируются) |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Как добавить или изменить компонент, статусы `alpha` / `beta` / `stable`, чек-лист PR |
| [`design/adr/`](./design/adr/) | Принятые решения (ADR) |
| [`TEAM.md`](./TEAM.md) | Как параллельные сессии Claude и боты работают вместе: роли, зоны, issues, замок Figma |

## Структура

```
src/
  tokens/      web-обёртка токенов; значения генерируются из ../tokens/tokens.json
  icons/       линейные иконки из Figma (icons.ts) и фирменная графика (brand.ts: логотип, звезда штампа)
  atoms/       icon.tsx      Icon, Logo
               button.tsx    Button, IconButton, Stamp
               display.tsx   Badge, Avatar, Divider, ColorDot, ScrollEdge, Text
  molecules/   inputs.tsx    Field, InputGroup, InputBar
               selection.tsx SegmentControl, ChipGroup, ListItem, List, ListGroup
               feedback.tsx  Hint, Snackbar, EmptyState, LoadingState, PhotoTile
               data.tsx      StatTile, StatRow, Carousel, BarChart, UsageMeter
  organisms/   system.tsx    StatusBar
               navigation.tsx Header, TabBar, BottomNav, BottomBar
               overlays.tsx  Sheet, Dialog, Overlay
               cards.tsx     ItemCard, ProductCard, OutfitCollage, CollageLayer, PhotoArea, WeatherCard, ChatBubble
               stylist.tsx   OutfitThumbnail, StylistPromptCard, TripCard
  templates/   Screen — каркас экрана со скроллом под навигацией; Grid, Row — раскладка
  pages/       экраны флоу, собранные только из компонентов (stories)
  motion/      метаданные анимаций и интерактивные демо
  docs/        страницы документации (MDX), registry.ts — реестр Figma ↔ код со статусом, status.ts — бейджи
  utils/       cx, plural
```

Каждый слой импортирует только слои ниже себя (атом не знает о молекуле). `index.tsx` слоя подключает CSS и реэкспортирует модули —
импортировать компоненты всегда из папки слоя: `import { Button } from '../atoms'`.

## Запуск

```bash
npm ci
npm run storybook        # http://localhost:6006
npm run build-storybook  # статическая сборка в storybook-static/
```

## Публикация

Workflow `.github/workflows/storybook.yml` собирает Storybook и публикует на GitHub Pages при пуше в `main`.
`main` защищена: изменения только через PR с зелёной проверкой `qa`.

## Командная работа

Несколько сессий Claude и ботов работают параллельно, каждая в своей ветке. Правила — [`TEAM.md`](./TEAM.md), зоны — `.github/team.json`.

```bash
npm run team   # активные ветки, их зоны и пересечения с твоей веткой
```

Задачу крупнее одной правки внутри сессии можно раздать агентам дизайн-системы: `/ds-team <задача>` (`.claude/skills/ds-team/SKILL.md`, агенты `.claude/agents/ds-*.md`, правила Figma → код — `design/FIGMA-RULES.md`).

На каждом PR workflow `team-overlap.yml` ставит метки `zone:*` и пишет, с какими открытыми PR есть общие файлы.

## Токены для iOS и Android

`tokens/tokens.json` — единый источник значений (цвета light/dark, отступы, радиусы, типографика, тени, анимации).

```bash
npm run tokens   # → src/tokens/tokens.generated.css, tokens/ios/YeetTokens.swift, tokens/android/YeetTokens.kt,
                 #   native/ios (токены, иконки → SwiftUI Path, шрифты, иконки погоды)
```

Таблицы токенов в `DESIGN.md` генерируются из того же файла:

```bash
npm run docs-tokens              # обновить блоки <!-- gen:… --> в DESIGN.md
npm run docs-tokens -- --check   # только сверить: код выхода 1, если DESIGN.md отстал от tokens.json
```

Как подключить в приложения — Storybook → «Процессы / iOS и Android».

## iOS: библиотека компонентов (SwiftUI)

`native/ios` — Swift Package `YeetDesignSystem` (iOS 16+, без зависимостей): те же компоненты и props, что в React.
Подключение через SPM по URL репозитория, таблица соответствий React ↔ Swift — [native/ios/README.md](native/ios/README.md).
Сборку проверяет `.github/workflows/ios.yml` (macOS, iOS Simulator).

## Релизы

Одна версия на всю систему (`package.json` → Android AAR и тег для SPM), семвер: **major** — удалён или переименован токен,
компонент, prop или роль токена поменяла значение так, что экраны поедут; **minor** — новое и обратно совместимое; **patch** —
исправления без изменения API. Подробно — [`.changeset/README.md`](.changeset/README.md).

1. **В каждом PR**, который меняет то, что получают приложения, — `npx changeset` (уровень и одна строка для CHANGELOG).
2. **Подготовка релиза** (человек): ветка от `main`, затем

   ```bash
   npm run release:version   # changeset version: версия в package.json, CHANGELOG.md
                             # + раздел «Токены» — дифф значений tokens.json с прошлым тегом
   ```

   PR «Release vX.Y.Z», мерж после зелёного CI.
3. **Тег** на коммите мержа: `git tag vX.Y.Z && git push origin vX.Y.Z`. Workflow `.github/workflows/release.yml`:
   проверяет, что тег совпадает с `package.json`, создаёт GitHub Release (CHANGELOG + дифф токенов между тегами)
   и публикует AAR в GitHub Packages. Сухой прогон без публикации — Actions → Release → Run workflow.

Посмотреть заранее: `npm run tokens:changelog` (последний тег → рабочее дерево), `npm run release:notes -- vX.Y.Z`.

**iOS (SPM)** — отдельной публикации нет: Xcode → Add Package Dependencies → `https://github.com/indiekola/Yeet-Design-System`,
правило «Up to Next Major» от нужной версии. SPM читает корневой `Package.swift` по тегу `vX.Y.Z`.

**Android (GitHub Packages)** — `settings.gradle.kts` приложения:

```kotlin
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("https://maven.pkg.github.com/indiekola/Yeet-Design-System")
            credentials { // GitHub Packages требует токен даже для чтения: PAT с read:packages
                username = providers.gradleProperty("gpr.user").orNull ?: System.getenv("GITHUB_ACTOR")
                password = providers.gradleProperty("gpr.key").orNull ?: System.getenv("GITHUB_TOKEN")
            }
        }
    }
}
```

и `implementation("design.yeet:yeet-design-system:X.Y.Z")`. Локально без публикации:
`cd native/android && ./gradlew :yeet-design-system:publishToMavenLocal` + `mavenLocal()`.
