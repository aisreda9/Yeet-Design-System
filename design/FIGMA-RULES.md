# Figma → код: правила интеграции через MCP

Свод правил для Claude при переносе макетов Figma в код этого репозитория. Спецификация — `DESIGN.md`, процесс сверки — `design/QA.md`.

## 0. Главное за 30 секунд

- Figma-файл `1LAkot5WySMWhwiiFJqJ0e`. Источник правды — страница **Design System 2.0 (Claude)** `942:5666` и коллекция переменных **«Yeet DS 2.0»** (Light / Dark). Экраны — `New app design` `70:12` (контекст), `Flow 2.0 (Claude)` (на компонентах 2.0).
- Код из `get_design_context` — это **референс, а не результат**. Он приходит как React + Tailwind с абсолютными значениями; здесь нет Tailwind, всё переводится в существующие компоненты, классы `y-*` и CSS-переменные.
- Сначала ищи готовый компонент в `src/docs/registry.ts`. Новый компонент — только если в Figma он есть как компонент DS 2.0.
- Никаких hex, px-значений цвета, `--yeet-*` и новых шрифтов в компонентах — только семантические/компонентные токены.

## 1. Токены

| Где | Что |
|---|---|
| `tokens/tokens.json` | **Единственный источник значений**: `primitive`, `item`, `color` (группы с `light`/`dark`/`role`/`figma`), `brand`, `component`, `space`, `radius`, `font`, `typography`, `shadow`, `layout`, `motion` |
| `scripts/build-tokens.mjs` | `npm run tokens` → `src/tokens/tokens.generated.css`, `tokens/ios/YeetTokens.swift`, `tokens/android/YeetTokens.kt` (руками не править) |
| `src/tokens/tokens.css` | Импортирует generated + база (`box-sizing`, классы текста) |
| `src/tokens/tokens.ts` | Метаданные токенов для страниц документации |

Формат значений: `"#RRGGBB"` или `"#RRGGBB@alpha"`; ссылки `"{primitive.blue-500}"`, `"{color.accent}"`, `"{radius.xl}"`.

```json
"accent": { "light": "{primitive.blue-500}", "dark": "{primitive.blue-300}", "role": "…", "figma": "ui-colors/blue" }
```

Три слоя CSS-переменных:

| Слой | Префикс | Кто читает |
|---|---|---|
| Примитивы | `--yeet-*` | только семантика |
| Семантика | `--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--motion-*`, `--font-*` | компоненты |
| Компонентные | `--button-*`, `--card-*`, `--sheet-*`, `--tab-bar-*`, `--input-*` | конкретный компонент |

Тема — `data-theme="dark"` на `<html>`; бренд-палитра — `data-brand="<id>"` (`tokens.brand`). Компоненты ничего не знают о теме.

### Перевод переменных Figma в код

| Figma (`get_variable_defs`) | Код |
|---|---|
| `ui-colors/blue` | `var(--color-accent)` (текст — `--color-text-accent`) |
| `ui-colors/blue-10%` | `var(--color-accent-soft)` |
| `ui-colors/red-10%` | `var(--color-danger-soft)` |
| `ui-colors/black-10%` | `--color-divider` / `--color-border-subtle` |
| `ui-colors/black` | `--color-text-primary` / `--color-bg-inverse` |
| `ui-colors/grey` | `--color-text-secondary` (`#6E6E6E` вместо `#777777` — контраст AA) |
| `ui-colors/light-grey` | `--color-bg-subtle` |
| `ui-colors/white` | `--color-bg-canvas` |
| `ui-colors/elevated` | `--color-bg-elevated` |
| `ui-colors/red` | `--color-danger` (текст — `--color-text-danger`) |
| `ui-colors/on-accent` | `--color-text-on-accent` |
| `ui-colors/overlay` | `--color-bg-overlay` |
| `item-colors/*` | только атрибут «цвет вещи» (`ColorDot`, `ItemColor`), **не UI** |
| `spaces/N` | `var(--space-N)` |
| радиусы 4 / 12 / 16 / 20 / 32 / 48 / 999 | `--radius-xs` / `sm` / `md` / `lg` / `xl` / `bar` / `full` |

Точное соответствие — поле `figma` у каждого цвета в `tokens.json`. Если значения в Figma нет в токенах — не хардкодь: задача для `ds-token-engineer`.

