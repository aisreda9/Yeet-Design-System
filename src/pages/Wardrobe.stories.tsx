import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, type ReactNode, useState } from 'react';
import { IconButton, Stamp } from '../atoms';
import { type Chip, ChipGroup, EmptyState, Field, InputGroup, List, ListItem, Note, SegmentControl, Snackbar, StatRow, StatTile } from '../molecules';
import { BottomBar, BottomNav, type CollageItem, Dialog, type Garment, garmentNames, Header, ItemCard, OutfitCollage, Overlay, PhotoArea, ProductCard, Sheet } from '../organisms';
import { useGridReorder } from '../motion';
import { DetailsScreen, Grid, Row, Screen, Sticky } from '../templates';
import { grid, shoes } from './data';
import { CategorySheet, ChipSheet, colors, OCCASION_PLACEHOLDER, occasions, seasons } from './sheets';
import { SCROLLED, SCROLLED_LIST, useScrolled } from './scroll';
import './pages.css';

/* Раздел: гардероб — вещи, образы, вишлист, архив, корзина. Id историй — pages-экраны-флоу--<slug> (flow-diff). */
const meta = {
  title: 'Pages/Экраны флоу',
  parameters: {
    layout: 'centered', controls: { disable: true }, options: { showPanel: false },
    docs: { description: { component: 'Экраны флоу, собранные **только** из компонентов системы. Названия — как в Figma (`Раздел / Экран / Состояние`).' } },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const tabs = [{ value: 'items', label: 'Вещи' }, { value: 'outfits', label: 'Образы' }, { value: 'wishlist', label: 'Вишлист' }];

/**
 * Гардероб: вещи. При скролле (#170) заголовок и сегмент уезжают, ряд фильтров прилипает под статус-бар (y70),
 * под ним — затухание (Figma `1205:13362` Wardrobe / Items / Populated / Scrolled).
 */
function WardrobeItemsScreen({ scrollTo = 0 }: { scrollTo?: number }) {
  const [tab, setTab] = useState('items');
  const ref = useScrolled(scrollTo);
  // перестановка долгим тапом (#209): удержание и сдвиг — подъём, соседи раздвигаются; порядок — в состоянии экрана
  const [items, setItems] = useState(() => [...grid, ...grid].map((kind, i): { id: string; kind: Garment } => ({ id: `w${i}`, kind })));
  const reorder = useGridReorder({ items, getKey: (it) => it.id, onReorder: setItems, getLabel: (it) => garmentNames[it.kind] });
  return (
    <Screen header={<Header type="large" title="Гардероб" />} bottom={<BottomNav active="wardrobe" fab />} scrollRef={ref}>
      <SegmentControl value={tab} onChange={setTab} segments={tabs} />
      <Sticky>
        <Row gap={4}>
          <IconButton icon="search" label="Поиск" size="S" />
          <IconButton icon="archive" label="Архив" size="S" />
          <ChipGroup chips={[{ label: 'Категория', dropdown: true }, { label: 'Сезон', dropdown: true }, { label: 'Теги', dropdown: true }]} />
        </Row>
      </Sticky>
      <Grid {...reorder.gridProps}>
        {reorder.items.map((it) => <ItemCard key={it.id} kind={it.kind} {...reorder.itemProps(it.id)} />)}
        {reorder.announcer}
      </Grid>
    </Screen>
  );
}

export const Wardrobe: Story = { name: 'Wardrobe / Items / Populated', render: () => <WardrobeItemsScreen /> };
export const WardrobeScrolled: Story = { name: 'Wardrobe / Items / Populated / Scrolled', render: () => <WardrobeItemsScreen scrollTo={SCROLLED_LIST} /> };

export const WardrobeEmpty: Story = {
  name: 'Wardrobe / Items / Empty',
  render: () => (
    <Screen header={<Header type="large" title="Гардероб" />} bottom={<BottomNav active="wardrobe" fab />}>
      <SegmentControl value="items" segments={tabs} />
      <div className="y-wardrobe-empty">
        <EmptyState title="Гардероб пуст" description={<>Добавь первую вещь,<br />чтобы начать создавать образы</>} />
      </div>
    </Screen>
  ),
};

export const FilterSheet: Story = {
  name: 'Wardrobe / Items / Sheet / Category',
  tags: ['figma:1371-37611'],
  render: () => <CategoryFilterScreen expanded />,
};

/** Шторка категорий над гардеробом: открывается с чипса «Категория» свёрнутой (Figma OPEN_OVERLAY → Category Root `1173:16925`), строки раскрываются по нажатию. */
function CategoryFilterScreen({ expanded }: { expanded?: boolean }) {
  return (
    <Screen header={<Header type="large" title="Гардероб" />} overlay={<Overlay><CategorySheet expanded={expanded} footer /></Overlay>}>
      <Grid>{grid.map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>
    </Screen>
  );
}

export const CategoryRootSheet: Story = {
  name: 'Wardrobe / Items / Sheet / Category Root',
  tags: ['figma:1371-37683'],
  render: () => <CategoryFilterScreen />,
};

export const ItemActions: Story = {
  name: 'Wardrobe / Items / Sheet / Item Actions',
  render: () => (
    <Screen
      header={<Header type="large" title="Гардероб" />}
      overlay={<Overlay><Sheet title="Белое платье с красными вкраплениями"><List><ListItem icon="collage" label="Создать образ" /><ListItem icon="pen" label="Редактировать" /><ListItem icon="archive" label="Архивировать" /><ListItem icon="trash" label="Удалить" /></List></Sheet></Overlay>}
    >
      <Grid>{grid.map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>
    </Screen>
  ),
};

export const Toast: Story = {
  name: 'Wardrobe / Item / Toast',
  render: () => (
    <Screen header={<Header type="large" title="Гардероб" />} bottom={<BottomNav active="wardrobe" fab />} floating={<Snackbar onUndo={() => {}}>Вещь перемещена в архив</Snackbar>}>
      <Grid>{grid.map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>
    </Screen>
  ),
};

const outfit: CollageItem[] = [{ kind: 'accessories', x: 32, y: 20, size: 64 }, { kind: 'top', x: 68, y: 34, size: 120, color: 'green' }, { kind: 'bottom', x: 30, y: 60, size: 150, color: 'green' }, { kind: 'shoe', x: 72, y: 74, size: 80, color: 'brown' }];

/**
 * Детали образа (Figma `1371:41156 → 1371:41329`): в шапке при скролле — мини-коллаж, штамп «Надеть» закреплён поверх.
 * Нажали «Надеть» — штамп выполнен и сжат до S 56 с «отменить» (Variant 02: DS 0.2 `1174:19564`, штамп `1174:19568`; Raw `1371:41262`),
 * повторное нажатие — отменить. `worn` — начальное состояние.
 */
function OutfitDetailsScreen({ scrolled, worn: initialWorn = false }: { scrolled?: boolean; worn?: boolean }) {
  const ref = useScrolled(scrolled ? SCROLLED : 0);
  const [worn, setWorn] = useState(initialWorn);
  return (
    <DetailsScreen media={<OutfitCollage items={outfit} />} title="На каждый день" stamp={<Stamp label="Надеть" doneSize="S" done={worn} onClick={() => setWorn((w) => !w)} />} scrollRef={ref}>
      <p className="y-body y-text--secondary">Все сезоны</p>
      <StatRow><StatTile label="Надето раз" value={8} /><StatTile label="Д. простоя" value={1} /><StatTile label="Вещи" value={4} /></StatRow>
      <section className="y-section">
        <h3 className="y-h3">Теги</h3>
        <ChipGroup wrap chips={[{ label: 'Тег #1' }, { label: 'Тег #2' }, { label: 'Тег #3' }, { label: 'Тег #4' }]} />
      </section>
      <section className="y-section">
        <h3 className="y-h3">Вещи из образа</h3>
        <Grid><ItemCard kind="top" color="green" /><ItemCard kind="bottom" color="green" /><ItemCard kind="shoe" color="brown" /><ItemCard kind="accessories" /></Grid>
      </section>
    </DetailsScreen>
  );
}

export const OutfitDetails: Story = { name: 'Wardrobe / Outfit Details', render: () => <OutfitDetailsScreen /> };
export const OutfitDetailsScrolled: Story = { name: 'Wardrobe / Outfit Details / Scrolled', render: () => <OutfitDetailsScreen scrolled /> };
/** Образ надет: штамп State=Done, Done Size=S (DS 0.2 `1174:19564`; тег — кадр Raw `1371:41262`: coverage сверяет теги с кадрами Raw). */
export const OutfitDetailsWorn: Story = { name: 'Wardrobe / Outfit Details / Variant 02', tags: ['figma:1371-41262'], render: () => <OutfitDetailsScreen worn /> };

const bagLooks: CollageItem[][] = [
  [{ kind: 'bottom', x: 28, y: 56, size: 150, color: 'black' }, { kind: 'top', x: 64, y: 36, size: 120, color: 'brown' }, { kind: 'container', x: 76, y: 70, size: 64, color: 'black' }],
  [{ kind: 'bottom', x: 30, y: 58, size: 150, color: 'green' }, { kind: 'top', x: 66, y: 34, size: 110, color: 'white' }, { kind: 'container', x: 76, y: 74, size: 64, color: 'black' }],
];

/** Детали вещи из гардероба (Figma `1371:41024 → 1371:41076`): статистика, теги, образы с вещью. */
function WardrobeItemScreen({ scrolled, overlay }: { scrolled?: boolean; overlay?: ReactNode }) {
  const ref = useScrolled(scrolled ? SCROLLED : 0);
  return (
    <DetailsScreen media={<PhotoArea kind="container" />} title="Сумка" scrollRef={ref} overlay={overlay && <Overlay>{overlay}</Overlay>}>
      <p className="y-body y-text--secondary">10 000 ₽ · Чёрный<br />Аксессуары · Все сезоны</p>
      <StatRow><StatTile label="Надето раз" value={43} /><StatTile label="Д. простоя" value={12} /><StatTile label="Образы" value={7} /></StatRow>
      <section className="y-section">
        <h3 className="y-h3">Теги</h3>
        <ChipGroup wrap chips={[{ label: 'Тег #1' }, { label: 'Тег #2' }, { label: 'Тег #3' }, { label: 'Тег #4' }]} />
      </section>
      <section className="y-section">
        <h3 className="y-h3">Образы с этой вещью</h3>
        <div className="y-stack-8">{bagLooks.map((items, i) => <OutfitCollage key={i} items={items} />)}</div>
      </section>
    </DetailsScreen>
  );
}

export const WardrobeItemDetails: Story = { name: 'Wardrobe / Item Details', render: () => <WardrobeItemScreen /> };
export const WardrobeItemDetailsScrolled: Story = { name: 'Wardrobe / Item Details / Scrolled', render: () => <WardrobeItemScreen scrolled /> };

/** Вишлист: вещи. Фильтров нет — при скролле не прилипает ничего, кроме статус-бара (#170, Figma `1205:13506`). */
function WishlistItemsScreen({ scrollTo = 0, overlay }: { scrollTo?: number; overlay?: ReactNode }) {
  const ref = useScrolled(scrollTo);
  // прокрученное состояние — 6 позиций, как в Figma `1205:13506`: первая — Air Force, дальше Ava Edge (#216, строка 23)
  const [list, setList] = useState(() => (scrollTo ? [...shoes, shoes[1], shoes[1]] : shoes).map((name, i) => ({ id: `p${i}`, name })));
  const reorder = useGridReorder({ items: list, getKey: (it) => it.id, onReorder: setList, getLabel: (it) => it.name });
  return (
    <Screen header={<Header type="large" title="Гардероб" />} bottom={<BottomNav active="wardrobe" fab />} overlay={overlay && <Overlay>{overlay}</Overlay>} scrollRef={ref}>
      <SegmentControl value="wishlist" segments={tabs} />
      <SegmentControl size="S" fit value="items" segments={[{ value: 'items', label: 'Вещи' }, { value: 'outfits', label: 'Образы' }]} />
      <Grid rowGap={24} {...reorder.gridProps}>
        {reorder.items.map((it) => <ProductCard key={it.id} kind="shoe" name={it.name} price={it.name === shoes[0] ? '10 400 ₽' : '14 300 ₽'} showLike={false} {...reorder.itemProps(it.id)} />)}
        {reorder.announcer}
      </Grid>
    </Screen>
  );
}

export const Wishlist: Story = { name: 'Wishlist / Items / Populated', render: () => <WishlistItemsScreen /> };
export const WishlistScrolled: Story = { name: 'Wishlist / Items / Scrolled', render: () => <WishlistItemsScreen scrollTo={SCROLLED_LIST} /> };

/** Детали вещи из вишлиста (Figma `1371:43300 → 1371:43256`): описание, образы, BottomBar закреплён. */
function WishlistItemScreen({ scrolled }: { scrolled?: boolean }) {
  const ref = useScrolled(scrolled ? SCROLLED : 0);
  return (
    <DetailsScreen
      media={<PhotoArea kind="container" />}
      title="Сумка"
      // флоу 1174:17064: в прокрученной шапке нет «Ещё»
      actions={scrolled ? [] : undefined}
      bottom={<BottomBar label="Переместить в гардероб" secondary={{ icon: 'external-link', label: 'Открыть в магазине' }} />}
      scrollRef={ref}
    >
      <p className="y-body y-text--secondary">10 000 ₽ · Sander · Чёрный<br />Аксессуары · Все сезоны</p>
      <Note>Мягкая сумка округлой формы с логотипом и кожаным ремешком</Note>
      <section className="y-section">
        <h3 className="y-h3">Образы с этой вещью</h3>
        <div className="y-stack-8">{bagLooks.map((items, i) => <OutfitCollage key={i} items={items} />)}</div>
      </section>
    </DetailsScreen>
  );
}

export const ItemDetails: Story = { name: 'Wishlist / Item Details', render: () => <WishlistItemScreen /> };
export const ItemDetailsScrolled: Story = { name: 'Wishlist / Item Details / Scrolled', render: () => <WishlistItemScreen scrolled /> };

export const Archive: Story = {
  name: 'Archive / Items / Populated',
  render: () => (
    <Screen header={<Header type="bar" titleChip="Архив вещей" />}>
      <Grid>
        <ItemCard kind="top" color="white" />
        <ItemCard kind="top" color="black" />
      </Grid>
    </Screen>
  ),
};

/** Очистить корзину: Figma DS 0.2 `1147:7271` (якорь flow2 `clear-trash`), кадр Raw `1371:43664`. */
export const ClearTrash: Story = {
  name: 'Trash / Items / Dialog / Clear',
  tags: ['figma:1371-43664'],
  render: () => (
    <Screen header={<Header type="bar" titleChip="Корзина вещей" />} overlay={<Overlay><Dialog variant="destructive" title="Очистить корзину?" description="Все вещи из корзины удаляются навсегда, их уже не вернуть" cancel="Отменить" confirm="Очистить" /></Overlay>}>
      <Grid>{grid.slice(0, 4).map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>
    </Screen>
  ),
};

/* ─── Состояния гардероба, вишлиста, архива и корзины (#30) ─────────── */

const looks: CollageItem[][] = [
  outfit,
  [{ kind: 'bottom', x: 28, y: 58, size: 150, color: 'black' }, { kind: 'top', x: 64, y: 36, size: 130, color: 'brown' }, { kind: 'container', x: 78, y: 76, size: 64, color: 'black' }],
];
const wardrobeHeader = <Header type="large" title="Гардероб" />;
const wardrobeNav = <BottomNav active="wardrobe" fab />;

export const OutfitsPopulated: Story = {
  name: 'Wardrobe / Outfits / Populated',
  render: () => (
    <Screen header={wardrobeHeader} bottom={wardrobeNav}>
      <SegmentControl value="outfits" segments={tabs} />
      <Sticky>
        <ChipGroup chips={[{ label: 'Повод', dropdown: true }, { label: 'Сезон', dropdown: true }, { label: 'Теги', dropdown: true }]} />
      </Sticky>
      <div className="y-stack-8">{looks.map((items, i) => <OutfitCollage key={i} items={items} />)}</div>
    </Screen>
  ),
};

export const OutfitsEmpty: Story = {
  name: 'Wardrobe / Outfits / Empty',
  render: () => (
    <Screen header={wardrobeHeader} bottom={wardrobeNav}>
      <SegmentControl value="outfits" segments={tabs} />
      <div className="y-wardrobe-empty">
        <EmptyState title="Образов ещё нет" description={<>Добавь больше вещей для создания образов<br />вручную или с помощью ИИ</>} />
      </div>
    </Screen>
  ),
};

const noFilterResults = <EmptyState title="Упс, не нашли" description={<>Измени фильтры или попробуй<br />поискать что-то другое</>} action={{ label: 'Сбросить фильтры' }} />;

export const ItemsNoFilterResults: Story = {
  name: 'Wardrobe / Items / No Filter Results',
  render: () => (
    <Screen header={wardrobeHeader} bottom={wardrobeNav}>
      <SegmentControl value="items" segments={tabs} />
      <Sticky>
        <Row gap={4}>
          <IconButton icon="search" label="Поиск" size="S" />
          <IconButton icon="archive" label="Архив" size="S" />
          <ChipGroup chips={[{ label: 'Категория · 2', selected: true, dropdown: true }, { label: 'Сезон · 2', selected: true, dropdown: true }]} />
        </Row>
      </Sticky>
      <div className="y-wardrobe-empty y-wardrobe-empty--items-filtered">{noFilterResults}</div>
    </Screen>
  ),
};

export const OutfitsNoFilterResults: Story = {
  name: 'Wardrobe / Outfits / No Filter Results',
  render: () => (
    <Screen header={wardrobeHeader} bottom={wardrobeNav}>
      <SegmentControl value="outfits" segments={tabs} />
      <Sticky>
        <ChipGroup chips={[{ label: 'На каждый день', selected: true, dropdown: true }, { label: 'Сезон · 2', selected: true, dropdown: true }, { label: 'Теги · 2', selected: true, dropdown: true }]} />
      </Sticky>
      <div className="y-wardrobe-empty y-wardrobe-empty--outfits-filtered">{noFilterResults}</div>
    </Screen>
  ),
};

export const ItemSearchFocused: Story = {
  name: 'Wardrobe / Item Search / Query Focused',
  render: () => (
    <Screen header={<Header type="search" placeholder="Название вещи" photoSearch={false} focused />}>
      <ChipGroup wrap center chips={['Nike', 'Crocs', 'Marine Serre', 'Белое платье с красными вкраплениями', 'Marine Serre', 'JAC58S Pina Jacquemus', 'Обувь для бега'].map((label, k) => ({ label, value: `${k}` }))} />
    </Screen>
  ),
};

export const ItemSearchResults: Story = {
  name: 'Wardrobe / Item Search / Results',
  render: () => (
    <Screen header={<Header type="search" query="Футболка" photoSearch={false} />}>
      <Grid><ItemCard kind="top" color="white" /><ItemCard kind="top" color="black" /></Grid>
    </Screen>
  ),
};

export const ItemSearchEmpty: Story = {
  name: 'Wardrobe / Item Search / No Results',
  render: () => (
    <Screen header={<Header type="search" query="Кожаная куртка" photoSearch={false} />}>
      <div className="y-empty-bar"><EmptyState title="Упс, не нашли" description={<>Измени запрос или попробуй<br />поискать что-то другое</>} action={{ label: 'Сбросить поиск' }} /></div>
    </Screen>
  ),
};

export const WishlistOutfits: Story = {
  name: 'Wishlist / Outfits / Populated',
  render: () => (
    <Screen header={wardrobeHeader} bottom={wardrobeNav}>
      <SegmentControl value="wishlist" segments={tabs} />
      {/* фильтров нет — ничего не прилипает, переключатель уезжает с контентом (#170, Figma 1205:13506) */}
      <SegmentControl size="S" fit value="outfits" segments={[{ value: 'items', label: 'Вещи' }, { value: 'outfits', label: 'Образы' }]} />
      <div className="y-stack-8">{looks.map((items, i) => <OutfitCollage key={i} items={items} />)}</div>
    </Screen>
  ),
};

export const WishlistEmpty: Story = {
  name: 'Wishlist / Items / Empty',
  render: () => (
    <Screen header={wardrobeHeader} bottom={wardrobeNav}>
      <SegmentControl value="wishlist" segments={tabs} />
      <div className="y-wardrobe-empty y-wardrobe-empty--wishlist">
        <EmptyState title="Вишлист пуст" description={<>Сохраняй вещи из поиска<br />нажимая на сердечко</>} />
      </div>
    </Screen>
  ),
};

export const ArchiveEmpty: Story = {
  name: 'Archive / Items / Empty',
  render: () => (
    <Screen header={<Header type="bar" titleChip="Архив вещей" />}>
      <div className="y-empty-bar y-empty-bar--storage"><EmptyState title="Архив пуст" description="Вещь из архива можно вернуть в гардероб" /></div>
    </Screen>
  ),
};

export const TrashEmpty: Story = {
  name: 'Trash / Items / Empty',
  render: () => (
    <Screen header={<Header type="bar" title="Корзина вещей" />}>
      <div className="y-empty-bar y-empty-bar--storage"><EmptyState title="Корзина пуста" description="Если ты удалишь вещь, она будет храниться здесь 30 дней" /></div>
    </Screen>
  ),
};

export const TrashPopulated: Story = {
  name: 'Trash / Items / Populated',
  render: () => (
    <Screen header={<Header type="bar" title="Корзина вещей" actions={[{ icon: 'trash', label: 'Очистить корзину' }]} />}>
      <Grid><ItemCard kind="top" color="white" /><ItemCard kind="top" color="black" /></Grid>
    </Screen>
  ),
};

/** Действия вещи в корзине (Figma `555:4098`, #122): «Удалить навсегда» — тост `555:4116` с «Отменить» (#184). */
export const TrashItemActions: Story = {
  name: 'Trash / Item / Sheet / Actions',
  render: () => (
    <Screen
      header={<Header type="bar" title="Корзина вещей" actions={[{ icon: 'trash', label: 'Очистить корзину' }]} />}
      overlay={<Overlay><Sheet title="Белое платье с красными вкраплениями"><List><ListItem icon="undo" label="Вернуть в гардероб" /><ListItem icon="trash" label="Удалить навсегда" /></List></Sheet></Overlay>}
    >
      <Grid><ItemCard kind="top" color="white" /><ItemCard kind="top" color="black" /></Grid>
    </Screen>
  ),
};

export const WishlistOutfitDetails: Story = {
  name: 'Wishlist / Outfit Details / Default',
  render: () => (
    <DetailsScreen media={<OutfitCollage items={outfit} />} title="На каждый день" bottom={<BottomBar label="Переместить в гардероб" />}>
      <p className="y-body y-text--secondary">Все сезоны</p>
      <section className="y-section">
        <h3 className="y-h3">Вещи из образа</h3>
        <Grid><ItemCard kind="top" color="green" /><ItemCard kind="bottom" color="green" /><ItemCard kind="shoe" color="brown" /><ItemCard kind="accessories" /></Grid>
      </section>
    </DetailsScreen>
  ),
};

/** Новая вещь в вишлисте (Figma `1371:42992 → 1371:43197`): бренд и ссылка на магазин, комментарий. */
function WishlistNewItemScreen({ filled }: { filled?: boolean }) {
  const ref = useScrolled(filled ? SCROLLED : 0);
  const text = (label: string, value: string) => <Field label={label} input={filled ? { defaultValue: value } : {}} />;
  return (
    <DetailsScreen media={<PhotoArea kind="container" onRemove={() => {}} />} titleChip="Новая вещь" actions={[]} title="Детали новой вещи" bottom={<BottomBar label="Добавить" />} scrollRef={ref}>
      <InputGroup>
        {text('Название', 'Сумка')}
        {text('Стоимость', '10 000 ₽')}
        {text('Бренд', 'Sander')}
        {text('Ссылка', 'https://www.farfetch.com/shopping/men/jil-sander-leather-strap-logo-soft-rolled-bag-item-32485732.aspx')}
      </InputGroup>
      <InputGroup>
        <Field label="Категория" value="Аксессуары" trailingIcon="chevron-up-down" />
        <Field label="Цвет" value="Чёрный" colorDot="black" trailingIcon="chevron-up-down" />
        <Field label="Сезон" value="Все" trailingIcon="chevron-up-down" />
      </InputGroup>
      <InputGroup><Field label="Комментарий" multiline={{}} /></InputGroup>
    </DetailsScreen>
  );
}

export const WishlistNewItem: Story = { name: 'Wishlist / New Item / Empty', render: () => <WishlistNewItemScreen /> };
export const WishlistNewItemCompleted: Story = { name: 'Wishlist / New Item / Completed', render: () => <WishlistNewItemScreen filled /> };

/* ─── Оверлеи гардероба: фильтры, действия, тосты (#207, аудит строки 22–23) ───
 * По одной истории на тип оверлея; одна и та же шторка над разными экранами — теги `figma:` всех её кадров. */

const itemsBackdrop = <Grid>{grid.map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>;

/** Шторка-фильтр над гардеробом: заголовок → 16 → чипсы, без кнопок — выбор применяется сразу. `add` — синий «+» перед чипсами (свой повод). */
/**
 * Шторка-фильтр с чипсами. `add` — «+» своего повода, как в шторке «Повод» на главной: чипс-поле с плейсхолдером
 * (Custom Occasion Name Empty), ввод (… Entered), Enter или уход фокуса — новый чипс с ×; пустое поле исчезает (#220).
 */
function FilterSheetScreen({ title, chips, add }: { title: string; chips: (string | Chip)[]; add?: boolean }) {
  const [list, setList] = useState<Chip[]>(() => chips.map((c, k) => ({ ...(typeof c === 'string' ? { label: c } : c), selected: k === 0 })));
  const addCustom = () => setList((cur) => (cur.some((c) => c.editing) ? cur : [...cur, { label: '', value: 'new', editing: true, removable: true, placeholder: OCCASION_PLACEHOLDER }]));
  const editCustom = (v: string) => setList((cur) => cur.map((c) => (c.editing ? { ...c, label: v } : c)));
  const doneCustom = (v: string) => setList((cur) => cur.flatMap((c) => (c.editing ? (v.trim() ? [{ label: v.trim(), removable: true }] : []) : [c])));
  const removeCustom = (v: string) => setList((cur) => cur.filter((c) => (c.value ?? c.label) !== v));
  const chipGroup = add
    ? <ChipGroup wrap chips={list} onAdd={addCustom} onEdit={editCustom} onEditDone={doneCustom} onRemove={removeCustom} />
    : <ChipGroup wrap chips={list} />;
  return (
    <Screen header={wardrobeHeader} overlay={<Overlay><Sheet title={title}>{chipGroup}</Sheet></Overlay>}>
      {itemsBackdrop}
    </Screen>
  );
}

export const SeasonFilterSheet: Story = {
  name: 'Wardrobe / Items / Sheet / Season Filter',
  tags: ['figma:1371-37595', 'figma:1371-37759', 'figma:1371-37827'],
  render: () => <FilterSheetScreen title="Сезон" chips={seasons} />,
};

export const TagsFilterSheet: Story = {
  name: 'Wardrobe / Items / Sheet / Tags Filter',
  tags: ['figma:1371-37801', 'figma:1371-37775'],
  render: () => <FilterSheetScreen title="Теги" chips={Array.from({ length: 10 }, (_, k) => `Тег #${k + 1}`)} />,
};

export const OccasionFilterSheet: Story = {
  name: 'Wardrobe / Outfits / Sheet / Occasion Filter',
  tags: ['figma:1371-37867', 'figma:1371-37843', 'figma:1371-37891'],
  render: () => <FilterSheetScreen title="Повод" add chips={[...occasions, { label: 'Кастомный', removable: true }]} />,
};

/** Свой повод в фильтре образов (Figma `1174:15803` / `1174:15958`): «+» добавил чипс-поле с × в конец, плейсхолдер «Название»; клавиатура — системная, в истории её нет. */
const customOccasion = (label: string): Chip => ({ label, editing: true, removable: true, placeholder: OCCASION_PLACEHOLDER });

export const OutfitsCustomOccasionEmpty: Story = {
  name: 'Wardrobe / Outfits / Sheet / Custom Occasion Name Empty',
  tags: ['figma:1371-42346'],
  render: () => <FilterSheetScreen title="Повод" add chips={[...occasions, customOccasion('')]} />,
};

export const OutfitsCustomOccasionEntered: Story = {
  name: 'Wardrobe / Outfits / Sheet / Custom Occasion Name Entered',
  tags: ['figma:1371-42373'],
  render: () => <FilterSheetScreen title="Повод" add chips={[...occasions, customOccasion('Кастом')]} />,
};

/** Шторка действий: заголовок — имя вещи или повода, необратимое действие последним (Organisms/Sheet → «Действия»). */
function ActionSheetScreen({ title, actions, header = wardrobeHeader }: { title: string; actions: [NonNullable<ComponentProps<typeof ListItem>['icon']>, string][]; header?: ReactNode }) {
  return (
    <Screen header={header} overlay={<Overlay><Sheet title={title}><List>{actions.map(([icon, label]) => <ListItem key={label} icon={icon} label={label} />)}</List></Sheet></Overlay>}>
      {itemsBackdrop}
    </Screen>
  );
}

export const ArchiveItemActions: Story = {
  name: 'Archive / Item / Sheet / Actions',
  tags: ['figma:1371-37535'],
  render: () => <ActionSheetScreen header={<Header type="bar" titleChip="Архив вещей" />} title="Белое платье с красными вкраплениями" actions={[['undo', 'Вернуть в гардероб'], ['trash', 'Удалить']]} />,
};

export const OutfitActions: Story = {
  name: 'Wardrobe / Outfit / Sheet / Actions',
  tags: ['figma:1371-41135'],
  render: () => <ActionSheetScreen title="На каждый день" actions={[['pen', 'Редактировать'], ['trash', 'Удалить']]} />,
};

export const OutfitPermanentDelete: Story = {
  name: 'Wardrobe / Outfit / Sheet / Permanent Delete Actions',
  tags: ['figma:1371-40430', 'figma:1371-40451'],
  render: () => <ActionSheetScreen title="На каждый день" actions={[['pen', 'Редактировать'], ['trash', 'Удалить навсегда']]} />,
};

/** «+» в вишлисте: что добавить — вещь или образ (Figma `1173:16729`). */
export const WishlistContentTypeSheet: Story = {
  name: 'Wishlist / Add / Sheet / Content Type',
  tags: ['figma:1371-40549'],
  render: () => <WishlistItemsScreen overlay={<Sheet title="Добавить в вишлист"><List><ListItem icon="wardrobe" label="Вещь" /><ListItem icon="collage" label="Образ" /></List></Sheet>} />,
};
export const WishlistItemActions: Story = {
  name: 'Wishlist / Item / Sheet / Actions',
  tags: ['figma:1371-40512'],
  render: () => <ActionSheetScreen title="Белое платье с красными вкраплениями" actions={[['external-link', 'Перейти по ссылке'], ['collage', 'Создать образ'], ['bag-check', 'Переместить в гардероб'], ['pen', 'Редактировать'], ['trash', 'Удалить']]} />,
};

/** Тост после действия: над контентом; с «Отменить» — для обратимого. */
function ToastScreen({ text, header = wardrobeHeader, undo }: { text: string; header?: ReactNode; undo?: boolean }) {
  return (
    <Screen header={header} floating={undo ? <Snackbar onUndo={() => {}}>{text}</Snackbar> : <Snackbar onClose={() => {}}>{text}</Snackbar>}>
      {itemsBackdrop}
    </Screen>
  );
}

export const ToastMovedToTrash: Story = {
  name: 'Archive / Item / Toast / Moved to Trash',
  tags: ['figma:1371-37560'],
  render: () => <ToastScreen header={<Header type="bar" titleChip="Архив вещей" />} text="Вещь перемещена в корзину" undo />,
};

export const ToastMovedToWardrobe: Story = {
  name: 'Wishlist / Item / Toast / Moved to Wardrobe',
  tags: ['figma:1371-37590'],
  render: () => <ToastScreen text="Вещь перемещена в гардероб" undo />,
};

export const ToastDeletedPermanently: Story = {
  name: 'Trash / Item / Toast / Deleted Permanently',
  tags: ['figma:1371-37585'],
  render: () => <ToastScreen header={<Header type="bar" title="Корзина вещей" actions={[{ icon: 'trash', label: 'Очистить корзину' }]} />} text="Вещь удалена навсегда" undo />,
};

/* ─── Редактирование вещи: шторки полей (#220) ───────────────────────
 * Экрана «Wardrobe / Edit Item» в макетах нет (PROTOTYPE-FIGMA §8.4), шторки показаны над деталями вещи, откуда ведёт «Редактировать». */

export const EditItemCategorySheet: Story = {
  name: 'Wardrobe / Edit Item / Sheet / Category Expanded',
  tags: ['figma:1371-43540'],
  render: () => <WardrobeItemScreen overlay={<CategorySheet expanded />} />,
};

export const EditItemColorSheet: Story = {
  name: 'Wardrobe / Edit Item / Sheet / Color',
  tags: ['figma:1371-43606'],
  render: () => <WardrobeItemScreen overlay={<ChipSheet title="Цвет" chips={colors} />} />,
};

export const EditItemSeasonSheet: Story = {
  name: 'Wardrobe / Edit Item / Sheet / Season',
  tags: ['figma:1371-43648'],
  render: () => <WardrobeItemScreen overlay={<ChipSheet title="Сезон" chips={seasons} />} />,
};
