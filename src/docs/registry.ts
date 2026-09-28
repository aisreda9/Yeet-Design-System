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
  { code: 'Logo', figma: 'yeet', level: 'Atoms', section: '01 Foundations', story: 'Atoms/Logo', note: 'цвет наследуется: on-accent, on-photo, secondary' },
  { code: 'Button', figma: 'button', level: 'Atoms', section: '02 Actions', story: 'Atoms/Button' },
  { code: 'IconButton', figma: 'icon-button', level: 'Atoms', section: '02 Actions', story: 'Atoms/IconButton' },
  { code: 'Stamp', figma: 'stamp', level: 'Atoms', section: '02 Actions', story: 'Atoms/Stamp', note: 'Tone: Primary 148 / Secondary 64 (иконка 29, −15°); анимация --motion-stamp' },
  { code: 'Badge', figma: 'badge', level: 'Atoms', section: '02 Actions', story: 'Atoms/Badge' },
  { code: 'Avatar', figma: 'avatar', level: 'Atoms', section: '07 Content', story: 'Atoms/Avatar', note: 'Content: Empty / Initial / Photo' },
  { code: 'Divider', figma: 'divider', level: 'Atoms', section: '09 System', story: 'Atoms/Text' },
  { code: 'ColorDot', figma: 'color', level: 'Atoms', section: '01 Foundations', story: 'Atoms/ColorDot' },
  { code: 'Text', figma: 'text styles', level: 'Atoms', section: '01 Foundations', story: 'Atoms/Text' },
  { code: 'ScrollEdge', figma: 'scroll-edge', level: 'Atoms', section: '05 Navigation & scroll', story: 'Templates/Screen' },

  { code: 'Field', figma: 'input (+ input-value)', level: 'Molecules', section: '03 Inputs', story: 'Molecules/Field & InputGroup', note: 'Multiline 104 («Комментарий»)' },
  { code: 'InputGroup', figma: 'input-group', level: 'Molecules', section: '03 Inputs', story: 'Molecules/Field & InputGroup' },
  { code: 'InputBar', figma: 'input-bar', level: 'Molecules', section: '03 Inputs', story: 'Molecules/InputBar', note: 'State=Focus (обводка 1.5), Right=Photo (превью 48)' },
  { code: 'SegmentControl', figma: 'segment-control', level: 'Molecules', section: '04 Selection', story: 'Molecules/SegmentControl' },
  { code: 'ChipGroup', figma: 'chip-group + chip', level: 'Molecules', section: '04 Selection', story: 'Molecules/ChipGroup', note: 'chip · Selected × Trailing (None / Dropdown / Remove), State=Editing' },
  { code: 'ListItem', figma: 'list-item', level: 'Molecules', section: '04 Selection', story: 'Molecules/ListItem', note: 'Radio + Trailing: флаг / текст («₽ · RUB»)' },
  { code: 'ListGroup', figma: 'list-group', level: 'Molecules', section: '04 Selection', story: 'Molecules/ListGroup' },
  { code: 'RangeSlider', figma: 'range-slider', level: 'Molecules', section: '04 Selection', story: 'Molecules/RangeSlider' },
  { code: 'StatTile', figma: 'stat-tile', level: 'Molecules', section: '07 Content', story: 'Molecules/StatTile', note: 'Size: M 80 (H2) / L 88 (H1)' },
  { code: 'Note', figma: 'note', level: 'Molecules', section: '07 Content', story: 'Molecules/Note', note: 'описание вещи: light-grey, p20, r20' },
  { code: 'Hint', figma: 'hint', level: 'Molecules', section: '06 Overlays', story: 'Molecules/Hint', note: 'Tone: Default / On Photo' },
  { code: 'Snackbar', figma: 'snackbar', level: 'Molecules', section: '06 Overlays', story: 'Molecules/Snackbar', note: 'Size: M 52 / S 48 (подсказка на холсте)' },
  { code: 'EmptyState', figma: 'empty-state', level: 'Molecules', section: '08 States', story: 'Molecules/EmptyState' },
  { code: 'LoadingState', figma: 'loading-state', level: 'Molecules', section: '08 States', story: 'Molecules/LoadingState' },
  { code: 'PhotoTile', figma: 'photo-tile', level: 'Molecules', section: '07 Content', story: 'Molecules/PhotoTile', note: 'поглотил brand-card' },
  { code: 'Carousel', figma: 'carousel', level: 'Molecules', section: '07 Content', story: 'Molecules/Carousel' },
  { code: 'BarChart', figma: 'bar-chart', level: 'Molecules', section: '07 Content', story: 'Molecules/BarChart' },
  { code: 'UsageMeter', figma: 'usage-meter', level: 'Molecules', section: '07 Content', story: 'Molecules/UsageMeter' },
  { code: 'AccountCard', figma: 'account-card', level: 'Molecules', section: '07 Content', story: 'Molecules/AccountCard', note: 'Kind: Current / Other / Settings' },
  { code: 'AvatarStack', figma: 'avatar-stack', level: 'Molecules', section: '07 Content', story: 'Molecules/AccountCard', note: 'мультиаккаунт в шапке профиля' },

  { code: 'StatusBar', figma: 'system / status-bar', level: 'Organisms', section: '09 System', story: 'Templates/Screen', note: 'только для макетов; Tone: Default / On Accent / On Photo' },
  { code: 'Header', figma: 'header', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/Header', note: 'Back: Subtitle, action Tertiary M; Search: превью фото' },
  { code: 'TabBar', figma: 'tab-bar', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/BottomNav & TabBar', note: 'профиль: буква или фото (avatarSrc)' },
  { code: 'BottomNav', figma: 'bottom-nav', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/BottomNav & TabBar' },
  { code: 'BottomBar', figma: 'bottom-bar', level: 'Organisms', section: '05 Navigation & scroll', story: 'Organisms/BottomBar' },
  { code: 'Sheet', figma: 'sheet', level: 'Organisms', section: '06 Overlays', story: 'Organisms/Sheet', note: 'Show Handle, Show Close' },
  { code: 'Dialog', figma: 'dialog', level: 'Organisms', section: '06 Overlays', story: 'Organisms/Dialog', note: 'Tone: Default / Destructive / Danger; одна кнопка' },
  { code: 'AccountsSheet', figma: 'sheet Modal + account-card', level: 'Organisms', section: '06 Overlays', story: 'Organisms/AccountsSheet' },
  { code: 'ItemCard', figma: 'item-card', level: 'Organisms', section: '07 Content', story: 'Organisms/ItemCard' },
  { code: 'ProductCard', figma: 'product-card', level: 'Organisms', section: '07 Content', story: 'Organisms/ProductCard' },
  { code: 'OutfitCollage', figma: 'outfit-collage', level: 'Organisms', section: '07 Content', story: 'Organisms/OutfitCollage', note: 'Pattern: Dots / None (plain)' },
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
