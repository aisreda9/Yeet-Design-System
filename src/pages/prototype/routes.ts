import { TAB_ROOTS, type ScreenId } from './screens';

/** Команды навигации, которые получает обработчик перехода. */
export type Nav = {
  /** Новый экран справа, старый уезжает на 30 %. */
  push(id: ScreenId): Promise<void>;
  /** Назад: текущий уходит вправо. */
  back(): Promise<void>;
  /** Замена текущего экрана проявлением (сегменты, «применить фильтр»). */
  swap(id: ScreenId): Promise<void>;
  /** Сброс стека к новому корню проявлением (вкладки, выход, «Пропустить»). */
  root(id: ScreenId): Promise<void>;
  /** Шторка или диалог поверх текущего экрана. */
  overlay(id: ScreenId): Promise<void>;
  /** Сменить верхнюю шторку её же состоянием (Figma: Swap overlay) — без ухода и повторного выезда; не шторка — как `swap`. */
  change(id: ScreenId): Promise<void>;
  /** Закрыть верхний слой (шторку, диалог) с анимацией ухода. */
  close(): Promise<void>;
  /** Уйти из цепочки экранов (создание образа) одним «назад» — к экрану, откуда в неё вошли. */
  leave(ids: ScreenId[]): Promise<void>;
  /** Snackbar над низом экрана. `undo` — кнопка «Отменить»: вызывается только ею, не по таймеру и не «×». */
  toast(text: string, opts?: { undo?: (nav: Nav) => void | Promise<void> }): void;
  /** Убрать из списка вещь, по которой нажали последней (карточка скрывается сразу). Результат — вернуть её на место. */
  take(): () => void;
  /** Сколько карточек вещей видно на верхнем экране. */
  left(): number;
  /** Экран под верхним слоем: откуда открыли шторку. */
  below(): ScreenId | undefined;
  /** Экраны в стеке снизу вверх: откуда пришли в общую цепочку (онбординг или гардероб). */
  stack(): ScreenId[];
  /** Прокрутить контент экрана к началу (повторное нажатие на активную вкладку). */
  scrollTop(): void;
};

export type Go = ScreenId | ((nav: Nav, el: HTMLElement, e?: MouseEvent) => void | Promise<void>);

export type Route = {
  /** CSS-селектор элемента. */
  sel: string;
  /** Подпись элемента (aria-label или текст): строка целиком или регулярное выражение. */
  text?: string | RegExp;
  /** `tap` — по умолчанию, `long` — долгое нажатие (400 мс) или правая кнопка. */
  on?: 'tap' | 'long';
  go: Go;
  /** Имя для скринридера у элемента без собственной кнопки (коллаж). */
  name?: string;
  /** Нативный обработчик компонента тоже отрабатывает (шторка закрывается сама), переход идёт параллельно. */
  native?: boolean;
  /** Не срабатывает, если палец попал в этот вложенный элемент (вещь на холсте — свои жесты). */
  not?: string;
};

const ok = (id: ScreenId): Go => id;
const sheet = (n: Nav) => n.close();
const label = (el: Element) => (el.getAttribute('aria-label') ?? el.textContent ?? '').replace(/\s+/g, ' ').trim();
const active = (el: HTMLElement) => el.getAttribute('aria-checked') === 'true';

/** Кнопка по подписи. */
const btn = (text: string | RegExp, go: Go, extra?: Partial<Route>): Route => ({ sel: 'button', text, go, ...extra });
/** Действие после закрытия шторки; `from` — экран под ней (после закрытия `below()` уже пуст). */
const closeThen = (fn: (n: Nav, from?: ScreenId) => void | Promise<void>): Go => async (n) => { const from = n.below(); await n.close(); await fn(n, from); };

/* ─── Сегменты «Вещи / Образы / Вишлист» ─────────────────────────────── */
const topSeg = (self: 'items' | 'outfits' | 'wishlist'): Route[] => ([
  { sel: '.y-segment--L [role=radio]', text: 'Вещи', go: (n, el) => { if (!active(el)) return n.swap('Wardrobe'); } },
  { sel: '.y-segment--L [role=radio]', text: 'Образы', go: (n, el) => { if (!active(el)) return n.swap('OutfitsPopulated'); } },
  { sel: '.y-segment--L [role=radio]', text: 'Вишлист', go: (n, el) => { if (!active(el)) return n.swap('Wishlist'); } },
] as Route[]).filter((r) => (self === 'items' ? r.text !== 'Вещи' : self === 'outfits' ? r.text !== 'Образы' : r.text !== 'Вишлист'));
const subSeg: Route[] = [
  { sel: '.y-segment--S [role=radio]', text: 'Вещи', go: (n, el) => { if (!active(el)) return n.swap('Wishlist'); } },
  { sel: '.y-segment--S [role=radio]', text: 'Образы', go: (n, el) => { if (!active(el)) return n.swap('WishlistOutfits'); } },
];
/**
 * Фильтры гардероба: у каждого чипса своя шторка (Figma: Items «Категория» / «Сезон» / «Теги», Outfits «Повод» / «Сезон» / «Теги», #210).
 * «Категория» открывает список свёрнутым (Figma OPEN_OVERLAY → Category Root `1173:16925`), строки раскрываются в самой шторке (#220).
 */