## 2. Компоненты

Атомарная архитектура, слой импортирует только нижние и только через `index.tsx`:

```
src/tokens → atoms → molecules → organisms → templates → pages
```

| Слой | Файлы | Компоненты |
|---|---|---|
| `src/atoms` | `icon.tsx`, `button.tsx`, `display.tsx`, `atoms.css` | Icon, Logo, WeatherIcon, Flag, Button, IconButton, Stamp, Badge, Avatar, Divider, ColorDot, ScrollEdge, Text |
| `src/molecules` | `inputs.tsx`, `selection.tsx`, `feedback.tsx`, `data.tsx` | Field, InputGroup, InputBar, SegmentControl, ChipGroup, ListItem, ListGroup, RangeSlider, Hint, Snackbar, EmptyState, LoadingState, PhotoTile, StatTile, Carousel, BarChart, UsageMeter |
| `src/organisms` | `system.tsx`, `navigation.tsx`, `overlays.tsx`, `cards.tsx`, `stylist.tsx`, `canvas.tsx` | StatusBar, Header, TabBar, BottomNav, BottomBar, Sheet, Dialog, ItemCard, ProductCard, OutfitCollage, PhotoArea, WeatherCard, ChatBubble, OutfitCanvas, TripCard… |
| `src/templates` | `index.tsx` | Screen, Grid, Row |
| `src/pages` | `Pages.stories.tsx` | Экраны флоу — **только** из компонентов |
| `src/motion` | `motion.ts`, `DragGrid.tsx` | Метаданные анимаций, жесты |

Реестр Figma ↔ код — `src/docs/registry.ts` (`code`, `figma`, `level`, `section`, `story`). Из него строятся страницы «Атомарная карта» и «Figma ↔ код».

Шаблон компонента:

```tsx
import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import { Icon } from './icon';

export type ButtonStyle = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'ghost' | 'soft' | 'destructive';

/** Описание + «Контексты во флоу» из Figma. */
export function Button({ variant = 'primary', size = 'L', className, children, ...rest }: ButtonProps) {
  return (
    <button type="button" className={cx('y-button', `y-button--${size}`, `y-style--${variant}`, className)} {...rest}>
      {children}
    </button>
  );
}
```

- Функциональные компоненты, именованный экспорт, типы `XxxProps`, JSDoc на русском.
- Свойства и значения вариантов — **как свойства компонента в Figma** (`variant`, `size: 'S' | 'M' | 'L' | 'XL'`, `type`…).
- Нативные атрибуты прокидываются через `...rest`; `className` склеивается через `cx`.
- Доступность: у `IconButton` обязателен `label`; декоративные иконки `aria-hidden`.

### Storybook — документация

Storybook 10 (`@storybook/react-vite`), `.storybook/`. Истории `src/**/*.stories.tsx`, MDX `src/docs/*.mdx`. Тулбар: **Тема** (light/dark), **Экран** (320 / 360 / 375 / 393 / 430), **Бренд**. У каждого компонента: `Playground`, все варианты, «В флоу» (реальные тексты экранов). Макетная ширина — 393×852.

## 3. Фреймворки и сборка

- React 19 + TypeScript 5.9 (`tsc --noEmit` — `npm run typecheck`), ES-модули.
- Стили — обычный CSS (без CSS Modules, Tailwind, CSS-in-JS).
- Vite 7 через Storybook; отдельной сборки библиотеки нет. `npm run build-storybook` → `storybook-static/` → GitHub Pages (`.github/workflows/storybook.yml`).
- QA: Playwright-core + axe-core + pixelmatch (`scripts/qa/*`), CI — `.github/workflows/qa.yml`.

## 4. Ассеты

- Шрифты: `tokens/fonts/` — Inter и Roboto Slab variable (TTF — исходник для iOS/Android, WOFF2 — web, подмножество `scripts/subset-fonts.sh`). `@font-face` генерируется в `tokens.generated.css`; в Storybook раздаются как `/fonts` (`staticDirs`). **Без внешних CDN.**
- SVG-ассеты подключаются через Vite `import.meta.glob(..., { eager: true, query: '?url', import: 'default' })`: `src/icons/weather/*.svg`, `src/icons/flags/*.svg`.
- Фото вещей — передаются пропсом `image` / `src` в `ItemArt` (`src/organisms/cards.tsx`); без фото рисуется контурная иконка категории. Фон вещей — `--color-bg-subtle`, вещь без собственного фона.
- Ассеты из Figma MCP (`localhost`-ссылки на картинки/SVG) **не** оставлять в коде: иконку добавляй в `icons.ts`, растр/цветной SVG — файлом в `src/icons/<группа>/` с glob-импортом.

