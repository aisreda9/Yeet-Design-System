/**
 * Реестр компонентов: одна точка правды для соответствия Figma ↔ код. `figmaId` — связь по node-id, а не по имени слоя.
 * Из него строятся «Атомарная карта» и таблица «Figma ↔ код». Добавляешь компонент — добавь строку сюда.
 */
export type Level = 'Atoms' | 'Molecules' | 'Organisms' | 'Templates';

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
};

export const registry: Entry[] = [
  { code: 'Icon', figma: 'ui-icons/*', figmaId: '942:5714', level: 'Atoms', section: '01 Foundations', story: 'Atoms/Icon' },
  { code: 'Logo', figma: 'yeet', figmaId: '1180:20027', level: 'Atoms', section: '01 Foundations', story: 'Atoms/Logo', note: 'цвет наследуется: on-accent, on-photo, secondary' },
  { code: 'Button', figma: 'button', figmaId: '942:6953', level: 'Atoms', section: '02 Actions', story: 'Atoms/Button' },
  { code: 'IconButton', figma: 'icon-button', figmaId: '942:7068', level: 'Atoms', section: '02 Actions', story: 'Atoms/IconButton' },
  { code: 'Stamp', figma: 'stamp', figmaId: '1004:5021', level: 'Atoms', section: '02 Actions', story: 'Atoms/Stamp', note: 'Tone: Primary 148 / Secondary 64 (иконка 29, −15°); анимация --motion-stamp' },
  { code: 'Badge', figma: 'badge', figmaId: '942:7125', level: 'Atoms', section: '02 Actions', story: 'Atoms/Badge' },
  { code: 'Avatar', figma: 'avatar', figmaId: '968:3666', level: 'Atoms', section: '07 Content', story: 'Atoms/Avatar', note: 'Content: Empty / Initial / Photo' },
  { code: 'Divider', figma: 'divider', figmaId: '951:3449', level: 'Atoms', section: '09 System', story: 'Atoms/Text' },
  { code: 'ColorDot', figma: 'color', figmaId: '1182:15916', level: 'Atoms', section: '01 Foundations', story: 'Atoms/ColorDot' },
  { code: 'Text', figma: 'text styles', figmaId: null, figmaWhy: 'текстовые стили Figma, не компонент', level: 'Atoms', section: '01 Foundations', story: 'Atoms/Text' },
  { code: 'ScrollEdge', figma: 'scroll-edge', figmaId: '965:3491', level: 'Atoms', section: '05 Navigation & scroll', story: 'Templates/Screen' },

  { code: 'Field', figma: 'input (+ input-value)', figmaId: '1182:20099', level: 'Molecules', section: '03 Inputs', story: 'Molecules/Field & InputGroup', note: 'Multiline 104 («Комментарий»)' },
  { code: 'InputGroup', figma: 'input-group', figmaId: '942:7264', level: 'Molecules', section: '03 Inputs', story: 'Molecules/Field & InputGroup' },
  { code: 'InputBar', figma: 'input-bar', figmaId: '942:7282', level: 'Molecules', section: '03 Inputs', story: 'Molecules/InputBar', note: 'State=Focus (обводка 1.5), Right=Photo (превью 48)' },
  { code: 'SegmentControl', figma: 'segment-control', figmaId: '942:7195', level: 'Molecules', section: '04 Selection', story: 'Molecules/SegmentControl' },
  { code: 'ChipGroup', figma: 'chip-group + chip', figmaId: '942:7246', level: 'Molecules', section: '04 Selection', story: 'Molecules/ChipGroup', note: 'chip · Selected × Trailing (None / Dropdown / Remove), State=Editing' },
  { code: 'ListItem', figma: 'list-item', figmaId: '960:2963', level: 'Molecules', section: '04 Selection', story: 'Molecules/ListItem', note: 'Radio + Trailing: флаг / текст («₽ · RUB»)' },
  { code: 'ListGroup', figma: 'list-group', figmaId: '1018:5025', level: 'Molecules', section: '04 Selection', story: 'Molecules/ListGroup' },
  { code: 'RangeSlider', figma: 'range-slider', figmaId: '1018:5036', level: 'Molecules', section: '04 Selection', story: 'Molecules/RangeSlider' },
  { code: 'StatTile', figma: 'stat-tile', figmaId: '1184:20692', level: 'Molecules', section: '07 Content', story: 'Molecules/StatTile', note: 'Size: M 80 (H2) / L 88 (H1)' },
  { code: 'Note', figma: 'note', figmaId: '1187:20746', level: 'Molecules', section: '07 Content', story: 'Molecules/Note', note: 'описание вещи: light-grey, p20, r20' },
  { code: 'Hint', figma: 'hint', figmaId: '1183:20594', level: 'Molecules', section: '06 Overlays', story: 'Molecules/Hint', note: 'Tone: Default / On Photo' },
  { code: 'Snackbar', figma: 'snackbar', figmaId: '1183:20589', level: 'Molecules', section: '06 Overlays', story: 'Molecules/Snackbar', note: 'Size: M 52 / S 48 (подсказка на холсте)' },
  { code: 'EmptyState', figma: 'empty-state', figmaId: '968:3643', level: 'Molecules', section: '08 States', story: 'Molecules/EmptyState' },
  { code: 'LoadingState', figma: 'loading-state', figmaId: '968:3667', level: 'Molecules', section: '08 States', story: 'Molecules/LoadingState' },
  { code: 'PhotoTile', figma: 'photo-tile', figmaId: '1146:6674', level: 'Molecules', section: '07 Content', story: 'Molecules/PhotoTile', note: 'поглотил brand-card' },
  { code: 'Carousel', figma: 'carousel', figmaId: '1018:5250', level: 'Molecules', section: '07 Content', story: 'Molecules/Carousel' },
  { code: 'BarChart', figma: 'bar-chart', figmaId: '1018:5224', level: 'Molecules', section: '07 Content', story: 'Molecules/BarChart' },
  { code: 'UsageMeter', figma: 'usage-meter', figmaId: '1018:5100', level: 'Molecules', section: '07 Content', story: 'Molecules/UsageMeter' },
  { code: 'AccountCard', figma: 'account-card', figmaId: '1131:5166', level: 'Molecules', section: '07 Content', story: 'Molecules/AccountCard', note: 'Kind: Current / Other / Settings' },
  { code: 'AvatarStack', figma: 'avatar-stack', figmaId: '1131:5183', level: 'Molecules', section: '07 Content', story: 'Molecules/AccountCard', note: 'мультиаккаунт в шапке профиля' },

  { code: 'StatusBar', figma: 'system / status-bar', figmaId: '1180:19996', level: 'Organisms', section: '09 System', story: 'Templates/Screen', note: 'только для макетов; Tone: Default / On Accent / On Photo' },
  { code: 'Header', figma: 'header', figmaId: '967:3624', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/Header', note: 'Back: Subtitle, action Tertiary M; Search: превью фото' },
  { code: 'TabBar', figma: 'tab-bar', figmaId: '962:3217', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/BottomNav & TabBar', note: 'профиль: буква или фото (avatarSrc)' },
  { code: 'BottomNav', figma: 'bottom-nav', figmaId: '967:3669', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/BottomNav & TabBar' },
  { code: 'BottomBar', figma: 'bottom-bar', figmaId: '967:3694', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/BottomBar' },
  { code: 'Sheet', figma: 'sheet', figmaId: '962:3095', level: 'Organisms', section: '06 Overlays', story: 'Organisms/Sheet', note: 'Show Handle, Show Close' },
  { code: 'Dialog', figma: 'dialog', figmaId: '962:3136', level: 'Organisms', section: '06 Overlays', story: 'Organisms/Dialog', note: 'Tone: Default / Destructive / Danger; одна кнопка' },
  { code: 'AccountsSheet', figma: 'sheet Modal + account-card', figmaId: null, figmaWhy: 'сборка: sheet 962:3095 (Modal) + account-card 1131:5166', level: 'Organisms', section: '06 Overlays', story: 'Organisms/AccountsSheet' },
  { code: 'ItemCard', figma: 'item-card', figmaId: '962:3218', level: 'Organisms', section: '07 Content', story: 'Organisms/ItemCard' },
  { code: 'ProductCard', figma: 'product-card', figmaId: '1118:9833', level: 'Organisms', section: '07 Content', story: 'Organisms/ProductCard' },
  { code: 'OutfitCollage', figma: 'outfit-collage', figmaId: '1187:20745', level: 'Organisms', section: '07 Content', story: 'Organisms/OutfitCollage', note: 'Pattern: Dots / None (plain)' },
  { code: 'OutfitThumbnail', figma: 'outfit-thumbnail', figmaId: '962:3227', level: 'Organisms', section: '07 Content', story: 'Organisms/OutfitCollage' },
  { code: 'PhotoArea', figma: 'photo-area', figmaId: '969:3652', level: 'Organisms', section: '07 Content', story: 'Organisms/PhotoArea' },
  { code: 'WeatherCard', figma: 'weather-card', figmaId: '962:3226', level: 'Organisms', section: '07 Content', story: 'Organisms/WeatherCard' },
  { code: 'ChatBubble', figma: 'chat-bubble', figmaId: '1036:5333', level: 'Organisms', section: '07 Content', story: 'Organisms/ChatBubble' },
  { code: 'StylistPromptCard', figma: 'stylist-prompt-card', figmaId: '1112:4317', level: 'Organisms', section: '07 Content', story: 'Organisms/StylistPromptCard' },
  { code: 'OutfitCanvas', figma: 'экран Canvas (outfit-collage + pattern)', figmaId: null, figmaWhy: 'экран Canvas во флоу; собран из outfit-collage 1187:20745', level: 'Organisms', section: '07 Content', story: 'Organisms/OutfitCanvas' },
  { code: 'TripCard', figma: 'trip-card', figmaId: '1036:5342', level: 'Organisms', section: '07 Content', story: 'Organisms/TripCard' },

  { code: 'Screen', figma: 'Screen patterns', figmaId: '984:4728', level: 'Templates', section: '10 Screen patterns', story: 'Templates/Screen' },
  { code: 'Grid', figma: 'auto layout 2 × 173, gap 8/7', figmaId: null, figmaWhy: 'auto layout в паттернах 984:4728, не компонент', level: 'Templates', section: '10 Screen patterns', story: 'Pages/Экраны флоу' },
  { code: 'Row', figma: 'auto layout, horizontal', figmaId: null, figmaWhy: 'auto layout, не компонент', level: 'Templates', section: '10 Screen patterns', story: 'Pages/Экраны флоу' },

  // Экспортируются из src/*, но строк не было (#31)
  { code: 'WeatherIcon', figma: 'weather-icons/weather/*', figmaId: '1061:1733', level: 'Atoms', section: '01 Foundations', story: 'Atoms/Icon', note: 'цветные SVG из src/icons/weather' },
  { code: 'Flag', figma: 'flags/flag/*', figmaId: '1061:1830', level: 'Atoms', section: '01 Foundations', story: 'Atoms/Icon', note: 'круглые флаги 24; trailing в list-item (валюта, страна)' },
  { code: 'StatRow', figma: 'stat-tile (ряд, auto layout)', figmaId: null, figmaWhy: 'ряд stat-tile 1184:20692 в usage, не компонент', level: 'Molecules', section: '07 Content', story: 'Molecules/StatTile' },
  { code: 'List', figma: 'list-item (столбик, gap 20)', figmaId: null, figmaWhy: 'столбик list-item 960:2963 в usage, не компонент', level: 'Molecules', section: '04 Selection', story: 'Molecules/ListItem' },
  { code: 'Overlay', figma: 'затемнение под sheet / dialog', figmaId: null, figmaWhy: 'скрим входит в макеты sheet 962:3095 и dialog 962:3136', level: 'Organisms', section: '06 Overlays', story: 'Organisms/Sheet', note: 'жест смахивания, тап по затемнению, Escape' },
  { code: 'ItemArt', figma: 'фото вещи внутри item-card', figmaId: null, figmaWhy: 'слой внутри item-card 962:3218 и outfit-collage 1187:20745', level: 'Organisms', section: '07 Content', story: 'Organisms/ItemCard', note: 'выравнивание по визуальному весу и оптическому центру' },
  { code: 'CollageLayer', figma: 'слой вещей outfit-collage', figmaId: null, figmaWhy: 'слой внутри outfit-collage 1187:20745, outfit-thumbnail 962:3227, trip-card 1036:5342', level: 'Organisms', section: '07 Content', story: 'Organisms/OutfitCollage' },
  { code: 'StylistDock', figma: 'нижняя панель стилиста (флоу Stylist / Home)', figmaId: null, figmaWhy: 'есть только в макетах флоу: input-bar 942:7282 + tab-bar 962:3217', level: 'Organisms', section: '05 Navigation & scroll', story: 'Pages/Экраны флоу' },
  { code: 'Sticky', figma: 'Pattern / Search Results (шапка с фильтрами)', figmaId: '984:4979', level: 'Templates', section: '10 Screen patterns', story: 'Pages/Экраны флоу', note: 'figmaId — кадр паттерна, не компонент' },

  // Волна 2 · organisms (#25)
  { code: 'OutfitPager', figma: 'стопка / лента образов (флоу Outfits, Stylist)', figmaId: null, figmaWhy: 'компонента в DS 2.0 нет, только экраны: 232:1355, 798:1741 (стопка), 463:1534 (лента); Animations «scale» 354:17678', level: 'Organisms', section: '07 Content', story: 'Organisms/OutfitPager', note: 'axis y / x, превью 96 / 150, слоты weather, stamp, skip' },
  { code: 'ItemSlots', figma: 'выбор вещей в образ (флоу Outfit Creation)', figmaId: null, figmaWhy: 'компонента в DS 2.0 нет, только экраны: 414:1459 (ряды 414:1476, 414:1499, пустой 414:1491), 414:1541', level: 'Organisms', section: '07 Content', story: 'Organisms/ItemSlots', note: 'ItemSlots + ItemSlot: ряд со снапом, «+» в конце' },
  { code: 'CropFrame', figma: 'рамка обрезки (флоу Search / Photo / Crop)', figmaId: null, figmaWhy: 'компонента в DS 2.0 нет, кадр 261:1590 — плоская картинка', level: 'Organisms', section: '07 Content', story: 'Organisms/CropFrame', note: 'затемнение, уголки, перемещение, углы, щипок' },
  { code: 'StylistAvatar', figma: 'аватар стилиста 64 (флоу Stylist)', figmaId: null, figmaWhy: 'иллюстрация в макетах 413:846 (слой 699:2534), 699:2858; не компонент', level: 'Organisms', section: '07 Content', story: 'Organisms/ChatBubble', note: 'ChatBubble avatar={true}' },
];