const chipSheet = (text: RegExp, id: ScreenId): Route => ({ sel: '.y-chip-group button', text, go: (n) => n.overlay(id) });
const itemFilters: Route[] = [chipSheet(/^Категория/, 'CategoryRootSheet'), chipSheet(/^Сезон/, 'SeasonFilterSheet'), chipSheet(/^Теги/, 'TagsFilterSheet')];
// первый чипс образов — повод: «Повод» или выбранный («На каждый день»)
const outfitFilters: Route[] = [chipSheet(/^Сезон/, 'SeasonFilterSheet'), chipSheet(/^Теги/, 'TagsFilterSheet'), { sel: '.y-chip-group button', go: (n) => n.overlay('OccasionFilterSheet') }];
/** Выбор в шторке-фильтре без кнопок применяется сразу: «Все» сбрасывает фильтр, остальное — фильтрует. */
const applyFilter = closeThen((n, b) => { if (b === 'Wardrobe') return n.swap('ItemsNoFilterResults'); if (b === 'OutfitsPopulated') return n.swap('OutfitsNoFilterResults'); });
const resetFilter = closeThen((n, b) => { if (b === 'ItemsNoFilterResults') return n.swap('Wardrobe'); if (b === 'OutfitsNoFilterResults') return n.swap('OutfitsPopulated'); });
/** Чипсы шторки-фильтра — статичные (без `onToggle`): тело чипса, в том числе у «Кастомный ×». */
const filterChip = ':is(.y-chip--static, .y-chip__toggle)';
const quickFilter: Route[] = [
  { sel: filterChip, text: 'Все', go: resetFilter },
  { sel: filterChip, go: applyFilter },
];
const gridSearch: Route[] = [
  { sel: 'button', text: 'Поиск', go: ok('ItemSearchFocused') },
  { sel: 'button', text: 'Архив', go: ok('Archive') },
];
const openItem: Route = { sel: '.y-item-card', go: ok('WardrobeItemDetails') };
const openOutfit: Route = { sel: '.y-collage', name: 'Открыть образ', go: ok('OutfitDetails') };
/**
 * Шторка действий образа: долгий тап по образу в списке и «Ещё» в деталях (решение владельца, #216 строка 35):
 * заголовок — повод, «Редактировать» и «Удалить навсегда» (Figma `1173:16639`). `OutfitActions` ни откуда не открывается.
 */
const outfitMenu: Route = { sel: '.y-collage', on: 'long', go: (n) => n.overlay('OutfitPermanentDelete') };
/** Шаги создания образа в шапке. */
const steps = (self: 'Гардероб' | 'Коллаж' | 'Описание'): Route[] =>
  ([['Гардероб', 'OutfitItems'], ['Коллаж', 'Canvas'], ['Описание', 'OutfitCriteria']] as const)
    .filter(([l]) => l !== self)
    .map(([l, id]) => ({ sel: '.y-segment [role=radio]', text: l, go: (n: Nav) => n.swap(id) }));

/**
 * Главная: штамп «Надеть» и свайп образов — нативные (OutfitPager), тап по коллажу открывает образ.
 * Тап по превью соседнего образа (`.is-prev` / `.is-next`) — тоже детали образа, как в Figma (PROTOTYPE-FIGMA §Sunny, `1173:16192`),
 * а не листание к нему, как в истории компонента (#234). Превью `inert`, клик приходит в ленту — Prototype переадресует его превью под пальцем.
 * «на каждый день ⌄» (`.y-header__accent`) — нативная кнопка: открывает шторку «Повод» самого экрана
 * (Figma OPEN_OVERLAY → Outfits / Everyday / Sheet / Occasion Filter `1173:14091`, история `TodayOccasions`); выбор повода меняет акцент (#216, строка 34).
 */
const today: Route[] = [{ sel: '.y-outfit-pager__look:is(.is-prev, .is-next)', go: ok('OutfitDetails') }, openOutfit];

/** Слова из подсказок поиска: длинная фраза «не находится», остальные ведут к результатам. Чипсы на фокусе — не кнопки. */
const noResults = /^Белое платье/;
const suggestions = (results: ScreenId, empty: ScreenId): Route[] => [
  { sel: '.y-chip-group > .y-button', text: noResults, go: empty },
  { sel: '.y-chip-group > .y-button', go: results },
];

