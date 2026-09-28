# yeet · Design System

Дизайн-система приложения **YeetStyle** — умного гардероба.

| Где | Что |
|---|---|
| **Storybook** · GitHub Pages | Живые компоненты, правила, «В флоу» — для продукта, разработки и дизайна |
| **Figma** · YeetStyle 2.0 → «Design System 2.0 (Claude)» | Компоненты и варианты, переменные Yeet DS 2.0 (Light / Dark) |
| [`DESIGN.md`](./DESIGN.md) | Полная текстовая спецификация |
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
  docs/        страницы документации (MDX), registry.ts — реестр Figma ↔ код
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

На каждом PR workflow `team-overlap.yml` ставит метки `zone:*` и пишет, с какими открытыми PR есть общие файлы.

## Токены для iOS и Android

`tokens/tokens.json` — единый источник значений (цвета light/dark, отступы, радиусы, типографика, тени, анимации).

```bash
npm run tokens   # → src/tokens/tokens.generated.css, tokens/ios/YeetTokens.swift, tokens/android/YeetTokens.kt
```

Как подключить в приложения — Storybook → «Процессы / iOS и Android».
