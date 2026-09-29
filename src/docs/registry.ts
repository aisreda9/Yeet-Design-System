/**
 * Реестр компонентов: одна точка правды для соответствия Figma ↔ код. `figmaId` — связь по node-id, а не по имени слоя.
 * Из него строятся «Атомарная карта» и таблица «Figma ↔ код». Добавляешь компонент — добавь строку сюда.
 */
export type Level = 'Atoms' | 'Molecules' | 'Organisms' | 'Templates';

/**
 * Зрелость компонента (ADR 0006, критерии — `status.ts`):
 * `stable` — Figma-компонент + код + история «В флоу» + на экранах + эталоны QA;
 * `beta` — на экранах и под QA, но чего-то из этого нет (причина в `statusWhy`);
 * `alpha` — ещё не на экранах или без Figma, API может поменяться;
 * `deprecated` — не использовать в новом коде, замена в `statusWhy`.
 */
export type Status = 'alpha' | 'beta' | 'stable' | 'deprecated';

export type Entry = {
  code: string;
  /** Имя компонента на странице «Design System 2.0 (Claude)»; `null` — только в коде. */
  figma: string | null;
  /**
   * node-id компонента (component set / symbol) на странице DS 2.0 `942:5666` — ссылка вида `?node-id=942-6953`.
   * `null` — отдельного компонента в Figma нет, причина в `figmaWhy`. Не задано — ещё не сверено.
   */
  figmaId?: string | null;
  /** Почему `figmaId: null`. */
  figmaWhy?: string;
  level: Level;
  /** Секция Figma */
  section: string;
  /** Путь в Storybook */
  story: string;
  note?: string;
  /** Зрелость: бейдж в сайдбаре Storybook и колонка в «Figma ↔ код». */
  status: Status;
  /** Чего не хватает до `stable` (или чем заменить `deprecated`). */
  statusWhy?: string;
};

