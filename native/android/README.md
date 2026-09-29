# Yeet Design System — Android (Jetpack Compose)

Нативная библиотека компонентов Yeet DS для Android. Источник правды — `tokens/tokens.json`, `DESIGN.md`
и React-компоненты в `src/atoms`, `src/molecules`, `src/organisms` (они повторяют Figma-библиотеку
«Design System 2.0 (Claude)»). Имена совпадают 1 : 1: **свойство Figma = prop React = параметр Kotlin**.

```
native/android/
├── yeet-design-system/            # Android-библиотека (namespace design.yeet.ds)
│   └── src/main/
│       ├── java/design/yeet/tokens/YeetTokens.kt    ← генерируется (npm run tokens)
│       ├── java/design/yeet/ds/icons/YeetIcons.kt   ← генерируется (npm run tokens)
│       ├── java/design/yeet/ds/{theme,icons,atoms,molecules,organisms}/…
│       └── res/font/{inter_variable,roboto_slab_variable}.ttf  ← копируются из tokens/fonts
└── sample/                        # витрина всех компонентов (light / dark / бренды)
```

- minSdk 26, compileSdk 35, Kotlin 2.0.21, AGP 8.7.3, Compose BOM 2024.12.01.
- Зависимости библиотеки: только Compose (`ui`, `foundation`, `material3` как база) + `ui-tooling-preview` для `@Preview`.
  Sample дополнительно использует `activity-compose`.

## Подключение

**Как модуль (Gradle include)** — в `settings.gradle.kts` приложения:

```kotlin
include(":yeet-design-system")
project(":yeet-design-system").projectDir = file("../Yeet-Design-System/native/android/yeet-design-system")
```

```kotlin
// app/build.gradle.kts
dependencies { implementation(project(":yeet-design-system")) }
```

Модулю нужен version catalog с алиасами из `native/android/gradle/libs.versions.toml` (или замените `libs.*` на координаты).

**Через Maven Local:**

```bash
cd native/android
./gradlew :yeet-design-system:publishToMavenLocal   # design.yeet:yeet-design-system:0.3.0
```

```kotlin
repositories { mavenLocal() }
dependencies { implementation("design.yeet:yeet-design-system:0.3.0") }
```

Витрина: `./gradlew :sample:installDebug`.

## Использование

```kotlin
setContent {
    YeetTheme {                                    // light / dark по системе; brand = YeetBrand.Lime …
        Box(Modifier.fillMaxSize().background(YeetTheme.colors.bgCanvas)) {
            LazyColumn(contentPadding = PaddingValues(top = 120.dp, bottom = 120.dp)) { /* контент */ }
            Header(HeaderType.Large(title = "Гардероб", action = HeaderAction(IconName.More, "Ещё")))
            BottomNav(active = Tab.Wardrobe, fab = true, onFab = { open = true }, modifier = Modifier.align(Alignment.BottomCenter))
        }
        Overlay(visible = open, onClose = { open = false }) {
            Sheet(title = "Сезон", footer = FooterAction("Сбросить") to FooterAction("Применить")) {
                ChipGroup(chips = seasons, onToggle = ::toggle, wrap = true)
            }
        }
    }
}
```

`Header`, `BottomNav`, `BottomBar` рисуют полосу затухания за своими границами (web: `ScrollEdge`) — ставьте их
**после** скроллящегося контента в `Box`, как `position: fixed` в вебе.

### Тема

| Что | Доступ | Источник |
|---|---|---|
| Цвета light / dark (+ 5 брендов) | `YeetTheme.colors.accent`, `LocalYeetColors` | `tokens.color`, `tokens.brand` |
| Компонентные цвета | `YeetTheme.colors.buttonPrimaryBg`, `cardBg`… | `tokens.component` |
| Типографика H1–H3, Body, Caption | `YeetTheme.typography.h1` | `tokens.typography`, Roboto Slab + Inter (переменные шрифты, вес через `FontVariation`) |
| Отступы, радиусы | `YeetTheme.space.s20`, `YeetTheme.radius.xl` | `tokens.space`, `tokens.radius` |
| Тень shadow/floating | `Modifier.yeetFloatingShadow(shape)` | `tokens.shadow` (setShadowLayer, API 28+; на 26–27 без тени) |
| Движение | `YeetTheme.motion.nav()` → `spring(dampingRatio, stiffness)`; `press()` → `tween` | `tokens.motion` |
| Хаптика | `YeetTheme.haptics.perform(YeetHapticEvent.Select)` | `tokens.motion.haptic` (с `androidMin` / `androidFallback`) |

