# Инвентаризация перед волной 2 · 28.09.2026

Роль: аудитор (только чтение кода и Figma). Состояние: `main` @ `df30b0c`.
Источники правды: Figma `1LAkot5WySMWhwiiFJqJ0e` — New app design `70:12` (144 исходных кадра), секции «Claude · DS 2.0» `1168:12824` (Light) и `1173:7887` (Dark),
страница DS 2.0 `942:5666`, страница Animations `354:17404`; в коде — `src/**`, `design/figma-flows.json`, `src/docs/registry.ts`.

Проверки на `main` во время аудита: `build-storybook` ✓, `flow-diff` ✓ — 22 кадра, 175 якорей, 0 расхождений, 23 осознанных.
Как собрано: метаданные страниц (XML) разобраны скриптом; все 144 исходных кадра и ~23 копии «· DS» просмотрены скриншотами; код проверен grep по `var(--…)`, пропсам и импортам.

> Легенда решений: **удалить** · **оставить** (с причиной) · **сделать** (задача волны 2, номер issue — в §7).

---

## 0. Главное

1. **Экранов в Figma — 83 полноэкранных кадра, в Storybook — 42 истории**, из них 22 сверяются `flow-diff` (только текстовые якоря). 48 полноэкранных кадров не имеют истории (§3.2).
2. **Скролл деталей сделан не так, как в Figma.** В макетах панель с хэндлом **наезжает на фото**, а фото/коллаж **сжимается в миниатюру 48 в шапке** (`349:9258 → 349:9976`, `349:10430`, `503:1150 → 503:1311`, `349:10770`; Animations `354:17405 → 354:17449`). В коде фото просто уезжает под шапку, миниатюра проявляется прозрачностью; морф есть только в демо `PhotoCollapse` (§4).
3. **Четыре механики из Figma живут только в демо `src/motion`:** смена образа вертикальным свайпом (главная, «Удиви меня»), сворачивание фото в миниатюру, листание поводов («С чем носить»), push/pop. На экранах `src/pages` ни одна не применена (§5).
4. **Из 13 «недостающих» компонентов аудита по макетам встречаются только Link и (частично) ActionSheet-пресет.** Switch, Checkbox, Skeleton, ProgressBar, Tooltip, DatePicker, PageDots, ImageViewer, Pull-to-refresh, ErrorState, очередь тостов — **ни в одном кадре** (§2). Зато найдены реальные пробелы: вертикальный пейджер образов, ряд-слоты выбора вещей, рамка обрезки фото, длинный текстовый документ (Legal), описание под заголовком Sheet.
5. **Мёртвые токены:** `blue-300`, `red-500`, `neutral-500`, `space-0/1/2/28/40/48/52/56/64/72`, `font-weight-h1/h3/caption` — ни одной ссылки ни в web, ни в iOS/Android (§1.3).
6. **Локальные стили экранов лежат в CSS системы:** `.y-today*`, `.y-slot*`, `.y-stylist-avatar` — в `organisms.css`; `.y-profile-*`, `.y-settings-footer`, `.y-legal` — в `templates.css`; 19 inline-стилей в `Pages.stories.tsx`; Splash и PhotoCrop собраны без `Screen` (§3.3).
7. **Копии «· DS» в Figma местами теряют содержимое** (Item Filter, Color, how-work, Apple-логотип, 👎 на штампе, ссылки) — нужна правка в Figma под замком (§3.4).

---

## 1. Лишнее: компоненты, варианты, пропсы, токены

### 1.1 Компоненты