const comingSoon = (n: Nav) => n.toast('Этого экрана пока нет в макетах');
/** «+» вишлиста — шторка выбора: вещь или образ (Wishlist / Add / Sheet / Content Type). */
const wishlistAdd: Route = { sel: '.y-bottom-nav__fab button', go: (n) => n.overlay('WishlistContentTypeSheet') };
/**
 * Поиск по фото из шапки: без снимка — шторка «Добавить» (Search / Photo / Sheet / Add), со снимком — «Заменить» (… / Replace).
 * Галерея и камера — дальше по цепочке поиска по фото, как плитки на «Discover»: обрезка → «Найти похожее» → результаты (#220).
 */
const photoAdd: Route = btn('Поиск по фото', (n) => n.overlay('PhotoAddSheet'));
const photoReplace: Route = btn('Выбранное фото', (n) => n.overlay('PhotoReplaceSheet'));
const photoToCrop: Route = { sel: '.y-photo-tile', go: closeThen((n) => n.push('PhotoCrop')) };
const howItWorks: Route = btn('Как это работает', comingSoon);
/** Кнопка «Добавить» внизу формы новой вещи (не «+» у тегов). */
const addItem = (go: Go): Route => ({ sel: '.y-button--full', text: 'Добавить', go });
/** Вещь из вишлиста перемещена в гардероб: тост с «Отменить» (↶), как у остальных перемещений (Figma `1371:37590`). */
const movedToWardrobe = async (n: Nav) => {
  await n.root('Wardrobe');
  n.toast('Вещь перемещена в гардероб', { undo: async (u) => { await u.root('Wishlist'); await u.push('ItemDetails'); } });
};
/** Вещь добавлена: в онбординге — к первому образу, иначе в гардероб с подтверждением. */
const addedItem: Go = async (n) => {
  if (n.stack().includes('FirstItemPrompt')) { await n.push('FirstOutfit'); n.toast('Первая вещь добавлена'); return; }
  await n.root('Wardrobe');
  n.toast('Вещь добавлена в гардероб');
};
/** «Не нравится» на последнем образе стопки: образы закончились. Штамп листает сам, пока есть следующий. */
const lastSkip: Route = {
  sel: '.y-stamp', text: 'Не нравится', native: true,
  go: (n, el) => { if (el.closest('.y-outfit-pager')?.querySelector('[aria-label="Следующий образ"][aria-disabled=true]')) return n.swap('OutfitOfTheDayEmpty'); },
};

/**
 * Вещь уходит из списка сразу, тост с «Отменить» (#184). Удаление окончательное, когда тост закрылся сам или «×»;
 * «Отменить» до этого возвращает вещь на место, а опустевший список (`empty`) — обратно в список с вещью.
 * Из деталей вещи сначала «назад» к списку, откуда её открыли.
 */
const removeItem = (text: string, empty?: ScreenId): Go => closeThen(async (n, from) => {
  if (from === 'WardrobeItemDetails') await n.back();
  const list = n.stack().at(-1);
  const restore = n.take();
  if (empty && !n.left()) await n.swap(empty);
  n.toast(text, {
    undo: async (u) => {
      restore();
      if (empty && list && u.stack().at(-1) === empty) await u.swap(list);
    },
  });
});

/**
 * Штамп «Надеть» в деталях образа — нативный: нажатие переводит его в «выполнено» (Done Size=S, Variant 02 `1174:19564`), тост
 * с «Отменить» возвращает штамп. Повторное нажатие по выполненному штампу — отмена самим штампом, без тоста (#234).
 * Маршрут срабатывает до обработчика штампа: `aria-pressed` — состояние до нажатия.
 */
const wearStamp: Route = {
  sel: '.y-stamp', native: true,
  go: (n, el) => {
    if (el.getAttribute('aria-pressed') === 'true') return;
    n.toast('Образ отмечен как надетый', { undo: () => { if (el.isConnected && el.getAttribute('aria-pressed') === 'true') el.click(); } });
  },
};

/* ─── Создание образа: диалоги и фильтр вещей (#54) ──────────────────── */
const CREATION: ScreenId[] = ['OutfitItems', 'Canvas', 'CanvasDefault', 'CanvasHint', 'OutfitCriteria'];
/** «Назад» с выбранными вещами — сначала диалог несохранённых изменений. */
const exitAsk = btn('Назад', (n) => n.overlay('ExitDialog'));
const shuffleAsk = btn('Перемешать', (n) => n.overlay('ShuffleDialog'));
/** Чипсы фильтра в панели «Гардероб» под холстом. */
const itemFilter: Route = { sel: '.y-sheet .y-chip-group button', go: (n) => n.overlay('ItemFilterSheet') };
/** Долгое нажатие на пустой холст — очистить образ; вещь на холсте держит свои жесты. */
const clearAsk: Route = { sel: '.y-canvas', on: 'long', not: '.y-canvas__item', name: 'Холст образа', go: (n) => n.overlay('ClearDialog') };