Material3 внутри `YeetTheme` получает `ColorScheme` и `Typography`, собранные из токенов, — стандартные M3-компоненты не выбиваются.

### Доступность

- **TalkBack:** у `IconButton` обязательный `label`; `Icon(title = …)` — иначе декоративная; роли и состояния — `Role.Tab` + selected
  (SegmentControl, TabBar), `RadioButton` (ListItem Radio), stateDescription (Expandable), `liveRegion` (Snackbar, LoadingState),
  `heading()` у H1–H3, `paneTitle` у Sheet / Dialog, `error()` у Field.
- **Масштаб шрифта:** текст в `sp`, высоты кнопок / полей / строк — минимальные (`heightIn`), при крупном шрифте компоненты растут.
- **Зона нажатия 48 dp:** элементы меньше 48 dp (IconButton S 40, чипсы 40, иконки в Snackbar) расширяют зону нажатия
  автоматически (`ViewConfiguration.minimumTouchTargetSize`) без изменения раскладки — как `::after` 44 в вебе.
- **Уменьшить движение:** `rememberReduceMotion()` следит за `Settings.Global.ANIMATOR_DURATION_SCALE`
  («Убрать анимацию»); при 0 все переходы — `snap()`, спиннер стоит, подъём без увеличения.
- **Хаптика** уважает системный «Виброотклик»; `select` — не чаще раза в 50 мс; выключается `YeetTheme(hapticsEnabled = false)`.

## React ↔ Compose

