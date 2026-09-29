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
  /** Закрыть верхний слой (шторку, диалог) с анимацией ухода. */
  close(): Promise<void>;
  /** Snackbar над низом экрана. */
  toast(text: string, opts?: { undo?: boolean }): void;
  /** Экран под верхним слоем: откуда открыли шторку. */
  below(): ScreenId | undefined;
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
};

const ok = (id: ScreenId): Go => id;
const sheet = (n: Nav) => n.close();
const label = (el: Element) => (el.getAttribute('aria-label') ?? el.textContent ?? '').replace(/\s+/g, ' ').trim();
const active = (el: HTMLElement) => el.getAttribute('aria-checked') === 'true';

/** Кнопка по подписи. */
const btn = (text: string | RegExp, go: Go, extra?: Partial<Route>): Route => ({ sel: 'button', text, go, ...extra });
/** Действие после закрытия шторки. */
const closeThen = (fn: (n: Nav) => void | Promise<void>): Go => async (n) => { await n.close(); await fn(n); };

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
/** Фильтры гардероба: любой чипс открывает шторку. */
const filters: Route = { sel: '.y-chip-group button', go: (n) => n.overlay('FilterSheet') };
const gridSearch: Route[] = [
  { sel: 'button', text: 'Поиск', go: ok('ItemSearchFocused') },
  { sel: 'button', text: 'Архив', go: ok('Archive') },
];
const openItem: Route = { sel: '.y-item-card', go: ok('WardrobeItemDetails') };
const openOutfit: Route = { sel: '.y-collage', name: 'Открыть образ', go: ok('OutfitDetails') };
/** Шаги создания образа в шапке. */
const steps = (self: 'Гардероб' | 'Коллаж' | 'Описание'): Route[] =>
  ([['Гардероб', 'OutfitItems'], ['Коллаж', 'Canvas'], ['Описание', 'OutfitCriteria']] as const)
    .filter(([l]) => l !== self)
    .map(([l, id]) => ({ sel: '.y-segment [role=radio]', text: l, go: (n: Nav) => n.swap(id) }));

/** Холст образа: выход и перемешивание с несохранёнными вещами спрашивают подтверждение, чипсы гардероба открывают фильтр. */
const canvas: Route[] = [
  btn('Назад', (n) => n.overlay('ExitDialog')),
  btn('Далее', 'OutfitCriteria'),
  ...steps('Коллаж'),
  btn('Перемешать', (n) => n.overlay('ShuffleDialog')),
  { sel: '.y-sheet--panel .y-chip-group button', go: (n) => n.overlay('ItemFilterSheet') },
];

/** Слова из подсказок поиска: длинная фраза «не находится», остальные ведут к результатам. */
const noResults = /^Белое платье/;
const suggestions = (results: ScreenId, empty: ScreenId): Route[] => [
  { sel: '.y-chip-group button', text: noResults, go: empty },
  { sel: '.y-chip-group button', go: results },
];

/** Вещь добавлена: в гардероб с подтверждением. */
const addedItem: Go = async (n) => { await n.root('Wardrobe'); n.toast('Вещь добавлена в гардероб'); };
/** Редактирование профиля: аватар и год рождения открывают шторки. */
const profileEdit = (avatarSheet: ScreenId): Route[] => [
  { sel: '.y-avatar', name: 'Фото профиля', go: (n) => n.overlay(avatarSheet) },
  { sel: '.y-field', text: /^Год рождения/, go: (n) => n.overlay('BirthYearSheet') },
];

const comingSoon = (n: Nav) => n.toast('Этого экрана пока нет в макетах');