/* ─── Профиль: фото и год рождения (#54) ─────────────────────────────── */
const editProfile = (avatar: 'AvatarAddSheet' | 'AvatarReplaceSheet'): Route[] => [
  { sel: '.y-avatar', name: 'Изменить фото профиля', go: (n) => n.overlay(avatar) },
  { sel: '.y-field', text: /^Год рождения/, go: (n) => n.overlay('BirthYearSheet') },
  { sel: '.y-field', text: /^Пол/, go: (n) => n.overlay('ProfileGenderSheet') },
  { sel: '.y-field', text: /^Стиль/, go: (n) => n.overlay('ProfileStyleSheet') },
];
const photoPicked = closeThen(async (n, from) => { if (from !== 'ProfileEditAvatar') await n.swap('ProfileEditAvatar'); n.toast('Фото профиля обновлено'); });

/**
 * Диалоги, которые закрываются и тапом по затемнению, и смахиванием (правило #89): подтверждения без риска.
 * Рискованные (`tone` destructive / danger: очистить, выйти из аккаунта, удалить) — только кнопками и Escape.
 */
export const LOOSE_DIALOGS = new Set<ScreenId>(['PasswordRecoverySent', 'ShuffleDialog', 'ExitDialog', 'AboutSurpriseDialog']);

