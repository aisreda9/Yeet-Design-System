# YeetDesignSystem — iOS (SwiftUI)

Нативная библиотека компонентов Yeet Design System: SwiftUI, iOS 16+, без сторонних зависимостей.
Повторяет React-компоненты из `src/atoms`, `src/molecules`, `src/organisms` (они же — библиотека Figma «Design System 2.0 (Claude)»):
**свойство Figma = prop React = параметр Swift**. Значения — только из токенов `tokens/tokens.json`.

```
native/ios/
├── Package.swift                     библиотека YeetDesignSystem (iOS 16)
└── Sources/YeetDesignSystem/
    ├── Generated/                    ← npm run tokens, руками не править
    │   ├── YeetTokens.swift          цвета light/dark, отступы, радиусы, типографика, тень, пружины, жесты, хаптика
    │   ├── YeetIcons.swift           49 иконок ui-icons → SwiftUI Path, звезда штампа, словесный знак
    │   └── YeetWeather.swift         цветные иконки погоды (asset-каталог)
    ├── Resources/                    ← npm run tokens: шрифты Inter / Roboto Slab (+ лицензии), Weather.xcassets
    ├── Foundation/                   нажатие, зона касания 44, Reduce Motion, формы, перенос строк
    ├── Atoms/                        Icon, Button, IconButton, Badge, Avatar, ColorDot, Logo, Stamp
    ├── Molecules/                    ChipGroup, SegmentControl, ListItem, ListGroup, Field, InputGroup, InputBar,
    │                                 Snackbar, EmptyState, StatTile, AccountCard, AvatarStack
    └── Organisms/                    Sheet, Dialog, Overlay, AccountsSheet, Header, TabBar, BottomNav,
                                      ItemCard, OutfitCollage, WeatherCard
```

У каждого компонента есть `#Preview` (Xcode 15+): откройте `native/ios/Package.swift` в Xcode и выберите файл компонента.

## Установка (Swift Package Manager)

**По URL репозитория.** Xcode → File → Add Package Dependencies… → URL репозитория → продукт `YeetDesignSystem`.
SPM читает `Package.swift` из корня репозитория — он указывает на исходники в `native/ios/Sources`.

```swift
// Package.swift приложения
dependencies: [
    .package(url: "https://github.com/<org>/Yeet-Design-System.git", branch: "main"),
],
targets: [
    .target(name: "App", dependencies: [.product(name: "YeetDesignSystem", package: "Yeet-Design-System")]),
]
```

**Локально** (разработка библиотеки рядом с приложением): Xcode → File → Add Package Dependencies… → Add Local… → папка `native/ios`.

Шрифты Inter и Roboto Slab лежат в ресурсах пакета и регистрируются сами при первом использовании
(`YeetFonts.register()`), `Info.plist → UIAppFonts` не нужен.

## Использование

```swift
import SwiftUI
import YeetDesignSystem

struct WardrobeScreen: View {
    @State private var tab: YeetTab = .wardrobe
    @State private var segment = "items"
    @State private var showFilters = false

    var body: some View {
        ScrollView {
            VStack(spacing: YeetSpace.s20) {
                YeetSegmentControl(segments: [
                    YeetSegment(value: "items", label: "Вещи"),
                    YeetSegment(value: "outfits", label: "Образы"),
                ], value: $segment)
                YeetChipGroup(chips: [YeetChip(label: "Сезон", dropdown: true)], onToggle: { _ in showFilters = true })
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 7), GridItem(.flexible())], spacing: 7) {
                    YeetItemCard(kind: .top, color: .blue)
                    YeetItemCard(kind: .shoe, discount: "-10%")
                }
            }
            .padding(.horizontal, YeetSpace.screenGutter)
        }
        .safeAreaInset(edge: .top, spacing: 0) {
            YeetHeader(type: .large(title: "Гардероб", action: YeetHeaderAction(icon: .search, label: "Поиск")))
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            YeetBottomNav(active: $tab, fab: true, onFab: { /* добавить вещь */ })
        }
        .background(YeetColor.bgCanvas)
        // Модальный слой — на корень экрана, чтобы накрыл и нижнюю навигацию
        .yeetOverlay(isPresented: $showFilters) {
            YeetSheet(title: "Сезон", footer: (YeetFooterAction(label: "Сбросить"), YeetFooterAction(label: "Применить", onClick: { showFilters = false }))) {
                YeetChipGroup(chips: [YeetChip(label: "Весна", selected: true), YeetChip(label: "Лето")], wrap: true)
            }
        }
    }
}
```