/** Переходы конкретных экранов: элемент → куда. Порядок важен: побеждает первое совпадение. */
export const routes: Partial<Record<ScreenId, Route[]>> = {
  /* Запуск и онбординг */
  OnboardingWelcome: [btn('Начать бесплатно', 'SignIn')],
  SignIn: [{ sel: 'a', text: /политикой/, go: ok('LegalPrivacy') }, { sel: 'a', text: /условиями/, go: ok('LegalTerms') }, btn('Войти', 'FirstItemPrompt'), btn('Забыли пароль?', 'PasswordRecovery'), btn('Войти с Apple', 'FirstItemPrompt')],
  FirstItemPrompt: [btn('Пропустить', (n) => n.root('Today')), { sel: '.y-photo-tile', go: ok('NewItem') }],
  PasswordRecovery: [btn('Отправить код', (n) => n.overlay('PasswordRecoverySent'))],
  PasswordRecoverySent: [btn('Ок!', closeThen((n) => n.back()))],

  /* Главная */
  Today: [
    { sel: '.y-outfit-thumb', go: ok('OutfitDetails') },
    openOutfit,
    { sel: '.y-stamp', go: (n) => n.toast('Образ отмечен как надетый', { undo: true }) },
  ],
  RecommendationsEmpty: [btn('Добавить вещь', 'NewItemNoPhotoV2')],

  /* Гардероб */
  Wardrobe: [...topSeg('items'), ...gridSearch, filters, { sel: '.y-item-card', on: 'long', go: (n) => n.overlay('ItemActions') }, openItem,
    { sel: '.y-bottom-nav__fab button', go: ok('NewItemNoPhotoV2') }],
  WardrobeEmpty: [...topSeg('items'), { sel: '.y-bottom-nav__fab button', go: ok('NewItemNoPhotoV2') }],
  ItemsNoFilterResults: [...topSeg('items'), ...gridSearch, filters, btn('Сбросить фильтры', (n) => n.swap('Wardrobe')), { sel: '.y-bottom-nav__fab button', go: ok('NewItemNoPhotoV2') }],
  OutfitsPopulated: [...topSeg('outfits'), filters, openOutfit, { sel: '.y-bottom-nav__fab button', go: ok('OutfitItems') }],
  OutfitsEmpty: [...topSeg('outfits'), { sel: '.y-bottom-nav__fab button', go: ok('OutfitItems') }],
  OutfitsNoFilterResults: [...topSeg('outfits'), filters, btn('Сбросить фильтры', (n) => n.swap('OutfitsPopulated')), { sel: '.y-bottom-nav__fab button', go: ok('OutfitItems') }],
  Toast: [...gridSearch, openItem, { sel: '.y-bottom-nav__fab button', go: ok('NewItemNoPhotoV2') }],
  FilterSheet: [
    btn('Применить', closeThen((n) => { const b = n.below(); if (b === 'Wardrobe') return n.swap('ItemsNoFilterResults'); if (b === 'OutfitsPopulated') return n.swap('OutfitsNoFilterResults'); })),
    btn('Сбросить', closeThen((n) => { const b = n.below(); if (b === 'ItemsNoFilterResults') return n.swap('Wardrobe'); if (b === 'OutfitsNoFilterResults') return n.swap('OutfitsPopulated'); })),
  ],
  ItemActions: [
    { sel: '.y-list-item', text: 'Создать образ', go: closeThen((n) => n.push('OutfitItems')) },
    { sel: '.y-list-item', text: 'Редактировать', go: closeThen(comingSoon) },
    { sel: '.y-list-item', text: 'Архивировать', go: closeThen((n) => n.toast('Вещь перемещена в архив', { undo: true })) },
    { sel: '.y-list-item', text: 'Удалить', go: closeThen((n) => n.toast('Вещь перемещена в корзину', { undo: true })) },
  ],
  WardrobeItemDetails: [btn('Ещё', (n) => n.overlay('ItemActions')), openOutfit],
  OutfitDetails: [openItem, { sel: '.y-stamp', go: (n) => n.toast('Образ отмечен как надетый', { undo: true }) }],

  /* Вишлист */
  Wishlist: [...topSeg('wishlist'), ...subSeg, { sel: '.y-product-card', go: ok('ItemDetails') }, { sel: '.y-bottom-nav__fab button', go: ok('WishlistNewItem') }],
  WishlistOutfits: [...topSeg('wishlist'), ...subSeg, { sel: '.y-collage', name: 'Открыть образ', go: ok('WishlistOutfitDetails') }, { sel: '.y-bottom-nav__fab button', go: ok('WishlistNewItem') }],
  WishlistEmpty: [...topSeg('wishlist'), { sel: '.y-bottom-nav__fab button', go: ok('WishlistNewItem') }],
  ItemDetails: [
    btn('Переместить в гардероб', async (n) => { await n.root('Wardrobe'); n.toast('Вещь перемещена в гардероб'); }),
    btn('Открыть в магазине', (n) => n.toast('Откроется магазин в браузере')),
    openOutfit,
  ],
  WishlistOutfitDetails: [
    btn('Переместить в гардероб', async (n) => { await n.root('OutfitsPopulated'); n.toast('Образ перемещён в гардероб'); }),
    openItem,
  ],
  WishlistNewItem: [btn('Добавить', async (n) => { await n.root('Wishlist'); n.toast('Вещь добавлена в вишлист'); })],
  WishlistNewItemCompleted: [btn('Добавить', async (n) => { await n.root('Wishlist'); n.toast('Вещь добавлена в вишлист'); })],

  /* Архив и корзина */
  Archive: [openItem],
  TrashPopulated: [btn('Очистить корзину', (n) => n.overlay('ClearTrash'))],
  ClearTrash: [btn('Отмена', sheet), btn('Очистить', closeThen(async (n) => { await n.swap('TrashEmpty'); n.toast('Корзина очищена'); }))],

  /* Поиск по гардеробу */
  ItemSearchFocused: [...suggestions('ItemSearchResults', 'ItemSearchEmpty'), { sel: '.y-input-bar__field', go: ok('ItemSearchResults') }],
  ItemSearchResults: [openItem, { sel: '.y-input-bar__field', go: (n) => n.swap('ItemSearchFocused') }],
  ItemSearchEmpty: [btn('Сбросить поиск', (n) => n.swap('ItemSearchFocused')), { sel: '.y-input-bar__field', go: (n) => n.swap('ItemSearchFocused') }],

  /* Поиск в сторах */
  SearchDiscover: [{ sel: '.y-photo-tile', go: ok('PhotoCrop') }, ...suggestions('SearchResults', 'SearchEmpty'), { sel: '.y-input-bar__field', go: ok('SearchResults') }],
  SearchResults: [
    { sel: '.y-chip-group button', text: 'Цена', go: (n) => n.overlay('PriceFilter') },
    { sel: '.y-product-card', go: (n) => n.toast('Откроется магазин в браузере') },
  ],
  SearchEmpty: [btn('Сбросить поиск', (n) => n.back())],
  PhotoCrop: [btn('Найти похожие', 'PhotoResults')],
  PhotoResults: [{ sel: '.y-product-card', go: (n) => n.toast('Откроется магазин в браузере') }],

  /* Стилист */
  StylistHome: [
    { sel: '.y-prompt-card', text: /^Конструктор/, go: ok('OutfitItems') },
    { sel: '.y-prompt-card', text: /^Для поездок/, go: ok('Trips') },
    { sel: '.y-prompt-card', go: comingSoon },
    { sel: '.y-dock .y-input-bar__field', go: ok('Stylist') },
    { sel: '.y-dock .y-input-bar__send', go: ok('Stylist') },
  ],
  Trips: [
    { sel: '.y-trip-card--add', go: (n) => n.toast('Создание поездки пока без макета') },
    { sel: '.y-trip-card', go: ok('TripDetails') },
    btn('Как это работает', comingSoon),
  ],
  TripDetails: [openOutfit],

  /* Создание образа */
  OutfitItems: [btn('Далее', 'Canvas'), ...steps('Гардероб'), btn('Перемешать', (n) => n.toast('Вещи перемешаны'))],
  Canvas: canvas,
  CanvasDefault: canvas,
  CanvasHint: canvas,
  OutfitCriteria: [btn('Создать образ', async (n) => { await n.root('OutfitsPopulated'); n.toast('Образ создан'); }), ...steps('Описание')],


  /* Новая вещь: без фото → загрузка (сама) → фото добавлено → «Добавить» */
  NewItemNoPhotoV1: [{ sel: '.y-photo-area__add', go: (n) => n.swap('NewItemLoadingV1') }],
  NewItemNoPhotoV2: [{ sel: '.y-photo-area__add', go: (n) => n.swap('NewItem') }],
  NewItemPhotoV1: [btn('Добавить', addedItem)],
  NewItemPhotoV2: [btn('Добавить', addedItem)],
  NewItemCompletedV1: [btn('Добавить', addedItem)],
  NewItemCompletedV2: [btn('Добавить', addedItem)],

  /* Создание образа: шторка фильтра и диалоги */
  ItemFilterSheet: [btn('Закрыть', sheet), btn('Очистить', sheet), btn('Использовать', closeThen((n) => n.toast('Вещи выбраны')))],
  ShuffleDialog: [btn('Перемешать', closeThen((n) => n.toast('Вещи перемешаны'))), btn('Сохранить и начать', closeThen((n) => n.toast('Образ сохранён')))],
  ExitDialog: [btn('Выйти', closeThen((n) => n.back())), btn('Сохранить и выйти', closeThen(async (n) => { await n.back(); n.toast('Образ сохранён'); }))],
  ClearDialog: [btn('Отмена', sheet), btn('Очистить', closeThen((n) => n.toast('Образ очищен')))],

  /* Профиль: редактирование */
  ProfileEdit: [...profileEdit('AvatarAddSheet')],
  ProfileEditAvatar: [...profileEdit('AvatarReplaceSheet')],
  BirthYearSheet: [{ sel: '.y-list-item', go: sheet }],
  AvatarAddSheet: [{ sel: '.y-photo-tile', go: closeThen((n) => n.swap('ProfileEditAvatar')) }],
  AvatarReplaceSheet: [{ sel: '.y-photo-tile', go: sheet }, btn('Удалить фотографию', closeThen((n) => n.swap('ProfileEdit')))],
  SignOutDialog: [btn('Отменить', sheet), btn('Выйти', closeThen(async (n) => { await n.root('OnboardingWelcome'); n.toast('Вы вышли из аккаунта'); }))],

  /* Профиль и настройки */
  ProfileAnalytics: [openItem, openOutfit, btn('Настройки', 'Settings', { native: true }), btn('Редактировать профиль', 'ProfileEdit', { native: true }), { sel: '.y-overlay button', text: 'Добавить аккаунт', go: 'SignIn', native: true }],
  ProfileSingle: [openItem, openOutfit, btn('Настройки', 'Settings', { native: true }), btn('Редактировать профиль', 'ProfileEdit', { native: true }), { sel: '.y-overlay button', text: 'Добавить аккаунт', go: 'SignIn', native: true }],
  AccountsMulti: [btn('Настройки', 'Settings', { native: true }), btn('Редактировать профиль', 'ProfileEdit', { native: true }), { sel: '.y-overlay button', text: 'Добавить аккаунт', go: 'SignIn', native: true }],
  AccountsSingle: [btn('Настройки', 'Settings', { native: true }), btn('Редактировать профиль', 'ProfileEdit', { native: true }), { sel: '.y-overlay button', text: 'Добавить аккаунт', go: 'SignIn', native: true }],
  Settings: [
    { sel: '.y-account', go: ok('ProfileEdit') },
    btn('Корзина вещей', 'TrashPopulated'),
    { sel: '.y-field', text: /^Страна/, go: (n) => n.overlay('CountrySheet') },
    { sel: '.y-field', text: /^Валюта/, go: (n) => n.overlay('CurrencySheet') },
    btn('Удалить аккаунт', (n) => n.overlay('DeleteAccount')),
    btn('Выйти', (n) => n.overlay('SignOutDialog')),
    // одна строка-абзац с двумя ссылками: верхняя половина — политика, нижняя — условия
    { sel: '.y-settings-footer p:not(:last-of-type)', go: (n, el, e) => { const r = el.getBoundingClientRect(); return n.push(e && e.clientY > r.top + r.height / 2 ? 'LegalTerms' : 'LegalPrivacy'); } },
    { sel: '.y-list-item', go: (n, el) => n.toast(`${label(el)}: откроется во внешнем приложении`) },
  ],
  CountrySheet: [{ sel: '.y-list-item', go: closeThen((n) => n.toast('Страна изменена')) }],
  CurrencySheet: [{ sel: '.y-list-item', go: closeThen((n) => n.toast('Валюта изменена')) }],
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
