# Yeet Design System

Указатель по дизайн-системе приложения **YeetStyle (yeet)** — умного гардероба: что где лежит, ID страниц Figma и сводные таблицы токенов.
Сама спецификация живёт в **Storybook** (MDX `src/docs/*.mdx`, истории компонентов «В флоу», <!-- gen:screens -->86<!-- /gen:screens --> экранов флоу) и в **`src/docs/registry.ts`** —
здесь она не дублируется. Storybook публикуется на GitHub Pages (`.github/workflows/storybook.yml`); локально — `npm ci && npm run storybook`.

> Таблицы токенов ниже **генерируются** из `tokens/tokens.json` (`npm run docs-tokens`, проверка — `npm run docs-tokens -- --check`): блоки между `<!-- gen:… -->` руками не правятся.

---

## 1. Figma

Файл: [YeetStyle 2.0](https://www.figma.com/design/1LAkot5WySMWhwiiFJqJ0e) (`fileKey: 1LAkot5WySMWhwiiFJqJ0e`). Ссылки с пояснениями — Storybook «Процессы / Ресурсы».

| Что | Узел | Назначение |
|---|---|---|
| **Design System 2.0 (Claude)** | [`942:5666`](https://www.figma.com/design/1LAkot5WySMWhwiiFJqJ0e/YeetStyle-2.0?node-id=942-5666) | Компоненты на коллекции «Yeet DS 2.0» (Light / Dark) — **источник правды для кода** |
| Claude · DS 2.0 — экраны | [`1168:12824`](https://www.figma.com/design/1LAkot5WySMWhwiiFJqJ0e/YeetStyle-2.0?node-id=1168-12824) | Экраны флоу, собранные из компонентов 2.0 |
| Claude · DS 2.0 — Dark | [`1173:7887`](https://www.figma.com/design/1LAkot5WySMWhwiiFJqJ0e/YeetStyle-2.0?node-id=1173-7887) | Те же экраны в тёмной теме |
| New app design | [`70:12`](https://www.figma.com/design/1LAkot5WySMWhwiiFJqJ0e/YeetStyle-2.0?node-id=70-12) | Исходные макеты дизайнера (~150 экранов и состояний) — эталон вида, якоря `npm run flow-diff` |
| Animations | [`354:17404`](https://www.figma.com/design/1LAkot5WySMWhwiiFJqJ0e/YeetStyle-2.0?node-id=354-17404) | Переходы Smart Animate — источник `--motion-*`. Читается по id, но `get_metadata` без `nodeId` её не перечисляет — открывать по ссылке |

Правило: **компонент DS — закон, экран — пример использования.** Порядок правки — `CONTRIBUTING.md`. Оригинальные страницы YeetStyle 2.0 не трогаем; писать в Figma — под замком (`TEAM.md` §5).

Секции страницы 2.0: 00 Обзор · 01 Foundations · 02 Actions · 03 Inputs · 04 Selection · 05 Navigation & scroll · 06 Overlays · 07 Content · 08 States · 09 System · 10 Screen patterns · 11 Motion.
Коллекции переменных: **«Yeet DS 2.0»** — основная (с тёмной темой, `motion/*` скрыты из пикеров); «Yeet Design System» — исходная, на ней экраны флоу.
`node-id` каждого компонента — в `registry.ts` (`figmaId`).

## 2. Что где лежит

| Тема | Storybook | Файлы |
|---|---|---|
| Продукт, флоу, роадмап | Старт / О проекте | `src/docs/00-Project.mdx` |
| Принципы, атомарная система, как пользоваться | Старт / … | `01-Introduction` … `04-HowTo.mdx` |
| Токены и тёмная тема | Foundations / Токены и семантика | `tokens/tokens.json` → `npm run tokens`; `10-Tokens.mdx` |
| Типографика, отступы, радиусы, сетка, тап-зона | Foundations / Типографика, Отступы и радиусы | `11-Typography.mdx`, `12-Spacing.mdx` |
| Иконки, фото вещей без фона | Foundations / Иконки; Organisms / PhotoBalance | `13-Icons.mdx`, `src/icons/`, `src/utils/artBalance.ts` |
| Скролл, края экрана, резиновая вёрстка | Foundations / Скролл и края экрана, Резиновая вёрстка | `14-Scroll.mdx`, `17-Layout.mdx`, `src/templates/` |
| Движение, жесты, хаптика | Foundations / Анимации | `16-Motion.mdx`, `src/motion/motion.ts` |
| Тексты и тон (гендерно-нейтрально) | Foundations / Тексты и тон | `15-Tone.mdx` |
| Компоненты: варианты, «В флоу», спецификация | Atoms / Molecules / Organisms / Templates | `src/<уровень>/*.stories.tsx` |
| Реестр Figma ↔ код, статус зрелости | Процессы / Figma ↔ код | `src/docs/registry.ts`, `src/docs/status.ts` |
| Экраны флоу | Pages / Экраны флоу | `src/pages/` (документация экранов — PR #50–#54) |
| Нативные платформы | Процессы / iOS и Android | `native/ios`, `native/android`, `21-Mobile.mdx` |
| Быстрый старт: запуск, подключение, ассеты, проверки | Старт / Быстрый старт | `00-QuickStart.mdx` |
| Ресурсы: ссылки, выгрузки | Процессы / Ресурсы | `22-Resources.mdx` |
| Как вносить изменения, чек-лист PR | — | `CONTRIBUTING.md` |
| Параллельная работа, зоны, замок Figma | — | `TEAM.md`, `.github/team.json`, `.github/CODEOWNERS` |
| Принятые решения | — | `design/adr/` |
| QA, эталоны скриншотов, контраст | — | `design/QA.md`, `scripts/qa/`, `npm run qa`, `npm run contrast` |
| Аудит, план, инвентаризация | — | `design/AUDIT.md`, `design/INVENTORY.md` |

## 3. Токены (генерируется)

Три слоя: примитивы `--yeet-*` → семантика `--color-*`, `--space-*`, `--radius-*`, `--shadow-*` → компонентные `--button-*`, `--sheet-*`…
Компоненты читают только семантику и компонентные; тема — атрибут `data-theme="dark"`. Правила и свотчи — «Foundations / Токены и семантика».

### 3.1 Цвета интерфейса — `ui-colors/*`

<!-- gen:colors -->
| Figma | Код | Light | Dark | Роль |
|---|---|---|---|---|
| `ui-colors/white` | `--color-bg-canvas` | `#FFFFFF` | `#0F0F11` | Фон экрана |
| `ui-colors/elevated` | `--color-bg-elevated` | `#FFFFFF` | `#1A1A1E` | Поднятые поверхности: tab-bar, sheet, dialog, hint |
| `ui-colors/light-grey` | `--color-bg-subtle` | `#F7F7F7` | `#26262B` | Карточки, поля, tertiary-кнопки |
| `ui-colors/black` | `--color-bg-inverse` | `#000000` | `#F5F5F7` | Snackbar, Secondary-кнопка, погода |
| `ui-colors/overlay` | `--color-bg-overlay` | `#000000` @ 40% | `#000000` @ 60% | Затемнение под модальным sheet |
| `ui-colors/black` | `--color-text-primary` | `#000000` | `#F5F5F7` | Основной текст и иконки |
| `ui-colors/grey` | `--color-text-secondary` | `#6E6E6E` | `#8E8E93` | Вторичный текст, лейблы, подписи |
| `ui-colors/white` | `--color-text-inverse` | `#FFFFFF` | `#0F0F11` | Текст на inverse-поверхности |
| `ui-colors/on-accent` | `--color-text-on-accent` | `#FFFFFF` | `#FFFFFF` | Текст и иконки на accent / danger |
| `ui-colors/inverse-secondary` | `--color-text-inverse-secondary` | `#A7B3BF` | `#5B6470` | Вторичный текст на inverse-поверхности: подпись в карточке погоды |
| `ui-colors/on-accent` | `--color-text-on-danger` | `#FFFFFF` | `#FFFFFF` | Текст на danger (бейдж скидки) — белый в любом бренде |
| `ui-colors/white` | `--color-text-on-photo` | `#FFFFFF` | `#FFFFFF` | Статус-бар, логотип, подсказка и иконки поверх фото и тёмной камеры (Splash, Search / Photo / Crop) — белый в любой теме и бренде |
| `ui-colors/blue-text` | `--color-text-accent` | `#0100F4` | `#8A8AFF` | Акцентный текст, выбранное |
| `ui-colors/red-text` | `--color-text-danger` | `#CC291B` | `#FF6B5C` | Ошибки, деструктивные действия |
| `ui-colors/blue` | `--color-accent` | `#0100F4` | `#4B4BFF` | Главное действие, выбранное, фокус |
| `ui-colors/blue-10%` | `--color-accent-soft` | `#F1F4FF` | `#4B4BFF` @ 20% | Фон выбранного чипса (Soft) и сообщения пользователя. Light — сплошной #F1F4FF, как во флоу New app design (не прозрачный: на сером фоне не темнеет) |
| `ui-colors/red` | `--color-danger` | `#CC291B` | `#CC291B` | Удаление, ошибка, бейдж скидки |
| `ui-colors/red-10%` | `--color-danger-soft` | `#FF4230` @ 10% | `#FF6B5C` @ 18% | Фон Destructive-кнопки |
| `ui-colors/black-10%` | `--color-border-subtle` | `#000000` @ 10% | `#F5F5F7` @ 12% | Обводки свотчей, гистограмма, фон неактивных точек |
| `ui-colors/divider` | `--color-divider` | `#000000` @ 5% | `#F5F5F7` @ 8% | Разделители строк в input-group и list-group |
| `ui-colors/pattern-dot` | `--color-pattern-dot` | `#000000` @ 23% | `#F5F5F7` @ 23% | Точки фона коллажа и холста (2 px, шаг 10) |
| `ui-colors/handle` | `--color-handle` | `#000000` @ 17% | `#F5F5F7` @ 14% | Хэндл шторки: декоративный, ≈ 1,5:1 к bg-elevated (D8, #58) |
<!-- /gen:colors -->

<!-- gen:contrast -->
| Пара | Текст / знак | Фон | Light | Dark | Норма WCAG |
|---|---|---|---|---|---|
| Основной текст на фоне | `text-primary` | `bg-canvas` | 21.0 : 1 | 17.6 : 1 | 4.5 : 1 |
| Вторичный текст на фоне | `text-secondary` | `bg-canvas` | 5.1 : 1 | 5.9 : 1 | 4.5 : 1 |
| Вторичный текст на карточке | `text-secondary` | `bg-subtle` | 4.8 : 1 | 4.6 : 1 | 4.5 : 1 |
| Акцентный текст на фоне | `text-accent` | `bg-canvas` | 9.1 : 1 | 6.5 : 1 | 4.5 : 1 |
| Текст ошибки на фоне | `text-danger` | `bg-canvas` | 5.4 : 1 | 6.8 : 1 | 4.5 : 1 |
| Текст на Primary-кнопке | `text-on-accent` | `accent` | 9.1 : 1 | 5.6 : 1 | 4.5 : 1 |
| Текст на бейдже скидки | `text-on-danger` | `danger` | 5.4 : 1 | 5.4 : 1 | 4.5 : 1 |
| Текст Destructive-кнопки | `text-danger` | `danger-soft` | 4.7 : 1 | 5.4 : 1 | 4.5 : 1 |
| Заливка `accent` (фокус, выбранное) на фоне | `accent` | `bg-canvas` | 9.1 : 1 | 3.4 : 1 | 3 : 1 |
<!-- /gen:contrast -->

### 3.2 Цвета вещей — `item-colors/*`

<!-- gen:items -->
| Токен | Значение | Подпись в UI | Текст на свотче |
|---|---|---|---|
| `item-colors/black` | `#1A1A2E` | Черный | `#FFFFFF` |
| `item-colors/grey` | `#777777` | Серый | `#000000` |
| `item-colors/white` | `#FFFFFF` | Белый | `#000000` |
| `item-colors/purple` | `#6A00FF` | Фиолетовый | `#FFFFFF` |
| `item-colors/pink` | `#D900FF` | Розовый | `#000000` |
| `item-colors/green` | `#00D08B` | Зеленый | `#000000` |
| `item-colors/blue` | `#0100F4` | Синий | `#FFFFFF` |
| `item-colors/yellow` | `#FFD000` | Желтый | `#000000` |
| `item-colors/orange` | `#FF8800` | Оранжевый | `#000000` |
| `item-colors/red` | `#FF4230` | Красный | `#000000` |
| `item-colors/beige` | `#FFE1C7` | Бежевый | `#000000` |
| `item-colors/brown` | `#C26547` | Коричневый | `#000000` |
<!-- /gen:items -->

### 3.3 Типографика

<!-- gen:typography -->
| Стиль | Шрифт | Вес | Размер / интерлиньяж | Трекинг | Применение |
|---|---|---|---|---|---|
| `h1` | Roboto Slab | 380 | 32 / 36 | −1 px | Заголовки экранов |
| `h2` | Roboto Slab | 400 | 24 / 28 | −0.4 px | Секции, пустые состояния, числа |
| `h3` | Roboto Slab | 400 | 19 / 24 | −0.3 px | Заголовки sheet, диалогов, карточек |
| `body` | Inter | 460 | 14 / 20 | 0 | Текст, кнопки, пункты списков |
| `caption` | Inter | 400 | 12 / 16 | 0 | Подписи, мета-данные, бейджи |
<!-- /gen:typography -->

### 3.4 Отступы — `spaces/*`

<!-- gen:space -->
Шкала — 14 шагов: `0, 2, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 52, 56` (`--space-<значение>`).
<!-- /gen:space -->

### 3.5 Скругления

<!-- gen:radius -->
| Токен | Значение | Где |
|---|---|---|
| `--radius-xs` | 4 | Хэндл sheet |
| `--radius-sm` | 12 | Badge |
| `--radius-md` | 16 | Snackbar, cap столбца графика |
| `--radius-lg` | 20 | Карточки, поля, фото |
| `--radius-xl` | 32 | Кнопки-капсулы, верх sheet, подсказка стилиста |
| `--radius-bar` | 48 | Tab-bar, низ плавающего sheet (концентрично углу экрана) |
| `--radius-full` | 999 | Аватар, радио |
| `--radius-overlay` | 48 | Все 4 угла bottom sheet и dialog: концентрично экрану 56 при отступе 8 (#58) |

Компонентные радиусы ссылаются на эти: `--card-radius` → `lg`, `--sheet-radius` → `xl`, `--sheet-radius-bottom` → `bar`.
<!-- /gen:radius -->

### 3.6 Тени

<!-- gen:shadow -->
| Токен | Light | Dark | Где |
|---|---|---|---|
| `shadow/floating` | 0 / 8, blur 40, `#000000` @ 12% | 0 / 8, blur 40, `#000000` @ 50% | Tab-bar, FAB, hint, панель sheet. Figma: стиль shadow/floating, цвет — переменная ui-colors/shadow |
<!-- /gen:shadow -->

### 3.7 Движение — `--motion-*`

<!-- gen:motion -->
Переходов — 13.

| Токен | Кривая | Что происходит |
|---|---|---|
| `--motion-press` | 150 мс · standard | Нажатие кнопки, scale 0.97 |
| `--motion-fade` | 240 мс · standard | Затухание краёв, тосты |
| `--motion-collapse` | 300 мс · ease-out | Фото сворачивается в шапку при скролле |
| `--motion-page` | 300 мс · ease-out | Листание образов и поводов по свайпу |
| `--motion-nav` | 744 мс · spring quick (k300 c20) | Таб-бар уступает место FAB |
| `--motion-stamp` | 958 мс · spring bouncy (k600 c15) | Штамп «Надеть» → отмечено |
| `--motion-swap` | 1022 мс · spring gentle (k100 c15) | Смена образа: превью ↔ коллаж |
| `--motion-select` | 150 мс · standard | Выбор: фон чипса, вкладки, строки, цвет лайка |
| `--motion-lift` | 744 мс · spring quick (k300 c20) | Подъём под пальцем: вещь на холсте, карточка при перетаскивании |
| `--motion-drop` | 744 мс · spring quick (k300 c20) | Бросок в цель: вещь встаёт на место, соседи раздвигаются |
| `--motion-return` | 1022 мс · spring gentle (k100 c15) | Отмена перетаскивания: вещь возвращается туда, откуда взяли |
| `--motion-appear` | 240 мс · standard | Появление: snackbar, подсказка, диалог |
| `--motion-exit` | 150 мс · standard | Исчезновение: быстрее появления, чтобы не мешать |
<!-- /gen:motion -->