Токены напрямую:

```swift
Text("Гардероб")
    .yeetText(YeetType.h1)                    // Roboto Slab 380, 32/36, −1, Dynamic Type по кривой .largeTitle
    .foregroundStyle(YeetColor.textPrimary)   // тёмная тема — автоматически

RoundedRectangle(cornerRadius: YeetRadius.lg).fill(YeetComponent.cardBg)

stamp.animation(YeetMotion.stamp, value: done)           // пружина Figma Bouncy (mass 1, stiffness 600, damping 15)
YeetSpring.quick.animation                                // .interpolatingSpring(mass:stiffness:damping:)
YeetSpring.quick.spring                                   // iOS 17: SwiftUI.Spring(mass:stiffness:damping:)
YeetHaptic.select()                                       // tokens.motion.haptic → UIFeedbackGenerator
```

## Соответствие React ↔ Swift

Имена типов — с префиксом `Yeet`, чтобы не конфликтовать со SwiftUI (`Button`, `List`, `ControlSize`, `ButtonStyle`).
Параметры совпадают с props один в один. Отличия, продиктованные платформой:

- `value` + `onChange` (контролируемое состояние) → `Binding` (`value: $x`, `active: $tab`, `query: $text`);
- `children` → `@ViewBuilder content` или строка первым аргументом (`YeetButton("Войти")`, `YeetBadge("-10%")`);
- `ReactNode`-слоты `leading` / `trailing` / `center` → `AnyView`; `footer` коллажа → `@ViewBuilder`;
- строковые URL картинок (`src`, `image`, `photo`) → `Image` — загрузку и кеш делает приложение;
- `className`, `style`, HTML-атрибуты — нет (модификаторы SwiftUI); `disabled` → `.disabled(true)`.