## 5. Иконки

- `src/icons/icons.ts` — объект `icons: Record<IconName, string>`: SVG-разметка **внутренностей** 24×24 из Figma `ui-icons/*`, линия 1.3, `currentColor`. Имена — kebab-case как в Figma (`chevron-up-down`, `search-by-image`, `arrow-back`).
- `src/icons/brand.ts` — логотип (`logoPaths`) и звезда штампа (`stampStar`).
- Использование — только через атом:

```tsx
import { Icon, IconButton, Button } from '../atoms';

<Icon name="search" />                                  // цвет наследуется
<IconButton icon="cross" label="Закрыть" variant="ghost" size="S" />
<Button variant="tertiary" size="S" rightIcon="chevron-up-down">Категория</Button>
```

- Новая иконка из Figma: `get_design_context` узла → взять `<path>`, привести к 24×24, убрать `stroke`/`fill` цвета (останется `currentColor`), добавить ключ в `icons` с именем из Figma. Цветные иконки (погода, флаги) — отдельные SVG-файлы.

## 6. Стили

- Методология: BEM-подобные глобальные классы с префиксом `y-`: блок `.y-button`, модификатор `.y-button--L`, элемент `.y-photo-area__close`, стиль-вариант `.y-style--primary` (задаёт локальные `--y-bg` / `--y-fg`).
- Один CSS-файл на слой: `atoms.css`, `molecules.css`, `organisms.css`, `templates.css`, `motion.css`; подключается в `index.tsx` слоя.
- Глобальное: `src/tokens/tokens.css` (box-sizing, `@font-face`, переменные), текстовые классы `.y-h1 .y-h2 .y-h3 .y-body .y-caption` и цвета `.y-text--secondary|primary|accent|danger`.
- Типографика — только стили H1/H2/H3/Body/Caption (Roboto Slab 380/400, Inter 460/400), без ручных размеров.
- Анимации — только `--motion-*` и `--gesture-*` (см. §7).
- Резиновая вёрстка 320–430 (макет 393):
  - ширина — через flex/grid и `--screen-gutter`, без фиксированных 393;
  - container queries для узких мест (`.y-bottom-nav { container-type: inline-size }`);
  - коллажи/холст масштабируются `useFitScale(ref, base)` (`src/utils/useFitScale.ts`), размеры — в единицах макета;
  - ритм экрана — `.y-section` (H3 → контент 16, до раздела 24), контент на 20 ниже шапки.

## 7. Движение: анимации, переходы, изинги, жесты, хаптика

Источник — страница Figma **Animations** `354:17404` (Smart Animate) и секция **11 · Motion** на DS 2.0 (переменные `motion/*`, code syntax `var(--motion-*)`). Значения — `tokens.json → motion`, метаданные для документации и графиков кривых — `src/motion/motion.ts`, живые демо — `src/motion/Motion.stories.tsx`, `DragGrid.tsx`, правила — Storybook «Foundations / Анимации» (`src/docs/16-Motion.mdx`).

### Слои токенов движения

| Слой | Токены | Пример |
|---|---|---|
| Длительности | `--motion-fast` 150 · `--motion-base` 240 · `--motion-300` 300 | только для сборки переходов |
| Кривые | `--ease-standard` `cubic-bezier(0.2,0,0,1)` · `--ease-out` `cubic-bezier(0,0,0.58,1)` · `--spring-quick` / `bouncy` / `gentle` (CSS `linear()` из пресетов Figma) + `--spring-*-duration` | только для сборки переходов |
| **Переходы (в компонентах — только они)** | `--motion-press` `select` `fade` `appear` `exit` `collapse` `page` `nav` `stamp` `swap` `lift` `drop` `return` | `transition: transform var(--motion-press)` |
| Жесты | `--gesture-press-scale` 0.97 · `-card` 0.98 · `-stamp` 0.94 · `--gesture-lift-scale` 1.04 · `--gesture-target-scale` 1.02 · `--gesture-long-press` 400ms · `--gesture-press-delay` 80ms · `--gesture-touch-slop` 10px · `--gesture-swipe-distance` 0.3 · `--gesture-swipe-velocity` 500 · `--gesture-rubber-band` 0.55 · `--gesture-snackbar` 4000ms | `transform: scale(var(--gesture-press-scale))` |

