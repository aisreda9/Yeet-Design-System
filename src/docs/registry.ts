/**
 * Реестр компонентов: одна точка правды для соответствия Figma ↔ код.
 * Из него строятся «Атомарная карта» и таблица «Figma ↔ код». Добавляешь компонент — добавь строку сюда.
 */
export type Level = 'Atoms' | 'Molecules' | 'Organisms' | 'Templates';

export type Entry = {
  code: string;
  /** Имя компонента на странице «Design System 2.0 (Claude)»; `null` — только в коде. */
  figma: string | null;
  level: Level;
  /** Секция Figma */
  section: string;
  /** Путь в Storybook */
  story: string;
  note?: string;
};

export const registry: Entry[] = [
  { code: 'Icon', figma: 'ui-icons/*', level: 'Atoms', section: '01 Foundations', story: 'Atoms/Icon' },
  { code: 'Logo', figma: 'yeet', level: 'Atoms', section: '01 Foundations', story: 'Atoms/Logo' },
  { code: 'Button', figma: 'button', level: 'Atoms', section: '02 Actions', story: 'Atoms/Button' },
  { code: 'IconButton', figma: 'icon-button', level: 'Atoms', section: '02 Actions', story: 'Atoms/IconButton' },
  { code: 'Stamp', figma: 'stamp', level: 'Atoms', section: '02 Actions', story: 'Atoms/Stamp', note: 'анимация --motion-stamp' },
  { code: 'Badge', figma: 'badge', level: 'Atoms', section: '02 Actions', story: 'Atoms/Badge' },
  { code: 'Avatar', figma: 'avatar', level: 'Atoms', section: '07 Content', story: 'Atoms/Avatar' },
  { code: 'Divider', figma: 'divider', level: 'Atoms', section: '09 System', story: 'Atoms/Text' },
  { code: 'ColorDot', figma: 'color', level: 'Atoms', section: '01 Foundations', story: 'Atoms/ColorDot' },
  { code: 'Text', figma: 'text styles', level: 'Atoms', section: '01 Foundations', story: 'Atoms/Text' },
  { code: 'ScrollEdge', figma: 'scroll-edge', level: 'Atoms', section: '05 Navigation & scroll', story: 'Templates/Screen' },

  { code: 'Field', figma: 'input (+ input-value)', level: 'Molecules', section: '03 Inputs', story: 'Molecules/Field & InputGroup' },
  { code: 'InputGroup', figma: 'input-group', level: 'Molecules', section: '03 Inputs', story: 'Molecules/Field & InputGroup' },
  { code: 'InputBar', figma: 'input-bar', level: 'Molecules', section: '03 Inputs', story: 'Molecules/InputBar' },
  { code: 'SegmentControl', figma: 'segment-control', level: 'Molecules', section: '04 Selection', story: 'Molecules/SegmentControl' },
  { code: 'ChipGroup', figma: 'chip-group + chip', level: 'Molecules', section: '04 Selection', story: 'Molecules/ChipGroup', note: 'chip · Selected × Trailing (None / Dropdown / Remove)' },
  { code: 'ListItem', figma: 'list-item', level: 'Molecules', section: '04 Selection', story: 'Molecules/ListItem' },
  { code: 'ListGroup', figma: 'list-group', level: 'Molecules', section: '04 Selection', story: 'Molecules/ListGroup' },
  { code: 'RangeSlider', figma: 'range-slider', level: 'Molecules', section: '04 Selection', story: 'Molecules/RangeSlider' },
  { code: 'StatTile', figma: 'stat-tile', level: 'Molecules', section: '07 Content', story: 'Molecules/StatTile' },
  { code: 'Hint', figma: 'hint', level: 'Molecules', section: '06 Overlays', story: 'Molecules/Hint' },
  { code: 'Snackbar', figma: 'snackbar', level: 'Molecules', section: '06 Overlays', story: 'Molecules/Snackbar' },
  { code: 'EmptyState', figma: 'empty-state', level: 'Molecules', section: '08 States', story: 'Molecules/EmptyState' },
  { code: 'LoadingState', figma: 'loading-state', level: 'Molecules', section: '08 States', story: 'Molecules/LoadingState' },
  { code: 'PhotoTile', figma: 'photo-tile', level: 'Molecules', section: '07 Content', story: 'Molecules/PhotoTile', note: 'поглотил brand-card' },
  { code: 'Carousel', figma: 'carousel', level: 'Molecules', section: '07 Content', story: 'Molecules/Carousel' },
  { code: 'BarChart', figma: 'bar-chart', level: 'Molecules', section: '07 Content', story: 'Molecules/BarChart' },
  { code: 'UsageMeter', figma: 'usage-meter', level: 'Molecules', section: '07 Content', story: 'Molecules/UsageMeter' },
  { code: 'AccountCard', figma: 'account-card', level: 'Molecules', section: '07 Content', story: 'Molecules/AccountCard', note: 'Kind: Current / Other / Settings' },
  { code: 'AvatarStack', figma: 'avatar-stack', level: 'Molecules', section: '07 Content', story: 'Molecules/AccountCard', note: 'мультиаккаунт в шапке профиля' },

  { code: 'StatusBar', figma: 'system / status-bar', level: 'Organisms', section: '09 System', story: 'Templates/Screen', note: 'только для макетов' },
  { code: 'Header', figma: 'header', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/Header' },
  { code: 'TabBar', figma: 'tab-bar', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/BottomNav & TabBar' },
  { code: 'BottomNav', figma: 'bottom-nav', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/BottomNav & TabBar' },
  { code: 'BottomBar', figma: 'bottom-bar', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/BottomBar' },
  { code: 'Sheet', figma: 'sheet', level: 'Organisms', section: '06 Overlays', story: 'Organisms/Sheet' },
  { code: 'Dialog', figma: 'dialog', level: 'Organisms', section: '06 Overlays', story: 'Organisms/Dialog', note: 'Tone: Default / Destructive / Danger' },
  { code: 'AccountsSheet', figma: 'sheet Modal + account-card', level: 'Organisms', section: '06 Overlays', story: 'Organisms/AccountsSheet' },
  { code: 'ItemCard', figma: 'item-card', level: 'Organisms', section: '07 Content', story: 'Organisms/ItemCard' },
  { code: 'ProductCard', figma: 'product-card', level: 'Organisms', section: '07 Content', story: 'Organisms/ProductCard' },
  { code: 'OutfitCollage', figma: 'outfit-collage', level: 'Organisms', section: '07 Content', story: 'Organisms/OutfitCollage' },
  { code: 'OutfitThumbnail', figma: 'outfit-thumbnail', level: 'Organisms', section: '07 Content', story: 'Organisms/OutfitCollage' },
  { code: 'PhotoArea', figma: 'photo-area', level: 'Organisms', section: '07 Content', story: 'Organisms/PhotoArea' },
  { code: 'WeatherCard', figma: 'weather-card', level: 'Organisms', section: '07 Content', story: 'Organisms/WeatherCard' },
  { code: 'ChatBubble', figma: 'chat-bubble', level: 'Organisms', section: '07 Content', story: 'Organisms/ChatBubble' },
  { code: 'StylistPromptCard', figma: 'stylist-prompt-card', level: 'Organisms', section: '07 Content', story: 'Organisms/StylistPromptCard' },
  { code: 'OutfitCanvas', figma: 'экран Canvas (outfit-collage + pattern)', level: 'Organisms', section: '07 Content', story: 'Organisms/OutfitCanvas' },
  { code: 'TripCard', figma: 'trip-card', level: 'Organisms', section: '07 Content', story: 'Organisms/TripCard' },

  { code: 'Screen', figma: 'Screen patterns', level: 'Templates', section: '10 Screen patterns', story: 'Templates/Screen' },
  { code: 'Grid', figma: 'auto layout 2 × 173, gap 8/7', level: 'Templates', section: '10 Screen patterns', story: 'Pages/Экраны флоу' },
  { code: 'Row', figma: 'auto layout, horizontal', level: 'Templates', section: '10 Screen patterns', story: 'Pages/Экраны флоу' },
];
