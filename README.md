# yeet · Design System

Дизайн-система приложения **YeetStyle** — умного гардероба.

| Где | Что |
|---|---|
| **Storybook** · GitHub Pages | Живые компоненты, правила, «В флоу» — для продукта, разработки и дизайна |
| **Figma** · YeetStyle 2.0 → «Design System 2.0 (Claude)» | Компоненты и варианты, переменные Yeet DS 2.0 (Light / Dark) |
| [`DESIGN.md`](./DESIGN.md) | Полная текстовая спецификация |

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

## Команда агентов Claude

Для работы над системой в Claude Code есть команда `/ds-team <задача>` — ведущий раздаёт работу агентам из `.claude/agents/`:
аудитор Figma ↔ код, инженер токенов, разработчик компонентов, сборщик Figma, UX-редактор, QA и хранитель документации.
Маршруты и критерии готовности — `.claude/skills/ds-team/SKILL.md`, общие правила — `CLAUDE.md`.

## Запуск

```bash
npm ci
npm run storybook        # http://localhost:6006
npm run build-storybook  # статическая сборка в storybook-static/
```

## Публикация

Workflow `.github/workflows/storybook.yml` собирает Storybook и публикует на GitHub Pages при пуше в `main`
или `claude/figma-access-ara4o8`. Один раз нужно включить Pages: **Settings → Pages → Source: GitHub Actions**.

## Токены для iOS и Android

`tokens/tokens.json` — единый источник значений (цвета light/dark, отступы, радиусы, типографика, тени, анимации).

```bash
npm run tokens   # → src/tokens/tokens.generated.css, tokens/ios/YeetTokens.swift, tokens/android/YeetTokens.kt
```

Как подключить в приложения — Storybook → «Процессы / iOS и Android».