Пружины Figma (mass 1): **Quick** k300 c20 → 744 мс, **Bouncy** k600 c15 → 958 мс, **Gentle** k100 c15 → 1022 мс.

### Какой переход выбрать

| Ситуация | Токен | Логика |
|---|---|---|
| Нажатие кнопки / чипса / иконки | `--motion-press` + `--gesture-press-scale` | мгновенный отклик; карточка сжимается меньше (0.98), штамп больше (0.94) |
| Смена выбора (чипс, вкладка, строка, лайк) | `--motion-select` | только цвет/фон, без сдвигов |
| Появление snackbar, подсказки, диалога | `--motion-appear` | standard 240 |
| Исчезновение | `--motion-exit` | **быстрее появления** (150), чтобы не мешать |
| Затухание краёв скролла, тосты | `--motion-fade` | |
| Движение, которое ведёт палец (скролл-сворачивание, листание) | `--motion-collapse`, `--motion-page` | **ease-out, без пружины** — не пружинит против руки |
| Ответ системы на действие (таб-бар ↔ FAB) | `--motion-nav` | spring quick |
| Штамп «Надеть» | `--motion-stamp` | **bouncy — только штамп** |
| Смена образа превью ↔ коллаж | `--motion-swap` | spring gentle |
| Перетаскивание: подъём / бросок / отмена | `--motion-lift` / `--motion-drop` / `--motion-return` | quick, quick, gentle |

Правила:
- Анимируем только `transform` и `opacity` (и цвет для `select`); не `width/height/top/left` — кроме описанных в Figma морфов (таб-бар 353 → 290), и то через `transform`, где возможно.
- Никаких сырых `ms`, `ease`, `cubic-bezier` в компонентах: новый переход = новый токен в `tokens.json → motion.transition` (+ `use`), затем `npm run tokens`.
- `prefers-reduced-motion: reduce` превращает все `--motion-*` в `1ms linear` и гасит `lift/target`-масштаб — не обходить это `animation`-ами с собственными длительностями.
- Нажатие внутри скролла — с задержкой `--gesture-press-delay`; сдвиг больше `--gesture-touch-slop` отменяет нажатие и начинает жест.
- Свайп засчитан при дистанции ≥ `--gesture-swipe-distance` ширины или скорости ≥ `--gesture-swipe-velocity`; за границей — сопротивление `--gesture-rubber-band`.

### Хаптика (натив)

`tokens.json → motion.haptic` — события `select`, `toggle`, `lift`, `target`, `drop`, `threshold`, `stamp`, `skip`, `delete`, `error`, `success` с iOS-генератором, Android-константой, `androidMin` / `androidFallback` и правилом «когда». Выгружается в Swift/Kotlin; в web — только документация. Одно событие — одна вибрация, `select` не чаще раза в 50 мс, `threshold` — только при пересечении вперёд.

### Из Figma в код

1. `get_motion_context` узла (или кадры Animations) → тип (Smart Animate / After delay), кривая, длительность, что меняется.
2. Сопоставь пресет: Ease out → `--ease-out`, Quick / Bouncy / Gentle → `--spring-*`, 150/240/300 → переходы выше. Нет совпадения — это решение дизайна, не новый хардкод.
3. Добавь строку в `motions` (`src/motion/motion.ts`) и демо в `Motion.stories.tsx`; в DESIGN.md §3.7 — строку таблицы.

## 8. Структура проекта

```
DESIGN.md            спецификация (токены, компоненты, флоу, тон, расхождения, дорожная карта)
design/              QA.md, figma-specs.json (эталоны размеров), figma-flows.json (якоря экранов), этот файл
tokens/              tokens.json, fonts/, ios/, android/
scripts/             build-tokens, check-contrast, subset-fonts, qa/ (run, flow-diff, shot, boxes, shots-pages, sheet)
src/                 tokens, icons, atoms, molecules, organisms, templates, pages, motion, docs, utils
.claude/             agents/ds-*.md, skills/ds-team, hooks/figma-guard.sh, settings.json
```

