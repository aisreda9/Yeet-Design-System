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
  /** Имя компонента на странице «Design System 0.2»; `null` — только в коде. */
  figma: string | null;
  /**
   * node-id компонента (component set / symbol) на странице DS 0.2 `942:5666` — ссылка вида `?node-id=942-6953`.
   * `null` — отдельного компонента в Figma нет, причина в `figmaWhy`. Не задано — ещё не сверено.
   */
  figmaId?: string | null;
  /** Почему `figmaId: null`. */
  figmaWhy?: string;
  level: Level;
  /** Путь в Storybook */
  story: string;
  note?: string;
  /** Зрелость: бейдж в сайдбаре Storybook и колонка в «Figma ↔ код». */
  status: Status;
  /** Чего не хватает до `stable` (или чем заменить `deprecated`). */
  statusWhy?: string;
};

export const registry: Entry[] = [
  { code: 'Icon', figma: 'ui-icons/*', figmaId: '942:5714', level: 'Atoms', story: 'Atoms/Icon', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'Logo', figma: 'yeet', figmaId: '1180:20027', level: 'Atoms', story: 'Atoms/Logo', note: 'Size: L 136×88 / S 61×40; Tone: Default / On Dark / Muted — цвет наследуется (currentColor), пропа tone нет', status: 'stable' },
  { code: 'Button', figma: 'button', figmaId: '942:6953', level: 'Atoms', story: 'Atoms/Button', status: 'stable' },
  { code: 'IconButton', figma: 'icon-button', figmaId: '942:7068', level: 'Atoms', story: 'Atoms/IconButton', note: 'Icon Size ↔ iconSize (20 / 24; по умолчанию 20 у S, 24 у остальных)', status: 'stable' },
  { code: 'Stamp', figma: 'stamp', figmaId: '1004:5021', level: 'Atoms', story: 'Atoms/Stamp', note: 'Tone: Primary 148 / Secondary 64 (иконка 29, −15°); анимация --motion-stamp', status: 'stable' },
  { code: 'Badge', figma: 'badge', figmaId: '942:7125', level: 'Atoms', story: 'Atoms/Badge', status: 'stable' },
  { code: 'Avatar', figma: 'avatar', figmaId: '968:3666', level: 'Atoms', story: 'Atoms/Avatar', note: 'Content: Empty / Initial / Photo', status: 'stable' },
  { code: 'Divider', figma: 'divider', figmaId: '951:3449', level: 'Atoms', story: 'Atoms/Divider', status: 'stable' },
  { code: 'ColorDot', figma: 'color-dot', figmaId: '1182:15916', level: 'Atoms', story: 'Atoms/ColorDot', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'ScrollEdge', figma: 'scroll-edge', figmaId: '965:3491', level: 'Atoms', story: 'Templates/Screen', status: 'beta', statusWhy: 'своей истории нет, показан в Templates/Screen' },
  { code: 'Link', figma: 'link', figmaId: '1209:21285', level: 'Atoms', story: 'Atoms/Link', note: 'State: Default / Focus; в макетах — 1371:36904, 517:7004, 1371:43055', status: 'alpha', statusWhy: 'ещё не на экранах (Delete Account, Legal — #50–#54)' },

  { code: 'Field', figma: 'input (+ input-value)', figmaId: '1182:20099', level: 'Molecules', story: 'Molecules/Field & InputGroup', note: 'Multiline 104 («Комментарий»)', status: 'stable' },
  { code: 'InputGroup', figma: 'input-group', figmaId: '942:7264', level: 'Molecules', story: 'Molecules/Field & InputGroup', status: 'stable' },
  { code: 'InputBar', figma: 'input-bar', figmaId: '942:7282', level: 'Molecules', story: 'Molecules/InputBar', note: 'State=Focus (обводка 1.5), Right=Photo (превью 48)', status: 'stable' },
  { code: 'SegmentControl', figma: 'segment-control', figmaId: '942:7195', level: 'Molecules', story: 'Molecules/SegmentControl', status: 'stable' },
  { code: 'ChipGroup', figma: 'chip-group + chip (1137:10333)', figmaId: '942:7246', level: 'Molecules', story: 'Molecules/ChipGroup', note: 'chip · Selected × Trailing (None / Dropdown / Remove), State=Editing', status: 'stable' },
  { code: 'ListItem', figma: 'list-item', figmaId: '960:2963', level: 'Molecules', story: 'Molecules/ListItem', note: 'Radio + Trailing: флаг / текст («₽ · RUB»); Show Description = `description`', status: 'stable' },
  { code: 'ListGroup', figma: 'list-group', figmaId: '1342:30828', level: 'Molecules', story: 'Molecules/ListGroup', note: 'Count: Multiple / Single; Single — 52, радиус 32', status: 'stable' },
  { code: 'RangeSlider', figma: 'range-slider', figmaId: '1018:5036', level: 'Molecules', story: 'Molecules/RangeSlider', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'StatTile', figma: 'stat-tile', figmaId: '1184:20692', level: 'Molecules', story: 'Molecules/StatTile', note: 'Size: M 80 (H2) / L 88 (H1)', status: 'stable' },
  { code: 'Note', figma: 'note', figmaId: '1187:20746', level: 'Molecules', story: 'Molecules/Note', note: 'описание вещи: light-grey, p20, r20', status: 'stable' },
  { code: 'Hint', figma: 'hint', figmaId: '1183:20594', level: 'Molecules', story: 'Molecules/Hint', note: 'Tone: Default / On Photo', status: 'stable' },
  { code: 'Snackbar', figma: 'snackbar', figmaId: '1183:20589', level: 'Molecules', story: 'Molecules/Snackbar', note: 'Size: M 52 / S 48 (подсказка на холсте)', status: 'stable' },
  { code: 'EmptyState', figma: 'empty-state', figmaId: '968:3643', level: 'Molecules', story: 'Molecules/EmptyState', status: 'stable' },
  { code: 'LoadingState', figma: 'loading-state', figmaId: '968:3667', level: 'Molecules', story: 'Molecules/LoadingState', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'PhotoTile', figma: 'photo-tile', figmaId: '1146:6674', level: 'Molecules', story: 'Molecules/PhotoTile', note: 'поглотил brand-card', status: 'stable' },
  { code: 'Carousel', figma: 'carousel', figmaId: '1018:5250', level: 'Molecules', story: 'Molecules/Carousel', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'BarChart', figma: 'bar-chart', figmaId: '1018:5224', level: 'Molecules', story: 'Molecules/BarChart', status: 'stable' },
  { code: 'UsageMeter', figma: 'usage-meter', figmaId: '1018:5100', level: 'Molecules', story: 'Molecules/UsageMeter', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'AccountCard', figma: 'account-card', figmaId: '1131:5166', level: 'Molecules', story: 'Molecules/AccountCard', note: 'Kind: Current / Other / Settings', status: 'stable' },
  { code: 'AvatarStack', figma: 'avatar-stack', figmaId: '1131:5183', level: 'Molecules', story: 'Molecules/AccountCard', note: 'мультиаккаунт в шапке профиля', status: 'stable' },
  { code: 'RadioList', figma: 'list-item · Type=Radio (столбик)', figmaId: null, figmaWhy: 'собирается из list-item 960:2963 Type=Radio, своего компонента нет', level: 'Molecules', story: 'Molecules/RadioList', note: 'radiogroup: стрелки, Home / End, controlled / uncontrolled', status: 'alpha', statusWhy: 'нет компонента в Figma, ещё не на экранах' },
  { code: 'FormField', figma: null, figmaId: null, figmaWhy: 'нет дизайна подписи и ошибки поля в DS 0.2', level: 'Molecules', story: 'Molecules/FormField', note: 'label / description / error над InputGroup', status: 'alpha', statusWhy: 'нет компонента в Figma (решение М7: пока только в коде), ещё не на экранах' },

  { code: 'StatusBar', figma: 'system / status-bar', figmaId: '1180:19996', level: 'Organisms', story: 'Templates/Screen', note: 'только для макетов; tone в коде: default / onAccent (сплэш) / onPhoto (поверх фото); в Figma Tone: Default / On Dark (AUDIT-149 О6)', status: 'beta', statusWhy: 'только для макетов, своей истории нет' },
  { code: 'Header', figma: 'header', figmaId: '967:3624', level: 'Organisms', story: 'Organisms/Header', note: 'Back: Subtitle, action Tertiary M; Search: превью фото', status: 'stable' },
  { code: 'TabBar', figma: 'tab-bar', figmaId: '962:3217', level: 'Organisms', story: 'Organisms/BottomNav & TabBar', note: 'профиль: буква или фото (avatarSrc)', status: 'stable' },
  { code: 'BottomNav', figma: 'bottom-nav', figmaId: '967:3669', level: 'Organisms', story: 'Organisms/BottomNav & TabBar', status: 'stable' },
  { code: 'BottomBar', figma: 'bottom-bar', figmaId: '967:3694', level: 'Organisms', story: 'Organisms/BottomBar', status: 'stable' },
  { code: 'Sheet', figma: 'sheet', figmaId: '962:3095', level: 'Organisms', story: 'Organisms/Sheet', note: 'Show Handle, Show Close', status: 'beta', statusWhy: 'аудит шторок: отступы, выравнивание, заголовки (#57, #58)' },
  { code: 'Dialog', figma: 'dialog', figmaId: '962:3136', level: 'Organisms', story: 'Organisms/Dialog', note: 'Tone: Default / Destructive / Danger; одна кнопка', status: 'stable' },
  { code: 'AccountsSheet', figma: 'sheet Modal + account-card', figmaId: null, figmaWhy: 'сборка: sheet 962:3095 (Modal) + account-card 1131:5166', level: 'Organisms', story: 'Organisms/AccountsSheet', status: 'beta', statusWhy: 'сборка без своего компонента в Figma; шторки на аудите (#58)' },
  { code: 'ItemCard', figma: 'item-card', figmaId: '962:3218', level: 'Organisms', story: 'Organisms/ItemCard', status: 'stable' },
  { code: 'ProductCard', figma: 'product-card', figmaId: '1118:9833', level: 'Organisms', story: 'Organisms/ProductCard', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'OutfitCollage', figma: 'outfit-collage', figmaId: '1187:20745', level: 'Organisms', story: 'Organisms/OutfitCollage', note: 'Pattern: Dots / None (plain)', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'OutfitThumbnail', figma: 'outfit-thumbnail', figmaId: '1348:16896', level: 'Organisms', story: 'Organisms/OutfitCollage', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'PhotoArea', figma: 'photo-area', figmaId: '969:3652', level: 'Organisms', story: 'Organisms/PhotoArea', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'WeatherCard', figma: 'weather-card', figmaId: '962:3226', level: 'Organisms', story: 'Organisms/WeatherCard', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'ChatBubble', figma: 'chat-bubble', figmaId: '1036:5333', level: 'Organisms', story: 'Organisms/ChatBubble', status: 'stable' },
  { code: 'StylistPromptCard', figma: 'stylist-prompt-card', figmaId: '1112:4317', level: 'Organisms', story: 'Organisms/StylistPromptCard', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'OutfitCanvas', figma: 'экран Canvas (outfit-collage + pattern)', figmaId: null, figmaWhy: 'экран Canvas во флоу; собран из outfit-collage 1187:20745', level: 'Organisms', story: 'Organisms/OutfitCanvas', status: 'beta', statusWhy: 'нет компонента в Figma, нет истории «В флоу»' },
  { code: 'TripCard', figma: 'trip-card', figmaId: '1036:5342', level: 'Organisms', story: 'Organisms/TripCard', status: 'beta', statusWhy: 'нет истории «В флоу»' },

  { code: 'Screen', figma: 'Templates (паттерны экрана)', figmaId: '1392:31304', level: 'Templates', story: 'Templates/Screen', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'Grid', figma: 'auto layout 2 × 173, gap 8/7', figmaId: null, figmaWhy: 'auto layout в паттернах Templates 1392:31304, не компонент', level: 'Templates', story: 'Pages/Экраны флоу', status: 'beta', statusWhy: 'auto layout, не компонент Figma' },
  { code: 'Row', figma: 'auto layout, horizontal', figmaId: null, figmaWhy: 'auto layout, не компонент', level: 'Templates', story: 'Pages/Экраны флоу', status: 'beta', statusWhy: 'auto layout, не компонент Figma' },

  // Экспортируются из src/*, но строк не было (#31)
  { code: 'WeatherIcon', figma: 'weather-icons/weather/*', figmaId: '1061:1733', level: 'Atoms', story: 'Atoms/Icon', note: 'цветные SVG из src/icons/weather', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'Flag', figma: 'flags/flag/*', figmaId: '1061:1830', level: 'Atoms', story: 'Atoms/Icon', note: 'круглые флаги 24; trailing в list-item (валюта, страна)', status: 'beta', statusWhy: 'нет истории «В флоу»' },
  { code: 'StatRow', figma: 'stat-tile (ряд, auto layout)', figmaId: null, figmaWhy: 'ряд stat-tile 1184:20692 в usage, не компонент', level: 'Molecules', story: 'Molecules/StatTile', status: 'beta', statusWhy: 'нет компонента в Figma' },
  { code: 'List', figma: 'list-item (столбик, gap 20)', figmaId: null, figmaWhy: 'столбик list-item 960:2963 в usage, не компонент', level: 'Molecules', story: 'Molecules/ListItem', status: 'beta', statusWhy: 'нет компонента в Figma' },
  { code: 'Overlay', figma: 'затемнение под sheet / dialog', figmaId: null, figmaWhy: 'скрим входит в макеты sheet 962:3095 и dialog 962:3136', level: 'Organisms', story: 'Organisms/Sheet', note: 'жест смахивания, тап по затемнению, Escape', status: 'beta', statusWhy: 'нет компонента в Figma' },
  { code: 'ItemArt', figma: 'фото вещи внутри item-card', figmaId: null, figmaWhy: 'слой внутри item-card 962:3218 и outfit-collage 1187:20745', level: 'Organisms', story: 'Organisms/ItemCard', note: 'выравнивание по визуальному весу и оптическому центру', status: 'beta', statusWhy: 'нет компонента в Figma' },
  { code: 'CollageLayer', figma: 'слой вещей outfit-collage', figmaId: null, figmaWhy: 'слой внутри outfit-collage 1187:20745, outfit-thumbnail 1348:16896, trip-card 1036:5342', level: 'Organisms', story: 'Organisms/OutfitCollage', status: 'beta', statusWhy: 'нет компонента в Figma, нет истории «В флоу»' },
  { code: 'StylistDock', figma: 'нижняя панель стилиста (флоу Stylist / Home)', figmaId: null, figmaWhy: 'есть только в макетах флоу: input-bar 942:7282 + tab-bar 962:3217', level: 'Organisms', story: 'Pages/Экраны флоу', status: 'beta', statusWhy: 'нет компонента в Figma, нет истории «В флоу»' },
  { code: 'Sticky', figma: 'Pattern / Search Results (шапка с фильтрами)', figmaId: '984:4979', level: 'Templates', story: 'Pages/Экраны флоу', note: 'figmaId — кадр паттерна, не компонент', status: 'beta', statusWhy: 'кадр паттерна, нет истории «В флоу»' },

  // Волна 2 · organisms (#25)
  { code: 'OutfitPager', figma: 'outfit-pager', figmaId: '1353:17046', level: 'Organisms', story: 'Organisms/OutfitPager', note: 'axis y / x, превью 96 / 150, слоты weather, stamp, skip', status: 'stable' },
  { code: 'ItemSlots', figma: 'item-slots + item-slots / slot (1355:17122)', figmaId: '1355:17124', level: 'Organisms', story: 'Organisms/ItemSlots', note: 'ItemSlots + ItemSlot: ряд со снапом, «+» в конце', status: 'stable' },
  { code: 'CropFrame', figma: 'crop-frame', figmaId: '1356:29832', level: 'Organisms', story: 'Organisms/CropFrame', note: 'затемнение, уголки, перемещение, углы, щипок', status: 'stable' },
  { code: 'StylistAvatar', figma: 'аватар стилиста 64 (флоу Stylist)', figmaId: null, figmaWhy: 'иллюстрация в макетах 1371:38928 (слой 699:2534), 1371:39070; не компонент', level: 'Organisms', story: 'Organisms/ChatBubble', note: 'ChatBubble avatar={true}', status: 'alpha', statusWhy: 'нет компонента в Figma; на экраны придёт с #50–#54' },

  // Шаблоны после #46 (#29) — строка предложена в PR #64 автором #43
  { code: 'DetailsScreen', figma: 'Item / Outfit Details (панель поверх фото, миниатюра 48 в шапке)', figmaId: null, figmaWhy: 'компонента в DS 0.2 нет, только экраны: 1371:41024 → 1371:41076, 1371:41156 → 1371:41329; Animations «new things» 354:17405', level: 'Templates', story: 'Templates/DetailsScreen', status: 'beta', statusWhy: 'нет компонента в Figma; своя история — каркас со слотами, с данными — на экранах деталей и «Новая вещь»' },
  { code: 'Prose', figma: 'Legal (текстовый документ: H1, разделы, карточка контактов)', figmaId: null, figmaWhy: 'компонента в DS 0.2 нет, только экраны: 1371:43055, 1371:43118', level: 'Templates', story: 'Templates/Prose', status: 'beta', statusWhy: 'нет компонента в Figma; своя история — каркас со слотами, с данными — Legal в Pages' },
  { code: 'PhotoBalance', figma: 'Organisms/PhotoBalance (текст на странице 1392:31298)', figmaId: null, figmaWhy: 'алгоритм выравнивания фото вещей (balanceArt, layoutCollage), не компонент; в Figma — только описание на странице Organisms 1392:31298', level: 'Organisms', story: 'Organisms/PhotoBalance', note: 'обрезка по альфе, визуальный вес, оптический центр; работает внутри ItemCard и OutfitCollage', status: 'beta', statusWhy: 'не компонент Figma, нет истории «В флоу»' },
  { code: 'Stack', figma: 'auto layout, vertical', figmaId: null, figmaWhy: 'auto layout, не компонент', level: 'Templates', story: 'Pages/Экраны флоу', note: 'вертикальная группа со своим шагом (8 / 12 / 0), align', status: 'beta', statusWhy: 'auto layout, не компонент Figma' },

  // Части компонентов Figma без своей истории (#216, AUDIT-149 п. 10): figmaId — узел DS 0.2, figmaWhy — почему нет отдельной истории
  { code: 'Field', figma: 'input-value', figmaId: '942:7138', figmaWhy: 'значение / плейсхолдер внутри input 1182:20099; в коде — часть Field, отдельного компонента и истории нет', level: 'Molecules', story: 'Molecules/Field & InputGroup', note: 'Color Blue / White из Figma в коде нет (AUDIT-149)', status: 'stable' },
  { code: 'ListGroup', figma: 'list-group / row', figmaId: '1037:5335', figmaWhy: 'строка внутри list-group 1342:30828; в коде — ListItem внутри ListGroup, отдельного компонента и истории нет', level: 'Molecules', story: 'Molecules/ListGroup', status: 'stable' },
  { code: 'BarChart', figma: 'bar-chart / bar', figmaId: '1186:16573', figmaWhy: 'столбец внутри bar-chart 1018:5224; в коде — элемент BarChart (`.y-bar-chart__bar`), отдельного компонента и истории нет', level: 'Molecules', story: 'Molecules/BarChart', status: 'stable' },
  { code: 'Screen', figma: 'system / keyboard', figmaId: '951:3442', figmaWhy: 'системная клавиатура только для макетов: в приложении её рисует ОС, компонента в коде и истории нет', level: 'Templates', story: 'Templates/Screen', status: 'beta', statusWhy: 'только для макетов, в коде не рисуется' },
  { code: 'Stamp', figma: 'shapes / main-action', figmaId: '942:13600', figmaWhy: 'форма звезды главного действия; в коде — путь `stampStar` внутри Stamp, отдельного компонента и истории нет', level: 'Atoms', story: 'Atoms/Stamp', status: 'stable' },
];
