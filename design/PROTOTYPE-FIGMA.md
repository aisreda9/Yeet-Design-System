<!-- Карта прототипных связей Flow 2.0 Light (Figma). Снимок 29.09.2026 (PR #111), актуализирован 01.10.2026 по routes.ts и #6 (#207, #210), issue #212. Раздел 0 главнее разделов 1–9: где они расходятся, верен раздел 0. -->

# Прототип Flow 2.0 — карта переходов (Light)

Источник карты: `src/pages/prototype/routes.ts` + `screens.ts` + `Prototype.tsx`, токены `motion`, `design/FIGMA-RULES.md` §7, issue #122. Кадры и узлы — из Figma `1LAkot5WySMWhwiiFJqJ0e`, страница `70:12`, секции Flow 2.0 Light `1168:12824` и Dark `1173:7887`. Только чтение; в Figma ничего не записано. Машинная версия: `prototype-spec.json`.

## 0. Актуализация 01.10.2026 (#212)

Прототип Flow 2.0 Light в Figma приведён к `routes.ts` (#210, Changelog `1476:15867`). Что изменилось против снимка 29.09:

| Поток                                    | Код (`routes.ts`)                                                                                                                                                                                                                                               | Figma                                                                                                                                                     |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Вход**                                 | `SignIn` «Войти» / «Войти с Apple» → `OnboardingName` → «Далее» → `FirstItemPrompt`                                                                                                                                                                             | Sign In (4 кадра: Empty, Email Partial, Credentials Filled, Password Visible) → Onboarding / Name / Focused `1173:21671` → First Item Prompt `1173:21880` |
| **Новая вещь**                           | FAB, «Добавить вещь» → `NewItemNoPhotoV2` → тап по фото → `NewItem` (загрузка, авто 2600 мс) → `NewItemPhotoV2` → «Добавить» → Wardrobe + тост. V01: `NewItemNoPhotoV1` → `NewItemLoadingV1` → `NewItemPhotoV1`; из онбординга «Добавить» ведёт в `FirstOutfit` | Пустая форма `1174:19818` → загрузка → форма с фото → Wardrobe; V01 → First Outfit `1173:21962`. На всех формах BACK                                      |
| **Crop**                                 | `PhotoCrop`: «Найти похожее» → `PhotoResults`, «Назад» — общий маршрут BACK                                                                                                                                                                                     | `1176:19019`: «Назад» (Inverse) → BACK, «Найти похожее» → Photo Results `1173:14753`. Пункты «узла нет» из §6 закрыты                                     |
| **Stylist / Message Ready** `1176:20046` | `Stylist`: «Назад» → BACK (общий маршрут, кнопка есть только в коде); Escape закрывает только оверлей                                                                                                                                                           | Esc → BACK, свайп по шапке → Catalog `1173:18217`. Видимой кнопки «Назад» в макете нет — расхождение оставлено                                            |
| **Фильтр-чипсы**                         | Items: «Категория» → `FilterSheet`, «Сезон» → `SeasonFilterSheet`, «Теги» → `TagsFilterSheet`; Outfits: повод → `OccasionFilterSheet` + «Сезон», «Теги». Выбор применяется сразу (`Все` — сброс)                                                                | Каждый чипс уже вёл в свою шторку; расхождение было в коде, исправлено                                                                                    |
| **«Ещё»**                                | `WardrobeItemDetails` → `ItemActions`, `OutfitDetails` → `OutfitActions` (`1173:16699`), `ItemDetails` (вишлист) → `WishlistItemActions` (`1144:3070`)                                                                                                          | Предложения из §6 для Outfit Details и Wishlist Item Details стали маршрутами                                                                             |
| **Архив и корзина**                      | Карточка: долгое нажатие и тап → `ArchiveItemActions` / `TrashItemActions`; «Очистить корзину» → `ClearTrash`                                                                                                                                                   | Долгое нажатие — MOUSE_DOWN 400 мс (§4); тап по карточке архива больше не открывает детали вещи                                                           |
| **Сортировка**                           | `SearchResults`: «Цена» → `PriceFilter` `1144:3684`, «Сортировка» → `SortingSheet` `1144:3485` → тост                                                                                                                                                           | Предложение из §6 стало маршрутом                                                                                                                         |

Прочее: шапка поиска на трёх экранах — иконка `search-by-image`, как в компоненте. Числа в §1 и списки §8 — снимок 29.09, не пересчитывались.

## 1. Сводка

- Кадров Flow Light: **148**; с реакциями: **74**.
- Реакций (записей карты): **278**; записей в узлы (сгруппированные карточки/чипсы/вкладки раскрыты): **345**.
- Предложения Figma-only (нет в routes.ts, отдельно, не входят в счёт): **21**; спецификаций долгого нажатия: **3** (3 узла-группы); Dark-реакций (только пары): **27**.
- По разделам (записи / записи в узлы): Outfits 25/26, Wardrobe 89/106, Wishlist 37/46, Search 17/23, Stylist 16/22, Profile 15/26, Archive 8/9, Trash 9/9, Outfit Creation 21/21, App 1/1, Onboarding 4/4, Auth 21/21, New Item 2/2, Settings 11/27, Legal 2/2.
- Недостижимых экранов: **46** (из них орфанов без всякого входа — 8); оверлеев без входящей связи: **41**; тупиков без выхода: **1**; маршрутов кода без кадра во Flow: **15**; реакций без узла-триггера: **9**.

## 2. Точки входа потоков (flowStartingPoints на 70:12)

| Имя                 | Кадр         | Примечание                                                                                                   |
| ------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ |
| Онбординг           | `1173:18160` | START в Prototype.tsx = Splash; далее авто-переход на Welcome                                                |
| Главная (Today)     | `1173:16144` | HOME в Prototype.tsx                                                                                         |
| Гардероб            | `1141:1697`  |                                                                                                              |
| Создание образа     | `1173:22216` | Outfit Creation / Item Selection / Ready to Continue                                                         |
| Архив и корзина     | `1142:3268`  | у точки входа нет истории: «Назад» (BACK) не сработает — начинать показ с Гардероб→Архив, если нужен возврат |
| Стилист             | `1173:18217` |                                                                                                              |
| Профиль и настройки | `1149:3669`  |                                                                                                              |

Предложение: 8-я точка «Поиск в сторах» → `1141:2700` (нужна для показа поиска без пути через таб-бар).

## 3. Правила и обоснование

| Ситуация                                                             | Действие Figma                                                                                                      | Переход                                                                                                                             | Почему                                                                                                                                                                                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Push вглубь (карточка, «Далее», строка списка)                       | ON_CLICK → NAVIGATE                                                                                                 | MOVE_IN справа, 300 мс, EASE_OUT (`--motion-page`, `--ease-out`)                                                                    | Совпадает с `nav.push()`; направление отражает иерархию                                                                                                                                        |
| «Назад» в шапке / иконка «Назад» поиска                              | ON_CLICK → BACK                                                                                                     | обратный к входящему                                                                                                                | BACK, а не NAVIGATE: не наращивает историю, анимация обратна автоматически                                                                                                                     |
| «Назад» на кадре, куда пришли заменой (Trash Empty)                  | ON_CLICK → NAVIGATE к родителю                                                                                      | MOVE_OUT вправо 300 мс                                                                                                              | После NAVIGATE из диалога история Figma неверна; в коде `swap` убирает кадр из стека                                                                                                           |
| Вкладки таб-бара, сегменты, шаги создания образа, «Сбросить фильтры» | ON_CLICK → NAVIGATE                                                                                                 | DISSOLVE 240 мс, кривая `standard` (0.2,0,0,1) (`--motion-appear`)                                                                  | Равноправные вкладки не иерархия — не push; в коде `root()`/`swap()`. Активная вкладка/сегмент — **без реакции** (в коде scrollTop)                                                            |
| Шторка (выбор, фильтр, действия, аккаунты)                           | ON_CLICK → OPEN_OVERLAY                                                                                             | BOTTOM_CENTER, MOVE_IN снизу 300 мс EASE_OUT; фон `rgba(0,0,0,0.4)` (`color/surface/bg-overlay`; в Dark 0.6); тап по фону закрывает | Кадр шторки 393×(высота+8): 8 отступ снизу уже внутри кадра, дополнительного смещения нет (§7.1). §7.8 требует «пружину без перелёта» — эквивалент `CUSTOM_SPRING 1/300/35`                    |
| Закрытие шторки                                                      | пункт-действие → CLOSE_OVERLAY (+ OPEN_OVERLAY тоста); NAVIGATE изнутри оверлея закрывает его сам                   | реверс открытия                                                                                                                     | Как `closeThen()`                                                                                                                                                                              |
| Диалог-подтверждение (destructive/danger)                            | ON_CLICK → OPEN_OVERLAY                                                                                             | BOTTOM_CENTER, DISSOLVE 240 мс; **тап по фону не закрывает**; кнопки «Отмена/Отменить» → CLOSE_OVERLAY                              | §7.7/§7.8 и `Prototype.tsx` (`[role=alertdialog]`)                                                                                                                                             |
| Тост                                                                 | OPEN_OVERLAY, MANUAL x=20, y=668 (над таб-баром; 700 над bottom-bar; 764 без панелей), DISSOLVE 240, без затемнения | AFTER_TIMEOUT на кадре тоста → CLOSE_OVERLAY: **4000 мс** без действия, **6000 мс** с ↶ (`gesture.snackbar`); × и ↶ → CLOSE_OVERLAY | В задаче было 3 с; принято по токенам кода                                                                                                                                                     |
| «Надеть» на главной                                                  | ON_CLICK → NAVIGATE                                                                                                 | SMART_ANIMATE, spring Bouncy (`--motion-stamp`)                                                                                     | Кадры 1173:16144 и 1173:16374 структурно идентичны (проверено по именам слоёв) — пара Animations `354:17504→354:17591`                                                                         |
| Пары «прокрутка» (детали, списки)                                    | не связывать                                                                                                        | —                                                                                                                                   | Структуры различаются (photo-area ↔ Container/Content, sticky-surface) → SMART_ANIMATE дал бы скачок; единственная совпавшая — Outfit Details V01→V02 (`1143:3032→1174:19564`), в предложениях |
| Автопереходы                                                         | AFTER_TIMEOUT на самом кадре                                                                                        | Splash 1600 мс → Welcome; NewItem 2600 мс → Item Details, DISSOLVE 240                                                              | Как `auto` в routes.ts                                                                                                                                                                         |
| Жест «назад» от края, смахивание шторки, drag холста                 | не переносится                                                                                                      | —                                                                                                                                   | ON_DRAG в Figma не даёт координатного следования; для шторки хватит тапа по фону                                                                                                               |

Ограничения Figma: параллакс −30 % предыдущего экрана и затемнение 14 % при push не воспроизводятся MOVE_IN (у SLIDE_IN стоит проверить). Единицы `timeout`/`duration` в Plugin API проверить на первом узле (в спеки — мс). Перед массовой записью проверить на одном кадре: направление MOVE_IN, блокировку базы оверлеем-тостом, двойное срабатывание MOUSE_DOWN+delay и ON_CLICK.

## 4. Долгое нажатие на вещь

В Figma нет long-press. ON_CLICK по карточке/«Ещё» для шторки **не ставим**. Вариант ON_PRESS отвергнут: он срабатывает сразу при нажатии, до ON_CLICK, и шторка открывалась бы на каждом тапе. Выбран **MOUSE_DOWN с delay 400 мс** (= `--long-press`, `Prototype.tsx` gesture.longPress) → OPEN_OVERLAY. Риск: после долгого удержания отпускание может дополнительно дать ON_CLICK (открыть детали) — проверить на одной карточке; если конфликт подтвердится, шторка остаётся достижимой через «Ещё» на деталях вещи (`1173:16760`), а долгое нажатие фиксируется комментарием к кадру.

- `1141:1697` Wardrobe / Items / Populated: Карточка вещи (долгое нажатие 400 мс) → шторка `1144:3017` (8 узл.). Код: { sel: '.y-item-card', on: 'long' } → n.overlay('ItemActions')
- `1142:3268` Archive / Items / Populated: Карточка вещи в архиве (долгое нажатие) → шторка `1173:16608` (2 узл.). Код: НЕТ в routes.ts (Archive: [openItem]) — по #122 нужно
- `1142:3407` Trash / Items / Populated: Карточка вещи в корзине (долгое нажатие) → шторка `1144:3131` (2 узл.). Код: НЕТ в routes.ts — по #122 нужно (тап по карточке в корзине ничего не делает)

## 5. Истории → кадры Flow 2.0 Light

| Story id                    | Имя истории                                          | Кадр Flow    | Имя кадра во Flow                                    | Оригиналы 70:12                                | Примечание                                                                                                                       |
| --------------------------- | ---------------------------------------------------- | ------------ | ---------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| NewItem                     | New Item / Removing Background                       | `1174:17689` | New Item / Photo / Removing Background Variant 01    | `349:10596`                                    | Removing Background Variant 01; Variant 02 — 1174:20167                                                                          |
| OutfitItems                 | Outfit Creation / Item Selection / Ready to Continue | `1173:22216` | Outfit Creation / Item Selection / Ready to Continue | `414:1459`                                     |                                                                                                                                  |
| Canvas                      | Outfit Creation / Canvas / Filtered                  | `1174:22173` | Outfit Creation / Canvas / Filtered                  | `414:1750`                                     |                                                                                                                                  |
| CanvasDefault               | Outfit Creation / Canvas / Default                   | `1174:21939` | Outfit Creation / Canvas / Default                   | `414:1679`                                     |                                                                                                                                  |
| CanvasHint                  | Outfit Creation / Canvas / Gesture Hint              | `1174:21691` | Outfit Creation / Canvas / Gesture Hint              | `414:1605`                                     |                                                                                                                                  |
| OutfitCriteria              | Outfit Creation / Criteria / Default                 | `1174:22446` | Outfit Creation / Criteria / Default                 | `414:1386`                                     |                                                                                                                                  |
| NewItemNoPhotoV1            | New Item / Details / No Photo Variant 01             | `1174:17332` | New Item / Details / No Photo Variant 01             | `349:10556`                                    |                                                                                                                                  |
| NewItemNoPhotoV2            | New Item / Details / No Photo Variant 02             | `1174:19818` | New Item / Details / No Photo Variant 02             | `306:2030`                                     |                                                                                                                                  |
| NewItemPhotoV1              | New Item / Details / Photo Added Variant 01          | `1174:18042` | New Item / Details / Photo Added Variant 01          | `440:2620`                                     |                                                                                                                                  |
| NewItemPhotoV2              | New Item / Details / Photo Added Variant 02          | `1174:20520` | New Item / Details / Photo Added Variant 02          | `349:9163`                                     |                                                                                                                                  |
| NewItemFocusedV1            | New Item / Details / Name Focused Variant 01         | `1174:18405` | New Item / Details / Name Focused Variant 01         | `440:2702`                                     |                                                                                                                                  |
| NewItemFocusedV2            | New Item / Details / Name Focused Variant 02         | `1174:20883` | New Item / Details / Name Focused Variant 02         | `349:10770`                                    |                                                                                                                                  |
| NewItemCompletedV1          | New Item / Details / Completed Variant 01            | `1174:18824` | New Item / Details / Completed Variant 01            | `440:2780`                                     |                                                                                                                                  |
| NewItemCompletedV2          | New Item / Details / Completed Variant 02            | `1174:21302` | New Item / Details / Completed Variant 02            | `349:11824`                                    |                                                                                                                                  |
| NewItemLoadingV1            | New Item / Photo / Removing Background Variant 01    | `1174:17689` | New Item / Photo / Removing Background Variant 01    | `349:10596`                                    |                                                                                                                                  |
| Splash                      | App / Splash                                         | `1173:18160` | App / Splash / Default                               | `203:1599`                                     | имя в Figma «App / Splash / Default»                                                                                             |
| OnboardingWelcome           | Onboarding / Welcome                                 | `1158:4483`  | Onboarding / Welcome / Default                       | `388:1632`                                     | имя «Onboarding / Welcome / Default»                                                                                             |
| FirstItemPrompt             | Onboarding / First Item Prompt                       | `1173:21880` | Onboarding / First Item / Prompt                     | `203:1457`                                     | имя «Onboarding / First Item / Prompt» (в коде «First Item Prompt»)                                                              |
| SignIn                      | Auth / Sign In                                       | `1173:20639` | Auth / Sign In / Empty                               | `203:1372`                                     | канонический — Empty; состояния: 1173:20790 Email Partial, 1173:21019 Credentials Filled, 1173:21250 Password Visible            |
| PasswordRecovery            | Auth / Password Recovery                             | `1173:21481` | Auth / Password Recovery / Email Focused             | `790:1913`                                     | имя «Auth / Password Recovery / Email Focused»                                                                                   |
| PasswordRecoverySent        | Auth / Password Recovery / Dialog / Sent             | **нет**      |                                                      | нет                                            | нет ни в Flow, ни в оригинале 70:12 (диалог «Готово!» / «Ок!»)                                                                   |
| OnboardingName              | Onboarding / Name / Focused                          | `1173:21671` | Onboarding / Name / Focused                          | `203:1424`                                     |                                                                                                                                  |
| FirstOutfit                 | Onboarding / First Outfit / Preview                  | `1173:21962` | Onboarding / First Outfit / Preview                  | `203:1559`                                     |                                                                                                                                  |
| Today                       | Outfits / Everyday / Sunny                           | `1173:16144` | Outfits / Everyday / Sunny                           | `232:1355`                                     |                                                                                                                                  |
| TodayRain                   | Outfits / Everyday / Rain Alert                      | `1173:16259` | Outfits / Everyday / Rain Alert                      | `295:488`                                      |                                                                                                                                  |
| RecommendationsEmpty        | Outfits / Recommendations / Empty Wardrobe           | `1173:19455` | Outfits / Recommendations / Empty Wardrobe           | `203:1108`                                     |                                                                                                                                  |
| ProfileAnalytics            | Profile / Overview / Analytics                       | `1149:3669`  | Profile / Overview / Analytics                       | `699:6406`                                     |                                                                                                                                  |
| ProfileSingle               | Profile / Overview / Single Account                  | **нет**      |                                                      | нет                                            | нет ни в Flow, ни в оригинале 70:12 (профиль с одним аккаунтом)                                                                  |
| AccountsMulti               | Profile / Accounts / Sheet / List                    | `1147:7151`  | Profile / Accounts / Sheet / List                    | `1126:10532`                                   |                                                                                                                                  |
| AccountsSingle              | Profile / Accounts / Sheet / Single                  | `1147:7208`  | Profile / Accounts / Sheet / Single                  |                                                |                                                                                                                                  |
| PeriodSheet                 | Profile / Analytics / Sheet / Period                 | `1147:3417`  | Profile / Analytics / Sheet / Period                 | `551:2198`                                     |                                                                                                                                  |
| ProfileEdit                 | Profile / Edit / No Avatar                           | `1168:4851`  | Profile / Edit / No Avatar                           | `533:7636`                                     |                                                                                                                                  |
| ProfileEditAvatar           | Profile / Edit / Avatar Added                        | `1176:19604` | Profile / Edit / Avatar Added                        | `586:2733`                                     |                                                                                                                                  |
| SearchDiscover              | Search / Discover                                    | `1141:2700`  | Search / Discover / Default                          | `261:1867`                                     | имя «Search / Discover / Default»                                                                                                |
| SearchResults               | Search / Text / Results                              | `1141:2876`  | Search / Text / Results                              | `260:804`                                      |                                                                                                                                  |
| SearchEmpty                 | Search / Text / No Results Filtered                  | `1141:3067`  | Search / Text / No Results Filtered                  | `260:964`                                      |                                                                                                                                  |
| PriceFilter                 | Search / Results / Sheet / Price Filter              | `1144:3684`  | Search / Results / Sheet / Price Filter              | `261:1493`                                     |                                                                                                                                  |
| PhotoCrop                   | Search / Photo / Crop                                | `1176:19019` | Search / Photo / Crop                                | `261:1590`                                     |                                                                                                                                  |
| PhotoResults                | Search / Photo / Results                             | `1173:14753` | Search / Photo / Results                             | `260:1103`                                     |                                                                                                                                  |
| SearchFocused               | Search / Text / Query Focused                        | `1173:14557` | Search / Text / Query Focused                        | `259:601`                                      |                                                                                                                                  |
| PhotoFocused                | Search / Photo / Query Focused                       | `1173:14911` | Search / Photo / Query Focused                       | `261:1216`                                     |                                                                                                                                  |
| Settings                    | Settings / Main                                      | `1149:4140`  | Settings / Main / Default                            | `513:4818`                                     | имя «Settings / Main / Default»                                                                                                  |
| DeleteAccount               | Settings / Delete Account / Dialog / Confirmation    | `1176:11793` | Settings / Delete Account / Dialog / Confirmation    | `517:6999`, `1017:9276`                        | два кадра: 1176:11793 (452 — новее) и 1147:7332 (460, устарел?)                                                                  |
| CountrySheet                | Settings / Country / Sheet / Default                 | `1147:3725`  | Settings / Country / Sheet / Default                 | `513:5823`                                     |                                                                                                                                  |
| CurrencySheet               | Settings / Currency / Sheet / Default                | `1174:16325` | Settings / Currency / Sheet / Default                | `513:6256`                                     |                                                                                                                                  |
| LegalPrivacy                | Legal / Privacy Policy / May 2026                    | `1204:20720` | Legal / Privacy Policy / May 2026                    | `513:6603`                                     |                                                                                                                                  |
| LegalTerms                  | Legal / Terms of Use / May 2026                      | `1204:20805` | Legal / Terms of Use / May 2026                      | `513:6707`                                     |                                                                                                                                  |
| Stylist                     | Stylist / Home / Message Ready                       | `1176:20046` | Stylist / Home / Message Ready                       | `699:2858`                                     |                                                                                                                                  |
| StylistFocused              | Stylist / Assistant / Input Focused                  | `1176:19708` | Stylist / Assistant / Input Focused                  | `413:846`                                      |                                                                                                                                  |
| StylistGreeting             | Stylist / Home / Greeting Entered                    | `1176:19877` | Stylist / Home / Greeting Entered                    | `449:3330`                                     |                                                                                                                                  |
| StylistHome                 | Stylist / Catalog                                    | `1173:18217` | Stylist / Catalog / Input Focused                    | `699:2676`                                     | имя «Stylist / Catalog / Input Focused», кадр 393×1363 (док внизу длинного кадра)                                                |
| Trips                       | Stylist / Trips / List                               | `1168:4579`  | Stylist / Trips / List                               | `463:1534`, `798:1832`                         | Дубли: 1176:20595.                                                                                                               |
| TripItems                   | Stylist / Trip Details / Items Tab                   | `1168:4679`  | Stylist / Trip Details / Items Tab                   | `798:1950`                                     |                                                                                                                                  |
| TripDetails                 | Stylist / Trip Details / Outfits Tab                 | `1177:13116` | Stylist / Trip Details / Outfits Tab                 | `798:1913`                                     |                                                                                                                                  |
| OutfitOfTheDayEmpty         | Stylist / Outfit of the Day / No More Outfits        | `1176:20445` | Stylist / Outfit of the Day / Default                | `463:1520`, `798:1741`, `798:1783`, `798:2034` | в Figma 4 кадра «Stylist / Outfit of the Day / Default» (1176:20253, 20319, 20445, 20521); пустое состояние — 20445, дубль 20521 |
| Wardrobe                    | Wardrobe / Items / Populated                         | `1141:1697`  | Wardrobe / Items / Populated                         | `203:1691`                                     |                                                                                                                                  |
| WardrobeEmpty               | Wardrobe / Items / Empty                             | `1141:2088`  | Wardrobe / Items / Empty                             | `261:2185`                                     |                                                                                                                                  |
| FilterSheet                 | Wardrobe / Items / Sheet / Category                  | `1144:3290`  | Wardrobe / Items / Sheet / Category Expanded         | `315:3640`                                     | шторка категорий, развёрнутый «Верх»; корень списка — 1173:16925                                                                 |
| ItemActions                 | Wardrobe / Items / Sheet / Item Actions              | `1144:3017`  | Wardrobe / Items / Sheet / Item Actions              | `551:3746`                                     | шторка действий из сетки; из деталей — 1173:16760                                                                                |
| Toast                       | Wardrobe / Item / Toast                              | `1176:11844` | Wardrobe / Item / Toast / Moved to Archive           | `337:2531`                                     | тост «Вещь перемещена в архив»; в Figma отдельный оверлей-кадр 353×52                                                            |
| OutfitDetails               | Wardrobe / Outfit Details                            | `1143:3032`  | Wardrobe / Outfit Details / Variant 01               | `349:8637`                                     | Variant 01 (по Animations 349:8637); Variant 02 — 1174:19564                                                                     |
| OutfitDetailsScrolled       | Wardrobe / Outfit Details / Scrolled                 | `1174:19422` | Wardrobe / Outfit Details / Scrolled                 | `349:10430`                                    | Scrolled (349:10430)                                                                                                             |
| WardrobeItemDetails         | Wardrobe / Item Details                              | `1143:2840`  | Wardrobe / Item Details / Variant 01                 | `349:9258`                                     | Variant 01 (349:9258)                                                                                                            |
| WardrobeItemDetailsScrolled | Wardrobe / Item Details / Scrolled                   | `1174:19290` | Wardrobe / Item Details / Variant 02                 | `349:9976`                                     | Variant 02 = Scrolled (349:9976)                                                                                                 |
| Wishlist                    | Wishlist / Items / Populated                         | `1142:2719`  | Wishlist / Items / Populated                         | `456:1073`                                     |                                                                                                                                  |
| ItemDetails                 | Wishlist / Item Details                              | `1174:16922` | Wishlist / Item Details / Default                    | `503:1150`                                     | Wishlist / Item Details / Default (503:1150)                                                                                     |
| ItemDetailsScrolled         | Wishlist / Item Details / Scrolled                   | `1174:17064` | Wishlist / Item Details / Scrolled                   | `503:1311`                                     | Scrolled (503:1311)                                                                                                              |
| Archive                     | Archive / Items / Populated                          | `1142:3268`  | Archive / Items / Populated                          | `334:2391`                                     |                                                                                                                                  |
| ClearTrash                  | Trash / Items / Dialog / Clear                       | `1147:7271`  | Trash / Items / Dialog / Clear Confirmation          | `555:4196`                                     | диалог «Trash / Items / Dialog / Clear Confirmation» (оверлей-кадр)                                                              |
| OutfitsPopulated            | Wardrobe / Outfits / Populated                       | `1142:2412`  | Wardrobe / Outfits / Populated                       | `261:1987`                                     |                                                                                                                                  |
| OutfitsEmpty                | Wardrobe / Outfits / Empty                           | `1141:2432`  | Wardrobe / Outfits / Empty                           | `261:2297`                                     |                                                                                                                                  |
| ItemsNoFilterResults        | Wardrobe / Items / No Filter Results                 | `1141:2212`  | Wardrobe / Items / No Filter Results                 | `349:11566`                                    |                                                                                                                                  |
| OutfitsNoFilterResults      | Wardrobe / Outfits / No Filter Results               | `1174:19706` | Wardrobe / Outfits / No Filter Results               | `349:11679`                                    |                                                                                                                                  |
| ItemSearchFocused           | Wardrobe / Item Search / Query Focused               | `1173:15144` | Wardrobe / Item Search / Query Focused               | `334:2187`                                     |                                                                                                                                  |
| ItemSearchResults           | Wardrobe / Item Search / Results                     | `1173:15337` | Wardrobe / Item Search / Results                     | `334:2305`                                     |                                                                                                                                  |
| ItemSearchEmpty             | Wardrobe / Item Search / No Results                  | `1173:15414` | Wardrobe / Item Search / No Results                  | `342:7355`                                     |                                                                                                                                  |
| WishlistOutfits             | Wishlist / Outfits / Populated                       | `1142:2970`  | Wishlist / Outfits / Populated                       | `507:3764`                                     |                                                                                                                                  |
| WishlistEmpty               | Wishlist / Items / Empty                             | `1141:2566`  | Wishlist / Items / Empty                             | `261:2349`                                     |                                                                                                                                  |
| ArchiveEmpty                | Archive / Items / Empty                              | `1142:3181`  | Archive / Items / Empty                              | `337:2455`                                     |                                                                                                                                  |
| TrashEmpty                  | Trash / Items / Empty                                | `1142:3342`  | Trash / Items / Empty                                | `551:3619`                                     |                                                                                                                                  |
| TrashPopulated              | Trash / Items / Populated                            | `1142:3407`  | Trash / Items / Populated                            | `551:3727`                                     |                                                                                                                                  |
| WishlistOutfitDetails       | Wishlist / Outfit Details / Default                  | `1174:17192` | Wishlist / Outfit Details / Default                  | `503:1432`                                     |                                                                                                                                  |
| WishlistNewItem             | Wishlist / New Item / Empty                          | `1173:18306` | Wishlist / New Item / Empty                          | `503:987`                                      |                                                                                                                                  |
| WishlistNewItemCompleted    | Wishlist / New Item / Completed                      | `1173:18555` | Wishlist / New Item / Completed                      | `503:1070`                                     |                                                                                                                                  |

Во Flow есть кадры, которых нет среди историй Pages (шторки/диалоги/тосты/состояния) — они перечислены в разделе 8 (оверлеи без входящей связи).

## 6. Карта реакций по кадрам (Light)

Формат: триггер (узел) → действие. `×N` — одна и та же реакция на N узлов (карточки, чипсы). Полный список id узлов — в JSON (`triggerNodesAll`).

### Outfits / Everyday / Sunny — `1173:16144` (393x852)

_вкладка «Главная» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Поиск» (`I1173:16238;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Гардероб» (`I1173:16238;967:3646;962:3176`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1173:16238;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1173:16238;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс
- [ON_CLICK] Превью соседнего образа ×2 (`1173:16192`) → NAVIGATE → Wardrobe / Outfit Details / Variant 01 (`1143:3032`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Коллаж образа (`1173:16172`) → NAVIGATE → Wardrobe / Outfit Details / Variant 01 (`1143:3032`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Штамп «Надеть» (`1173:16218`) → NAVIGATE → Outfits / Everyday / Wear Action Active (`1173:16374`) SMART_ANIMATE
- _предложение_ [ON_CLICK] Повод «на каждый день ⌄» (`I1173:16145;1111:9717`) → OPEN_OVERLAY → Outfits / Everyday / Sheet / Occasion Filter (`1173:14091`) MOVE_IN BOTTOM 300 мс — в routes.ts маршрута нет; во Flow есть шторка Occasion Filter (1173:14091) — устаревший полноэкранный «Occasion Selector Open» 1173:16493 недостижим

### Outfits / Everyday / Rain Alert — `1173:16259` (393x852)

_вкладка «Главная» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Поиск» (`I1173:16353;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Гардероб» (`I1173:16353;967:3646;962:3176`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1173:16353;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1173:16353;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс

### Outfits / Everyday / Wear Action Active — `1173:16374` (393x852)

_вкладка «Главная» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Поиск» (`I1173:16472;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Гардероб» (`I1173:16472;967:3646;962:3176`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1173:16472;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1173:16472;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс
- [ON_CLICK] Штамп (снять отметку) (`1173:16448`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) SMART_ANIMATE

### Outfits / Everyday / Occasion Selector Open — `1173:16493` (393x852)

_вкладка «Главная» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Поиск» (`I1173:16587;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Гардероб» (`I1173:16587;967:3646;962:3176`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1173:16587;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1173:16587;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс

### Outfits / Recommendations / Empty Wardrobe — `1173:19455` (393x852)

_вкладка «Главная» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Поиск» (`I1173:19473;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Гардероб» (`I1173:19473;967:3646;962:3176`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1173:19473;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1173:19473;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс
- [ON_CLICK] Кнопка «Добавить вещь» (`I1173:19456;968:3637`) → NAVIGATE → New Item / Details / No Photo Variant 02 (`1174:19818`) MOVE_IN RIGHT 300 мс

### Wardrobe / Items / Populated — `1141:1697` (393x852)

_вкладка «Гардероб» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Главная» (`I1141:1985;967:3646;962:3170`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Поиск» (`I1141:1985;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1141:1985;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1141:1985;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс
- [ON_CLICK] FAB «+» (`I1141:1985;967:3662`) → NAVIGATE → New Item / Details / No Photo Variant 02 (`1174:19818`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Сегмент «Образы» (`I1141:1741;942:7209`) → NAVIGATE → Wardrobe / Outfits / Populated (`1142:2412`) DISSOLVE 240 мс
- [ON_CLICK] Сегмент «Вишлист» (`I1141:1741;942:7210`) → NAVIGATE → Wishlist / Items / Populated (`1142:2719`) DISSOLVE 240 мс
- [ON_CLICK] Иконка «Поиск» (`I1141:1812;942:7255;1141:1899`) → NAVIGATE → Wardrobe / Item Search / Query Focused (`1173:15144`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Иконка «Архив» (`I1141:1812;942:7255;1141:1907`) → NAVIGATE → Archive / Items / Populated (`1142:3268`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Чипс «Категория» (`I1141:1812;942:7255;1141:1914`) → OPEN_OVERLAY → Wardrobe / Items / Sheet / Category Root (`1173:16925`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Чипс «Сезон» (`I1141:1812;942:7255;1141:1923`) → OPEN_OVERLAY → Wardrobe / Items / Sheet / Season Filter (`1173:13651`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Чипс «Теги» (`I1141:1812;942:7255;1141:1931`) → OPEN_OVERLAY → Wardrobe / Items / Sheet / Tags Filter (`1173:13921`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Карточка вещи (тап) ×8 (`1141:1937`) → NAVIGATE → Wardrobe / Item Details / Variant 01 (`1143:2840`) MOVE_IN RIGHT 300 мс

### Wardrobe / Items / Empty — `1141:2088` (393x852)

_вкладка «Гардероб» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Главная» (`I1141:2153;967:3646;962:3170`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Поиск» (`I1141:2153;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1141:2153;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1141:2153;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс
- [ON_CLICK] FAB «+» (`I1141:2153;967:3662`) → NAVIGATE → New Item / Details / No Photo Variant 02 (`1174:19818`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Сегмент «Образы» (`I1141:2117;942:7209`) → NAVIGATE → Wardrobe / Outfits / Populated (`1142:2412`) DISSOLVE 240 мс
- [ON_CLICK] Сегмент «Вишлист» (`I1141:2117;942:7210`) → NAVIGATE → Wishlist / Items / Populated (`1142:2719`) DISSOLVE 240 мс

### Wardrobe / Items / No Filter Results — `1141:2212` (393x852)

_вкладка «Гардероб» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Главная» (`I1141:2373;967:3646;962:3170`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Поиск» (`I1141:2373;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1141:2373;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1141:2373;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс
- [ON_CLICK] FAB «+» (`I1141:2373;967:3662`) → NAVIGATE → New Item / Details / No Photo Variant 02 (`1174:19818`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Сегмент «Образы» (`I1141:2241;942:7209`) → NAVIGATE → Wardrobe / Outfits / Populated (`1142:2412`) DISSOLVE 240 мс
- [ON_CLICK] Сегмент «Вишлист» (`I1141:2241;942:7210`) → NAVIGATE → Wishlist / Items / Populated (`1142:2719`) DISSOLVE 240 мс
- [ON_CLICK] Иконка «Поиск» (`I1141:2274;942:7255;1141:2318`) → NAVIGATE → Wardrobe / Item Search / Query Focused (`1173:15144`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Иконка «Архив» (`I1141:2274;942:7255;1141:2325`) → NAVIGATE → Archive / Items / Populated (`1142:3268`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Чипс «Категория · 2» (`I1141:2274;942:7255;1141:2332`) → OPEN_OVERLAY → Wardrobe / Items / Sheet / Category Root (`1173:16925`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Чипс «Сезон · 2» (`I1141:2274;942:7255;1141:2341`) → OPEN_OVERLAY → Wardrobe / Items / Sheet / Season Filter (`1173:13651`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Кнопка «Сбросить фильтры» (`I1141:2354;968:3637`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс

### Wardrobe / Outfits / Populated — `1142:2412` (393x852)

_вкладка «Гардероб» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Главная» (`I1142:2660;967:3646;962:3170`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Поиск» (`I1142:2660;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1142:2660;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1142:2660;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс
- [ON_CLICK] FAB «+» (`I1142:2660;967:3662`) → NAVIGATE → Outfit Creation / Item Selection / Ready to Continue (`1173:22216`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Сегмент «Вещи» (`I1142:2442;942:7207;1142:2502`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Сегмент «Вишлист» (`I1142:2442;942:7207;1142:2504`) → NAVIGATE → Wishlist / Items / Populated (`1142:2719`) DISSOLVE 240 мс
- [ON_CLICK] Чипс «Повод» (`I1142:2514;942:7255;1142:2600`) → OPEN_OVERLAY → Wardrobe / Outfits / Sheet / Occasion Filter (`1173:14251`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Чипс «Сезон» (`I1142:2514;942:7255;1142:2608`) → OPEN_OVERLAY → Wardrobe / Outfits / Sheet / Season Filter (`1173:13726`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Чипс «Теги» (`I1142:2514;942:7255;1142:2616`) → OPEN_OVERLAY → Wardrobe / Outfits / Sheet / Tags Filter (`1173:14006`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Коллаж образа ×2 (`1142:2622`) → NAVIGATE → Wardrobe / Outfit Details / Variant 01 (`1143:3032`) MOVE_IN RIGHT 300 мс

### Wardrobe / Outfits / Empty — `1141:2432` (393x852)

_вкладка «Гардероб» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Главная» (`I1141:2507;967:3646;962:3170`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Поиск» (`I1141:2507;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1141:2507;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1141:2507;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс
- [ON_CLICK] FAB «+» (`I1141:2507;967:3662`) → NAVIGATE → Outfit Creation / Item Selection / Ready to Continue (`1173:22216`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Сегмент «Вещи» (`I1141:2461;942:7207;1141:2492`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Сегмент «Вишлист» (`I1141:2461;942:7207;1141:2494`) → NAVIGATE → Wishlist / Items / Populated (`1142:2719`) DISSOLVE 240 мс

### Wardrobe / Outfits / No Filter Results — `1174:19706` (393x852)

_вкладка «Гардероб» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Главная» (`I1174:19712;967:3646;962:3170`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Поиск» (`I1174:19712;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1174:19712;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1174:19712;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс
- [ON_CLICK] FAB «+» (`I1174:19712;967:3662`) → NAVIGATE → Outfit Creation / Item Selection / Ready to Continue (`1173:22216`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Сегмент «Вещи» (`I1174:19708;942:7207;1174:19740`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Сегмент «Вишлист» (`I1174:19708;942:7207;1174:19742`) → NAVIGATE → Wishlist / Items / Populated (`1142:2719`) DISSOLVE 240 мс
- [ON_CLICK] Чипс «На каждый день» (`I1174:19709;942:7255;1174:19716`) → OPEN_OVERLAY → Wardrobe / Outfits / Sheet / Occasion Filter (`1173:14251`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Чипс «Сезон · 2» (`I1174:19709;942:7255;1174:19717`) → OPEN_OVERLAY → Wardrobe / Outfits / Sheet / Season Filter (`1173:13726`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Чипс «Теги · 2» (`I1174:19709;942:7255;1174:19718`) → OPEN_OVERLAY → Wardrobe / Outfits / Sheet / Tags Filter (`1173:14006`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Кнопка «Сбросить фильтры» (`I1174:19711;968:3637`) → NAVIGATE → Wardrobe / Outfits / Populated (`1142:2412`) DISSOLVE 240 мс

### Wishlist / Items / Populated — `1142:2719` (393x852)

_вкладка «Гардероб» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Главная» (`I1142:2911;967:3646;962:3170`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Поиск» (`I1142:2911;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1142:2911;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1142:2911;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс
- [ON_CLICK] FAB «+» (`I1142:2911;967:3662`) → NAVIGATE → Wishlist / New Item / Empty (`1173:18306`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Сегмент «Вещи» (`I1142:2748;942:7207;1142:2779`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Сегмент «Образы» (`I1142:2748;942:7207;1142:2780`) → NAVIGATE → Wardrobe / Outfits / Populated (`1142:2412`) DISSOLVE 240 мс
- [ON_CLICK] Подсегмент вишлиста «Образы» (`I1142:2791;942:7227;1142:2843`) → NAVIGATE → Wishlist / Outfits / Populated (`1142:2970`) DISSOLVE 240 мс
- [ON_CLICK] Карточка товара ×6 (`1142:2845`) → NAVIGATE → Wishlist / Item Details / Default (`1174:16922`) MOVE_IN RIGHT 300 мс

### Wishlist / Outfits / Populated — `1142:2970` (393x852)

_вкладка «Гардероб» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Главная» (`I1142:3122;967:3646;962:3170`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Поиск» (`I1142:3122;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1142:3122;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1142:3122;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс
- [ON_CLICK] FAB «+» (`I1142:3122;967:3662`) → NAVIGATE → Wishlist / New Item / Empty (`1173:18306`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Сегмент «Вещи» (`I1142:2999;942:7207;1142:3030`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Сегмент «Образы» (`I1142:2999;942:7207;1142:3031`) → NAVIGATE → Wardrobe / Outfits / Populated (`1142:2412`) DISSOLVE 240 мс
- [ON_CLICK] Подсегмент вишлиста «Вещи» (`I1142:3042;942:7227;1142:3073`) → NAVIGATE → Wishlist / Items / Populated (`1142:2719`) DISSOLVE 240 мс
- [ON_CLICK] Коллаж образа ×2 (`1142:3084`) → NAVIGATE → Wishlist / Outfit Details / Default (`1174:17192`) MOVE_IN RIGHT 300 мс

### Wishlist / Items / Empty — `1141:2566` (393x852)

_вкладка «Гардероб» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Главная» (`I1141:2641;967:3646;962:3170`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Поиск» (`I1141:2641;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1141:2641;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1141:2641;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс
- [ON_CLICK] FAB «+» (`I1141:2641;967:3662`) → NAVIGATE → Wishlist / New Item / Empty (`1173:18306`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Сегмент «Вещи» (`I1141:2595;942:7207;1141:2626`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Сегмент «Образы» (`I1141:2595;942:7207;1141:2627`) → NAVIGATE → Wardrobe / Outfits / Populated (`1142:2412`) DISSOLVE 240 мс

### Search / Discover / Default — `1141:2700` (393x852)

_вкладка «Поиск» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Главная» (`I1141:2836;967:3646;962:3170`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Гардероб» (`I1141:2836;967:3646;962:3176`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1141:2836;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1141:2836;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс
- [ON_CLICK] Плитки «Галерея / Камера» ×2 (`1141:2730`) → NAVIGATE → Search / Photo / Crop (`1176:19019`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Подсказки-чипсы (короткие) ×6 (`I1141:2782;942:7248;1141:2811`) → NAVIGATE → Search / Text / Results (`1141:2876`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Подсказка «Белое платье…» (`I1141:2782;942:7248;1141:2823`) → NAVIGATE → Search / Text / No Results Filtered (`1141:3067`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Поле «Белые кроссовки Nike» (`I1141:2748;1109:4923`) → NAVIGATE → Search / Text / Results (`1141:2876`) MOVE_IN RIGHT 300 мс

### Stylist / Catalog / Input Focused — `1173:18217` (393x1363)

_вкладка «Стилист» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Главная» (`I1173:18216;962:3170`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Поиск» (`I1173:18216;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Гардероб» (`I1173:18216;962:3176`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1173:18216;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс
- [ON_CLICK] Карточка «Конструктор» (`1173:18247`) → NAVIGATE → Outfit Creation / Item Selection / Ready to Continue (`1173:22216`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Карточка «Для поездок» (`1173:18258`) → NAVIGATE → Stylist / Trips / List (`1168:4579`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Поле «Спроси у стилиста» / отправить ×2 (`I1173:18215;1121:1697`) → NAVIGATE → Stylist / Home / Message Ready (`1176:20046`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Карточки soon (Оживи гардероб, Докупить, Оцени лук) ×3 (`1173:18263`) → — — не прототипируется: заглушка, не прототипируется
- _предложение_ [ON_CLICK] Карточка «Удиви меня» (`1173:18252`) → NAVIGATE → Stylist / Outfit of the Day / Default (`1176:20319`) MOVE_IN RIGHT 300 мс — во Flow есть Stylist / Outfit of the Day / Default (1176:20319)
- _предложение_ [ON_CLICK] Карточка «С чем носить» (`1173:18255`) → NAVIGATE → Stylist / Trips / List (`1176:20595`) MOVE_IN RIGHT 300 мс — кадр 1176:20595 назван «Stylist / Trips / List», но содержит коллаж/ленту «С чем носить» — переименовать

### Stylist / Assistant / Input Focused — `1176:19708` (393x852)

_вкладка «Стилист» активна — реакции нет (в коде scrollTop)_

- [ON_CLICK] Вкладка «Главная» (`I1176:19746;967:3646;962:3170`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Поиск» (`I1176:19746;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Гардероб» (`I1176:19746;967:3646;962:3176`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Профиль» (`I1176:19746;967:3646;962:3182`) → NAVIGATE → Profile / Overview / Analytics (`1149:3669`) DISSOLVE 240 мс

### Profile / Overview / Analytics — `1149:3669` (393x3164)

_вкладка «Профиль» активна — реакции нет (в коде scrollTop)_
_393x3164: для прототипа нужна обёртка 393×852 с вертикальной прокруткой; нижний bottom-nav лежит на y=3048_

- [ON_CLICK] Вкладка «Главная» (`I1149:4039;967:3646;962:3170`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Поиск» (`I1149:4039;967:3646;962:3173`) → NAVIGATE → Search / Discover / Default (`1141:2700`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Гардероб» (`I1149:4039;967:3646;962:3176`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс
- [ON_CLICK] Вкладка «Стилист» (`I1149:4039;967:3646;962:3179`) → NAVIGATE → Stylist / Catalog / Input Focused (`1173:18217`) DISSOLVE 240 мс
- [ON_CLICK] Стопка аватаров (`1149:3699`) → OPEN_OVERLAY → Profile / Accounts / Sheet / List (`1147:7151`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Чипс периода «За всё время» (`1149:3719`) → OPEN_OVERLAY → Profile / Analytics / Sheet / Period (`1147:3417`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Карточки в каруселях «Чаще всего надевалось / Давно не надевалось» ×8 (`I1149:3726;968:3675;1149:3917;1037:5373;1149:3957`) → NAVIGATE → Wardrobe / Item Details / Variant 01 (`1143:2840`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Коллажи «Самый дорогой образ» / «Лучшая инвестиция» ×2 (`I1149:3726;968:3675;1149:4020`) → NAVIGATE → Wardrobe / Outfit Details / Variant 01 (`1143:3032`) MOVE_IN RIGHT 300 мс

### Wardrobe / Item Details / Variant 01 — `1143:2840` (393x852)

- [ON_CLICK] Шапка: назад (`I1143:2841;967:3518`) → BACK
- [ON_CLICK] Шапка: «Ещё» (`I1143:2841;967:3534`) → OPEN_OVERLAY → Wardrobe / Item Details / Sheet / Actions (`1173:16760`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Коллаж «Образы с этой вещью» (`I1143:2912;968:3675;1143:3021`) → NAVIGATE → Wardrobe / Outfit Details / Variant 01 (`1143:3032`) MOVE_IN RIGHT 300 мс
- _предложение_ [ON_DRAG] Скролл деталей: Variant 01 → Variant 02 (узла нет) → NAVIGATE → Wardrobe / Item Details / Variant 02 (`1174:19290`) DISSOLVE 240 мс — НЕ создавать: структуры кадров различаются (photo-area ↔ Container/Content 03) → Smart Animate дал бы прыжок; скролл делать нативным (overflow scroll у панели). Пара — только документация

### Wardrobe / Outfit Details / Variant 01 — `1143:3032` (393x852)

- [ON_CLICK] Шапка: назад (`I1143:3033;967:3518`) → BACK
- [ON_CLICK] Карточки «Вещи из образа» ×4 (`I1143:3108;968:3675;1143:3202`) → NAVIGATE → Wardrobe / Item Details / Variant 01 (`1143:2840`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Штамп «Надеть» (`1143:3224`) → — — не прототипируется: нет кадра-цели
- [ON_CLICK] Шапка: «Ещё» (`I1143:3033;967:3534`) → OPEN_OVERLAY → Wardrobe / Outfit / Sheet / Actions (`1173:16699`) MOVE_IN BOTTOM 300 мс
- _предложение_ [ON_DRAG] Скролл: Variant 01 → Variant 02 (`1143:3108`) → NAVIGATE → Wardrobe / Outfit Details / Variant 02 (`1174:19564`) SMART_ANIMATE — единственная структурно совпавшая пара деталей (имена слоёв те же): SMART_ANIMATE допустим, ON_DRAG вверх по sheet; сдвиг фото в миниатюру 48 всё равно не воспроизводится 1:1 — необязательно

### Wishlist / Item Details / Default — `1174:16922` (393x852)

- [ON_CLICK] Шапка: назад (`I1174:16923;967:3518`) → BACK
- [ON_CLICK] Кнопка «Переместить в гардероб» (`I1174:17038;967:3681`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс → затем OPEN_OVERLAY → Wishlist / Item / Toast / Moved to Wardrobe (`1176:11859`) DISSOLVE 240 мс
- [ON_CLICK] Иконка «Открыть в магазине» (`I1174:17038;967:3687`) → — — не прототипируется: внешний переход, не прототипируется
- [ON_CLICK] Коллаж «Образы с этой вещью» (`I1174:16990;968:3675;1174:17027`) → NAVIGATE → Wardrobe / Outfit Details / Variant 01 (`1143:3032`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Шапка: «Ещё» (`I1174:16923;967:3534`) → OPEN_OVERLAY → Wishlist / Item / Sheet / Actions (`1144:3070`) MOVE_IN BOTTOM 300 мс

### Wishlist / Outfit Details / Default — `1174:17192` (393x852)

- [ON_CLICK] Шапка: назад (`I1174:17193;967:3518`) → BACK
- [ON_CLICK] Кнопка «Переместить в гардероб» (`I1174:17321;967:3671`) → NAVIGATE → Wardrobe / Outfits / Populated (`1142:2412`) DISSOLVE 240 мс
- [ON_CLICK] Карточки вещей образа ×4 (`I1174:17268;968:3675;1174:17299`) → NAVIGATE → Wardrobe / Item Details / Variant 01 (`1143:2840`) MOVE_IN RIGHT 300 мс

### Wishlist / New Item / Empty — `1173:18306` (393x852)

- [ON_CLICK] Шапка: назад (`I1173:18307;967:3518`) → BACK
- [ON_CLICK] Кнопка «Добавить» (`I1173:18542;967:3671`) → NAVIGATE → Wishlist / Items / Populated (`1142:2719`) DISSOLVE 240 мс
- _предложение_ [ON_CLICK] Поле формы → «Completed» (`I1173:18380;968:3675;1173:18426;942:7266;1173:18445`) → NAVIGATE → Wishlist / New Item / Completed (`1173:18555`) DISSOLVE 240 мс — цепочка состояний формы; в routes.ts нет (WishlistNewItemCompleted недостижим)

### Wishlist / New Item / Completed — `1173:18555` (393x852)

- [ON_CLICK] Шапка: назад (`I1173:18556;967:3518`) → BACK
- [ON_CLICK] Кнопка «Добавить» (`I1173:18875;967:3671`) → NAVIGATE → Wishlist / Items / Populated (`1142:2719`) DISSOLVE 240 мс

### Archive / Items / Populated — `1142:3268` (393x852)

- [ON_CLICK] Шапка: назад (`I1142:3269;967:3518`) → BACK
- [MOUSE_DOWN 400 мс] Карточка вещи в архиве ×2 (`1142:3330`) → OPEN_OVERLAY → Archive / Item / Sheet / Actions (`1173:16608`) MOVE_IN BOTTOM 300 мс (в коде и тап — запасной путь)

### Archive / Items / Empty — `1142:3181` (393x852)

- [ON_CLICK] Шапка: назад (`I1142:3182;967:3518`) → BACK

### Trash / Items / Populated — `1142:3407` (393x852)

- [ON_CLICK] Шапка: назад (`I1142:3408;967:3518`) → BACK
- [ON_CLICK] Шапка: «Очистить корзину» (`I1142:3408;967:3534`) → OPEN_OVERLAY → Trash / Items / Dialog / Clear Confirmation (`1147:7271`) DISSOLVE 240 мс

### Trash / Items / Empty — `1142:3342` (393x852)

- [ON_CLICK] Шапка: назад (`I1142:3343;967:3518`) → NAVIGATE → Settings / Main / Default (`1149:4140`) MOVE_OUT RIGHT 300 мс

### Archive / Item / Sheet / Actions — `1173:16608` (393x160)

- [ON_CLICK] Пункт «Вернуть в гардероб» (`I1173:16609;962:3076;1173:16625`) → CLOSE_OVERLAY
- [ON_CLICK] Пункт «Удалить» (`I1173:16609;962:3076;1173:16636`) → CLOSE_OVERLAY → затем OPEN_OVERLAY → Archive / Item / Toast / Moved to Trash (`1176:11849`) DISSOLVE 240 мс

### Trash / Item / Sheet / Actions — `1144:3131` (393x160)

- [ON_CLICK] Пункт «Вернуть в гардероб» (`I1144:3132;962:3076;1144:3148`) → CLOSE_OVERLAY
- [ON_CLICK] Пункт «Удалить навсегда» (`I1144:3132;962:3076;1144:3158`) → CLOSE_OVERLAY → затем OPEN_OVERLAY → Trash / Item / Toast / Deleted Permanently (`1176:11854`) DISSOLVE 240 мс

### Wardrobe / Items / Sheet / Item Actions — `1144:3017` (393x248)

- [ON_CLICK] Пункт «Создать образ» (`I1144:3018;962:3076;1144:3035`) → NAVIGATE → Outfit Creation / Item Selection / Ready to Continue (`1173:22216`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Пункт «Редактировать» (`I1144:3018;962:3076;1144:3047`) → CLOSE_OVERLAY
- [ON_CLICK] Пункт «Архивировать» (`I1144:3018;962:3076;1144:3057`) → CLOSE_OVERLAY → затем OPEN_OVERLAY → Wardrobe / Item / Toast / Moved to Archive (`1176:11844`) DISSOLVE 240 мс
- [ON_CLICK] Пункт «Удалить» (`I1144:3018;962:3076;1144:3067`) → CLOSE_OVERLAY → затем OPEN_OVERLAY → Archive / Item / Toast / Moved to Trash (`1176:11849`) DISSOLVE 240 мс

### Wardrobe / Item Details / Sheet / Actions — `1173:16760` (393x248)

- [ON_CLICK] Пункт «Создать образ» (`I1173:16761;962:3076;1173:16777`) → NAVIGATE → Outfit Creation / Item Selection / Ready to Continue (`1173:22216`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Пункт «Редактировать» (`I1173:16761;962:3076;1173:16788`) → CLOSE_OVERLAY
- [ON_CLICK] Пункт «Архивировать» (`I1173:16761;962:3076;1173:16798`) → CLOSE_OVERLAY → затем OPEN_OVERLAY → Wardrobe / Item / Toast / Moved to Archive (`1176:11844`) DISSOLVE 240 мс
- [ON_CLICK] Пункт «Удалить» (`I1173:16761;962:3076;1173:16808`) → CLOSE_OVERLAY → затем OPEN_OVERLAY → Archive / Item / Toast / Moved to Trash (`1176:11849`) DISSOLVE 240 мс

### Trash / Items / Dialog / Clear Confirmation — `1147:7271` (393x192)

- [ON_CLICK] Кнопка «Отмена» (`I1147:7272;962:3124`) → CLOSE_OVERLAY
- [ON_CLICK] Кнопка «Очистить» (`I1147:7272;962:3130`) → NAVIGATE → Trash / Items / Empty (`1142:3342`) DISSOLVE 240 мс

### Wardrobe / Item / Toast / Moved to Archive — `1176:11844` (353x52)

- [AFTER_TIMEOUT 6000 мс] Тост: автозакрытие (`1176:11844`) → CLOSE_OVERLAY
- [ON_CLICK] Иконка × в тосте (`I1176:11845;951:3428`) → CLOSE_OVERLAY
- [ON_CLICK] Иконка ↶ «Отменить» в тосте (**узла нет**) → CLOSE_OVERLAY

### Archive / Item / Toast / Moved to Trash — `1176:11849` (353x52)

- [AFTER_TIMEOUT 6000 мс] Тост: автозакрытие (`1176:11849`) → CLOSE_OVERLAY
- [ON_CLICK] Иконка × в тосте (`I1176:11850;951:3428`) → CLOSE_OVERLAY
- [ON_CLICK] Иконка ↶ «Отменить» в тосте (**узла нет**) → CLOSE_OVERLAY

### Trash / Item / Toast / Deleted Permanently — `1176:11854` (353x52)

- [AFTER_TIMEOUT 4000 мс] Тост: автозакрытие (`1176:11854`) → CLOSE_OVERLAY
- [ON_CLICK] Иконка × в тосте (`I1176:11855;951:3428`) → CLOSE_OVERLAY

### Wishlist / Item / Toast / Moved to Wardrobe — `1176:11859` (353x52)

- [AFTER_TIMEOUT 4000 мс] Тост: автозакрытие (`1176:11859`) → CLOSE_OVERLAY
- [ON_CLICK] Иконка × в тосте (`I1176:11860;951:3428`) → CLOSE_OVERLAY

### Search / Result Item / Toast / Moved to Wishlist — `1176:11864` (353x56)

- [AFTER_TIMEOUT 4000 мс] Тост: автозакрытие (`1176:11864`) → CLOSE_OVERLAY
- [ON_CLICK] Иконка × в тосте (`I1176:11865;951:3428`) → CLOSE_OVERLAY

### Wardrobe / Item Search / Query Focused — `1173:15144` (393x852)

- [ON_CLICK] Шапка поиска: «Назад» (`I1173:15145;967:3575;942:7284`) → BACK
- [ON_CLICK] Подсказки-чипсы (короткие) ×6 (`I1173:15208;942:7248;1173:15237`) → NAVIGATE → Wardrobe / Item Search / Results (`1173:15337`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Подсказка «Белое платье…» (длинная) (`I1173:15208;942:7248;1173:15249`) → NAVIGATE → Wardrobe / Item Search / No Results (`1173:15414`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Поле поиска (`I1173:15145;967:3575;1109:4909`) → NAVIGATE → Wardrobe / Item Search / Results (`1173:15337`) MOVE_IN RIGHT 300 мс

### Wardrobe / Item Search / Results — `1173:15337` (393x852)

- [ON_CLICK] Шапка поиска: «Назад» (`I1173:15338;967:3575;942:7284`) → BACK
- [ON_CLICK] Карточка вещи ×2 (`1173:15402`) → NAVIGATE → Wardrobe / Item Details / Variant 01 (`1143:2840`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Поле поиска (`I1173:15338;967:3575;1109:4909`) → NAVIGATE → Wardrobe / Item Search / Query Focused (`1173:15144`) DISSOLVE 240 мс

### Wardrobe / Item Search / No Results — `1173:15414` (393x852)

- [ON_CLICK] Шапка поиска: «Назад» (`I1173:15415;967:3575;942:7284`) → BACK
- [ON_CLICK] Кнопка «Сбросить поиск» (`I1173:15477;968:3637`) → NAVIGATE → Wardrobe / Item Search / Query Focused (`1173:15144`) DISSOLVE 240 мс
- [ON_CLICK] Поле поиска (`I1173:15415;967:3575;1109:4909`) → NAVIGATE → Wardrobe / Item Search / Query Focused (`1173:15144`) DISSOLVE 240 мс

### Search / Text / Results — `1141:2876` (393x852)

- [ON_CLICK] Шапка поиска: «Назад» (`I1141:2877;967:3575;942:7284`) → BACK
- [ON_CLICK] Фильтр «Цена» (`I1141:2877;967:3595;967:3604`) → OPEN_OVERLAY → Search / Results / Sheet / Price Filter (`1144:3684`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Фильтр «Сортировка» (`I1141:2877;967:3595;967:3596`) → OPEN_OVERLAY → Search / Results / Sheet / Sorting (`1144:3485`) MOVE_IN BOTTOM 300 мс
- _предложение_ [ON_CLICK] Сердечко на карточке (`I1141:2979;942:6320`) → OPEN_OVERLAY → Search / Result Item / Toast / Moved to Wishlist (`1176:11864`) DISSOLVE 240 мс — в коде like — нативный (NATIVE), тост «в вишлист» не показывается; кадр тоста 1176:11864 есть

### Search / Text / No Results Filtered — `1141:3067` (393x852)

- [ON_CLICK] Шапка поиска: «Назад» (`I1141:3068;967:3575;942:7284`) → BACK
- [ON_CLICK] Кнопка «Сбросить поиск» (`I1141:3137;968:3637`) → BACK

### Search / Photo / Crop — `1176:19019` (393x852)

- [ON_CLICK] Кнопка «Найти похожее» → NAVIGATE → Search / Photo / Results (`1173:14753`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Кнопка «Назад» (Inverse) → BACK

### Search / Photo / Results — `1173:14753` (393x852)

- [ON_CLICK] Шапка поиска: «Назад» (`I1173:14754;967:3575;942:7284`) → BACK

### Stylist / Trips / List — `1168:4579` (393x852)

- [ON_CLICK] Шапка: назад (`I1168:4580;967:3518`) → BACK
- [ON_CLICK] Карточки поездок ×5 (`1168:4659`) → NAVIGATE → Stylist / Trip Details / Outfits Tab (`1177:13116`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Карточка «+ Новая поездка» (`1168:4649`) → — — не прототипируется: нет кадра
- [ON_CLICK] Шапка: «Как это работает» (`I1168:4580;967:3534`) → — — не прототипируется: нет кадра

### Stylist / Trip Details / Outfits Tab — `1177:13116` (393x852)

- [ON_CLICK] Шапка: назад (`I1177:13117;967:3518`) → BACK
- [ON_CLICK] Коллаж образа ×2 (`1177:13213`) → NAVIGATE → Wardrobe / Outfit Details / Variant 01 (`1143:3032`) MOVE_IN RIGHT 300 мс
- _предложение_ [ON_CLICK] Сегмент «Вещи · 4» (`I1177:13178;942:7207;1177:13209`) → NAVIGATE → Stylist / Trip Details / Items Tab (`1168:4679`) DISSOLVE 240 мс — в routes.ts нет; порядок сегментов в коде: Образы · 1 \| Вещи · 4

### Stylist / Trip Details / Items Tab — `1168:4679` (393x852)

- [ON_CLICK] Шапка: назад (`I1168:4680;967:3518`) → BACK
- _предложение_ [ON_CLICK] Сегмент «Образы · 1» (`I1168:4742;942:7207;1168:4802`) → NAVIGATE → Stylist / Trip Details / Outfits Tab (`1177:13116`) DISSOLVE 240 мс —
- _предложение_ [ON_CLICK] Карточка вещи (`1168:4813`) → NAVIGATE → Wardrobe / Item Details / Variant 01 (`1143:2840`) MOVE_IN RIGHT 300 мс — в routes.ts нет

### Outfit Creation / Item Selection / Ready to Continue — `1173:22216` (393x852)

- [ON_CLICK] Шаг «Коллаж» (`I1173:22273;942:7222;1173:22303`) → NAVIGATE → Outfit Creation / Canvas / Filtered (`1174:22173`) DISSOLVE 240 мс
- [ON_CLICK] Шаг «Описание» (`I1173:22273;942:7222;1173:22304`) → NAVIGATE → Outfit Creation / Criteria / Default (`1174:22446`) DISSOLVE 240 мс
- [ON_CLICK] Шапка: назад (`I1173:22217;967:3518`) → BACK
- [ON_CLICK] Шапка: «Перемешать» (`I1173:22217;967:3534`) → — — не прототипируется: нет кадра тоста
- [ON_CLICK] Кнопка «Далее» (`I1173:22400;967:3671`) → NAVIGATE → Outfit Creation / Canvas / Filtered (`1174:22173`) MOVE_IN RIGHT 300 мс

### Outfit Creation / Item Selection / Items Selected — `1173:22050` (393x852)

- [ON_CLICK] Шаг «Коллаж» (`I1173:22107;942:7222;1173:22147`) → NAVIGATE → Outfit Creation / Canvas / Filtered (`1174:22173`) DISSOLVE 240 мс
- [ON_CLICK] Шаг «Описание» (`I1173:22107;942:7222;1173:22148`) → NAVIGATE → Outfit Creation / Criteria / Default (`1174:22446`) DISSOLVE 240 мс
- [ON_CLICK] Шапка: назад (`I1173:22051;967:3518`) → BACK

### Outfit Creation / Canvas / Filtered — `1174:22173` (393x852)

- [ON_CLICK] Шаг «Гардероб» (`I1174:22230;942:7222;1174:22259`) → NAVIGATE → Outfit Creation / Item Selection / Ready to Continue (`1173:22216`) DISSOLVE 240 мс
- [ON_CLICK] Шаг «Описание» (`I1174:22230;942:7222;1174:22261`) → NAVIGATE → Outfit Creation / Criteria / Default (`1174:22446`) DISSOLVE 240 мс
- [ON_CLICK] Шапка: назад (`I1174:22174;967:3518`) → BACK
- [ON_CLICK] Шапка: «Перемешать» (`I1174:22174;967:3534`) → — — не прототипируется: нет кадра тоста
- [ON_CLICK] Кнопка «Далее» (`I1174:22435;967:3671`) → NAVIGATE → Outfit Creation / Criteria / Default (`1174:22446`) MOVE_IN RIGHT 300 мс

### Outfit Creation / Canvas / Default — `1174:21939` (393x852)

- [ON_CLICK] Шаг «Гардероб» (`I1174:21996;942:7222;1174:22025`) → NAVIGATE → Outfit Creation / Item Selection / Ready to Continue (`1173:22216`) DISSOLVE 240 мс
- [ON_CLICK] Шаг «Описание» (`I1174:21996;942:7222;1174:22027`) → NAVIGATE → Outfit Creation / Criteria / Default (`1174:22446`) DISSOLVE 240 мс
- [ON_CLICK] Шапка: назад (`I1174:21940;967:3518`) → BACK

### Outfit Creation / Canvas / Gesture Hint — `1174:21691` (393x852)

- [ON_CLICK] Шаг «Гардероб» (`I1174:21748;942:7222;1174:21787`) → NAVIGATE → Outfit Creation / Item Selection / Ready to Continue (`1173:22216`) DISSOLVE 240 мс
- [ON_CLICK] Шаг «Описание» (`I1174:21748;942:7222;1174:21789`) → NAVIGATE → Outfit Creation / Criteria / Default (`1174:22446`) DISSOLVE 240 мс
- [ON_CLICK] Шапка: назад (`I1174:21692;967:3518`) → BACK

### Outfit Creation / Criteria / Default — `1174:22446` (393x852)

- [ON_CLICK] Шаг «Гардероб» (`I1174:22503;942:7222;1174:22532`) → NAVIGATE → Outfit Creation / Item Selection / Ready to Continue (`1173:22216`) DISSOLVE 240 мс
- [ON_CLICK] Шаг «Коллаж» (`I1174:22503;942:7222;1174:22533`) → NAVIGATE → Outfit Creation / Canvas / Filtered (`1174:22173`) DISSOLVE 240 мс
- [ON_CLICK] Шапка: назад (`I1174:22447;967:3518`) → BACK
- [ON_CLICK] Кнопка «Создать образ» (`I1174:22704;967:3671`) → NAVIGATE → Wardrobe / Outfits / Populated (`1142:2412`) DISSOLVE 240 мс

### App / Splash / Default — `1173:18160` (393x852)

- [AFTER_TIMEOUT 1600 мс] Сплэш: автопереход (`1173:18160`) → NAVIGATE → Onboarding / Welcome / Default (`1158:4483`) DISSOLVE 240 мс

### Onboarding / Welcome / Default — `1158:4483` (393x852)

- [ON_CLICK] Кнопка «Начать бесплатно» (`I1158:4497;967:3671`) → NAVIGATE → Auth / Sign In / Empty (`1173:20639`) MOVE_IN RIGHT 300 мс

### Auth / Sign In / Empty — `1173:20639` (393x852)

- [ON_CLICK] Шапка: назад (`I1173:20640;967:3551`) → BACK
- [ON_CLICK] Кнопка «Войти» (`1173:20757`) → NAVIGATE → Onboarding / Name / Focused (`1173:21671`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Кнопка «Забыли пароль?» (`1173:20766`) → NAVIGATE → Auth / Password Recovery / Email Focused (`1173:21481`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Кнопка «Войти с Apple» (`1173:20779`) → NAVIGATE → Onboarding / Name / Focused (`1173:21671`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Ссылки «политикой» / «условиями» (**узла нет**) → NAVIGATE → Legal / Privacy Policy / May 2026 (`1204:20720`) MOVE_IN RIGHT 300 мс
- _предложение_ [ON_CLICK] Поле «Почта» → Email Partial (`I1173:20691;942:7266;1173:20738`) → NAVIGATE → Auth / Sign In / Email Partial (`1173:20790`) DISSOLVE 240 мс — цепочка состояний ввода; в routes.ts нет

### Auth / Sign In / Email Partial — `1173:20790` (393x852)

- [ON_CLICK] Шапка: назад (`I1173:20791;967:3551`) → BACK
- [ON_CLICK] Кнопка «Войти» (`1173:20911`) → NAVIGATE → Onboarding / Name / Focused (`1173:21671`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Кнопка «Забыли пароль?» (`1173:20920`) → NAVIGATE → Auth / Password Recovery / Email Focused (`1173:21481`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Кнопка «Войти с Apple» (`1173:20933`) → NAVIGATE → Onboarding / Name / Focused (`1173:21671`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Ссылки «политикой» / «условиями» (**узла нет**) → NAVIGATE → Legal / Privacy Policy / May 2026 (`1204:20720`) MOVE_IN RIGHT 300 мс
- _предложение_ [ON_CLICK] Поле «Пароль» → Credentials Filled (`I1173:20842;942:7266;1173:20907`) → NAVIGATE → Auth / Sign In / Credentials Filled (`1173:21019`) DISSOLVE 240 мс —

### Auth / Sign In / Credentials Filled — `1173:21019` (393x852)

- [ON_CLICK] Шапка: назад (`I1173:21020;967:3551`) → BACK
- [ON_CLICK] Кнопка «Войти» (`1173:21142`) → NAVIGATE → Onboarding / Name / Focused (`1173:21671`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Кнопка «Забыли пароль?» (`1173:21151`) → NAVIGATE → Auth / Password Recovery / Email Focused (`1173:21481`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Кнопка «Войти с Apple» (`1173:21164`) → NAVIGATE → Onboarding / Name / Focused (`1173:21671`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Ссылки «политикой» / «условиями» (**узла нет**) → NAVIGATE → Legal / Privacy Policy / May 2026 (`1204:20720`) MOVE_IN RIGHT 300 мс
- _предложение_ [ON_CLICK] Иконка «глаз» → Password Visible (`I1173:21071;942:7266;1173:21135`) → NAVIGATE → Auth / Sign In / Password Visible (`1173:21250`) DISSOLVE 240 мс —

### Auth / Sign In / Password Visible — `1173:21250` (393x852)

- [ON_CLICK] Шапка: назад (`I1173:21251;967:3551`) → BACK
- [ON_CLICK] Кнопка «Войти» (`1173:21373`) → NAVIGATE → Onboarding / Name / Focused (`1173:21671`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Кнопка «Забыли пароль?» (`1173:21382`) → NAVIGATE → Auth / Password Recovery / Email Focused (`1173:21481`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Кнопка «Войти с Apple» (`1173:21395`) → NAVIGATE → Onboarding / Name / Focused (`1173:21671`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Ссылки «политикой» / «условиями» (**узла нет**) → NAVIGATE → Legal / Privacy Policy / May 2026 (`1204:20720`) MOVE_IN RIGHT 300 мс

### Auth / Password Recovery / Email Focused — `1173:21481` (393x852)

- [ON_CLICK] Шапка: назад (`I1173:21482;967:3551`) → BACK
- [ON_CLICK] Кнопка «Отправить код» (`1173:21587`) → — — не прототипируется: нет кадра-цели

### Onboarding / First Item / Prompt — `1173:21880` (393x852)

- [ON_CLICK] Шапка: «Пропустить» (`I1173:21881;967:3555`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс
- [ON_CLICK] Шапка: назад (`I1173:21881;967:3551`) → BACK
- [ON_CLICK] Кнопка нижней панели (`I1173:21951;967:3671`) → NAVIGATE → New Item / Photo / Removing Background Variant 01 (`1174:17689`) MOVE_IN RIGHT 300 мс

### Onboarding / Name / Focused — `1173:21671` (393x852)

- [ON_CLICK] Шапка: назад (`I1173:21672;967:3551`) → BACK
- [ON_CLICK] Кнопка «Далее» (`I1173:21869;967:3671`) → NAVIGATE → Onboarding / First Item / Prompt (`1173:21880`) MOVE_IN RIGHT 300 мс

### Onboarding / First Outfit / Preview — `1173:21962` (393x852)

- _предложение_ [ON_CLICK] Кнопка «Сохранить образ и завершить» (`I1173:22039;967:3671`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс —
- _предложение_ [ON_CLICK] Шапка: «Пропустить» (`I1173:21963;967:3555`) → NAVIGATE → Outfits / Everyday / Sunny (`1173:16144`) DISSOLVE 240 мс —

### New Item / Photo / Removing Background Variant 01 — `1174:17689` (393x852)

- [AFTER_TIMEOUT 2600 мс] Загрузка фото: автопереход (`1174:17689`) → NAVIGATE → Wardrobe / Item Details / Variant 01 (`1143:2840`) DISSOLVE 240 мс
- [ON_CLICK] Шапка: назад (`I1174:17690;967:3518`) → BACK

### Profile / Accounts / Sheet / List — `1147:7151` (393x304)

- [ON_CLICK] Иконка «Редактировать профиль» (`I1147:7152;962:3076;1147:7174;1131:5150`) → NAVIGATE → Profile / Edit / No Avatar (`1168:4851`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Иконка «Настройки» (`I1147:7152;962:3076;1147:7174;1131:5154`) → NAVIGATE → Settings / Main / Default (`1149:4140`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Карточка второго аккаунта (`I1147:7152;962:3076;1147:7188`) → CLOSE_OVERLAY
- [ON_CLICK] Кнопка «Добавить аккаунт» (`I1147:7152;962:3076;1147:7200`) → NAVIGATE → Auth / Sign In / Empty (`1173:20639`) MOVE_IN RIGHT 300 мс

### Profile / Analytics / Sheet / Period — `1147:3417` (393x176)

- [ON_CLICK] Чипсы периода ×4 (`I1147:3418;962:3076;1147:3460;942:7248;1147:3487`) → CLOSE_OVERLAY

### Settings / Main / Default — `1149:4140` (393x852)

- [ON_CLICK] Шапка: назад (`I1149:4141;967:3518`) → BACK
- [ON_CLICK] Карточка аккаунта (`1149:4210`) → NAVIGATE → Profile / Edit / No Avatar (`1168:4851`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Строка «Корзина вещей» (`I1149:4223;1037:5340;1149:4251`) → NAVIGATE → Trash / Items / Populated (`1142:3407`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Поле «Страна» (`1176:20223`) → OPEN_OVERLAY → Settings / Country / Sheet / Default (`1147:3725`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Поле «Валюта» (`1176:20224`) → OPEN_OVERLAY → Settings / Currency / Sheet / Default (`1174:16325`) MOVE_IN BOTTOM 300 мс
- [ON_CLICK] Кнопка «Удалить аккаунт» (`1176:20244`) → OPEN_OVERLAY → Settings / Delete Account / Dialog / Confirmation (`1176:11793`) DISSOLVE 240 мс
- [ON_CLICK] Абзац «Политикой конфиденциальности / Условиями использования» (`1176:20241`) → NAVIGATE → Legal / Privacy Policy / May 2026 (`1204:20720`) MOVE_IN RIGHT 300 мс
- [ON_CLICK] Внешние строки (Язык, Уведомления, Оценить, Поддержка, Идеи, Сотрудничество) (**узла нет**) → — — не прототипируется: внешние
- _предложение_ [ON_CLICK] Иконка «Выйти» (`I1149:4210;1150:7338`) → OPEN_OVERLAY → Settings / Sign Out / Dialog / Confirmation (`1147:7244`) DISSOLVE 240 мс — конфликт с route `.y-account`: в коде тап по иконке уйдёт в ProfileEdit — исправить порядок маршрутов

### Profile / Edit / No Avatar — `1168:4851` (393x852)

- [ON_CLICK] Шапка: назад (`I1168:4852;967:3518`) → BACK

### Profile / Edit / Avatar Added — `1176:19604` (393x852)

- [ON_CLICK] Шапка: назад (`I1176:19610;967:3518`) → BACK

### Legal / Privacy Policy / May 2026 — `1204:20720` (393x4050)

- [ON_CLICK] Шапка: назад (`I1204:20721;967:3551`) → BACK

### Legal / Terms of Use / May 2026 — `1204:20805` (393x4914)

- [ON_CLICK] Шапка: назад (`I1204:20806;967:3551`) → BACK

### Settings / Country / Sheet / Default — `1147:3725` (393x320)

- [ON_CLICK] Пункты стран ×4 (`I1147:3726;962:3076;1147:7055`) → CLOSE_OVERLAY

### Settings / Currency / Sheet / Default — `1174:16325` (393x722)

- [ON_CLICK] Пункты валют ×14 (`I1174:16326;962:3076;1174:16346`) → CLOSE_OVERLAY

### Settings / Delete Account / Dialog / Confirmation — `1176:11793` (393x452)

- [ON_CLICK] Кнопка «Отменить» (`I1176:11794;1148:6953`) → CLOSE_OVERLAY
- [ON_CLICK] Кнопка «Удалить» (`I1176:11794;1148:6954`) → NAVIGATE → Onboarding / Welcome / Default (`1158:4483`) DISSOLVE 240 мс

### Wardrobe / Items / Sheet / Category Root — `1173:16925` (393x360)

- [ON_CLICK] Кнопка «Применить» (`I1173:16926;962:3089`) → NAVIGATE → Wardrobe / Items / No Filter Results (`1141:2212`) DISSOLVE 240 мс
- [ON_CLICK] Кнопка «Сбросить» (`I1173:16926;962:3083`) → NAVIGATE → Wardrobe / Items / Populated (`1141:1697`) DISSOLVE 240 мс

## 7. Dark (только пары)

Реакции Light зеркалятся на Dark-кадры, когда есть Dark-пара и у цели. Пары: Wardrobe / Items / Populated (`1173:7888`), Search / Text / Results (`1173:7909`), Wardrobe / Outfits / Populated (`1173:7919`), Wardrobe / Item Details / Variant 01 (`1173:7945`), Settings / Main / Default (`1173:7974`), Profile / Overview / Analytics (`1173:7994`), Outfits / Everyday / Sunny (`1173:8022`), Stylist / Catalog / Input Focused (`1173:8042`), Profile / Accounts / Sheet / List (`1173:8065`), Settings / Delete Account / Dialog / Confirmation (`1173:8072`), Trash / Items / Dialog / Clear Confirmation (`1173:8081`). Остальные Dark-кадры (шторки/диалоги без базы) получают только реакции закрытия. Скрим в Dark — `rgba(0,0,0,0.6)`. Реакций: 27.

- `1173:7888` Wardrobe / Items / Populated: 5 реакц. (пара `1141:1697`)
- `1173:7909` Search / Text / Results: 1 реакц. (пара `1141:2876`)
- `1173:7919` Wardrobe / Outfits / Populated: 4 реакц. (пара `1142:2412`)
- `1173:7945` Wardrobe / Item Details / Variant 01: 1 реакц. (пара `1143:2840`)
- `1173:7974` Settings / Main / Default: 1 реакц. (пара `1149:4140`)
- `1173:7994` Profile / Overview / Analytics: 5 реакц. (пара `1149:3669`)
- `1173:8022` Outfits / Everyday / Sunny: 3 реакц. (пара `1173:16144`)
- `1173:8042` Stylist / Catalog / Input Focused: 3 реакц. (пара `1173:18217`)
- `1173:8065` Profile / Accounts / Sheet / List: 2 реакц. (пара `1147:7151`)
- `1173:8072` Settings / Delete Account / Dialog / Confirmation: 1 реакц. (пара `1176:11793`)
- `1173:8081` Trash / Items / Dialog / Clear Confirmation: 1 реакц. (пара `1147:7271`)

## 8. Пробелы

### 8.1 Недостижимые экраны

**orphan-screen (нет входа ни в коде, ни в кадрах)** — 8:

- `1149:4079` how work modal/sheet
- `1168:4679` Stylist / Trip Details / Items Tab
- `1173:16493` Outfits / Everyday / Occasion Selector Open
- `1173:21671` Onboarding / Name / Focused
- `1173:21962` Onboarding / First Outfit / Preview
- `1176:19604` Profile / Edit / Avatar Added
- `1176:20595` Stylist / Trips / List
- `1204:20805` Legal / Terms of Use / May 2026

**input-state (клавиатура/ввод; нет маршрута в routes.ts)** — 20:

- `1173:14557` Search / Text / Query Focused
- `1173:14911` Search / Photo / Query Focused
- `1173:18555` Wishlist / New Item / Completed
- `1173:20790` Auth / Sign In / Email Partial
- `1173:21019` Auth / Sign In / Credentials Filled
- `1173:21250` Auth / Sign In / Password Visible
- `1173:22050` Outfit Creation / Item Selection / Items Selected
- `1174:17332` New Item / Details / No Photo Variant 01
- `1174:18042` New Item / Details / Photo Added Variant 01
- `1174:18405` New Item / Details / Name Focused Variant 01
- `1174:18824` New Item / Details / Completed Variant 01
- `1174:19818` New Item / Details / No Photo Variant 02
- `1174:20167` New Item / Photo / Removing Background Variant 02
- `1174:20520` New Item / Details / Photo Added Variant 02
- `1174:20883` New Item / Details / Name Focused Variant 02
- `1174:21302` New Item / Details / Completed Variant 02
- `1174:21691` Outfit Creation / Canvas / Gesture Hint
- `1174:21939` Outfit Creation / Canvas / Default
- `1176:19708` Stylist / Assistant / Input Focused
- `1176:19877` Stylist / Home / Greeting Entered

**data-state (зависит от данных; в коде выбирается историей, а не переходом)** — 11:

- `1141:2088` Wardrobe / Items / Empty
- `1141:2432` Wardrobe / Outfits / Empty
- `1141:2566` Wishlist / Items / Empty
- `1142:3181` Archive / Items / Empty
- `1173:16259` Outfits / Everyday / Rain Alert
- `1173:19455` Outfits / Recommendations / Empty Wardrobe
- `1174:19706` Wardrobe / Outfits / No Filter Results
- `1176:20253` Stylist / Outfit of the Day / Default
- `1176:20319` Stylist / Outfit of the Day / Default
- `1176:20445` Stylist / Outfit of the Day / Default
- `1176:20521` Stylist / Outfit of the Day / Default

**scroll-state (пара Animations, не навигация)** — 7:

- `1174:17064` Wishlist / Item Details / Scrolled
- `1174:19290` Wardrobe / Item Details / Variant 02
- `1174:19422` Wardrobe / Outfit Details / Scrolled
- `1174:19564` Wardrobe / Outfit Details / Variant 02
- `1205:13362` Wardrobe / Items / Populated / Scrolled
- `1205:13506` Wishlist / Items / Populated / Scrolled
- `1205:21115` Profile / Overview / Analytics / Scrolled

### 8.2 Оверлеи без входящей связи (не достижимы по обязательным реакциям)

`1144:3070` Wishlist / Item / Sheet / Actions, `1144:3161` New Item / Details / Sheet / Category Root, `1144:3290` Wardrobe / Items / Sheet / Category Expanded, `1144:3485` Search / Results / Sheet / Sorting, `1144:3546` Outfits / Everyday / Sheet / Occasion Presets, `1147:3351` Onboarding / First Item / Sheet / Add Photo, `1147:3377` Search / Photo / Sheet / Replace, `1147:3502` Profile / Edit / Sheet / Gender, `1147:3559` Profile / Edit / Sheet / Birth Year, `1147:7208` Profile / Accounts / Sheet / Single, `1147:7244` Settings / Sign Out / Dialog / Confirmation, `1147:7311` Outfit Creation / Shuffle / Dialog / Unsaved Changes, `1147:7332` Settings / Delete Account / Dialog / Confirmation, `1173:13791` Outfit Creation / Criteria / Sheet / Season Filter, `1173:13856` Wardrobe / Edit Item / Sheet / Season, `1173:14091` Outfits / Everyday / Sheet / Occasion Filter, `1173:14171` Outfit Creation / Criteria / Sheet / Occasion Filter, `1173:14331` Wardrobe / Outfits / Sheet / Occasion Presets, `1173:14403` Profile / Edit / Sheet / Style, `1173:14464` Wardrobe / Edit Item / Sheet / Color, `1173:16639` Wardrobe / Outfit / Sheet / Permanent Delete Actions, `1173:16669` Wishlist / Outfit / Sheet / Permanent Delete Actions, `1173:16699` Wardrobe / Outfit / Sheet / Actions, `1173:16729` Wishlist / Add / Sheet / Content Type, `1173:16811` Search / Photo / Sheet / Add, `1173:16837` New Item / Photo / Sheet / Add, `1173:16863` Profile / Avatar / Sheet / Add, `1173:16889` Profile / Avatar / Sheet / Replace, `1173:17042` Outfit Creation / Items / Sheet / Category with Selection, `1173:17210` Wardrobe / Edit Item / Sheet / Category Expanded, `1173:17360` New Item / Details / Sheet / Category Expanded, `1174:15483` Outfits / Everyday / Sheet / Custom Occasion Name Empty, `1174:15648` Outfits / Everyday / Sheet / Custom Occasion Name Entered, `1174:15803` Wardrobe / Outfits / Sheet / Custom Occasion Name Empty, `1174:15958` Wardrobe / Outfits / Sheet / Custom Occasion Name Entered, `1174:16113` Settings / Country / Sheet / Search Focused, `1174:16605` Outfit Creation / Item Filter / Sheet / Bottoms, `1176:11722` Outfit Creation / Exit / Dialog / Unsaved Changes, `1176:11751` Outfit Creation / Clear / Dialog / Confirmation, `1176:11772` Outfit Creation / Exit / Dialog / Unsaved Changes, `1176:11864` Search / Result Item / Toast / Moved to Wishlist

Из них есть маршрут в коде, но нет кадра-цели, — см. 8.4. Остальные — шторки/диалоги, на которые в routes.ts нет ни одной ссылки (выбор повода, категории редактирования вещи, Exit/Shuffle/Clear/Sign Out, Add Photo и т.д.).

### 8.3 Тупики без «назад»

- `1176:20046` Stylist / Home / Message Ready — открытая клавиатура, вкладок нет; выход только через BACK (в коде «Назад» есть только у экранов с шапкой)
- Точка входа «Архив и корзина» (`1142:3268`): BACK не сработает без истории.
- `Stylist / Home / Greeting Entered` — недостижим и без выхода.

### 8.4 Маршруты кода / #122 без кадра во Flow

- closeThen(toast 'Вещь добавлена в гардероб') после NewItem → предложить кадр «Wardrobe / Item / Toast / Added to Wardrobe»
- toast 'Образ отмечен как надетый' (с ↶) на деталях образа → предложить кадр «Wardrobe / Outfit / Toast / Marked as Worn + вариант штампа done на Wardrobe / Outfit Details»
- toast 'Вещи перемешаны' → предложить кадр «Outfit Creation / Shuffle / Toast / Shuffled (во Flow есть только диалог Shuffle)»
- toast 'Образ создан' → предложить кадр «Outfit Creation / Criteria / Toast / Outfit Created»
- toast 'Вещь добавлена в вишлист' → предложить кадр «Wishlist / New Item / Toast / Added (1176:11864 «Вещь перемещена в вишлист» — другой текст)»
- toast 'Образ перемещён в гардероб' → предложить кадр «Wishlist / Outfit / Toast / Moved to Wardrobe»
- toast 'Корзина очищена' → предложить кадр «Trash / Items / Toast / Cleared»
- toast 'Страна изменена' / 'Валюта изменена' → предложить кадр «Settings / Country|Currency / Toast / Changed»
- toast 'Аккаунт деактивирован на 14 дней' → предложить кадр «Settings / Delete Account / Toast / Deactivated»
- #122: «Вернуть в гардероб» из Архива / Корзины — тост возврата → предложить кадр «Archive|Trash / Item / Toast / Restored to Wardrobe»
- PasswordRecoverySent (диалог «Готово!») → предложить кадр «Auth / Password Recovery / Dialog / Sent»
- ProfileSingle → предложить кадр «Profile / Overview / Single Account»
- Создание поездки (карточка «+») → предложить кадр «Stylist / Trips / New Trip»
- Редактировать вещь (пункт «Редактировать») → предложить кадр «Wardrobe / Edit Item / Default»
- «Как это работает» (Стилист) → предложить кадр «Stylist / How It Works»

### 8.5 Реакции без узла-триггера или без цели

- `1176:11844` Wardrobe / Item / Toast / Moved to Archive: Иконка ↶ «Отменить» в тосте
- `1176:11849` Archive / Item / Toast / Moved to Trash: Иконка ↶ «Отменить» в тосте
- `1176:19019` Search / Photo / Crop: Кнопка «Найти похожие»
- `1176:19019` Search / Photo / Crop: Шапка: назад
- `1173:20639` Auth / Sign In / Empty: Ссылки «политикой» / «условиями»
- `1173:20790` Auth / Sign In / Email Partial: Ссылки «политикой» / «условиями»
- `1173:21019` Auth / Sign In / Credentials Filled: Ссылки «политикой» / «условиями»
- `1173:21250` Auth / Sign In / Password Visible: Ссылки «политикой» / «условиями»
- `1149:4140` Settings / Main / Default: Внешние строки (Язык, Уведомления, Оценить, Поддержка, Идеи, Сотрудничество)
- `1173:18217` Карточки soon (Оживи гардероб, Докупить, Оцени лук) — заглушка, не прототипируется
- `1143:3032` Штамп «Надеть» — нет кадра-цели
- `1174:16922` Иконка «Открыть в магазине» — внешний переход, не прототипируется
- `1168:4579` Карточка «+ Новая поездка» — нет кадра
- `1168:4579` Шапка: «Как это работает» — нет кадра
- `1173:22216` Шапка: «Перемешать» — нет кадра тоста
- `1174:22173` Шапка: «Перемешать» — нет кадра тоста
- `1173:21481` Кнопка «Отправить код» — нет кадра-цели
- `1149:4140` Внешние строки (Язык, Уведомления, Оценить, Поддержка, Идеи, Сотрудничество) — внешние

### 8.6 Несоответствия имён

- StylistHome: код «Stylist / Catalog» ↔ Figma «Stylist / Catalog / Input Focused»
- Settings: код «Settings / Main» ↔ Figma «Settings / Main / Default»
- OnboardingWelcome: код «Onboarding / Welcome» ↔ Figma «Onboarding / Welcome / Default»
- FirstItemPrompt: код «Onboarding / First Item Prompt» ↔ Figma «Onboarding / First Item / Prompt»
- SearchDiscover: код «Search / Discover» ↔ Figma «Search / Discover / Default»
- Splash: код «App / Splash» ↔ Figma «App / Splash / Default»
- PasswordRecovery: код «Auth / Password Recovery» ↔ Figma «Auth / Password Recovery / Email Focused»
- WardrobeItemDetails / OutfitDetails: код «… Details» ↔ Figma «… Details / Variant 01 (Outfit: + Variant 02, Scrolled)»
- ItemDetails: код «Wishlist / Item Details» ↔ Figma «Wishlist / Item Details / Default»
- ClearTrash / DeleteAccount: код «… / Dialog / Clear | Confirmation» ↔ Figma «… / Dialog / Clear Confirmation; Delete Account ×2 (1176:11793, 1147:7332)»
- OutfitOfTheDayEmpty: код «…/ No More Outfits» ↔ Figma «4 кадра с одним именем «Stylist / Outfit of the Day / Default»»
- Trips: код «Stylist / Trips / List» ↔ Figma «2 кадра с этим именем: 1168:4579 (карточки поездок) и 1176:20595 (лента «С чем носить»)»
- Toast: код «Wardrobe / Item / Toast» ↔ Figma «Wardrobe / Item / Toast / Moved to Archive; «Archive / Item / Toast / Moved to Trash» используется и из Гардероба»
- Exit dialog: код «—» ↔ Figma «2 кадра «Outfit Creation / Exit / Dialog / Unsaved Changes» (1176:11722, 1176:11772)»

### 8.7 Ловушки истории BACK / высокие кадры

- `1143:2840`: цепочка NewItem → (AFTER_TIMEOUT NAVIGATE) → Item Details: BACK вернёт на кадр загрузки → по таймеру снова на детали. Решение: скопировать детали «· Proto» для цепочки создания, у которого «назад» = NODE Гардероб (MOVE_OUT)
- `1142:3342`: NAVIGATE из диалога очистки оставляет TrashPopulated в истории. Решение: «назад» = NODE Settings (MOVE_OUT), так и записано
- `1142:3268`: точка входа «Архив и корзина» — истории нет, BACK ничего не делает. Решение: использовать вход через Гардероб или временный NODE
- `1141:1697`: сегменты/вкладки — NAVIGATE: история растёт; BACK на корневых кадрах не используется. Решение: нет действий; BACK только на push-экранах
- Высокий кадр `1149:3669` 393x3164: обёртка 393×852, overflow вертикальный скролл; bottom-nav — fixed
- Высокий кадр `1173:18217` 393x1363: то же; док (input-bar + tab-bar) закрепить
- Высокий кадр `1204:20720` 393x4050: то же
- Высокий кадр `1204:20805` 393x4914: то же
- `1176:19019` Search / Photo / Crop: кадр пуст (0 детей): нет ни триггеров, ни содержимого

### 8.8 Противоречия best practices и расхождения

- Оригиналы диалогов (555:4196, 349:10758, 517:6986 …) содержат хэндл 48×4 — противоречит §7.7 (диалог без хэндла); в Flow-копиях хэндл скрыт (hidden) у всех 8 диалогов — прототипировать только Flow-копии
- Flow-снекбары (1176:11844/11849/11859 …) содержат только ×; ↶ из #122 отсутствует; «Вещь удалена навсегда» (11854) корректно без ↶, но структурно не отличается от остальных — добавить в компонент snackbar вариант Action=undo
- Тосты в коде живут 4 с / 6 с с ↶, в задаче 3 с — приняты значения токенов
- Sheet «MOVE_IN снизу, 300 мс EASE_OUT» ≠ токен: §7.8 говорит «пружина без перелёта» — в Figma это CUSTOM_SPRING mass 1 / stiffness 300 / damping 35 (≈критическое); базово записано ease-out 300 по заданию
- Push в коде уводит предыдущий экран на −30 % с затемнением 14 %; MOVE_IN в Figma оставляет старый на месте (параллакс воспроизводит SLIDE_IN; проверить и заменить при желании)
- Долгое нажатие: у Figma нет long-press, есть MOUSE_DOWN+delay — риск двойного срабатывания с ON_CLICK
- Overlay toasts в Figma блокируют базу (модальны) на время показа — риск для сценариев подряд; см. md
- Диалоги Exit / Shuffle / Clear / Sign Out есть во Flow, но не в routes.ts (код: выход без подтверждения, перемешать — тост)
- Ссылки политика/условия на Sign In: в коде <a>, на кадрах Flow узла нет
- Кнопка «Настройки» / «Редактировать профиль» в коде — кнопки с подписью внутри шторки; во Flow это иконки edit/settings в account-card

## 9. Объём и пакеты записи

Пакеты по 20–30 кадров; порядок безопасный (цели существуют заранее). Перед P1 — проверка на одном кадре (Wardrobe Populated: вкладки, сегмент, чипс → шторка, карточка long-press).

| Пакет                                                                      | Кадров | Записей (реакций) | Записей в узлы |
| -------------------------------------------------------------------------- | ------ | ----------------- | -------------- |
| P1 · Корни и таб-бар: Главная, Гардероб, Образы, Вишлист, Стилист, Профиль | 20     | 138               | 168            |
| P2 · Детали, поиск по гардеробу, вишлист-детали, архив и корзина (экраны)  | 20     | 43                | 61             |
| P3 · Создание образа, онбординг, вход, профиль/настройки (экраны)          | 22     | 60                | 60             |
| P4 · Оверлеи: шторки, диалоги, тосты (внутренние реакции)                  | 16     | 37                | 56             |
| P5 · Dark (только пары): зеркало Light                                     | 11     | 27                | 27             |
| P6 · Предложения (proposed) после утверждения владельцем                   | 15     | 21                | 21             |

В P1 самая плотная часть — таб-бар (4 реакции × ~20 кадров) и карточки; P5 (Dark) — после утверждения Light; P6 — только с решением владельца (каждое предложение помечено `source: figma-proposed`).