export const registry: Entry[] = [
  { code: 'Icon', figma: 'ui-icons/*', figmaId: '942:5714', level: 'Atoms', section: '01 Foundations', story: 'Atoms/Icon', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'Logo', figma: 'yeet', figmaId: '1180:20027', level: 'Atoms', section: '01 Foundations', story: 'Atoms/Logo', note: 'цвет наследуется: on-accent, on-photo, secondary', status: 'stable' },
  { code: 'Button', figma: 'button', figmaId: '942:6953', level: 'Atoms', section: '02 Actions', story: 'Atoms/Button', status: 'stable' },
  { code: 'IconButton', figma: 'icon-button', figmaId: '942:7068', level: 'Atoms', section: '02 Actions', story: 'Atoms/IconButton', status: 'stable' },
  { code: 'Stamp', figma: 'stamp', figmaId: '1004:5021', level: 'Atoms', section: '02 Actions', story: 'Atoms/Stamp', note: 'Tone: Primary 148 / Secondary 64 (иконка 29, −15°); анимация --motion-stamp', status: 'stable' },
  { code: 'Badge', figma: 'badge', figmaId: '942:7125', level: 'Atoms', section: '02 Actions', story: 'Atoms/Badge', status: 'stable' },
  { code: 'Avatar', figma: 'avatar', figmaId: '968:3666', level: 'Atoms', section: '07 Content', story: 'Atoms/Avatar', note: 'Content: Empty / Initial / Photo', status: 'stable' },
  { code: 'Divider', figma: 'divider', figmaId: '951:3449', level: 'Atoms', section: '09 System', story: 'Atoms/Divider', status: 'stable' },
  { code: 'ColorDot', figma: 'color', figmaId: '1182:15916', level: 'Atoms', section: '01 Foundations', story: 'Atoms/ColorDot', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'ScrollEdge', figma: 'scroll-edge', figmaId: '965:3491', level: 'Atoms', section: '05 Navigation & scroll', story: 'Templates/Screen', status: 'beta', statusWhy: 'своей истории нет, показан в Templates/Screen' },
  { code: 'Link', figma: 'link', figmaId: '1209:21285', level: 'Atoms', section: '02 Actions', story: 'Atoms/Link', note: 'State: Default / Focus; в макетах — 203:1372, 517:7004, 513:6603', status: 'alpha', statusWhy: 'ещё не на экранах (Delete Account, Legal — #50–#54)' },

  { code: 'Field', figma: 'input (+ input-value)', figmaId: '1182:20099', level: 'Molecules', section: '03 Inputs', story: 'Molecules/Field & InputGroup', note: 'Multiline 104 («Комментарий»)', status: 'stable' },
  { code: 'InputGroup', figma: 'input-group', figmaId: '942:7264', level: 'Molecules', section: '03 Inputs', story: 'Molecules/Field & InputGroup', status: 'stable' },
  { code: 'InputBar', figma: 'input-bar', figmaId: '942:7282', level: 'Molecules', section: '03 Inputs', story: 'Molecules/InputBar', note: 'State=Focus (обводка 1.5), Right=Photo (превью 48)', status: 'stable' },
  { code: 'SegmentControl', figma: 'segment-control', figmaId: '942:7195', level: 'Molecules', section: '04 Selection', story: 'Molecules/SegmentControl', status: 'stable' },
  { code: 'ChipGroup', figma: 'chip-group + chip', figmaId: '942:7246', level: 'Molecules', section: '04 Selection', story: 'Molecules/ChipGroup', note: 'chip · Selected × Trailing (None / Dropdown / Remove), State=Editing', status: 'stable' },
  { code: 'ListItem', figma: 'list-item', figmaId: '960:2963', level: 'Molecules', section: '04 Selection', story: 'Molecules/ListItem', note: 'Radio + Trailing: флаг / текст («₽ · RUB»)', status: 'stable' },
  { code: 'ListGroup', figma: 'list-group', figmaId: '1018:5025', level: 'Molecules', section: '04 Selection', story: 'Molecules/ListGroup', status: 'stable' },
  { code: 'RangeSlider', figma: 'range-slider', figmaId: '1018:5036', level: 'Molecules', section: '04 Selection', story: 'Molecules/RangeSlider', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'StatTile', figma: 'stat-tile', figmaId: '1184:20692', level: 'Molecules', section: '07 Content', story: 'Molecules/StatTile', note: 'Size: M 80 (H2) / L 88 (H1)', status: 'stable' },
  { code: 'Note', figma: 'note', figmaId: '1187:20746', level: 'Molecules', section: '07 Content', story: 'Molecules/Note', note: 'описание вещи: light-grey, p20, r20', status: 'stable' },
  { code: 'Hint', figma: 'hint', figmaId: '1183:20594', level: 'Molecules', section: '06 Overlays', story: 'Molecules/Hint', note: 'Tone: Default / On Photo', status: 'stable' },
  { code: 'Snackbar', figma: 'snackbar', figmaId: '1183:20589', level: 'Molecules', section: '06 Overlays', story: 'Molecules/Snackbar', note: 'Size: M 52 / S 48 (подсказка на холсте)', status: 'stable' },
  { code: 'EmptyState', figma: 'empty-state', figmaId: '968:3643', level: 'Molecules', section: '08 States', story: 'Molecules/EmptyState', status: 'stable' },
  { code: 'LoadingState', figma: 'loading-state', figmaId: '968:3667', level: 'Molecules', section: '08 States', story: 'Molecules/LoadingState', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'PhotoTile', figma: 'photo-tile', figmaId: '1146:6674', level: 'Molecules', section: '07 Content', story: 'Molecules/PhotoTile', note: 'поглотил brand-card', status: 'stable' },
  { code: 'Carousel', figma: 'carousel', figmaId: '1018:5250', level: 'Molecules', section: '07 Content', story: 'Molecules/Carousel', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'BarChart', figma: 'bar-chart', figmaId: '1018:5224', level: 'Molecules', section: '07 Content', story: 'Molecules/BarChart', status: 'stable' },
  { code: 'UsageMeter', figma: 'usage-meter', figmaId: '1018:5100', level: 'Molecules', section: '07 Content', story: 'Molecules/UsageMeter', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'AccountCard', figma: 'account-card', figmaId: '1131:5166', level: 'Molecules', section: '07 Content', story: 'Molecules/AccountCard', note: 'Kind: Current / Other / Settings', status: 'stable' },
  { code: 'AvatarStack', figma: 'avatar-stack', figmaId: '1131:5183', level: 'Molecules', section: '07 Content', story: 'Molecules/AccountCard', note: 'мультиаккаунт в шапке профиля', status: 'stable' },

  { code: 'StatusBar', figma: 'system / status-bar', figmaId: '1180:19996', level: 'Organisms', section: '09 System', story: 'Templates/Screen', note: 'только для макетов; Tone: Default / On Accent / On Photo', status: 'beta', statusWhy: 'только для макетов, своей истории нет' },
  { code: 'Header', figma: 'header', figmaId: '967:3624', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/Header', note: 'Back: Subtitle, action Tertiary M; Search: превью фото', status: 'stable' },
  { code: 'TabBar', figma: 'tab-bar', figmaId: '962:3217', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/BottomNav & TabBar', note: 'профиль: буква или фото (avatarSrc)', status: 'stable' },
  { code: 'BottomNav', figma: 'bottom-nav', figmaId: '967:3669', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/BottomNav & TabBar', status: 'stable' },
  { code: 'BottomBar', figma: 'bottom-bar', figmaId: '967:3694', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/BottomBar', status: 'stable' },
  { code: 'Sheet', figma: 'sheet', figmaId: '962:3095', level: 'Organisms', section: '06 Overlays', story: 'Organisms/Sheet', note: 'Show Handle, Show Close', status: 'beta', statusWhy: 'аудит шторок: отступы, выравнивание, заголовки (#57, #58)' },
  { code: 'Dialog', figma: 'dialog', figmaId: '962:3136', level: 'Organisms', section: '06 Overlays', story: 'Organisms/Dialog', note: 'Tone: Default / Destructive / Danger; одна кнопка', status: 'stable' },
  { code: 'AccountsSheet', figma: 'sheet Modal + account-card', figmaId: null, figmaWhy: 'сборка: sheet 962:3095 (Modal) + account-card 1131:5166', level: 'Organisms', section: '06 Overlays', story: 'Organisms/AccountsSheet', status: 'beta', statusWhy: 'сборка без своего компонента в Figma; шторки на аудите (#58)' },
  { code: 'ItemCard', figma: 'item-card', figmaId: '962:3218', level: 'Organisms', section: '07 Content', story: 'Organisms/ItemCard', status: 'stable' },
  { code: 'ProductCard', figma: 'product-card', figmaId: '1118:9833', level: 'Organisms', section: '07 Content', story: 'Organisms/ProductCard', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'OutfitCollage', figma: 'outfit-collage', figmaId: '1187:20745', level: 'Organisms', section: '07 Content', story: 'Organisms/OutfitCollage', note: 'Pattern: Dots / None (plain)', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'OutfitThumbnail', figma: 'outfit-thumbnail', figmaId: '962:3227', level: 'Organisms', section: '07 Content', story: 'Organisms/OutfitCollage', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'PhotoArea', figma: 'photo-area', figmaId: '969:3652', level: 'Organisms', section: '07 Content', story: 'Organisms/PhotoArea', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'WeatherCard', figma: 'weather-card', figmaId: '962:3226', level: 'Organisms', section: '07 Content', story: 'Organisms/WeatherCard', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'ChatBubble', figma: 'chat-bubble', figmaId: '1036:5333', level: 'Organisms', section: '07 Content', story: 'Organisms/ChatBubble', status: 'stable' },
  { code: 'StylistPromptCard', figma: 'stylist-prompt-card', figmaId: '1112:4317', level: 'Organisms', section: '07 Content', story: 'Organisms/StylistPromptCard', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'OutfitCanvas', figma: 'экран Canvas (outfit-collage + pattern)', figmaId: null, figmaWhy: 'экран Canvas во флоу; собран из outfit-collage 1187:20745', level: 'Organisms', section: '07 Content', story: 'Organisms/OutfitCanvas', status: 'beta', statusWhy: 'нет компонента в Figma, нет истории «В флоу»' },
  { code: 'TripCard', figma: 'trip-card', figmaId: '1036:5342', level: 'Organisms', section: '07 Content', story: 'Organisms/TripCard', status: 'beta', statusWhy: 'нет истории «В флоу»' },

  { code: 'Screen', figma: 'Screen patterns', figmaId: '984:4728', level: 'Templates', section: '10 Screen patterns', story: 'Templates/Screen', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'Grid', figma: 'auto layout 2 × 173, gap 8/7', figmaId: null, figmaWhy: 'auto layout в паттернах 984:4728, не компонент', level: 'Templates', section: '10 Screen patterns', story: 'Pages/Экраны флоу', status: 'beta', statusWhy: 'auto layout, не компонент Figma' },
  { code: 'Row', figma: 'auto layout, horizontal', figmaId: null, figmaWhy: 'auto layout, не компонент', level: 'Templates', section: '10 Screen patterns', story: 'Pages/Экраны флоу', status: 'beta', statusWhy: 'auto layout, не компонент Figma' },

  // Экспортируются из src/*, но строк не было (#31)
  { code: 'WeatherIcon', figma: 'weather-icons/weather/*', figmaId: '1061:1733', level: 'Atoms', section: '01 Foundations', story: 'Atoms/Icon', note: 'цветные SVG из src/icons/weather', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'Flag', figma: 'flags/flag/*', figmaId: '1061:1830', level: 'Atoms', section: '01 Foundations', story: 'Atoms/Icon', note: 'круглые флаги 24; trailing в list-item (валюта, страна)', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'StatRow', figma: 'stat-tile (ряд, auto layout)', figmaId: null, figmaWhy: 'ряд stat-tile 1184:20692 в usage, не компонент', level: 'Molecules', section: '07 Content', story: 'Molecules/StatTile', status: 'beta', statusWhy: 'нет компонента в Figma' },
  { code: 'List', figma: 'list-item (столбик, gap 20)', figmaId: null, figmaWhy: 'столбик list-item 960:2963 в usage, не компонент', level: 'Molecules', section: '04 Selection', story: 'Molecules/ListItem', status: 'beta', statusWhy: 'нет компонента в Figma' },
  { code: 'Overlay', figma: 'затемнение под sheet / dialog', figmaId: null, figmaWhy: 'скрим входит в макеты sheet 962:3095 и dialog 962:3136', level: 'Organisms', section: '06 Overlays', story: 'Organisms/Sheet', note: 'жест смахивания, тап по затемнению, Escape', status: 'beta', statusWhy: 'нет компонента в Figma' },
  { code: 'ItemArt', figma: 'фото вещи внутри item-card', figmaId: null, figmaWhy: 'слой внутри item-card 962:3218 и outfit-collage 1187:20745', level: 'Organisms', section: '07 Content', story: 'Organisms/ItemCard', note: 'выравнивание по визуальному весу и оптическому центру', status: 'beta', statusWhy: 'нет компонента в Figma' },
  { code: 'CollageLayer', figma: 'слой вещей outfit-collage', figmaId: null, figmaWhy: 'слой внутри outfit-collage 1187:20745, outfit-thumbnail 962:3227, trip-card 1036:5342', level: 'Organisms', section: '07 Content', story: 'Organisms/OutfitCollage', status: 'beta', statusWhy: 'нет компонента в Figma, нет истории «В флоу»' },
  { code: 'StylistDock', figma: 'нижняя панель стилиста (флоу Stylist / Home)', figmaId: null, figmaWhy: 'есть только в макетах флоу: input-bar 942:7282 + tab-bar 962:3217', level: 'Organisms', section: '05 Navigation & scroll', story: 'Pages/Экраны флоу', status: 'beta', statusWhy: 'нет компонента в Figma, нет истории «В флоу»' },
  { code: 'Sticky', figma: 'Pattern / Search Results (шапка с фильтрами)', figmaId: '984:4979', level: 'Templates', section: '10 Screen patterns', story: 'Pages/Экраны флоу', note: 'figmaId — кадр паттерна, не компонент', status: 'beta', statusWhy: 'кадр паттерна, нет истории «В флоу»' },

  // Волна 2 · organisms (#25)
  { code: 'OutfitPager', figma: 'стопка / лента образов (флоу Outfits, Stylist)', figmaId: null, figmaWhy: 'компонента в DS 2.0 нет, только экраны: 232:1355, 798:1741 (стопка), 463:1534 (лента); Animations «scale» 354:17678', level: 'Organisms', section: '07 Content', story: 'Organisms/OutfitPager', note: 'axis y / x, превью 96 / 150, слоты weather, stamp, skip', status: 'alpha', statusWhy: 'нет компонента в Figma; на экраны придёт с #50–#54' },
  { code: 'ItemSlots', figma: 'выбор вещей в образ (флоу Outfit Creation)', figmaId: null, figmaWhy: 'компонента в DS 2.0 нет, только экраны: 414:1459 (ряды 414:1476, 414:1499, пустой 414:1491), 414:1541', level: 'Organisms', section: '07 Content', story: 'Organisms/ItemSlots', note: 'ItemSlots + ItemSlot: ряд со снапом, «+» в конце', status: 'alpha', statusWhy: 'нет компонента в Figma; на экраны придёт с #50–#54' },
  { code: 'CropFrame', figma: 'рамка обрезки (флоу Search / Photo / Crop)', figmaId: null, figmaWhy: 'компонента в DS 2.0 нет, кадр 261:1590 — плоская картинка', level: 'Organisms', section: '07 Content', story: 'Organisms/CropFrame', note: 'затемнение, уголки, перемещение, углы, щипок', status: 'alpha', statusWhy: 'нет компонента в Figma; на экраны придёт с #50–#54' },
  { code: 'StylistAvatar', figma: 'аватар стилиста 64 (флоу Stylist)', figmaId: null, figmaWhy: 'иллюстрация в макетах 413:846 (слой 699:2534), 699:2858; не компонент', level: 'Organisms', section: '07 Content', story: 'Organisms/ChatBubble', note: 'ChatBubble avatar={true}', status: 'alpha', statusWhy: 'нет компонента в Figma; на экраны придёт с #50–#54' },

  // Шаблоны после #46 (#29) — строка предложена в PR #64 автором #43
  { code: 'DetailsScreen', figma: 'Item / Outfit Details (панель поверх фото, миниатюра 48 в шапке)', figmaId: null, figmaWhy: 'компонента в DS 2.0 нет, только экраны: 349:9258 → 349:9976, 349:8637 → 349:10430; Animations «new things» 354:17405', level: 'Templates', section: '10 Screen patterns', story: 'Pages/Экраны флоу/Wardrobe / Item Details', status: 'beta', statusWhy: 'нет компонента в Figma и своей истории — показан на экранах деталей и «Новая вещь»' },
];
