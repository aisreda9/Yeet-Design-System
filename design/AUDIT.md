# Аудит дизайн-системы · сентябрь 2026

Глубокий аудит Yeet DS v0.3 — токены, компоненты, доступность, инструменты, документация, связь с Figma — и план развития.
Состояние: `claude/gallant-wozniak-bmuhva` (fdf3fa5, 28.09 18:46) + `claude/happy-babbage-hj9u2w` (1ba6ff6) — самые свежие ветки.
На нём: `typecheck` ✓, `contrast` ✓ (156 пар), токены перегенерируются без дрейфа. На базовой 2b9850c дополнительно: `build-storybook` ✓ (17 с),
`qa` ✓ (114 историй, 60/60 спек Figma, 5 мин), `flow-diff --strict` ✓ (175 якорей). Figma-файл YeetStyle 2.0 открывается через MCP.

> Система активно дорабатывается в `gallant-wozniak` — находки ниже перепроверены на ней; уже закрытое отмечено ✅.

---

## Статус на 29.09 — после слияния #1 и #2

Уже закрыто (вливанием #1 и #2 в `main`):
- ✅ **Нативные библиотеки:** Swift Package `YeetDesignSystem` (`native/ios`, SwiftUI, iOS 16+, подключается по URL репозитория) и Compose-модуль `yeet-design-system` (`native/android`, `YeetTheme`, пример-галерея). Компоненты повторяют React API.
- ✅ **CI для нативных:** `ios.yml` (xcodebuild) и `android.yml` (Gradle assemble + lint) с проверкой дрейфа сгенерированных файлов.
- ✅ **Swift/Kotlin компилируются:** экранирование ключевых слов (`return`); Dynamic Type через `relativeTo:` + `@ScaledMetric`; Reduce Motion на iOS; `YeetMotionScheme(reduced)` на Android.
- ✅ **Зона касания 44 pt на iOS** (`Foundation.swift`, `contentShape` без изменения вида).
- ✅ Dialog `danger`, Sheet `onClose`, тап по затемнению, страница «Ресурсы» с загрузками.

Ниже — исходный аудит; пункты выше в нём уже неактуальны. Работа по оставшимся — issues #7–#13, координация — #6.

---

## TL;DR

Система **сильная как спецификация**: чистые слои токенов, один `tokens.json` → CSS / Swift / Kotlin, Storybook с «В флоу» и
реальными текстами, редкий по качеству автоматический QA (спеки Figma, якоря флоу, тени, тап-зоны). Главные проблемы не в
визуале, а в том, **как систему потребляют и насколько ей можно доверять**:

1. **Продукт нативный, а система отдаёт ему только файлы токенов «скопируй в проект».** Нет Swift Package / Gradle-модуля,
   Kotlin ни разу не компилировался, брендов и компонентных токенов на iOS/Android нет. React-компоненты — эталон, их никто не импортирует.
2. **Документация расходится с источником правды.** DESIGN.md (47 КБ) называет `tokens.json` главным, но цвета, шкала отступов,
   анимации и страницы Figma в нём уже другие (см. §2.1).
3. **Модальные и интерактивные компоненты доступны только визуально.** Sheet/Dialog без фокуса и Escape, Field-кнопка не нажимается
   с клавиатуры, у полей нет видимого фокуса, холст образа без клавиатуры.
4. **Часть «зелёных» проверок ничего не проверяет.** Визуальная регрессия в CI не сравнивает (эталоны в `.gitignore`), axe валит
   только `critical`, контраст считает 12 текстовых пар и пропускает Destructive-кнопку и фокус-кольца в брендах.
5. **Нет процесса:** ветки `main` нет, Pages деплоится с фича-ветки, нет версий, CHANGELOG, линтеров, статусов компонентов.

---

## 1. Что хорошо (не ломать)

- Три слоя токенов (primitive → semantic → component), тема и бренд — одним атрибутом; hex в компонентах почти не встречается.
- Генератор детерминирован: `npm run tokens` даёт байт-в-байт закоммиченный результат.
- Пружины Figma заданы физикой (mass / stiffness / damping) и честно переносятся в SwiftUI, Compose и CSS `linear()`; `prefers-reduced-motion` в CSS.
- Истории «В флоу» с названием экрана и реальными текстами — лучшая практика, которой нет у большинства систем.
- QA-пайплайн: 60 спек из Figma, 175 якорей флоу, тени, обрезка, тап-зоны, axe — уникально сильная часть.
- Тон и гендерно-нейтральные тексты зафиксированы правилами с примерами.

---

## 2. Находки

Критичность: 🔴 критично · 🟠 высокая · 🟡 средняя · ⚪ низкая.

### 2.1 Источник правды и документация

| | Находка | Где |
|---|---|---|
| 🟠 | DESIGN.md §3.1 расходится с `tokens.json`: `blue` dark `#5B5BFF` → на деле `#4B4BFF`; `grey` light `#777777` → `#6E6E6E`; `red` `#FF4230/#FF5A4A` → `danger` `#CC291B` в обеих темах; заявленный контраст синего на тёмном 4.4:1 → фактически 3.4:1 | DESIGN.md:62-77 |
| 🟠 | Шкала отступов в DESIGN.md — 21 шаг (36, 44, 60, 68), в токенах — 17; радиус 24 заявлен, токена нет; анимаций 7 против 13 | DESIGN.md:124, 130-141, 157-165 |
| 🟡 | Страницы Figma: в DESIGN.md 6 страниц, MCP видит 2 верхнего уровня; актуальные ссылки уже живут на странице «Ресурсы» — DESIGN.md §1 сверить с ней | DESIGN.md:15-22, 22-Resources.mdx |
| 🟡 | DESIGN.md §3.1: `blue-10%` light теперь сплошной `#F1F4FF`, а таблица говорит «10%» | DESIGN.md:65, tokens.json |
| 🟡 | Три параллельных источника: DESIGN.md, MDX в Storybook, `registry.ts`; DESIGN.md правится руками и отстаёт («15 экранов» при 28, `npm i` вместо `npm ci`, нумерация §9 не по порядку) | DESIGN.md:7, 479-487 |
| 🟡 | Нет CONTRIBUTING, шаблона PR, CODEOWNERS, журнала решений (ADR), статусов компонентов (alpha / beta / stable / deprecated) | — |
| ⚪ | Только русский — нормально для команды, но закрывает дорогу подрядчикам; числа в MDX захардкожены | 01-Introduction.mdx:25 |

### 2.2 Токены

| | Находка | Где |
|---|---|---|
| 🟠 | Нет проверки дрейфа: CI перегенерирует токены, но не проверяет `git diff` — ручная правка `.swift`/`.kt`/`.css` уйдёт в main | qa.yml |
| 🟠 | Контраст: проверяется 12 пар текста. Провалы вне проверки — Destructive-кнопка (`text-danger` на `danger-soft`) в sage 4.36, lilac 4.45, lime 4.48; фокус-кольцо `accent` на фоне в светлых брендах 1.3–2.1 (нужно 3:1, WCAG 1.4.11) | check-contrast.mjs |
| 🟠 | Бренды (lime, butter, cherry, sage, lilac) — только web, hex без примитивов; переопределяют 14 из 20 семантических цветов (danger, overlay, inverse-secondary наследуют синий) | tokens.json:68-249 |
| 🟡 | Формат не DTCG (`#hex@alpha`, кириллические группы, `light`/`dark` внутри значения) — нельзя синхронизировать с Figma Variables / Tokens Studio / Style Dictionary | tokens.json |
| 🟡 | Имена Figma → код неоднозначны: `ui-colors/white` = bg-canvas + text-inverse, `ui-colors/black` = bg-inverse + text-primary (✅ `divider`, `pattern-dot`, `on-accent` уже привязаны к переменным) | tokens.json:41-66 |
| 🟡 | «Готово, если…» обещает иконки ≥ 3:1 и совпадение токенов Figma ↔ `tokens.json`, но ни то ни другое не проверяется автоматически | 22-Resources.mdx |
| 🟡 | Генератор хрупкий: ссылки только на 3 группы, `{space.x}` молча станет `var(--color-x)`, нет валидации схемы, тени dark = light | build-tokens.mjs:18, 63, 94, 150 |
| 🟡 | Типографика — только CSS-классы, нет составных токенов → `12px/16px`, `14px/20px` вручную ~15 раз; нет токенов opacity, z-index, размеров контролов (40/48/52/56), брейкпоинтов, фокус-кольца | atoms.css, molecules.css, organisms.css |
| 🟡 | iOS: Dynamic Type считается относительно `.body` для всех стилей, межстрочный — фиксированный; нет Reduce Motion и повышенного контраста в `YeetMotion`/`YeetColor` | YeetTokens.swift |
| 🟡 | Android: нет `YeetTheme {}` / `CompositionLocal` / маппинга в `MaterialTheme`; пример в 21-Mobile.mdx не совпадает с генерируемым кодом | YeetTokens.kt, 21-Mobile.mdx:45 |
| ⚪ | Дубли и мусор: `text-on-accent` ≡ `text-on-danger`, неиспользуемые `blue-300`, `space-28…72`; `danger` на red-600, а `danger-soft` на red-500 | tokens.json |
| ⚪ | Правило тап-зоны 40×40 ниже платформ (iOS 44 pt, Android 48 dp) | 12-Spacing.mdx:24 |

### 2.3 Компоненты и доступность

| | Находка | Где |
|---|---|---|
| 🔴 | `Field` с `onClick` — `div role="button"` без `tabIndex` и Enter/Space: «Страна», «Категория», «Цвет» не выбрать с клавиатуры | inputs.tsx:31 |
| 🔴 | Кнопка-иконка в `Field` без имени («button»); на экране входа `trailingIcon="eye"` без обработчика — показать пароль нельзя | inputs.tsx:46, Pages.stories.tsx:40 |
| 🔴 | `Sheet`/`Dialog` без модального поведения: нет `aria-modal`, фокус-ловушки, Escape, возврата фокуса, `inert` фона, API `open`/`onOpenChange` (✅ уже есть `onClose` у Sheet и тап по затемнению у Overlay) | overlays.tsx |
| 🔴 | У полей ввода нет видимого фокуса (`outline: 0` без замены) — WCAG 2.4.7 | molecules.css:15 |
| 🔴 | `OutfitCanvas` — `role="application"` без клавиатуры: вещи не фокусируются, нет стрелок / ± / Delete | canvas.tsx:76 |
| 🟠 | `SegmentControl`: `tablist` без панелей и стрелок, иконочные сегменты озвучиваются внутренним ключом; `key` передаётся спредом | selection.tsx:19-31 |
| 🟠 | `ChipGroup`: невыбранный чипс не объявлен как переключатель (`aria-pressed` undefined), идентичность по тексту, нет отдельного «удалить» | selection.tsx:55 |
| 🟠 | `ListItem radio` без `radiogroup` и стрелок; `Snackbar` без очереди и таймера, live-region монтируется вместе с текстом | selection.tsx:106, feedback.tsx:22 |
| 🟠 | Нет `loading` у Button (roadmap), `ref`/`className`/`...rest` не пробрасываются у ~15 компонентов; всё только controlled | button.tsx, data.tsx, cards.tsx… |
| 🟡 | `Screen` перерисовывает весь экран на каждое событие скролла; `useFitScale` — ResizeObserver на каждую карточку (100 вещей = 100 наблюдателей), хотя `cqw` уже используется | templates/index.tsx:37, cards.tsx |
| 🟡 | Утечки: таймеры и rAF в `DragGrid`/`useSlidingPill` не чистятся; жесты холста — щипок только одной вещью, wheel пассивный, `find(...)!` падает при удалении | DragGrid.tsx, canvas.tsx |
| 🟡 | Нет полноценного FormField (лейбл, описание, текст ошибки через `aria-describedby`); плейсхолдер вместо лейбла | inputs.tsx |
| 🟡 | CSS без `@layer`, атомы стилизуют организмы (`.y-bottom-bar`, `.y-sheet__footer` в atoms.css), цепочки специфичности перебивают `className` потребителя | atoms.css:37, molecules.css:171-186 |
| ⚪ | Разнобой имён: `tone` = размер (Stamp) / цвет (Text) / серьёзность (Dialog); `type` как вариант; `size` то буквы, то числа | — |
| ⚪ | NaN при пустых данных (`BarChart`, `RangeSlider` при min = max), Avatar без имени для скринридера, Divider «или» не озвучивается | data.tsx:50, selection.tsx:192, display.tsx |

**Чего не хватает** для флоу умного гардероба: Switch (уведомления), Checkbox (выбор вещей), TextArea (описание, чат), Skeleton,
ProgressBar (удаление фона, загрузка), Toast-очередь, ActionSheet/Menu, Tooltip, DatePicker (поездки «8–13 сент»), PageDots,
ImageViewer (зум фото вещи), Pull-to-refresh, ErrorState / OfflineState с «Повторить», Link, VisuallyHidden, FocusScope/Portal.

### 2.4 Инструменты, CI, дистрибуция

| | Находка | Где |
|---|---|---|
| 🔴 | Систему нельзя подключить: `private`, нет `exports`/типов/сборки; нативным приложениям — «скопируйте файл»; Kotlin и Swift в CI не компилируются | package.json, 21-Mobile.mdx:25 |
| 🟠 | Визуальная регрессия в CI не работает: `qa/baseline` в `.gitignore`, сравнение только при наличии эталона → «0 расхождений» всегда | .gitignore:7, run.mjs:238 |
| 🟠 | Ветки `main` нет; workflows и Pages живут на `claude/figma-access-ara4o8`; QA не обязательная проверка PR | qa.yml:5, storybook.yml:5 |
| 🟠 | Нет ESLint (react-hooks, jsx-a11y), stylelint (запрет hex / сырых px / z-index), Prettier, pre-commit | — |
| 🟠 | axe валит только `critical` (QA.md обещает 0 serious); нет play-тестов для интерактивных компонентов | run.mjs:214 |
| 🟡 | CI: нет `concurrency`/`timeout`, Chromium качается каждый раз, Storybook собирается дважды; нет `.nvmrc`/`engines`, Renovate | qa.yml |
| 🟡 | Storybook: только addon-docs; нет addon-a11y, addon-designs (Figma рядом с историей), addon-vitest; `argTypes` дублируют TS-юнионы; iframe-чанк 1.17 МБ, TTF-шрифты лежат рядом с WOFF2 (+1.5 МБ) | .storybook/main.ts |
| 🟡 | Реестр Figma ↔ код связан по имени слоя, не по node-id; `figma-specs.json`/`figma-flows.json` собраны вручную через MCP, скрипта обновления нет | registry.ts, design/*.json |
| ⚪ | `figma-guard.sh` пропускает всё, если нет `jq`; регулярки обходятся — это «лежачий полицейский», не граница безопасности | .claude/hooks/figma-guard.sh |

---

## 3. Стратегическое решение (нужно от команды)

**Кто потребитель системы?** Сейчас: дизайнеры (Figma) и iOS/Android-разработчики. React-код никто не импортирует.

Рекомендация: **Storybook остаётся эталоном поведения, а инвестиции идут в то, что попадает в приложение**:
токены как пакеты (SPM + Gradle), затем нативные компоненты `YeetUI` (SwiftUI / Compose) с тем же API, что в Storybook.
Web-пакет npm — только если появится веб-потребитель (лендинг, веб-версия, админка).

✅ Вопрос Dialog Destructive решён в `gallant-wozniak`: тоны `default` / `destructive` (серый) / `danger` (красный).

Решения (28.09):
1. **Тап-зона — да.** Визуальные размеры не меняются; зона нажатия дотягивается до 44 pt (iOS) / 48 dp (Android) невидимым hit-slop. Правило в 12-Spacing.mdx и DESIGN.md §4 — поправить в фазе 0.
2. **Бренд-палитры — эксперимент**, выбираем одну. Остаются только в web/Storybook, на iOS/Android не переносим. После выбора: палитра-победитель становится основной (или остаётся вариантом), остальные удаляются из `tokens.json`.

---

## 4. План

Оценки — в идеальных днях одного человека с агентом.

### Фаза 0 · Быстрые победы (1–2 дня) — после того как `gallant-wozniak` вольётся

Код не трогаю в этом PR: те же файлы (overlays, inputs, molecules.css, tokens) сейчас правятся в `gallant-wozniak`.

- [x] Документ аудита и план (этот файл)
- [ ] #12 CI: проверка дрейфа токенов (`npm run tokens && git diff --exit-code`), `concurrency`, `timeout-minutes`; `.nvmrc` и `engines`
- [ ] #7 `Field`: видимый фокус (`:has(:focus-visible)`), Enter/пробел и `tabIndex` для строки-кнопки, имя у кнопки-иконки, встроенный показ пароля
- [ ] #8 `ChipGroup` `aria-pressed` у всех чипсов; `SegmentControl` без спреда `key`, имя у иконочных сегментов
- [ ] #9 `Sheet`/`Dialog`: `aria-modal`, `aria-labelledby` на заголовок, Escape → `onClose`
- [ ] #11 DESIGN.md §1 и §3.1 — по фактическим `tokens.json` и странице «Ресурсы»
- [ ] #10 Тап-зона: hit-slop до 44 у кнопок S / иконок-фильтров / чипсов, правило в 12-Spacing.mdx и DESIGN.md §4
- [x] Ветка `main` — основная, защищена правилом (PR + обязательная `qa`); координация — issue #6

### Фаза 1 · Доверие к проверкам (1 неделя)

Первые три пункта — задача #13.

- Визуальная регрессия, которая реально сравнивает: Chromatic (бесплатный тариф, ревью в PR) **или** Playwright `toHaveScreenshot` в закреплённом Docker-образе с эталонами в git
- Контраст: пары генерируются из компонентных токенов (`*-fg` × `*-bg`) × все темы × бренды; уровень 3:1 для фокуса, границ, индикаторов; токен `focus-ring`
- axe: падать на `serious`; `@storybook/addon-a11y` для авторов
- ESLint (react-hooks, jsx-a11y, storybook) + stylelint (запрет hex / сырых px / z-index вне токенов) + Prettier + lefthook
- `@storybook/addon-vitest`: play-тесты для Sheet, SegmentControl, RangeSlider, OutfitCanvas, Field
- Проверка в CI, что пути `story` из `registry.ts` существуют

### Фаза 2 · Токены 2.0 (1–1.5 недели)

- Перевести `tokens.json` в **DTCG** (`$value`/`$type`, английские группы, метаданные в `$extensions.com.yeet.*`), темы и бренды — модификаторами
- Сборка на **Style Dictionary v5** вместо самописного генератора; трансформы: пружина → `linear()`, px → pt/dp/sp
- Новые категории: `opacity`, `z-index`/`layer`, `size.control.*`, `focus-ring`, `border-width`, составная `typography`, `breakpoint`
- Бренды: после выбора палитры — одна полная семантическая шкала на примитивах, остальные удалить
- Имена 1:1 с переменными Figma (развести `ui-colors/white` на роли), синхронизация через Variables REST API или Tokens Studio
- `prefers-color-scheme` и `prefers-contrast` на web; high-contrast режим

### Фаза 3 · Дистрибуция для приложений (1–2 недели) — ✅ в основном сделана в #1

Осталось: версии и релизы (Changesets, теги), asset catalog с High Contrast, публикация AAR в GitHub Packages.


- **iOS:** Swift Package `YeetTokens` — asset catalog (Any / Dark / High Contrast), шрифты как ресурсы, `Font.custom(relativeTo:)` + `@ScaledMetric`, `YeetMotion` с Reduce Motion; CI `swift build` на macOS
- **Android:** Gradle-модуль `yeet-tokens` — `YeetTheme {}`, `CompositionLocal`, маппинг в `MaterialTheme`, учёт `ANIMATOR_DURATION_SCALE`; CI `./gradlew assemble`; публикация в GitHub Packages
- Версии: Changesets + семвер + сгенерированный CHANGELOG токенов (дифф значений); теги и релизы
- Web-пакет (tsup, `exports`, `peerDependencies`, один `styles.css`) — только при появлении веб-потребителя

### Фаза 4 · Компоненты: поведение и доступность (2 недели)

- Примитивы: `useControllableState`, `FocusScope`/`Portal` (или нативный `<dialog>`), `VisuallyHidden`, общий `:focus-visible`
- `Sheet`/`Dialog`: `open`/`onOpenChange`, фокус-ловушка, Escape, клик по затемнению, `inert` фона, анимация выхода через API
- `SegmentControl` (radiogroup или APG Tabs), `RadioList`, `ChipGroup` с `value` и `onRemove`, `FormField` с ошибкой через `aria-describedby`
- `OutfitCanvas` с клавиатурой, жесты на уровне холста, чистка таймеров в `DragGrid`/`useSlidingPill`
- Единый API: `ref` + `className` + `...rest` везде, `variant`/`size`/`tone` с одним смыслом, экспортируемые типы
- Button `loading` (+ спиннер, `aria-busy`), состояния pressed / disabled в историях и Figma
- CSS: `@layer yeet.tokens, atoms, molecules, organisms`; контекстные переопределения → пропсы; `cqw` вместо `useFitScale`

### Фаза 5 · Недостающие компоненты (по мере флоу)

Приоритет — по факту макетов: на 29.09 нужных компонентов в макетах нет. Появятся кадры — заводить issue [atoms] / [molecules] с node-id.
Сверка 29.09 (#115): Animations `354:17404`, 144 кадра `design/figma-frames.json`, Настройки `513:4818`, Поездки `798:1913`, Удаление фона `349:9106`, Фильтр `414:1842`, Онбординг `388:1632`, Год рождения `586:1743`.

| Компонент | Что в макетах вместо него |
|---|---|
| Switch | в Настройках строки со стрелкой, переключателей нет |
| Checkbox | круглая галочка на `ItemCard selected`, радио в `ListItem` |
| ErrorState / Offline | кадров с ошибкой сети нет |
| Skeleton, ProgressBar | спиннер и подпись «Удаляем фон» (`LoadingState`) |
| Toast-очередь | 5 одиночных тостов, двух сразу нет (`Snackbar`) |
| TextArea | `Field multiline` |
| ActionSheet | пресет `Sheet` + `ListItem action` (9 шторок) |
| PageDots | онбординг без слайдов; листание образов без точек |
| DatePicker | даты текстом «8–13 сент · 5 ночей» (`Header` → `titleChipSub`) |
| ImageViewer | `CropFrame` |
| Tooltip, Pull-to-refresh | нет |

Не проверено: тёмная тема, прототипные связи, копии «· DS» во Flow 2.0.
Каждый — в Figma и в коде одновременно, со статусом в реестре.

### Фаза 6 · Процесс и документация (параллельно)

- Одна правда: MDX + `registry.ts` канонические; DESIGN.md сжать до указателя и ID страниц Figma, таблицы генерировать
- Статус компонента (`alpha`/`beta`/`stable`/`deprecated`) в реестре → бейдж в Storybook
- `node-id` Figma в реестре, `@storybook/addon-designs` (макет рядом с историей); скрипт выгрузки спек/якорей через REST API по расписанию
- CONTRIBUTING (как добавить компонент: Figma → реестр → код → история «В флоу» → QA), шаблон PR, CODEOWNERS, ADR вместо лога в QA.md
- Code Connect — при переходе на тариф Organization

---

## 5. Метрики готовности v1.0

- 0 нарушений axe уровня serious+; 100% интерактивных компонентов с клавиатурой и play-тестом
- Визуальная регрессия сравнивает каждый PR; дрейф токенов = красный CI
- iOS и Android подключают токены пакетом одной строкой, версия видна в релизе
- Каждый компонент: Figma node-id ↔ код ↔ история ↔ статус; DESIGN.md не дублирует Storybook