| React (web) | Swift | Параметры (= props) |
|---|---|---|
| `Icon` | `YeetIcon` | `name: YeetIconName`, `size` 24, `title`, `strokeWidth` 1.3 |
| `Logo` | `YeetLogo` | `height` |
| `ColorDot` | `YeetColorDot` | `color: YeetItemColor`, `size` |
| `Button` | `YeetButton` | `variant: YeetButtonStyle`, `size: YeetControlSize` (`.s .m .l .xl`), `leftIcon`, `rightIcon`, `fullWidth`, `floating`, `action` |
| `IconButton` | `YeetIconButton` | `icon`, `label`, `variant` (.tertiary), `size` (.m), `floating`, `decorative`, `action` |
| `Badge` | `YeetBadge` | `variant: YeetBadgeVariant` (primary, danger, secondary, muted, tertiary, ghost) |
| `Avatar` | `YeetAvatar` | `size: YeetAvatarSize`, `initial`, `src: Image?`, `alt`, `color` |
| `AvatarStack` | `YeetAvatarStack` | `accounts: [YeetAccount]`, `onOpen`, `onAdd` |
| `Stamp` | `YeetStamp` | `label`, `tone: YeetStampTone`, `icon` (.thumbDown), `done`, `action` |
| `Chip` (тип) | `YeetChip` + `YeetChipButton` | `label`, `selected`, `removable`, `colorDot`, `dropdown` |
| `ChipGroup` | `YeetChipGroup` | `chips`, `onToggle`, `onAdd`, `wrap`, `center` |
| `SegmentControl` / `Segment` | `YeetSegmentControl` / `YeetSegment` | `segments`, `value: Binding<String>`, `size`, `fit` |
| `ListItem` | `YeetListItem` | `type: YeetListItemType` (action, expandable, radio), `label`, `icon`, `expanded`, `checked`, `description`, `leading`, `trailing`, `onClick` |
| `List` / `ListGroup` | `YeetList` / `YeetListGroup` | `content` |
| `Field` | `YeetField` | `label`, `value`, `colorDot`, `trailingIcon`, `onTrailingClick`, `input: YeetFieldInput?`, `error`, `onClick` |
| `InputGroup` | `YeetInputGroup` | `size: YeetInputGroupSize` (.m .l .xl), `content` |
| `InputBar` | `YeetInputBar` | `placeholder`, `value: Binding<String>`, `fieldIcon`, `leading` / `trailing: YeetBarAction`, `send: YeetSendAction`, `size` |
| `Snackbar` | `YeetSnackbar` | `onClose`, `onUndo`, `content`; переход `.transition(.yeetSnackbar)` |
| `EmptyState` | `YeetEmptyState` | `title`, `description`, `action: YeetEmptyStateAction` |
| `StatTile` / `StatRow` | `YeetStatTile` / `YeetStatRow` | `label`, `value` |
| `AccountCard` | `YeetAccountCard` | `account`, `kind: YeetAccountCardKind` (current, other, settings), `onClick`, `onEdit`, `onSettings`, `onSignOut` |
| `Sheet` | `YeetSheet` | `title`, `description`, `type: YeetSheetType` (modal, panel), `footer: (YeetFooterAction, YeetFooterAction)?`, `onClose`, `label`, `handle`, `content` |
| `Dialog` | `YeetDialog` | `tone: YeetDialogTone` (default, destructive, danger), `title`, `description`, `cancel` (без него — одна кнопка), `confirm`, `onCancel`, `onConfirm`, `handle` (нет), `dismissible`, `content` |
| `Overlay` | `.yeetOverlay(isPresented:)`, `.yeetDialog(isPresented:)` | + `dismissOnTap`, `dragToDismiss` (свайп вниз, порог 30 % / 500 pt/с, пауза > 80 мс — не бросок) |
| `AccountsSheet` | `YeetAccountsSheet` | `accounts`, `onEdit`, `onSettings`, `onSwitch(id)`, `onAdd` |
| `Header` | `YeetHeader(type:)` | `.large(title:subtitle:accent:action:)`, `.bar(title:titleChip:titleChipSub:center:onBack:actions:)`, `.back(title:onBack:textAction:)`, `.search(query:placeholder:onBack:filters:)` |
| `TabBar` / `Tab` | `YeetTabBar` / `YeetTab` | `active: Binding<YeetTab>`, `initial` |
| `BottomNav` | `YeetBottomNav` | `active: Binding<YeetTab>`, `fab`, `onFab` |
| `ItemArt` / `Garment` | `YeetItemArt` / `YeetGarment` | `kind`, `color`, `size`, `src`, `alt` |
| `ItemCard` | `YeetItemCard` | `kind`, `color`, `image`, `discount`, `label`, `name`, `selected: Bool?`, `onClick`, `onRemove` |
| `OutfitCollage` / `CollageLayer` | `YeetOutfitCollage` / `YeetCollageLayer` | `items: [YeetCollageItem]`, `label`, `footer` |
| `WeatherCard` / `WeatherIcon` | `YeetWeatherCard` / `YeetWeatherIcon` | `temperature`, `description`, `weather: YeetWeather`, `icon`, `alert`, `tilt` |

Токены: `--color-*` → `YeetColor.*`, `--button-*` / `--card-*` / `--sheet-*` → `YeetComponent.*`, `--space-N` → `YeetSpace.sN`,
`--radius-*` → `YeetRadius.*`, `.y-h1…caption` → `YeetType.*` + `.yeetText(_:)`, `--motion-*` → `YeetMotion.*`,
`--spring-*` → `YeetSpring.*`, `--gesture-*` → `YeetGesture.*`, `--shadow-floating` → `.yeetFloatingShadow()`, хаптика → `YeetHaptic.*`.

Пока не перенесены (есть в React): `RangeSlider`, `Carousel`, `BarChart`, `UsageMeter`, `Hint`, `LoadingState`, `PhotoTile`,
`PhotoArea`, `ProductCard`, `ChatBubble`, `BottomBar`, `StylistDock`, `OutfitCanvas`, `TripCard`, `StylistPromptCard`, бренд-темы (`data-brand`),
сворачивание шапки при скролле.

