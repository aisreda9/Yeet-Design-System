# yeet-design-system

## 0.4.0

### Minor Changes

- 3ff6586: Атомы по сверке с Figma (#151): у `Logo` новый проп `size` L (рамка 136×88) / S (61×40), `height` устарел; `Avatar.color` — только 9 цветов аккаунтов (новый тип `AvatarColor`, без grey, white, beige); `ColorDot` по умолчанию 16, обводка только у white и beige; `ScrollEdge` по умолчанию 32. Экраны не меняются: во всех местах размеры переданы явно.
- c8a06ca: Молекулы (волна 3, #152): `ListItem description` — вторая строка Caption серым (Figma: list-item · Show Description); `Hint tone="onPhoto"` — иконка 24 и gap 8, как в DS 0.2; `EmptyState` — кнопка действия по умолчанию Primary L (было Tertiary), вторичное действие — `variant: 'tertiary'`. В реестре — RadioList и FormField (`figmaId: null`), у ChipGroup указан `chip` 1137:10333; описание RangeSlider: трек чёрный, не accent.
- 4193ebc: iOS: `isLoading` у кнопок, `YeetLink`, `YeetStamp(doneSize:)` и малый штамп 64, `YeetRadioList`, `YeetFormField`, встроенный глаз пароля в `YeetField`, неуправляемый выбор (`defaultValue` / `defaultSelection`) у переключателя, чипсов и радио, отдельная кнопка «Удалить» у тега, зоны касания 44 у строк списка и сегментов.
- 1bc8287: iOS: новые организмы `YeetOutfitPager` (стопка и лента, свайп с порогом и броском), `YeetItemSlots` / `YeetItemSlot`, `YeetCropFrame`, `YeetDetailsScreen` (фото сворачивается в миниатюру 48 в шапке), `YeetVelocityTracker` и `yeetRubberBand`.
- 4f89a9c: iOS: шторка и диалог по единому правилу — все углы 48, прокрутка только тела, закреплённые шапка и футер, кнопки половинами или столбцом, рискованный диалог закрывается только кнопками, `.yeetDialog(isPresented:)`, `YeetSheet(description:label:handle:)`, `YeetDialog(cancel: nil)`.
- cb8ceef: Организмы: `ref`, `className` и атрибуты корня у всех (кроме Sheet / Dialog / Overlay / AccountsSheet — следующим PR), экспорт типов `*Props`; `StatusBar tone` (`onAccent` / `onPhoto` — устарели), `Header variant` (`type` — устарел). Стили — одной точкой входа `src/styles.css` с каскадными слоями `yeet.tokens < yeet.atoms < yeet.molecules < yeet.organisms < yeet.templates`: CSS приложения вне слоёв перебивает систему без `!important`.
- 3bc6f0f: OutfitCanvas: управление с клавиатуры (roving tabindex, стрелки, `+`/`−`, `Delete`, `Esc`, озвучка положения), щипок вторым пальцем в любом месте холста, колесо мыши без прокрутки страницы; `ref`, `className`, `...rest`, `label` у вещи.
- 540aa49: Sheet, Dialog, Overlay, AccountsSheet: `ref`, `className` и атрибуты корня; `Sheet variant` (`type` — устарел), `Dialog variant` (`tone` — устарел). Модальная область фокуса вынесена в общий примитив `useFocusScope` (`src/utils`): фокус внутрь, `inert` фона, Tab по кругу, возврат фокуса.
- fc9c0c6: Sheet Modal и Dialog на токенах шторки (#58): все 4 угла `--radius-overlay` (48), заголовок → контент и заголовок → описание 16 (`--sheet-title-gap`), хэндл `--sheet-handle` (≈ 1,5:1), верх высокой шторки — токен `--sheet-top-gap`.
- Сводка изменений волны 0.4 без отдельных записей. Экраны: все экраны флоу собраны из компонентов и есть в Storybook (≈ 85 историй), 8 шторок и диалогов на своих экранах, ссылки в текстах на атоме `Link`. Прототип «Старт / Прототип»: экраны связаны переходами, шторками и жестами, без тупиков. Android: шторка и диалог по единому правилу, доступность и API атомов и молекул, `OutfitPager`, `ItemSlots`, `CropFrame`, `DetailsScreen`, шторка на токенах. Storybook: меню «Старт» с прототипом, процессами и примитивами, шаблоны `DetailsScreen` и `Prose`. QA: play-тесты интерактивных историй в CI, workflow «QA baseline» для пересъёмки эталонов без Docker, ESLint и stylelint без предупреждений в atoms, molecules, organisms, templates, pages и scripts.
- 10eff93: Токены шторки (#58): `radius.overlay` = 48 (все углы sheet и dialog), `--sheet-top-gap` (статус-бар + 8; натив — 8 от safe area top), `--sheet-handle` / `--color-handle` (≈ 1,5:1 к фону шторки), `--sheet-title-gap` = 16. CSS, Swift, Kotlin.
- bb4fe81: Пружина шторки без перелёта (#130): `motion.spring.critical` (k 300, c 2·√300 ≈ 34.641, ζ = 1, 540 мс) → `--spring-critical`, `--spring-critical-duration`, `YeetSpring.critical`, `YeetSpring.criticalDampingRatio` / `criticalStiffness`; переход `motion.transition.sheet` → `--motion-sheet`, `YeetMotion.sheet` (Swift и Kotlin), `YeetMotionScheme.sheet()`. Генератор `linear()` считает критическое и передемпфированное затухание. Натив: шторка iOS и Android — на `YeetMotion.sheet`; Android при «Уменьшении движения» — растворение `fade` 240 мс вместо мгновенного появления.

### Patch Changes

- a4ac1ad: SegmentControl (#112): иконочный `fit` — кнопка квадратная `высота − 8`, M = 136×48, `fit` — ширина по содержимому (`width: fit-content`); пилюля активного сегмента на `--color-bg-canvas` (как в Figma). ChipGroup без `onToggle` / `value` — статичный текст, действуют только «×» и «+»; лента без интерактивных элементов фокусируется сама.
- 9bcf2f0: iOS: шторка и диалог берут радиус, отступ сверху и цвет хэндла из токенов `YeetRadius.overlay`, `YeetComponent.sheetTopGap`, `YeetComponent.sheetHandle` — хэндл теперь заметнее (D8).
- dc45bf0: Overlay: пружина шторки берётся из токена `--motion-sheet` (`motion.spring.critical`) вместо локального литерала `linear()`. Кривая та же (k 300, ζ = 1, 540 мс), сетка плотнее; при «Уменьшении движения» по-прежнему 1ms.
- 08d39cd: Удалён неиспользуемый токен `sheet-radius-bottom` (`--sheet-radius-bottom`, iOS `YeetComponent.sheetRadiusBottom`, Android `sheetRadiusBottom`): после #121 все 4 угла шторки и диалога — `--radius-overlay` (48), ссылок на токен в web и нативе не осталось. Если он где-то нужен снаружи — замена `radius.bar` / `--radius-bar` (то же значение 48).

### Токены

_начало → v0.4.0_

Первый релиз с журналом токенов: 377 значений.