/** Переходы конкретных экранов: элемент → куда. Порядок важен: побеждает первое совпадение. */
export const routes: Partial<Record<ScreenId, Route[]>> = {
  /* Запуск и онбординг */
  OnboardingWelcome: [btn('Начать бесплатно', 'SignIn')],
  SignIn: [{ sel: 'a', text: /политикой/, go: ok('LegalPrivacy') }, { sel: 'a', text: /условиями/, go: ok('LegalTerms') }, btn('Войти', 'OnboardingName'), btn('Не помнишь пароль?', 'PasswordRecovery'), btn('Войти с Apple', 'OnboardingName')],
  OnboardingName: [btn('Далее', 'FirstItemPrompt')],
  FirstOutfit: [btn('Пропустить', (n) => n.root('Today')), btn('Сохранить образ и завершить', async (n) => { await n.root('Today'); n.toast('Образ сохранён'); })],
  // Figma 1173:21880: «Добавить» → форма Variant 01, «Пропустить» → главная (#216, строки 32–33)
  FirstItemPrompt: [btn('Пропустить', (n) => n.root('Today')), btn('Добавить', ok('NewItemNoPhotoV1'))],
  PasswordRecovery: [btn('Отправить код', (n) => n.overlay('PasswordRecoverySent'))],
  PasswordRecoverySent: [btn('Ок!', closeThen((n) => n.back()))],

  /* Главная */
  Today: today,
  TodayRain: today,
  TodayWorn: today,
  RecommendationsEmpty: [btn('Добавить вещь', 'NewItemNoPhotoV2')],

  /* Гардероб */
  Wardrobe: [...topSeg('items'), ...gridSearch, ...itemFilters, { sel: '.y-item-card', on: 'long', go: (n) => n.overlay('ItemActions') }, openItem,
    { sel: '.y-bottom-nav__fab button', go: ok('NewItemNoPhotoV2') }],
  WardrobeEmpty: [...topSeg('items'), { sel: '.y-bottom-nav__fab button', go: ok('NewItemNoPhotoV2') }],
  ItemsNoFilterResults: [...topSeg('items'), ...gridSearch, ...itemFilters, btn('Сбросить фильтры', (n) => n.swap('Wardrobe')), { sel: '.y-bottom-nav__fab button', go: ok('NewItemNoPhotoV2') }],
  OutfitsPopulated: [...topSeg('outfits'), ...outfitFilters, outfitMenu, openOutfit, { sel: '.y-bottom-nav__fab button', go: ok('OutfitItems') }],
  OutfitsEmpty: [...topSeg('outfits'), { sel: '.y-bottom-nav__fab button', go: ok('OutfitItems') }],
  OutfitsNoFilterResults: [...topSeg('outfits'), ...outfitFilters, btn('Сбросить фильтры', (n) => n.swap('OutfitsPopulated')), { sel: '.y-bottom-nav__fab button', go: ok('OutfitItems') }],
  Toast: [...gridSearch, openItem, { sel: '.y-bottom-nav__fab button', go: ok('NewItemNoPhotoV2') }],
  FilterSheet: [btn('Применить', applyFilter), btn('Сбросить', resetFilter)],
  // Figma `1173:16925`: «Применить» → No Filter Results, «Сбросить» → Populated
  CategoryRootSheet: [btn('Применить', applyFilter), btn('Сбросить', resetFilter)],
  SeasonFilterSheet: quickFilter,
  TagsFilterSheet: quickFilter,
  // «+» — нативный: чипс-поле своего повода (Custom Occasion Name Empty → Entered), Enter или уход фокуса — новый чипс (#220)
  OccasionFilterSheet: quickFilter,
  ItemActions: [
    { sel: '.y-list-item', text: 'Создать образ', go: closeThen((n) => n.push('OutfitItems')) },
    { sel: '.y-list-item', text: 'Редактировать', go: closeThen(comingSoon) },
    { sel: '.y-list-item', text: 'Архивировать', go: removeItem('Вещь перемещена в архив', 'WardrobeEmpty') },
    { sel: '.y-list-item', text: 'Удалить', go: removeItem('Вещь перемещена в корзину', 'WardrobeEmpty') },
  ],
  WardrobeItemDetails: [btn('Ещё', (n) => n.overlay('ItemActions')), openOutfit],
  // штамп в истории без состояния: «Отменить» возвращать нечего
  OutfitDetails: [btn('Ещё', (n) => n.overlay('OutfitPermanentDelete')), openItem, wearStamp],
  OutfitDetailsWorn: [btn('Ещё', (n) => n.overlay('OutfitPermanentDelete')), openItem, wearStamp],
  OutfitActions: [
    { sel: '.y-list-item', text: 'Редактировать', go: closeThen((n) => n.push('OutfitItems')) },
    // образ в истории без состояния: «Отменить» открывает его снова
    { sel: '.y-list-item', text: 'Удалить', go: closeThen(async (n) => { await n.back(); n.toast('Образ удалён', { undo: (u) => u.push('OutfitDetails') }); }) },
  ],
  OutfitPermanentDelete: [
    { sel: '.y-list-item', text: 'Редактировать', go: closeThen((n) => n.push('OutfitItems')) },
    // из деталей — «назад» к списку; образ в истории без состояния: «Отменить» открывает его снова
    {
      sel: '.y-list-item', text: 'Удалить навсегда',
      go: closeThen(async (n, from) => {
        if (from === 'OutfitDetails') await n.back();
        n.toast('Образ удалён навсегда', { undo: (u) => (from === 'OutfitDetails' ? u.push('OutfitDetails') : undefined) });
      }),
    },
  ],

  /* Вишлист: «+» → «Добавить в вишлист» → «Вещь» — форма новой вещи; формы образа в макетах нет (#220) */
  // удержание без движения — шторка действий, как в гардеробе; удержание и сдвиг — перестановка (#209)
  Wishlist: [...topSeg('wishlist'), ...subSeg, { sel: '.y-product-card', on: 'long', go: (n) => n.overlay('WishlistItemActions') }, { sel: '.y-product-card', go: ok('ItemDetails') }, wishlistAdd],
  WishlistOutfits: [...topSeg('wishlist'), ...subSeg, { sel: '.y-collage', name: 'Открыть образ', go: ok('WishlistOutfitDetails') }, wishlistAdd],
  WishlistEmpty: [...topSeg('wishlist'), wishlistAdd],
  WishlistContentTypeSheet: [
    { sel: '.y-list-item', text: 'Вещь', go: closeThen((n) => n.push('WishlistNewItem')) },
    { sel: '.y-list-item', text: 'Образ', go: closeThen(comingSoon) },
  ],
  ItemDetails: [
    btn('Ещё', (n) => n.overlay('WishlistItemActions')),
    btn('Переместить в гардероб', movedToWardrobe),
    btn('Открыть в магазине', (n) => n.toast('Откроется магазин в браузере')),
    openOutfit,
  ],
  WishlistItemActions: [
    { sel: '.y-list-item', text: 'Перейти по ссылке', go: closeThen((n) => n.toast('Откроется магазин в браузере')) },
    { sel: '.y-list-item', text: 'Создать образ', go: closeThen((n) => n.push('OutfitItems')) },
    { sel: '.y-list-item', text: 'Переместить в гардероб', go: closeThen(movedToWardrobe) },
    { sel: '.y-list-item', text: 'Редактировать', go: closeThen(comingSoon) },
    { sel: '.y-list-item', text: 'Удалить', go: closeThen(async (n) => { await n.root('Wishlist'); n.toast('Вещь удалена из вишлиста', { undo: (u) => u.push('ItemDetails') }); }) },
  ],
  WishlistOutfitDetails: [
    btn('Переместить в гардероб', async (n) => { await n.root('OutfitsPopulated'); n.toast('Образ перемещён в гардероб'); }),
    openItem,
  ],
  // поле формы → заполненная форма (Figma 1173:18306 → 1173:18555, #216, строка 36)
  WishlistNewItem: [{ sel: '.y-field :is(input, textarea)', go: (n) => n.swap('WishlistNewItemCompleted') }, btn('Добавить', async (n) => { await n.root('Wishlist'); n.toast('Вещь добавлена в вишлист'); })],
  WishlistNewItemCompleted: [btn('Добавить', async (n) => { await n.root('Wishlist'); n.toast('Вещь добавлена в вишлист'); })],

  /* Архив и корзина */
  // действия с вещью — долгим нажатием, как в Figma (MOUSE_DOWN 0,4 с); тап — запасной путь (клавиатура, скринридер), #210
  Archive: [{ sel: '.y-item-card', on: 'long', go: (n) => n.overlay('ArchiveItemActions') }, { sel: '.y-item-card', go: (n) => n.overlay('ArchiveItemActions') }],
  ArchiveItemActions: [
    { sel: '.y-list-item', text: 'Вернуть в гардероб', go: removeItem('Вещь возвращена в гардероб', 'ArchiveEmpty') },
    { sel: '.y-list-item', text: 'Удалить', go: removeItem('Вещь перемещена в корзину', 'ArchiveEmpty') },
  ],
  TrashPopulated: [
    btn('Очистить корзину', (n) => n.overlay('ClearTrash')),
    { sel: '.y-item-card', on: 'long', go: (n) => n.overlay('TrashItemActions') },
    { sel: '.y-item-card', go: (n) => n.overlay('TrashItemActions') },
  ],
  TrashItemActions: [
    { sel: '.y-list-item', text: 'Вернуть в гардероб', go: removeItem('Вещь возвращена в гардероб', 'TrashEmpty') },
    { sel: '.y-list-item', text: 'Удалить навсегда', go: removeItem('Вещь удалена навсегда', 'TrashEmpty') },
  ],
  ClearTrash: [btn('Отменить', sheet), btn('Очистить', closeThen(async (n) => { await n.swap('TrashEmpty'); n.toast('Корзина очищена'); }))],

  /* Поиск по гардеробу */
  ItemSearchFocused: [...suggestions('ItemSearchResults', 'ItemSearchEmpty'), { sel: '.y-input-bar__field', go: ok('ItemSearchResults') }],
  ItemSearchResults: [openItem, { sel: '.y-input-bar__field', go: (n) => n.swap('ItemSearchFocused') }],
  ItemSearchEmpty: [btn('Сбросить поиск', (n) => n.swap('ItemSearchFocused')), { sel: '.y-input-bar__field', go: (n) => n.swap('ItemSearchFocused') }],

  /* Поиск в сторах */
  SearchDiscover: [{ sel: '.y-photo-tile', go: ok('PhotoCrop') }, ...suggestions('SearchResults', 'SearchEmpty'), { sel: '.y-input-bar__field', go: ok('SearchFocused') }],
  SearchFocused: [...suggestions('SearchResults', 'SearchEmpty'), photoAdd],
  SearchResults: [
    photoAdd,
    { sel: '.y-chip-group button', text: 'Цена', go: (n) => n.overlay('PriceFilter') },
    { sel: '.y-chip-group button', text: 'Сортировка', go: (n) => n.overlay('SortingSheet') },
    // сердечко переключается само (native); тост — только когда вещь добавляется, не убирается
    { sel: '.y-product-card__like', native: true, go: (n, el) => { if (el.getAttribute('aria-pressed') !== 'true') n.toast('Вещь перемещена в вишлист', { undo: () => undefined }); } },
    { sel: '.y-product-card', go: (n) => n.toast('Откроется магазин в браузере') },
  ],
  SortingSheet: [{ sel: '.y-chip--static', go: closeThen((n) => n.toast('Сортировка изменена')) }],
  SearchEmpty: [btn('Сбросить поиск', (n) => n.back()), photoAdd],
  PhotoCrop: [btn('Найти похожее', 'PhotoResults')],
  PhotoResults: [photoReplace, { sel: '.y-product-card', go: (n) => n.toast('Откроется магазин в браузере') }],
  PhotoFocused: [photoReplace],
  PhotoAddSheet: [photoToCrop],
  PhotoReplaceSheet: [photoToCrop, btn('Удалить фотографию', sheet)],

  /* Стилист */
  StylistHome: [
    { sel: '.y-prompt-card', text: /^Конструктор/, go: ok('OutfitItems') },
    { sel: '.y-prompt-card', text: /^Для поездок/, go: ok('Trips') },
    { sel: '.y-prompt-card', text: /^Удиви меня/, go: ok('OutfitOfTheDay') },
    { sel: '.y-prompt-card', text: /^С чем носить/, go: ok('WhatToWear') },
    { sel: '.y-prompt-card', go: comingSoon },
    { sel: '.y-dock .y-input-bar__field', go: ok('Stylist') },
    { sel: '.y-dock .y-input-bar__send', go: ok('Stylist') },
  ],
  Trips: [
    { sel: '.y-trip-card--add', go: (n) => n.toast('Создание поездки пока без макета') },
    { sel: '.y-trip-card', go: ok('TripDetails') },
    howItWorks,
  ],
  TripDetails: [{ sel: '.y-segment [role=radio]', text: /^Вещи/, go: (n) => n.swap('TripItems') }, openOutfit],
  TripItems: [{ sel: '.y-segment [role=radio]', text: /^Образы/, go: (n) => n.swap('TripDetails') }, openItem],
  // «Как это работает» (i) → диалог «Удиви меня» (DS 0.2 `1176:11772`): реакции в Figma нет, триггер — по имени диалога (#220)
  OutfitOfTheDay: [lastSkip, btn('Как это работает', (n) => n.overlay('AboutSurpriseDialog'))],
  AboutSurpriseDialog: [btn('Ок!', sheet)],
  OutfitOfTheDayEmpty: [btn('Показать ещё', (n) => n.swap('OutfitOfTheDay')), howItWorks],
  WhatToWear: [openItem, howItWorks],

  /* Создание образа */
  OutfitItems: [btn('Далее', 'Canvas'), ...steps('Гардероб'), shuffleAsk, exitAsk],
  Canvas: [btn('Далее', 'OutfitCriteria'), ...steps('Коллаж'), shuffleAsk, exitAsk, itemFilter, clearAsk],
  CanvasDefault: [...steps('Коллаж'), btn('Перемешать', (n) => n.toast('Вещи перемешаны')), itemFilter],
  CanvasHint: [...steps('Коллаж'), btn('Перемешать', (n) => n.toast('Вещи перемешаны')), itemFilter],
  ShuffleDialog: [
    btn('Перемешать', closeThen((n) => n.toast('Вещи перемешаны'))),
    btn('Сохранить', closeThen((n) => n.toast('Образ сохранён, вещи перемешаны'))),
  ],
  ExitDialog: [
    btn('Выйти', closeThen((n) => n.leave(CREATION))),
    btn('Сохранить', closeThen(async (n) => { await n.leave(CREATION); n.toast('Образ сохранён'); })),
  ],
  ClearDialog: [btn('Отменить', sheet), btn('Очистить', closeThen(async (n) => { await n.swap('CanvasDefault'); n.toast('Образ очищен'); }))],
  ItemFilterSheet: [
    btn('Использовать', closeThen((n, from) => { if (from !== 'Canvas') return n.swap('Canvas'); })),
    btn('Очистить', closeThen((n) => n.toast('Фильтр сброшен'))),
  ],
  OutfitCriteria: [btn('Создать образ', async (n) => { await n.root('OutfitsPopulated'); n.toast('Образ создан'); }), ...steps('Описание')],

  /* Новая вещь: без фото → загрузка (сама) → фото добавлено → «Добавить» */
  NewItemNoPhotoV1: [{ sel: '.y-photo-area__add', go: (n) => n.swap('NewItemLoadingV1') }],
  NewItemNoPhotoV2: [{ sel: '.y-photo-area__add', go: (n) => n.swap('NewItem') }],
  // поле формы → заполненная форма, как у вишлиста
  NewItemPhotoV1: [{ sel: '.y-field input', go: (n) => n.swap('NewItemCompletedV1') }, addItem(addedItem)],
  NewItemPhotoV2: [{ sel: '.y-field input', go: (n) => n.swap('NewItemCompletedV2') }, addItem(addedItem)],
  NewItemCompletedV1: [addItem(addedItem)],
  NewItemCompletedV2: [addItem(addedItem)],

  /* Профиль и настройки */
  ProfileAnalytics: [openItem, openOutfit, btn('Настройки', 'Settings', { native: true }), btn('Редактировать профиль', 'ProfileEdit', { native: true }), { sel: '.y-overlay button', text: 'Добавить аккаунт', go: 'SignIn', native: true }],
  ProfileSingle: [openItem, openOutfit, btn('Настройки', 'Settings', { native: true }), btn('Редактировать профиль', 'ProfileEdit', { native: true }), { sel: '.y-overlay button', text: 'Добавить аккаунт', go: 'SignIn', native: true }],
  AccountsMulti: [btn('Настройки', 'Settings', { native: true }), btn('Редактировать профиль', 'ProfileEdit', { native: true }), { sel: '.y-overlay button', text: 'Добавить аккаунт', go: 'SignIn', native: true }],
  AccountsSingle: [btn('Настройки', 'Settings', { native: true }), btn('Редактировать профиль', 'ProfileEdit', { native: true }), { sel: '.y-overlay button', text: 'Добавить аккаунт', go: 'SignIn', native: true }],
  Settings: [
    // «Выйти» внутри строки аккаунта — раньше самой строки
    btn('Выйти', (n) => n.overlay('SignOutDialog')),
    { sel: '.y-account', go: ok('ProfileEdit') },
    btn('Корзина вещей', 'TrashPopulated'),
    { sel: '.y-field', text: /^Страна/, go: (n) => n.overlay('CountrySheet') },
    { sel: '.y-field', text: /^Валюта/, go: (n) => n.overlay('CurrencySheet') },
    btn('Удалить аккаунт', (n) => n.overlay('DeleteAccount')),
    // одна строка-абзац с двумя ссылками: верхняя половина — политика, нижняя — условия
    { sel: '.y-settings-footer p:not(:last-of-type)', go: (n, el, e) => { const r = el.getBoundingClientRect(); return n.push(e && e.clientY > r.top + r.height / 2 ? 'LegalTerms' : 'LegalPrivacy'); } },
    { sel: '.y-list-item', go: (n, el) => n.toast(`${label(el)}: откроется во внешнем приложении`) },
  ],
  // поле поиска в шторке → та же шторка с полем в фокусе (Settings / Country / Sheet / Search Focused, #220)
  CountrySheet: [{ sel: '.y-input-bar__field', go: (n) => n.change('CountrySearchFocused') }, { sel: '.y-list-item', go: closeThen((n) => n.toast('Страна изменена')) }],
  CountrySearchFocused: [{ sel: '.y-list-item', go: closeThen((n) => n.toast('Страна изменена')) }],
  CurrencySheet: [{ sel: '.y-list-item', go: closeThen((n) => n.toast('Валюта изменена')) }],
  SignOutDialog: [btn('Отменить', sheet), btn('Выйти', closeThen((n) => n.root('SignIn')))],
  ProfileEdit: editProfile('AvatarAddSheet'),
  ProfileEditAvatar: editProfile('AvatarReplaceSheet'),
  // пол и стиль: выбор чипсом применяется сразу — шторка закрывается (#220)
  ProfileGenderSheet: [{ sel: '.y-chip--static', go: sheet }],
  ProfileStyleSheet: [{ sel: '.y-chip--static', go: sheet }],
  BirthYearSheet: [{ sel: '.y-list-item', go: closeThen((n) => n.toast('Год рождения изменён')) }],
  AvatarAddSheet: [{ sel: '.y-photo-tile', go: photoPicked }],
  AvatarReplaceSheet: [
    { sel: '.y-photo-tile', go: photoPicked },
    btn('Удалить фотографию', closeThen(async (n, from) => { if (from !== 'ProfileEdit') await n.swap('ProfileEdit'); n.toast('Фото профиля удалено'); })),
  ],
  DeleteAccount: [btn('Отменить', sheet), btn('Удалить', closeThen(async (n) => { await n.root('OnboardingWelcome'); n.toast('Аккаунт деактивирован на 14 дней'); }))],
};