## 9. Процесс: узел Figma → код

1. **Найти узел.** `search_design_system` / `get_metadata` на странице `942:5666`; не выгружать страницу целиком.
2. **Снять контекст.** `get_design_context` + `get_screenshot` (Light и Dark), `get_variable_defs` для токенов.
3. **Сопоставить.** Узел есть в `registry.ts` → правим существующий компонент. Инстансы внутри узла → существующие компоненты, а не новые div.
4. **Перевести.** Tailwind/абсолютные значения → классы `y-*` + токены (таблица §1). Размеры, которых нет в токенах, — только внутри компонента в CSS слоя и только если так в Figma.
5. **Задокументировать.** Story (Playground, варианты, «В флоу»), строка в `registry.ts`, замер в `design/figma-specs.json`.
6. **Проверить.** `npm run typecheck`, `npm run build-storybook && npm run qa -- --only=<story>`, для экранов `npm run flow-diff -- <slug>`; скриншот `node scripts/qa/shot.mjs <story-id> qa/out/cmp/x.png` рядом с `get_screenshot`.

Расхождение — ровно один класс: **баг кода** (чиним), **неточность спеки** (обновляем `figma-specs.json`/`figma-flows.json`), **решение дизайна** (контраст, зоны нажатия — к человеку, код не меняем). Осознанные замены цвета ради контраста — `colorAlias` в `scripts/qa/flow-diff.mjs`.

Для анимации шаг 2 — `get_motion_context`, шаг 4 — таблица §7.

## 10. Запись в Figma

Только страницы `Design System 2.0 (Claude)` и `Flow 2.0 (Claude)` и коллекция «Yeet DS 2.0». Перед `use_figma` загрузить `figma-use`. Хук `.claude/hooks/figma-guard.sh` запрашивает подтверждение на удаления и запись в оригинальные страницы (`551:2286`, `70:12`, `0:1`, `354:17404`, `352:12171`). Code Connect недоступен (тариф Pro).

## 11. Лучшие практики

**Дизайн-система**
- Одно значение — одно место: Figma-переменная ↔ `tokens.json` ↔ CSS/Swift/Kotlin. Имя токена отражает роль, а не цвет (`--color-text-secondary`, не `--grey`).
- Компонент сначала в Figma DS 2.0 (варианты, описание, «В флоу»), потом в коде. Локальные правки экрана не делаем — добавляем вариант компонента.
- Каждый экран — во всех состояниях: Default, Empty, No Results, Focused, Filled, Loading, Error; Light и Dark; 320 и 430.
- Доступность — часть определения готовности: контраст AA 4,5 : 1, зона нажатия ≥ 44 pt / 48 dp в нативе (≥ 40 px в web), подписи у иконок-кнопок, `prefers-reduced-motion`, Dynamic Type / font scale 1.3.
- Версионирование: изменения фиксируются в Changelog DS 2.0, `DESIGN.md` (§9, §10) и журнале `design/QA.md`. Ломающее переименование свойства компонента — через заметку в Changelog.

**Код**
- Небольшие компоненты с явными пропсами; составные — композиция нижних слоёв, а не параметры-флаги на всё.
- Семантический HTML (`button`, `ul/li`, `h1–h3`) вместо `div` с `onClick`; фокус — `:focus-visible` с `--color-accent`.
- Никакой логики темы в компонентах, никаких inline-стилей, кроме динамических значений (масштаб `useFitScale`, CSS-переменные).
- Переиспользуй утилиты `src/utils` (`cx`, `plural`, `useFitScale`, `useSlidingPill`) вместо копий.
- Маленькие проверяемые шаги: одна логическая правка → `typecheck` → `qa --only` → коммит. Эталон скриншотов обновляется только осознанно.
- Коммиты — что и зачем, по-английски или по-русски в стиле истории репозитория; PR — со ссылками на узлы Figma и отчётом QA.

**Команда**
- Задачи крупнее одной правки — через `/ds-team` (`.claude/skills/ds-team/SKILL.md`): аудит → план → реализация → QA → документация.
- У каждого агента своя зона записи; решения дизайна не принимаются кодом — выносятся человеку списком.
