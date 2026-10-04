/**
 * Порядок экранов «Pages / Экраны флоу» по пути пользователя (#174) — один источник правды
 * для сайдбара Storybook и рядов секции Pages в Figma (`1168:12824`, ряд = группа = файл историй).
 *
 * Ряды — порядок из #174: Onboarding → Outfits → Wardrobe → Creation → Search → Stylist → Profile → Settings.
 * Внутри ряда — по шагам сценария: пусто → заполнено → фокус → результат, оверлеи — рядом с экраном, с которого открываются.
 * Строки — точные имена историй (`name`), они же имена кадров в Figma; id историй и эталоны qa не зависят от порядка.
 *
 * Storybook читает `storySort` из `.storybook/preview.tsx` статически, импорт туда не работает, поэтому
 * список копируется в preview: после правки здесь — `node scripts/flow-order.mjs`, проверка — `node scripts/flow-order.mjs --check`
 * (заодно ловит историю Pages, которой нет в списке, и строку без истории).
 */
export interface FlowRow {
  /** Ряд в Figma и группа в сайдбаре: имя файла `src/pages/<row>.stories.tsx`. */
  row: string;
  /** Подпись ряда — что за участок пути. */
  label: string;
  stories: readonly string[];
}

export const FLOW_ORDER: readonly FlowRow[] = [
  {
    row: 'Onboarding',
    label: 'Онбординг и вход',
    stories: [
      'App / Splash',
      'Onboarding / Welcome',
      'Auth / Sign In',
      'Auth / Password Recovery',
      'Auth / Password Recovery / Dialog / Sent',
      'Onboarding / Name / Focused',
      'Onboarding / First Item Prompt',
      'Onboarding / First Item / Sheet / Add Photo',
      'Onboarding / First Outfit / Preview',
    ],
  },
  {
    row: 'Outfits',
    label: 'Главная (Сегодня)',
    stories: [
      'Outfits / Everyday / Sunny',
      'Outfits / Everyday / Rain Alert',
      'Outfits / Everyday / Occasion Selector Open',
      'Outfits / Everyday / Sheet / Custom Occasion Name Empty',
      'Outfits / Everyday / Sheet / Custom Occasion Name Entered',
      'Outfits / Everyday / Wear Action Active',
      'Outfits / Recommendations / Empty Wardrobe',
    ],
  },
  {
    row: 'Wardrobe',
    label: 'Гардероб: вещи, образы, вишлист, архив и корзина',
    stories: [
      'Wardrobe / Items / Empty',
      'Wardrobe / Items / Populated',
      'Wardrobe / Items / Populated / Scrolled',
      'Wardrobe / Items / Sheet / Category Root',
      'Wardrobe / Items / Sheet / Category',
      'Wardrobe / Items / Sheet / Season Filter',
      'Wardrobe / Items / Sheet / Tags Filter',
      'Wardrobe / Items / No Filter Results',
      'Wardrobe / Items / Sheet / Item Actions',
      'Wardrobe / Item / Toast',
      'Wardrobe / Item Search / Query Focused',
      'Wardrobe / Item Search / Results',
      'Wardrobe / Item Search / No Results',
      'Wardrobe / Item Details',
      'Wardrobe / Item Details / Scrolled',
      'Wardrobe / Edit Item / Sheet / Category Expanded',
      'Wardrobe / Edit Item / Sheet / Color',
      'Wardrobe / Edit Item / Sheet / Season',
      'Wardrobe / Outfits / Empty',
      'Wardrobe / Outfits / Populated',
      'Wardrobe / Outfits / Sheet / Occasion Filter',
      'Wardrobe / Outfits / Sheet / Custom Occasion Name Empty',
      'Wardrobe / Outfits / Sheet / Custom Occasion Name Entered',
      'Wardrobe / Outfits / No Filter Results',
      'Wardrobe / Outfit / Sheet / Actions',
      'Wardrobe / Outfit / Sheet / Permanent Delete Actions',
      'Wardrobe / Outfit Details',
      'Wardrobe / Outfit Details / Scrolled',
      'Wardrobe / Outfit Details / Variant 02',
      'Wishlist / Items / Empty',
      'Wishlist / Items / Populated',
      'Wishlist / Items / Scrolled',
      'Wishlist / Add / Sheet / Content Type',
      'Wishlist / New Item / Empty',
      'Wishlist / New Item / Completed',
      'Wishlist / Item / Sheet / Actions',
      'Wishlist / Item / Toast / Moved to Wardrobe',
      'Wishlist / Item Details',
      'Wishlist / Item Details / Scrolled',
      'Wishlist / Outfits / Populated',
      'Wishlist / Outfit Details / Default',
      'Archive / Items / Empty',
      'Archive / Items / Populated',
      'Archive / Item / Sheet / Actions',
      'Archive / Item / Toast / Moved to Trash',
      'Trash / Items / Empty',
      'Trash / Items / Populated',
      'Trash / Item / Sheet / Actions',
      'Trash / Item / Toast / Deleted Permanently',
      'Trash / Items / Dialog / Clear',
    ],
  },
  {
    row: 'Creation',
    label: 'Новая вещь и создание образа',
    stories: [
      'New Item / Details / No Photo Variant 01',
      'New Item / Details / No Photo Variant 02',
      'New Item / Photo / Sheet / Add',
      'New Item / Photo / Removing Background Variant 01',
      'New Item / Removing Background',
      'New Item / Details / Photo Added Variant 01',
      'New Item / Details / Photo Added Variant 02',
      'New Item / Details / Name Focused Variant 01',
      'New Item / Details / Name Focused Variant 02',
      'New Item / Details / Sheet / Category Root',
      'New Item / Details / Sheet / Category Expanded',
      'New Item / Details / Completed Variant 01',
      'New Item / Details / Completed Variant 02',
      'Outfit Creation / Item Selection / Items Selected',
      'Outfit Creation / Item Selection / Ready to Continue',
      'Outfit Creation / Items / Sheet / Category with Selection',
      'Outfit Creation / Shuffle / Dialog / Unsaved Changes',
      'Outfit Creation / Canvas / Gesture Hint',
      'Outfit Creation / Canvas / Default',
      'Outfit Creation / Item Filter / Sheet / Bottoms',
      'Outfit Creation / Canvas / Filtered',
      'Outfit Creation / Clear / Dialog / Confirmation',
      'Outfit Creation / Exit / Dialog / Unsaved Changes',
      'Outfit Creation / Criteria / Default',
    ],
  },
  {
    row: 'Search',
    label: 'Поиск',
    stories: [
      'Search / Discover',
      'Search / Text / Query Focused',
      'Search / Text / Results',
      'Search / Results / Sheet / Sorting',
      'Search / Results / Sheet / Price Filter',
      'Search / Text / No Results Filtered',
      'Search / Result Item / Toast / Moved to Wishlist',
      'Search / Photo / Sheet / Add',
      'Search / Photo / Crop',
      'Search / Photo / Query Focused',
      'Search / Photo / Results',
      'Search / Photo / Sheet / Replace',
    ],
  },
  {
    row: 'Stylist',
    label: 'Стилист и поездки',
    stories: [
      'Stylist / Catalog',
      'Stylist / Assistant / Input Focused',
      'Stylist / Home / Greeting Entered',
      'Stylist / Home / Message Ready',
      'Stylist / Outfit of the Day / Default',
      'Stylist / Outfit of the Day / Dialog / About Surprise Me',
      'Stylist / Outfit of the Day / No More Outfits',
      'Stylist / Constructor / Empty',
      'Stylist / What to Wear / Outfits',
      'Stylist / Trips / List',
      'Stylist / Trip Details / Outfits Tab',
      'Stylist / Trip Details / Items Tab',
    ],
  },
  {
    row: 'Profile',
    label: 'Профиль',
    stories: [
      'Profile / Overview / Single Account',
      'Profile / Overview / Analytics',
      'Profile / Overview / Analytics / Scrolled',
      'Profile / Analytics / Sheet / Period',
      'Profile / Accounts / Sheet / Single',
      'Profile / Accounts / Sheet / List',
      'Profile / Edit / No Avatar',
      'Profile / Avatar / Sheet / Add',
      'Profile / Edit / Avatar Added',
      'Profile / Avatar / Sheet / Replace',
      'Profile / Edit / Sheet / Birth Year',
      'Profile / Edit / Sheet / Gender',
      'Profile / Edit / Sheet / Style',
    ],
  },
  {
    row: 'Settings',
    label: 'Настройки и юридическое',
    stories: [
      'Settings / Main',
      'Settings / Country / Sheet / Default',
      'Settings / Country / Sheet / Search Focused',
      'Settings / Currency / Sheet / Default',
      'Settings / Sign Out / Dialog / Confirmation',
      'Settings / Delete Account / Dialog / Confirmation',
      'Legal / Privacy Policy / May 2026',
      'Legal / Terms of Use / May 2026',
    ],
  },
];

/** Все истории подряд — то, что уходит в `storySort` для `Pages/Экраны флоу`. */
export const FLOW_STORY_ORDER: readonly string[] = FLOW_ORDER.flatMap((r) => r.stories);