/** Общие переходы: таб-бар и «Назад» работают на любом экране. */
export const globalRoutes: Route[] = [
  {
    sel: '.y-tab-bar button',
    go: (n, el) => {
      const root = TAB_ROOTS[(['today', 'search', 'wardrobe', 'stylist', 'profile'] as const)[[...(el.parentElement?.querySelectorAll('button') ?? [])].indexOf(el as HTMLButtonElement)]];
      if (el.getAttribute('aria-current') === 'page') return n.scrollTop();
      return n.root(root);
    },
  },
  { sel: 'button', text: 'Назад', go: (n) => n.back() },
  // крестик шторки: в истории у него пустой onClose
  { sel: '.y-overlay button', text: 'Закрыть', go: (n) => n.close() },
];

/** Экран, который сам уходит дальше: сплэш и загрузка фото. */
export const auto: Partial<Record<ScreenId, { after: number; go: Go }>> = {
  Splash: { after: 1600, go: (n) => n.swap('OnboardingWelcome') },
  NewItem: { after: 2600, go: (n) => n.swap('NewItemPhotoV2') },
  NewItemLoadingV1: { after: 2600, go: (n) => n.swap('NewItemPhotoV1') },
};

/** Первый экран по умолчанию и экран, куда «Назад» ведёт с единственного экрана в стеке. */
export const START: ScreenId = 'Splash';
export const HOME: ScreenId = 'Today';

export { label };