## Шторки и диалоги

По «Единому правилу шторки» (`design/SHEETS-AUDIT.md`, решения владельца в #58):

- плавающая карточка 8 от краёв, **все углы 48** (концентрично экрану), снизу `max(8, safe area)`, над клавиатурой 8, сверху не выше статус-бара + 8;
- хэндл → 16 → заголовок → 16 → [описание → 20] → контент → 16 → футер; без хэндла заголовок на 20 от верха;
- хэндл, заголовок и футер закреплены, прокручивается только тело; пока тело влезает, оно тянет шторку вместе с шапкой;
- кнопки футера — равные половины через 7, если подписи влезают, иначе столбец во всю ширину;
- закрытие одним путём (свайп, затемнение, «escape», крестик, «Отмена») — колбэк шторки вызывается один раз;
  рискованный диалог (`destructive`, `danger`) закрывается только кнопками и «escape»;
- шторка — пружина без перелёта, диалог — `YeetMotion.appear`, уход — `YeetMotion.exit`, при Reduce Motion — растворение.

Пока токенов `radius-overlay`, `sheet-top-gap`, `sheet-handle` нет в `tokens.json`, их значения — в `YeetOverlayToken` (`Organisms/Sheet.swift`, TODO #92).

## Доступность

- **VoiceOver:** у кнопок-иконок обязательный `label`; выбранные чипсы, сегменты, вкладки, радио — трейт `isSelected`;
  заголовки — `isHeader`; sheet и dialog — `isModal`, при появлении VoiceOver переходит в шторку (у диалога — на безопасное действие),
  закрываются жестом «escape» (Z двумя пальцами); Snackbar с текстом озвучивается при появлении.
- **Dynamic Type:** `yeetText(_:)` масштабирует размер, межстрочный интервал и трекинг по кривой `textStyle` стиля
  (H1 — `.largeTitle`, H2 — `.title`, H3 — `.title3`, Body — `.body`, Caption — `.caption`); кнопки растут по высоте (`minHeight`).
- **Зона касания ≥ 44 pt:** `yeetHitArea` расширяет форму нажатия мелких элементов (кнопки S 40, «×», иконки в snackbar) без изменения вида.
- **Reduce Motion:** пилюли, штамп, sheet, FAB и галочки меняются мгновенно, нажатие без сжатия
  (`@Environment(\.accessibilityReduceMotion)`; для своих экранов — `.yeetAnimation(_:value:)` и `yeetWithAnimation(_:reduceMotion:_:)`).

## Как перегенерировать токены, иконки и ресурсы

```bash
npm run tokens
```

Одна команда (`scripts/build-tokens.mjs` → `scripts/build-ios.mjs`) из общих источников обновляет:

| Источник | Результат |
|---|---|
| `tokens/tokens.json` | `Generated/YeetTokens.swift` (и `tokens/ios/YeetTokens.swift` — копия для проектов без пакета, шрифты из `Bundle.main`) |
| `src/icons/icons.ts`, `src/icons/brand.ts` | `Generated/YeetIcons.swift` — SVG-контуры (M L H V C S Q T Z, `circle`, `g translate`) → `Path`; обводка `stroke-linecap/linejoin/dasharray` и заливка — из SVG |
| `src/icons/weather/*.svg`, `weatherNames` в `src/atoms/icon.tsx` | `Resources/Weather.xcassets` (вектор сохраняется) + `Generated/YeetWeather.swift` |
| `tokens/fonts/*.ttf` | `Resources/Fonts` |

Новая иконка: добавьте её в `src/icons/icons.ts` и запустите `npm run tokens` — появится `YeetIconName.<camelCase>`.
Генератор падает с понятной ошибкой на неподдержанных элементах SVG (например, дугах `A` или `transform` кроме `translate`).
CI (`.github/workflows/ios.yml`) проверяет, что сгенерированные файлы закоммичены, и собирает оба манифеста под iOS Simulator.

Ограничения: CoreSVG в asset-каталоге не рисует фильтры SVG — мягкая тень под облаками в иконках погоды не видна.