| React (`src/`) | Compose (`design.yeet.ds.*`) | Отличия |
|---|---|---|
| `<Icon name size title strokeWidth>` | `Icon(IconName.X, size, title, strokeWidth)` | имя `'chevron-up-down'` → `IconName.ChevronUpDown` (`IconName.fromKey`) |
| `<Logo height>` | `Logo(height, tint)` | |
| `<Button variant size leftIcon rightIcon fullWidth floating>` | `Button(text, onClick, variant = ButtonStyle.*, size = ControlSize.*, …)` | children → `text` или слот `content` |
| `<IconButton icon label variant size floating decorative>` | `IconButton(icon, label, onClick, …)` | |
| `<Stamp label tone icon done>` | `Stamp(label, onClick, tone = StampTone.*, icon, done)` | хаптика `stamp` в пик пружины (120 мс) |
| `<Badge variant>` | `Badge(text, variant = BadgeVariant.*)` | |
| `<Avatar size initial src alt color>` | `Avatar(size = AvatarSize.*, initial, src: Painter?, alt, color: YeetItemColor?)` | `src` — `Painter` (загрузка картинок — в приложении) |
| `<AvatarStack accounts onOpen onAdd>` | `AvatarStack(accounts, onOpen, onAdd)` | |
| `<Divider label>`, `<ColorDot>`, `<ScrollEdge>`, `<Text variant tone>` | `Divider(label)`, `ColorDot`, `ScrollEdge`, `Text(text, variant, tone)` | `Text(tone = null)` наследует цвет |
| `<Field label value colorDot trailingIcon onTrailingClick input error onClick>` | `Field(…, input = FieldInput(value, onValueChange, …))` | + `trailingLabel` для TalkBack |
| `<InputGroup size>` | `InputGroup(size = InputGroupSize.*) { Field(…) }` | разделители рисуются автоматически |
| `<InputBar placeholder value onChange fieldIcon leading trailing send size>` | `InputBar(…, leading = BarAction(…), send = SendAction(…))` | |
| `<SegmentControl segments value onChange size fit>` | `SegmentControl(segments = listOf(Segment(…)), value, onChange, size, fit)` | пилюля — пружина `nav` |
| `<ChipGroup chips onToggle onAdd wrap center>` | `ChipGroup(chips = listOf(Chip(…)), onToggle, onAdd, wrap, center, bleed)` | `bleed` = выход за поля (web: −gutter) |
| `<ListItem type label icon expanded checked description leading trailing onClick>` | `ListItem(label, type = ListItemType.*, …)` | `leading` / `trailing` — слоты |
| `<ListGroup>` | `ListGroup { ListItem(…) }` | |
| `<StatTile label value>`, `<StatRow>` | `StatTile(label, value)`, `StatRow { … }` | ширина делится поровну |
| `<Hint icon>`, `<Snackbar onClose onUndo>`, `<EmptyState title description action>`, `<LoadingState label>` | `Hint(text)`, `Snackbar(text, onClose, onUndo)`, `EmptyState(…, action = EmptyStateAction(…))`, `LoadingState(label)` | |
| `<AccountCard account kind onClick onEdit onSettings onSignOut>` | `AccountCard(account, kind = AccountCardKind.*, …)` | `Account.photo: Painter?` |
| `<Sheet title description type footer onClose label handle>` | `Sheet(title, type = SheetType.*, footer = a to b, onClose, description, label, handle) { … }` | шапка и футер закреплены, тело — `verticalScroll` (не кладите внутрь `LazyColumn`); кнопки футера — половины или столбец |
| `<Dialog tone title description cancel confirm onCancel onConfirm>` | `Dialog(title, cancel, confirm, tone = DialogTone.*, …)` | без хэндла; `cancel = null` — одна кнопка; `Destructive` / `Danger` в `Overlay` закрываются только кнопками, «Назад» → `onCancel` |
| `<Overlay onClose>` | `Overlay(visible, onClose) { Sheet / Dialog }` | окно Dialog: затемнение `bgOverlay`, пружина без перелёта, свайп вниз (из тела — через nested scroll), «Назад», TalkBack «Закрыть»; `WindowInsets` статус-бара, навигации и IME |
| `<AccountsSheet accounts onEdit onSettings onSwitch onAdd>` | `AccountsSheet(accounts, …)` | |
| `<Header type="large" …>` | `Header(HeaderType.Large(title, subtitle, accent, action))` | тип — sealed-класс: `Large`, `Bar`, `Back`, `Search` |
| `<TabBar active initial onChange>`, `<BottomNav active fab onFab onTabChange>`, `<BottomBar>` | `TabBar`, `BottomNav`, `BottomBar` | `Tab.Today…Profile` |
| `<ItemCard kind color image discount label name selected onClick onRemove>` | `ItemCard(Garment.*, …, image: Painter?)` | |
| `<OutfitCollage items label footer>`, `CollageItem` | `OutfitCollage(items, label, footer)`, `CollageItem(kind, x, y, size, color, src)` | `x`, `y` — % |
| `<WeatherCard temperature description weather icon alert tilt>` | `WeatherCard(…, weather = Weather.*, icon, weatherIcon: Painter?, alert, tilt)` | цветные SVG погоды не портированы (фильтры / маски не поддерживаются VectorDrawable) — передайте `weatherIcon` |

Не портировано (нет в объёме этой версии): RangeSlider, Carousel, BarChart, UsageMeter, PhotoTile, PhotoArea,
ProductCard, TripCard, StylistPromptCard, ChatBubble, OutfitCanvas, StylistDock, Flag, WeatherIcon, сворачивание шапки при скролле.

## Превью

У каждого компонента — `@YeetPreviews` (Light + Dark, ширина 393 как фреймы Figma) в том же файле.

## Перегенерация токенов, иконок и шрифтов

```bash
npm run tokens
```

`scripts/build-tokens.mjs` (+ `scripts/android.mjs`) пишет:

- `tokens/android/YeetTokens.kt` и его копию `yeet-design-system/src/main/java/design/yeet/tokens/YeetTokens.kt` — цвета, бренды,
  компонентные токены, отступы, радиусы, типографика, `YeetMotion` / `YeetMotionScheme` (пружины Figma → `spring(dampingRatio, stiffness)`),
  жесты, хаптика (`YeetHaptic`, `YeetHapticEvent` с fallback для API < 30 / 34), тень;
- `yeet-design-system/src/main/java/design/yeet/ds/icons/YeetIcons.kt` — `IconName` и пути из `src/icons/icons.ts`
  (окружности → дуги, `translate` → группы, `stroke-dasharray` раскладывается на отрезки) + словесный знак и звезда штампа из `src/icons/brand.ts`;
- `yeet-design-system/src/main/res/font/*.ttf` — из `tokens/fonts`.

Сгенерированные файлы не правятся руками; CI (`.github/workflows/android.yml`) проверяет, что они совпадают с источниками,
и собирает `assembleDebug` библиотеки и sample.