| Компонент | Где используется | Решение |
|---|---|---|
| `Text` (`display.tsx:64`) | только `Text.stories.tsx`; экраны и компоненты пишут `<h1 className="y-h1">`, `<p className="y-body …">` (Pages:29, 30, 111, 114, 131, 134, 138, 426, 537 и др.) | **удалить** или сделать обязательным. Рекомендация — удалить: канонические классы `.y-h1…y-caption` уже везде, в Figma компонента нет (только text styles); поправить `11-Typography.mdx:14` |
| `Badge`, `ColorDot`, `ScrollEdge`, `WeatherIcon`, `TabBar`, `CollageLayer` | не в Pages, но используются внутри других компонентов (напр. Badge → ItemCard `cards.tsx:119`, OutfitCollage `:199`) | **оставить** — строительные блоки |
| `StylistDock` | только Pages:313, своей истории нет | **оставить**, добавить историю (есть во флоу `699:2676`) |
| `Row` | Pages:79, 298, 684 | **оставить** |
| `DragGrid` (`src/motion`) | только демо; перестановки сетки долгим нажатием нет ни в одном кадре Figma | **оставить как демо**, в `mechanics` пометить «не во флоу» |
| `PageStackDemo` (push/pop) | только демо | **оставить** — это правило для натива, не компонент |
| Реестр `registry.ts` | нет строк для `Flag`, `StatRow`, `List`, `Overlay`, `ItemArt`, `StylistDock`, `Sticky`, `Text`, `Badge`-вариантов; связь по имени слоя, без node-id | **сделать**: дополнить реестр, добавить `figmaId` (#31) |

### 1.2 Варианты и пропсы

«Figma» — есть ли вариант на странице DS 2.0 `942:5666`. Не используемое нигде, кроме своей истории / демо:

| Компонент · вариант/проп | Figma | Решение |
|---|---|---|
| Button `inverse`, `XL`, `floating` | все 7 стилей и Size=XL есть (`942:6953`) | **оставить** — паритет с Figma; Inverse нужен на тёмных/фото-подложках |
| IconButton `inverse`, `soft`, `destructive` | все 7 стилей есть (`942:7068`) | **оставить** (паритет с Figma) |
| Badge `primary`, `tertiary`, `ghost` | все 6 стилей есть (`942:7125`) | **оставить** (паритет) |
| Avatar `S` | есть (`968:3666`) | **оставить** |
| Stamp `tone="secondary"`, `done` | есть (`1004:5021`), во флоу `798:1741`, `252:268` | **оставить**; экраны должны их применять (§5). Во флоу done-штамп двух размеров: 78 на главной (`252:286`), **56** в деталях образа (`440:3008`) — в коде только 78 → **сделать** размер S |
| Stamp `icon` | — | **оставить** (одна иконка по умолчанию, проп дешёвый) |
| Field `multiline`, `error` | Input Size=Multiline есть (`1182:20099`); error — нет | multiline **оставить** (во флоу «Комментарий» `503:1070`); error **оставить** до FormField (аудит §2.3) |
| InputGroup `size` M/L | Size=L/M/XL есть (`942:7264`) | **оставить** (паритет), но в макетах только XL |
| SegmentControl `XL` | Size=XL есть (`942:7195`), в макетах нет | **оставить** (паритет) |
| ListItem `description`, `leading` | вариантов нет (`960:2963`), во флоу нет | **удалить** |
| RangeSlider `step`, `format` | — | **оставить** (API для рублей/шага) |
| Chip `editing`, `colorDot` | Editing есть (`1137:10333`); цвет — во флоу `586:2057` | **оставить** |
| Hint `default` | Tone=Default есть (`1183:20594`) | **оставить** |
| Snackbar `autoHide` | — | **оставить**; включить на экране Toast (сейчас только в демо) |
| Dialog default с двумя кнопками | Tone=Default (`962:3136`), во флоу `349:10496`, `517:6986` | **оставить**; экраны «Выйти», «Несохранённые изменения» — §3.2 |
| Sheet `onClose`, `handle` | Show Handle, Show Close (`962:3095`) | **оставить** |
| BottomBar `disabled` | — | **оставить** (форма «Новая вещь» до заполнения) |
| WeatherCard `weather`, `icon`, `alert` | alert во флоу `295:488` | **оставить**; экран Rain Alert — §3.2 |
| TripCard `label`, UsageMeter `label`, BarChart `height`, Screen `floatingOffset` | — | **оставить** (служебные) |
| ItemCard `image`, PhotoArea `image`, ProductCard `image` | фото вещей во флоу | **оставить** — нужны для реальных фото |
| Row `align`, Icon `title`, ScrollEdge `offset`, TabBar `initial`, Note `className`, ItemArt `alt`, PhotoTile `label/onClick`, OutfitThumbnail `onClick`, StylistPromptCard `onClick`, AccountCard `onSignOut`, Header `onBack/onQueryChange/placeholder` | нигде не передаются, даже в историях | `onBack`, `onClick`, `onSignOut`, `onQueryChange` — **оставить** (поведение, экраны статичны); `ScrollEdge offset`, `Row align`, `Icon title`, `TabBar initial` — **удалить** или применить (TabBar `initial` нужен для «М»/«С» — **оставить**) |

### 1.3 Токены

Метод: ссылки `var(--name)` по `src/**/*.{css,ts,tsx,mdx}` без `tokens.generated.css`, ссылки внутри `tokens.json`, использование в `native/` и `tokens/ios|android`.

| Токен | Web | Через другие токены | iOS / Android | Решение |
|---|---|---|---|---|
| `--yeet-blue-300` | 0 | 0 | генерируется `YeetPrimitive.blue300`, не используется | **удалить** |
| `--yeet-red-500` | 0 | 0 (значение `#FF4230` продублировано литералом в `item.red` и `danger-soft`) | — | **удалить** или сослаться на него из `item.red`/`danger-soft` (рекомендация: сослаться — уйдёт дубль литерала) |
| `--yeet-neutral-500` | 0 | 0 (`#777777` литералом в `item.grey`) | — | то же: сослаться из `item.grey` |
| `--space-0`, `-1`, `-2` | 0 | 0 | 0 | **удалить** |
| `--space-28`, `-40`, `-48`, `-52`, `-56`, `-64`, `-72` | 0 | 0 | 0 (Android `YeetSpace` не используется вовсе, отступы литералами dp) | **удалить**. 40/48/52/56 — это высоты контролов: вынести в `size.control.*` (аудит, фаза 2), а не держать в space |
| `--space-32` | 1 (`templates.css:67`, профиль) | — | 0 | **оставить** |
| `--font-weight-h1`, `-h3`, `-caption` | 0 (классы `.y-h*` в generated.css с числом `380`) | — | — | **сделать**: генерировать классы через `var(--font-weight-*)` или **удалить** токены |
| `--motion-page`, `--motion-swap`, `--motion-return`, `--gesture-target-scale`, `--gesture-long-press` | только `src/motion` (демо) | — | есть в натив | **оставить** — станут живыми, когда механики применят на экранах (§5) |
| `--gesture-touch-slop/-swipe-*/-rubber-band/-snackbar` | 0 `var()` — JS читает `tokens.json` напрямую (`utils/gesture.ts:7`) | — | используются | **оставить** (нужны нативу) |
| `--yeet-item-purple/pink/red` | динамически (`display.tsx:22, 46`), в экранах не передаются | — | — | **оставить** (палитра цветов вещей `586:2057`) |

Все `--color-*`, `--button-*`, `--card-*`, `--sheet-*`, `--radius-*`, `--shadow-floating`, `--screen-*` используются.

---

## 2. Недостающие компоненты — по макетам

Просмотрены все 144 кадра New app design. «Нет» — не встречается ни в одном кадре.

### 2.1 Кандидаты из аудита §2.3

| Кандидат | Во флоу | Доказательство | Решение |
|---|---|---|---|
| Switch | нет | «Уведомления» в настройках — строка со ↗ (`513:4818`) | не делать |
| Checkbox | нет | выбор вещей — `ItemCard selected` (`414:1750`, `414:1842`) | не делать |
| TextArea | покрыто | «Комментарий» — `Field multiline` (`503:1070`); чат — `InputBar` (`413:846`) | не делать |
| Skeleton | нет | — | не делать |
| ProgressBar | нет | удаление фона — `LoadingState` (`349:9106`) | не делать |
| Toast-очередь | нет | все тосты одиночные: `337:2531`, `555:4092`, `555:4116`, `443:3284`, `341:6188` | не делать; Snackbar хватает |
| ActionSheet / Menu | **как пресет** | 9 шторок «действия»: `551:3746`, `337:2567`, `555:4098`, `305:1472`, `456:1053`, `305:1528`, `455:1007`, `349:8618`, `555:4123` — все Sheet + ListItem action | отдельный компонент не нужен; **история-пресет** «Sheet / Действия» (§7 O3) |
| Tooltip | нет | (i) в шапке поездок (`798:1832`) открывает шторку how-work, не тултип | не делать |
| DatePicker | нет | даты поездки только текстом «8-13 сент» (`798:1913`); год рождения — radio-список (`586:1743`) | не делать |
| PageDots | нет | онбординг без слайдов (`388:1632`) | не делать |
| ImageViewer | нет | вместо него — **рамка обрезки** (см. 2.2) | не делать |
| Pull-to-refresh | нет | — | не делать |
| ErrorState / Offline | нет | — | не делать до появления в макетах (вопрос в #6) |
| **Link** | **да** | инлайн-ссылки в юр. подписи `203:1372` (+`591:3306`, `591:3427`, `593:3710`), в диалоге удаления `517:7004`, `555:4234` (кадр `517:6999`), e-mail в Legal `513:6603`, `513:6707` | **сделать** atom `Link` (сейчас — `.y-legal a` в CSS) |

### 2.2 Найдено в макетах, нет в DS

| Элемент | Кадры (node-id) | Сейчас в коде | Решение |
|---|---|---|---|
| **Вертикальный пейджер образов**: коллаж 353, превью 96 соседних сверху/снизу, свайп, штамп, погода | главная `232:1355`, `295:488`, `252:268`; «Удиви меня» `798:1741`; Animations «scale» `354:17678 → 354:17767` | статичная разметка `.y-today` (organisms.css:294) на экране; жест только в демо `TodayDemo` (Motion.stories:103) | **сделать** организм `OutfitPager` (#25) |
| **Горизонтальный пейджер образов + лента поводов + лента вещей** («С чем носить») | `463:1534`; Animations `798:2215 / 798:2274 / 799:2433` | только демо `PagerDemo` (Motion.stories:251); экрана нет | **сделать** (O1 — горизонтальный режим того же пейджера; экран — S3) |
| **Ряд-слоты выбора вещей**: карточка по центру, соседние обрезаны, карточка «+» | `414:1459` (ряды `414:1476`, `414:1499`, пустой `414:1491`), `414:1541` | локальные `.y-slots/.y-slot` в `organisms.css:300-306` | **сделать** организм `ItemSlots` (#27) |
| **Рамка обрезки фото** (уголки, затемнение, перемещай/масштабируй) | `261:1590` | экран `PhotoCrop` без рамки, собран без `Screen` (Pages:695) | **сделать** организм `CropFrame` (#27) |
| **Шаблон «медиа + наезжающая панель + миниатюра в шапке»** | `349:9258 → 349:9976`, `349:8637 → 349:10430` (мини-коллаж `349:10441`), `503:1150 → 503:1311`, New Item `349:10770`, `503:1070` | `Header centerOnScroll` + фото в потоке; морф — демо `CollapseDemo` | **сделать** шаблон `DetailsScreen` (#29) |
| **Длинный текстовый документ** (H1, дата, нумерованные H2, абзацы, маркированные списки, ссылки) | Legal `513:6603` (4078 px), `513:6707` (5058 px) — **единственные кадры без копии «· DS»** | нет | **сделать** шаблон `Prose`/`LegalScreen` (#30) |
| Описание под заголовком Sheet | `513:6256` (Валюта: абзац-пояснение) | у `Sheet` нет слота (`description` есть только у `Dialog`, `overlays.tsx:75`) | **сделать** проп `description` у Sheet (#27) |
| Штамп done размера 56 | `440:3008` (кадр `440:2953`) | только 78 | **сделать** (#22) |
| Аватар стилиста 64 в чате | `413:846`, `699:2858` | локальный `.y-stylist-avatar` (organisms.css:253) | **сделать** `ChatBubble` аватар по умолчанию (#27) |
| Подвал настроек (Logo, юр. строка со ссылками, версия, «Удалить аккаунт» ниже фолда) | `513:4818` (блок `678:1447`, кнопка `586:2798`) | `.y-settings-footer` в templates.css | **оставить** в экране, перенести стиль в `pages.css` (#28) |

Покрыто DS (проверено, нового не нужно): чип со счётчиком «Категория · 2» — текст в label (`414:1750`); однострочные чипсы со скроллом — `ChipGroup` без `wrap` = `.y-chip-group--scroll` (`selection.tsx:70`); «×5» на карточке — `ItemCard label` (Badge) (`798:1961`); × на фото — `PhotoArea onRemove`; WeatherCard alert — проп `alert`; поиск в шторке — Sheet + InputBar (`513:5823`); сетка цветов — chip `colorDot` (`586:2057`); ввод своего повода — chip `editing` (`349:11268`); «Показать ещё» — Button (`798:2034`); выбор пола/года — Sheet + ChipGroup / radio (`586:1686`, `586:1743`); системная клавиатура — `system / keyboard` (`951:3442`, не компонент продукта).

---

## 3. Экраны

### 3.1 Сводка

| | Кол-во |
|---|---|
| Исходных кадров New app design | 144 (83 полноэкранных, 61 оверлей: шторки, диалоги, тосты) |
| С копией «· DS» (Flow 2.0 на компонентах) | 142 (нет только Legal `513:6603`, `513:6707`); в Dark — 14 |
| Историй в `Pages.stories.tsx` | 42 (некоторые — композиция экрана + оверлея) |
| Историй, сверяемых `flow-diff` | 22 — все «ок» |
| Полноэкранных кадров без истории | 48 |
| Историй без исходного кадра | `ProfileSingle`, `AccountsSingle` (есть только копия `1147:7208`), `PasswordRecoverySent` |

Полная таблица кадр → копия DS → история → flow-diff — в **Приложении А**.

### 3.2 Экраны без истории (48), по разделам

- **Гардероб / Вишлист / Архив / Корзина (18):** Outfits Populated `261:1987`, Outfits Empty `261:2297`, Items No Filter Results `349:11566`, Outfits No Filter Results `349:11679`, Item Search: Query Focused `334:2187`, Results `334:2305`, No Results `342:7355`; **Item Details** `349:9258` / `349:9976` (Scrolled); Wishlist Outfits `507:3764`, Items Empty `261:2349`, Outfit Details `503:1432`, New Item Empty `503:987` / Completed `503:1070`; Archive Empty `337:2455`; Trash Empty `551:3619` / Populated `551:3727`.
- **Новая вещь / Создание образа (14):** New Item V01/V02 — No Photo `349:10556` `306:2030`, Photo Added `440:2620` `349:9163`, Name Focused `440:2702` `349:10770`, Completed `440:2780` `349:11824`, Removing Background V01 `349:10596`; Canvas Default `414:1679`, Gesture Hint `414:1605`, Items Selected `414:1541`.
- **Главная / Стилист / Поиск / Онбординг (14):** Rain Alert `295:488`, Wear Action Active `252:268`, «Occasion Selector Open» `232:1441` (по содержимому = Rain Alert); «Удиви меня» `798:1741`, `798:1783`, `798:2034`, Конструктор `463:1520` (пустой); «С чем носить» `463:1534` (назван Trips / List); Trip Details Items `798:1950`; Assistant `413:846`, Greeting `449:3330`; Search Text Query Focused `259:601`, Photo Query Focused `261:1216`; Onboarding Name `203:1424`, First Outfit `203:1559`.
- **Профиль / Legal (3):** Profile Edit Avatar Added `586:2733`; Legal Privacy `513:6603`, Terms `513:6707`.
- **Оверлеи без истории**, которые меняют экран (не просто список): Dialog Unsaved Changes `349:10496`, `349:10508`, Sign Out `517:6986`, Clear Outfit `349:10758`; Item Filter Sheet `414:1842`; Category with Selection `349:10989`; Birth Year `586:1743`; Avatar Add/Replace `586:2705`, `586:2717`; Custom Occasion `632:6450`, `632:6477`.

### 3.3 Локальная разметка на экранах

| Экран (история) | Инлайн-стили | Локальные классы / сырой HTML | Что сделать |
|---|---|---|---|
| Today | 0 | `.y-today`, `__weather`, `__stamp` (organisms.css:294-297) | → `OutfitPager` (#25) |
| OutfitItems | 0 | `.y-slots`, `.y-slot`, `__row`, `__add` (organisms.css:300-306), пустой `<span />`-распорка | → `ItemSlots` (#27) |
| Stylist | 1 (распорка `minHeight 180`) | `.y-stylist-avatar` (organisms.css:253) | → ChatBubble (#27) |
| OutfitDetails | 1 (штамп `absolute top 160`) | `section.y-section`, `h3.y-h3` | → `DetailsScreen` со слотом штампа (#29) |
| ItemDetails, NewItem | 1 | `.y-gutter`, `section.y-section` | → `DetailsScreen` (#29) |
| Splash, PhotoCrop | 2 + 2 | рамка экрана вручную (`width/height/radius 56`), без `Screen` | `Screen` с вариантом фона (accent / фото) (#28) |
| Settings | 0 | `.y-stack-8`, `.y-settings-footer` (templates.css:53) | стиль → `src/pages/pages.css` (#28) |
| Profile* | 2 | `.y-profile-bar/-panel/-summary` (templates.css:65-69), `span.y-h2` в footer | → `pages.css` (#28) |
| SignIn | 1 | `.y-legal` + `<a>` | → `Link` (#22) |
| OnboardingWelcome, SearchEmpty, SearchDiscover, WardrobeEmpty, Wishlist, ProfileEdit, Canvas | 1–2 | отрицательные margin / обёртки `div` | подобрать через `Screen` / `Stack` gap (#28) |

Итого 19 инлайн-стилей (Pages:29, 30, 45, 97, 113, 142, 168, 205, 228, 284, 286, 297, 303, 430, 447, 479, 551, 695, 698).

### 3.4 Figma: копии «· DS» расходятся с исходниками

| Копия | Исходник | Что не так |
|---|---|---|
| `1174:16605` Item Filter Sheet | `414:1842` | 393×240 вместо 714: пропала сетка вещей и кнопки, 4 чипса |
| `1173:14464` Edit Item / Color | `586:2057` | 192 вместо 308: обрезаны 12 цветов |
| `1149:4079` how work (+Dark `1173:8058`) | `1126:10577` | шторка обрезана: второй AccountCard срезан, нет «Добавить аккаунт» |
| `1173:20639` Sign In | `203:1372` | нет логотипа Apple на кнопке, нет разделителя в InputGroup |
| `1176:20595` «С чем носить» | `463:1534` | на чёрном штампе нет 👎 |
| `1144:3684` Price Filter | `261:1493` | «60 000 ₽» обрезано правым краем |
| `1147:7332` Delete Account | `517:6999` | ссылки не подчёркнуты, StatTile M вместо L |
| `1147:7271`, `1176:11722`, `1176:11772` диалоги | `555:4196`, `349:10508`, `798:1995` | исходник — нижняя шторка с хэндлом, копия — плавающий Dialog. Решение дизайна нужно (вопрос в #6) |
| `1173:22216`, `1174:21691` шаги создания | `414:1459`, `414:1605` | другие иконки шагов, выбран не тот шаг |
| `1149:4140` Settings | `513:4818` | фото-аватар → буква, зеркальная иконка выхода |

Ошибки в самих исходниках (только для сведения, исходники не правим): имя `232:1441` ≠ содержимое; `463:1534` назван Trips / List, а это «С чем носить»; `798:1995` назван Exit, а это «Удиви меня»; `414:1541` «Items Selected» — всё пусто; `586:2166` Season с заголовком «Цвет»; `790:1913` кнопка «Войти» вместо «Отправить код»; `555:4116` «удалена навсегда» с кнопкой отмены; `555:4196` разрушительное действие не destructive.

---

## 4. Скролл и шапка

Прототипных ключевых кадров в файле нет: `get_motion_context` для страницы Animations и экранов (`354:17405`, `232:1355`, `349:10430`) возвращает пусто. Поведение при скролле восстановлено по парам кадров Default → Scrolled и по Animations.

| Экран | Figma: что происходит | Код сейчас (`Screen`, `Header`, `Sticky`) | Статус |
|---|---|---|---|
| Корневые вкладки с большим заголовком (Гардероб `203:1691`, Вишлист `456:1073`, Профиль `699:6406`, Стилист `699:2676`, Поиск `261:1867`) | контент уходит под шапку; кадров «Scrolled» для них **нет** | `Header large` + `data-collapsed` после 24 pt: H1 → пилюля по центру (organisms.css:36-59) | сделано; поведение — решение кода, в Figma не нарисовано (задокументировать в Figma — F1) |
| Фильтры Гардероба (`334:2123`) | ряд чипсов выходит за край → горизонтальный скролл; прилипание не нарисовано | `<Sticky>` + `.y-chip-group--scroll` | сделано |
| Вишлист: вложенный сегмент (`456:1073`) | — | `<Sticky>` | сделано |
| **Детали вещи** (`349:9258 → 349:9976`; Wishlist `503:1150 → 503:1311`) | панель с хэндлом поднимается с y511 до y138 **поверх фото**; фото → **миниатюра 48 по центру шапки** (`349:10424`, `503:1392`); back/More остаются; BottomBar закреплён (`503:1420`) | фото в потоке уезжает под шапку; `centerOnScroll` проявляет `ItemArt` прозрачностью (organisms.css:47, 59); панель — обычный Sheet panel в потоке | **не как в Figma**: нет наезда панели и морфа (#29) |
| **Детали образа** (`349:8637 → 349:10430`) | коллаж → **мини-коллаж 48** в шапке (`349:10441`–`10445`); штамп внутри скролла уезжает с контентом | миниатюра — одна вещь (`ItemArt kind="top"`), не коллаж; штамп `position:absolute` (Pages:142) | **не как в Figma** (#29) |
| **Новая вещь** (`349:9163 → 349:10770`, `503:987 → 503:1070`) | при фокусе/скролле фото улетает в миниатюру шапки, поля поднимаются | `Header bar titleChip` без `centerOnScroll`; фото в потоке | **не сделано** (#29) |
| **Главная** (`232:1355`) | вертикальная стопка образов: превью сверху/снизу, свайп (Animations «scale») | статичная разметка, жеста нет | **только демо** `OutfitSwap` (#25) |
| «С чем носить» (`463:1534`) | горизонтальные ленты: образы, поводы, вещи (Animations `798:2215…`) | экрана нет | **только демо** `OccasionPager` (O1, S3) |
| Создание образа: слоты (`414:1459`) | горизонтальные ряды вещей, секции уходят под BottomBar | статичный ряд `.y-slot__row`, горизонтального скролла нет | не сделано (#27) |
| Профиль (`699:6406`, 3164 px) | панель уходит под шапку, карусели горизонтальные | `Sheet panel` в потоке + `Carousel` (snap) | сделано |
| Стилист / Каталог (`699:2676`, 1363 px) | сетка скроллится, док прибит к низу | `StylistDock` в `bottom` | сделано |
| Настройки (`513:4818`) | подвал ниже фолда (`678:1447`) | в потоке | сделано |
| Шторки с длинным списком (Валюта `513:6256`, Год `586:1743`) | список длиннее шторки | Sheet скроллится внутри | сделано (проверить на Валюте — истории со всем списком нет) |
| Legal (`513:6603`, `513:6707`) | длинный документ | экрана нет | не сделано (#30) |

Документация `14-Scroll.mdx` в таблице «Что происходит при скролле» заявляет для деталей «Фото уходит вверх, панель поднимается · Миниатюра 48» — формулировка совпадает с Figma, но реализация — нет. После S2 обновить (#31).

---

## 5. Анимации и переходы: Figma → демо → экран

Источник Figma — страница Animations `354:17404` (пары состояний Smart Animate), таблица кода — `src/motion/motion.ts` (`motions`, `mechanics`).

| Механика | Figma | Демо (`Motion.stories.tsx`) | На экране `src/pages` |
|---|---|---|---|
| Сворачивание фото в миниатюру | «new things» `354:17405 → 354:17449` | `PhotoCollapse` (`.y-collapse`, motion.css:45) | **нет** — ItemDetails/OutfitDetails без морфа |
| Смена образа (стопка, scale) | «scale» `354:17678 → 354:17767` | `OutfitSwap` (TodayDemo) | **нет** — Today статичен; `--motion-swap` только в демо |
| Штамп «Надеть» → done | «dropdown → active button» `354:17504 → 354:17591` | `StampPress` | **нет** — на Today и OutfitDetails `Stamp` без `onClick`/`done`; компонент умеет |
| Таб-бар → FAB | «default → things» `458:1256 → 458:1342` | `NavFab` | в компоненте `BottomNav fab` ✓; экраны статичны (вкладки не переключаются) |
| Листание образов и поводов | «Stylist / Trips / List» `798:2215 → 798:2274 → 799:2433` | `OccasionPager` | **нет** — экрана «С чем носить» нет; `--motion-page` только в демо |
| Шапка при скролле, липкие фильтры | не нарисовано (решение кода) | `HeaderScroll` | ✓ Header large + Sticky на Гардеробе, Вишлисте |
| Шторка: появление / уход / смахивание | — | `SheetDismiss` | ✓ в `Overlay`; интерактивно только на Профиле (`onClose` передан 1 из 9 `Overlay` в Pages) |
| Snackbar, подсказка, загрузка | — | `Feedback` | Snackbar ✓ (Toast, без `autoHide`); LoadingState ✓ (NewItem) |
| Холст: подъём, бросок, щипок | «Gesture Hint» `414:1605` (подсказка) | `CanvasGesture` | ✓ Canvas (`OutfitCanvas`) |
| Профиль: аккаунты и период | — | `ProfileAccounts` | ✓ Profile* |
| Сегмент и радио | — | `Selection` | ✓ в компонентах |
| Нажатие, лайк, галочка | — | `Press` | ✓ в компонентах |
| Перестановка сетки (DragGrid) | **нет во флоу** | `DragDrop` | — (оставить как демо) |
| Push / pop, свайп назад | — | `PushPop` | — (правило для натива) |

Вывод: из пяти переходов страницы Animations на экранах применён один (таб-бар → FAB, и то без переключения вкладок). Остальные четыре — только демо.

---

## 6. Порядок и зависимости

| Волна 1 (открыто) | Зоны | Что блокирует во волне 2 |
|---|---|---|
| #7 (PR #19), #8 (PR #15) | molecules, screens (Pages.stories) | #23 (molecules), #28 (screens) — после них |
| #9 (PR #26) | organisms (`overlays.tsx`, `organisms.css`) | #25, затем #27 — после |
| #10 | atoms | #22 — после |
| #11 (PR #17) | docs (DESIGN.md) | #31 — после; #21 меняет `tokens.json` → таблицы #11 перегенерировать |
| #12 (PR #18) | infra | — |
| #13 (PR #16) | qa | #32 — после |

Сразу, параллельно волне 1: **#21** (tokens), **#24** (motion). Цепочки внутри зоны — строго по очереди: organisms #25 → #27; screens #28 → #29 → #30.
Замок Figma нужен только **#33**.

---

## 7. Задачи волны 2

Созданы 28.09; порядок — комментарий в #6.

| Код | Issue | Зона | Задача |
|---|---|---|---|
| T1 | #21 | tokens | Мёртвые токены и литералы-дубли |
| A1 | #22 | atoms | `Link`, штамп done S (56), удалить `Text` |
| M1 | #23 | molecules | ListItem без `description`/`leading`; ChipGroup-скролл внутри Sheet (`414:1842`) |
| MO1 | #24 | motion | Вынести жесты демо в переиспользуемые хуки (`useSwipePager`, `usePhotoCollapse`) |
| O1 | #25 | organisms | `OutfitPager`: вертикальная стопка образов (+ горизонтальный режим) вместо `.y-today` |
| O2 | #27 | organisms | `ItemSlots`, `CropFrame`, `Sheet description`, аватар стилиста; убрать экранные стили из organisms.css |
| S1 | #28 | screens | `pages.css`, без инлайн-стилей, Splash/PhotoCrop через `Screen`, Pages.stories по разделам |
| S2 | #29 | screens | `DetailsScreen`: панель наезжает на фото, фото → миниатюра 48 (вещь, образ, новая вещь) |
| S3 | #30 | screens | Недостающие экраны (48) + якоря flow-diff |
| D1 | #31 | docs | Реестр (node-id, недостающие строки), 14-Scroll, 16-Motion «демо / на экране» |
| Q1 | #32 | qa | Покрытие экранов: отчёт кадр Figma ↔ история, проверка story-путей реестра |
| F1 | #33 | Figma (замок) | Починить копии «· DS» (§3.4), Legal в DS, нарисовать поведение шапки при скролле |

---

## Приложение А. Кадры New app design → Flow 2.0 → Storybook → flow-diff

«Копия DS» — node-id кадра в секции `1168:12824` (+Dark — есть копия в `1173:7887`). «История» — экспорт в `src/pages/Pages.stories.tsx`.

| Кадр | Имя | Тип | Копия DS | История | flow-diff |
|---|---|---|---|---|---|
| `203:1599` | App / Splash / Default | экран 393×852 | 1173:18160 | Splash | — |
| `337:2567` | Archive / Item / Sheet / Actions | оверлей 377×152 | 1173:16608 | — | — |
| `555:4092` | Archive / Item / Toast / Moved to Trash | оверлей 353×52 | 1176:11849 | — | — |
| `337:2455` | Archive / Items / Empty | экран 393×852 | 1142:3181 | — | — |
| `334:2391` | Archive / Items / Populated | экран 393×852 | 1142:3268 | Archive | ✓ |
| `790:1913` | Auth / Password Recovery / Email Focused | экран 393×852 | 1173:21481 | PasswordRecovery | — |
| `591:3427` | Auth / Sign In / Credentials Filled | экран 393×852 | 1173:21019 | SignIn | — |
| `591:3306` | Auth / Sign In / Email Partial | экран 393×852 | 1173:20790 | SignIn | — |
| `203:1372` | Auth / Sign In / Empty | экран 393×852 | 1173:20639 | SignIn | ✓ |
| `593:3710` | Auth / Sign In / Password Visible | экран 393×852 | 1173:21250 | SignIn | — |
| `513:6603` | Legal / Privacy Policy / May 2026 | экран 393×4078 | — | — | — |
| `513:6707` | Legal / Terms of Use / May 2026 | экран 393×5058 | — | — | — |
| `440:2780` | New Item / Details / Completed Variant 01 | экран 393×852 | 1174:18824 | — | — |
| `349:11824` | New Item / Details / Completed Variant 02 | экран 393×852 | 1174:21302 | — | — |
| `440:2702` | New Item / Details / Name Focused Variant 01 | экран 393×852 | 1174:18405 | — | — |
| `349:10770` | New Item / Details / Name Focused Variant 02 | экран 393×852 | 1174:20883 | — | — |
| `349:10556` | New Item / Details / No Photo Variant 01 | экран 393×852 | 1174:17332 | — | — |
| `306:2030` | New Item / Details / No Photo Variant 02 | экран 393×852 | 1174:19818 | — | — |
| `440:2620` | New Item / Details / Photo Added Variant 01 | экран 393×852 | 1174:18042 | — | — |
| `349:9163` | New Item / Details / Photo Added Variant 02 | экран 393×852 | 1174:20520 | — | — |
| `341:7119` | New Item / Details / Sheet / Category Expanded | оверлей 377×336 | 1173:17360 | — | — |
| `632:6664` | New Item / Details / Sheet / Category Root | оверлей 393×368 | 1144:3161 +Dark | — | — |
| `349:10596` | New Item / Photo / Removing Background Variant 01 | экран 393×852 | 1174:17689 | — | — |
| `349:9106` | New Item / Photo / Removing Background Variant 02 | экран 393×852 | 1174:20167 | NewItem | ✓ |
| `306:2010` | New Item / Photo / Sheet / Add | оверлей 377×221 | 1173:16837 | — | — |
| `203:1457` | Onboarding / First Item / Prompt | экран 393×852 | 1173:21880 | FirstItemPrompt | — |
| `564:5134` | Onboarding / First Item / Sheet / Add Photo | оверлей 393×225 | 1147:3351 | — | — |
| `203:1559` | Onboarding / First Outfit / Preview | экран 393×852 | 1173:21962 | — | — |
| `203:1424` | Onboarding / Name / Focused | экран 393×852 | 1173:21671 | — | — |
| `388:1632` | Onboarding / Welcome / Default | экран 393×852 | 1158:4483 | OnboardingWelcome | ✓ |
| `414:1679` | Outfit Creation / Canvas / Default | экран 393×852 | 1174:21939 | — | — |
| `414:1750` | Outfit Creation / Canvas / Filtered | экран 393×852 | 1174:22173 | Canvas | ✓ |
| `414:1605` | Outfit Creation / Canvas / Gesture Hint | экран 393×852 | 1174:21691 | — | — |
| `349:10758` | Outfit Creation / Clear / Dialog / Confirmation | оверлей 393×180 | 1176:11751 | — | — |
| `414:1386` | Outfit Creation / Criteria / Default | экран 393×852 | 1174:22446 | OutfitCriteria | ✓ |
| `586:2337` | Outfit Creation / Criteria / Sheet / Occasion Filter | оверлей 377×212 | 1173:14171 | — | — |
| `349:10975` | Outfit Creation / Criteria / Sheet / Season Filter | оверлей 377×168 | 1173:13791 | — | — |
| `349:10508` | Outfit Creation / Exit / Dialog / Unsaved Changes | оверлей 393×180 | 1176:11722,1176:11772 | — | — |
| `798:1995` | Outfit Creation / Exit / Dialog / Unsaved Changes | оверлей 393×200 | 1176:11722,1176:11772 | — | — |
| `414:1842` | Outfit Creation / Item Filter / Sheet / Bottoms | оверлей 393×714 | 1174:16605 | — | — |
| `414:1541` | Outfit Creation / Item Selection / Items Selected | экран 393×852 | 1173:22050 | — | — |
| `414:1459` | Outfit Creation / Item Selection / Ready to Continue | экран 393×852 | 1173:22216 | OutfitItems | ✓ |
| `349:10989` | Outfit Creation / Items / Sheet / Category with Selection | оверлей 393×420 | 1173:17042 | — | — |
| `349:10496` | Outfit Creation / Shuffle / Dialog / Unsaved Changes | оверлей 377×192 | 1147:7311 | — | — |
| `232:1441` | Outfits / Everyday / Occasion Selector Open | экран 393×852 | 1173:16493 | — | — |
| `295:488` | Outfits / Everyday / Rain Alert | экран 393×852 | 1173:16259 | — | — |
| `632:6450` | Outfits / Everyday / Sheet / Custom Occasion Name Empty | оверлей 393×489 | 1174:15483 | — | — |
| `632:6477` | Outfits / Everyday / Sheet / Custom Occasion Name Entered | оверлей 393×489 | 1174:15648 | — | — |
| `632:6408` | Outfits / Everyday / Sheet / Occasion Filter | оверлей 393×176 | 1173:14091 | — | — |
| `632:6432` | Outfits / Everyday / Sheet / Occasion Presets | оверлей 393×180 | 1144:3546 | — | — |
| `232:1355` | Outfits / Everyday / Sunny | экран 393×852 | 1173:16144 +Dark | Today | ✓ |
| `252:268` | Outfits / Everyday / Wear Action Active | экран 393×852 | 1173:16374 | — | — |
| `203:1108` | Outfits / Recommendations / Empty Wardrobe | экран 393×852 | 1173:19455 | RecommendationsEmpty | — |
| `1126:10532` | Profile / Accounts / Sheet / List | оверлей 377×296 | 1147:7151 +Dark | AccountsMulti | — |
| `551:2198` | Profile / Analytics / Sheet / Period | оверлей 377×168 | 1147:3417 | PeriodSheet | — |
| `586:2705` | Profile / Avatar / Sheet / Add | оверлей 393×225 | 1173:16863 | — | — |
| `586:2717` | Profile / Avatar / Sheet / Replace | оверлей 393×285 | 1173:16889 | — | — |
| `586:2733` | Profile / Edit / Avatar Added | экран 393×852 | 1176:19604 | — | — |
| `533:7636` | Profile / Edit / No Avatar | экран 393×852 | 1168:4851 | ProfileEdit | ✓ |
| `586:1743` | Profile / Edit / Sheet / Birth Year | оверлей 393×516 | 1147:3559 | — | — |
| `586:1686` | Profile / Edit / Sheet / Gender | оверлей 377×124 | 1147:3502 | — | — |
| `586:1700` | Profile / Edit / Sheet / Style | оверлей 377×168 | 1173:14403 | — | — |
| `699:6406` | Profile / Overview / Analytics | экран 393×3164 | 1149:3669 +Dark | ProfileAnalytics | — |
| `261:1867` | Search / Discover / Default | экран 393×852 | 1141:2700 | SearchDiscover | ✓ |
| `261:1590` | Search / Photo / Crop | экран 393×852 | 1176:19019 | PhotoCrop | — |
| `261:1216` | Search / Photo / Query Focused | экран 393×852 | 1173:14911 | — | — |
| `260:1103` | Search / Photo / Results | экран 393×852 | 1173:14753 | PhotoResults | — |
| `564:5123` | Search / Photo / Sheet / Add | оверлей 393×225 | 1173:16811 | — | — |
| `578:1460` | Search / Photo / Sheet / Replace | оверлей 393×285 | 1147:3377 | — | — |
| `341:6188` | Search / Result Item / Toast / Moved to Wishlist | оверлей 353×56 | 1176:11864 | — | — |
| `261:1493` | Search / Results / Sheet / Price Filter | оверлей 377×188 | 1144:3684 | PriceFilter | — |
| `261:1441` | Search / Results / Sheet / Sorting | оверлей 377×168 | 1144:3485 | — | — |
| `260:964` | Search / Text / No Results Filtered | экран 393×852 | 1141:3067 | SearchEmpty | ✓ |
| `259:601` | Search / Text / Query Focused | экран 393×852 | 1173:14557 | — | — |
| `260:804` | Search / Text / Results | экран 393×852 | 1141:2876 +Dark | SearchResults | ✓ |
| `513:5823` | Settings / Country / Sheet / Default | оверлей 393×702 | 1147:3725 | CountrySheet | — |
| `513:5957` | Settings / Country / Sheet / Search Focused | оверлей 393×702 | 1174:16113 | — | — |
| `513:6256` | Settings / Currency / Sheet / Default | оверлей 393×702 | 1174:16325 | CurrencySheet | — |
| `517:6999` | Settings / Delete Account / Dialog / Confirmation | оверлей 377×468 | 1147:7332,1176:11793 +Dark | DeleteAccount | — |
| `1017:9276` | Settings / Delete Account / Dialog / Confirmation | оверлей 393×440 | 1147:7332,1176:11793 +Dark | DeleteAccount | — |
| `513:4818` | Settings / Main / Default | экран 393×852 | 1149:4140 +Dark | Settings | ✓ |
| `517:6986` | Settings / Sign Out / Dialog / Confirmation | оверлей 393×200 | 1147:7244 | — | — |
| `413:846` | Stylist / Assistant / Input Focused | экран 393×852 | 1176:19708 | — | — |
| `699:2676` | Stylist / Catalog / Input Focused | экран 393×1363 | 1173:18217 +Dark | StylistHome | ✓ |
| `449:3330` | Stylist / Home / Greeting Entered | экран 393×852 | 1176:19877 | — | — |
| `699:2858` | Stylist / Home / Message Ready | экран 393×852 | 1176:20046 | Stylist | ✓ |
| `463:1520` | Stylist / Outfit of the Day / Default | экран 393×852 | 1176:20253,1176:20319,1176:20445,1176:20521 | — | — |
| `798:1741` | Stylist / Outfit of the Day / Default | экран 393×852 | 1176:20253,1176:20319,1176:20445,1176:20521 | — | — |
| `798:1783` | Stylist / Outfit of the Day / Default | экран 393×852 | 1176:20253,1176:20319,1176:20445,1176:20521 | — | — |
| `798:2034` | Stylist / Outfit of the Day / Default | экран 393×852 | 1176:20253,1176:20319,1176:20445,1176:20521 | — | — |
| `798:1950` | Stylist / Trip Details / Items Tab | экран 393×852 | 1168:4679 | — | — |
| `798:1913` | Stylist / Trip Details / Outfits Tab | экран 393×852 | 1177:13116 | TripDetails | ✓ |
| `463:1534` | Stylist / Trips / List | экран 393×852 | 1168:4579,1176:20595 | — (по содержимому «С чем носить», не Trips) | — |
| `798:1832` | Stylist / Trips / List | экран 393×852 | 1168:4579,1176:20595 | Trips | ✓ |
| `555:4098` | Trash / Item / Sheet / Actions | оверлей 377×152 | 1144:3131 | — | — |
| `555:4116` | Trash / Item / Toast / Deleted Permanently | оверлей 353×52 | 1176:11854 | — | — |
| `555:4196` | Trash / Items / Dialog / Clear Confirmation | оверлей 393×200 | 1147:7271 +Dark | ClearTrash | — |
| `551:3619` | Trash / Items / Empty | экран 393×852 | 1142:3342 | — | — |
| `551:3727` | Trash / Items / Populated | экран 393×852 | 1142:3407 | — | — |
| `586:1956` | Wardrobe / Edit Item / Sheet / Category Expanded | оверлей 393×348 | 1173:17210 | — | — |
| `586:2057` | Wardrobe / Edit Item / Sheet / Color | оверлей 393×308 | 1173:14464 | — | — |
| `586:2166` | Wardrobe / Edit Item / Sheet / Season | оверлей 393×176 | 1173:13856 | — | — |
| `337:2531` | Wardrobe / Item / Toast / Moved to Archive | оверлей 353×52 | 1176:11844 | Toast | — |
| `555:4123` | Wardrobe / Item Details / Sheet / Actions | оверлей 393×252 | 1173:16760 | — | — |
| `349:9258` | Wardrobe / Item Details / Variant 01 | экран 393×852 | 1143:2840 +Dark | — | — |
| `349:9976` | Wardrobe / Item Details / Variant 02 | экран 393×852 | 1174:19290 | — | — |
| `342:7355` | Wardrobe / Item Search / No Results | экран 393×852 | 1173:15414 | — | — |
| `334:2187` | Wardrobe / Item Search / Query Focused | экран 393×852 | 1173:15144 | — | — |
| `334:2305` | Wardrobe / Item Search / Results | экран 393×852 | 1173:15337 | — | — |
| `261:2185` | Wardrobe / Items / Empty | экран 393×852 | 1141:2088 | WardrobeEmpty | ✓ |
| `349:11566` | Wardrobe / Items / No Filter Results | экран 393×852 | 1141:2212 | — | — |
| `203:1691` | Wardrobe / Items / Populated | экран 393×852 | 1141:1697 +Dark | Wardrobe | ✓ |
| `315:3640` | Wardrobe / Items / Sheet / Category Expanded | оверлей 377×404 | 1144:3290 +Dark | FilterSheet | — |
| `506:2344` | Wardrobe / Items / Sheet / Category Root | оверлей 377×352 | 1173:16925 | FilterSheet | — |
| `551:3746` | Wardrobe / Items / Sheet / Item Actions | оверлей 377×240 | 1144:3017 | ItemActions | — |
| `334:2144` | Wardrobe / Items / Sheet / Season Filter | оверлей 377×168 | 1173:13651 | — | — |
| `629:6147` | Wardrobe / Items / Sheet / Tags Filter | оверлей 377×212 | 1173:13921 | — | — |
| `349:8618` | Wardrobe / Outfit / Sheet / Actions | оверлей 377×152 | 1173:16699 | — | — |
| `305:1472` | Wardrobe / Outfit / Sheet / Permanent Delete Actions | оверлей 377×152 | 1173:16639 | — | — |
| `349:10430` | Wardrobe / Outfit Details / Scrolled | экран 393×852 | 1174:19422 | OutfitDetails | — |
| `349:8637` | Wardrobe / Outfit Details / Variant 01 | экран 393×852 | 1143:3032 | OutfitDetails | ✓ |
| `440:2953` | Wardrobe / Outfit Details / Variant 02 | экран 393×852 | 1174:19564 | OutfitDetails | — |
| `261:2297` | Wardrobe / Outfits / Empty | экран 393×852 | 1141:2432 | — | — |
| `349:11679` | Wardrobe / Outfits / No Filter Results | экран 393×852 | 1174:19706 | — | — |
| `261:1987` | Wardrobe / Outfits / Populated | экран 393×852 | 1142:2412 +Dark | — | — |
| `349:11268` | Wardrobe / Outfits / Sheet / Custom Occasion Name Empty | оверлей 393×489 | 1174:15803 | — | — |
| `349:11296` | Wardrobe / Outfits / Sheet / Custom Occasion Name Entered | оверлей 393×489 | 1174:15958 | — | — |
| `278:2883` | Wardrobe / Outfits / Sheet / Occasion Filter | оверлей 377×212 | 1173:14251 | — | — |
| `349:11399` | Wardrobe / Outfits / Sheet / Occasion Presets | оверлей 377×168 | 1173:14331 | — | — |
| `278:2990` | Wardrobe / Outfits / Sheet / Season Filter | оверлей 377×168 | 1173:13726 | — | — |
| `629:6121` | Wardrobe / Outfits / Sheet / Tags Filter | оверлей 377×212 | 1173:14006 | — | — |
| `455:1007` | Wishlist / Add / Sheet / Content Type | оверлей 377×152 | 1173:16729 | — | — |
| `305:1528` | Wishlist / Item / Sheet / Actions | оверлей 377×284 | 1144:3070 | — | — |
| `443:3284` | Wishlist / Item / Toast / Moved to Wardrobe | оверлей 353×52 | 1176:11859 | — | — |
| `503:1150` | Wishlist / Item Details / Default | экран 393×852 | 1174:16922 | ItemDetails | ✓ |
| `503:1311` | Wishlist / Item Details / Scrolled | экран 393×852 | 1174:17064 | ItemDetails | — |
| `261:2349` | Wishlist / Items / Empty | экран 393×852 | 1141:2566 | — | — |
| `456:1073` | Wishlist / Items / Populated | экран 393×852 | 1142:2719 | Wishlist | ✓ |
| `503:1070` | Wishlist / New Item / Completed | экран 393×852 | 1173:18555 | — | — |
| `503:987` | Wishlist / New Item / Empty | экран 393×852 | 1173:18306 | — | — |
| `456:1053` | Wishlist / Outfit / Sheet / Permanent Delete Actions | оверлей 377×152 | 1173:16669 | — | — |
| `503:1432` | Wishlist / Outfit Details / Default | экран 393×852 | 1174:17192 | — | — |
| `507:3764` | Wishlist / Outfits / Populated | экран 393×852 | 1142:2970 | — | — |
| `1126:10577` | how work modal/sheet | экран 393×852 | 1149:4079 +Dark | ≈ AccountsMulti | — |