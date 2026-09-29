import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { IconButton, Stamp } from '../atoms';
import { ChipGroup, EmptyState, List, ListItem, Note, SegmentControl, Snackbar, StatRow, StatTile } from '../molecules';
import { BottomBar, BottomNav, type CollageItem, Dialog, Header, ItemCard, OutfitCollage, Overlay, PhotoArea, ProductCard, Sheet } from '../organisms';
import { DetailsScreen, Grid, Row, Screen, Sticky } from '../templates';
import { grid, shoes } from './data';
import { SCROLLED, useScrolled } from './scroll';
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

export const Wardrobe: Story = {
  name: 'Wardrobe / Items / Populated',
  render: () => {
    const [tab, setTab] = useState('items');
    return (
      <Screen header={<Header type="large" title="Гардероб" />} bottom={<BottomNav active="wardrobe" fab />}>
        <SegmentControl value={tab} onChange={setTab} segments={tabs} />
        <Sticky>
          <Row gap={4}>
            <IconButton icon="search" label="Поиск" size="S" />
            <IconButton icon="archive" label="Архив" size="S" />
            <ChipGroup chips={[{ label: 'Категория', dropdown: true }, { label: 'Сезон', dropdown: true }, { label: 'Теги', dropdown: true }]} />
          </Row>
        </Sticky>
        <Grid>{[...grid, ...grid].map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>
      </Screen>
    );
  },
};

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
  render: () => (
    <Screen
      header={<Header type="large" title="Гардероб" />}
      overlay={
        <Overlay>
          <Sheet title="Категория" footer={[{ label: 'Сбросить' }, { label: 'Применить' }]}>
            <List><ListItem type="expandable" icon="outerwear" label="Верхняя одежда" /><ListItem type="expandable" icon="top" label="Верх" expanded /></List>
            <ChipGroup wrap chips={[{ label: 'Футболка', selected: true }, { label: 'Поло' }, { label: 'Топ' }, { label: 'Рубашка' }]} />
            <List><ListItem type="expandable" icon="bottom" label="Низ" /><ListItem type="expandable" icon="shoe" label="Обувь" /><ListItem type="expandable" icon="accessories" label="Аксессуары" /></List>
          </Sheet>
        </Overlay>
      }
    >
      <Grid>{grid.map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>
    </Screen>
  ),
};

export const ItemActions: Story = {
  name: 'Wardrobe / Items / Sheet / Item Actions',
  render: () => (
    <Screen
      header={<Header type="large" title="Гардероб" />}
      overlay={<Overlay><Sheet title="Название вещи"><List><ListItem icon="collage" label="Создать образ" /><ListItem icon="pen" label="Редактировать" /><ListItem icon="archive" label="Архивировать" /><ListItem icon="trash" label="Удалить" /></List></Sheet></Overlay>}
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

/** Детали образа (Figma `349:8637 → 349:10430`): в шапке при скролле — мини-коллаж, штамп «Надеть» закреплён поверх. */
function OutfitDetailsScreen({ scrolled }: { scrolled?: boolean }) {
  const ref = useScrolled(scrolled ? SCROLLED : 0);
  return (
    <DetailsScreen media={<OutfitCollage items={outfit} />} title="На каждый день" stamp={<Stamp label="Надеть" />} scrollRef={ref}>
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

const bagLooks: CollageItem[][] = [
  [{ kind: 'bottom', x: 28, y: 56, size: 150, color: 'black' }, { kind: 'top', x: 64, y: 36, size: 120, color: 'brown' }, { kind: 'container', x: 76, y: 70, size: 64, color: 'black' }],
  [{ kind: 'bottom', x: 30, y: 58, size: 150, color: 'green' }, { kind: 'top', x: 66, y: 34, size: 110, color: 'white' }, { kind: 'container', x: 76, y: 74, size: 64, color: 'black' }],
];

/** Детали вещи из гардероба (Figma `349:9258 → 349:9976`): статистика, теги, образы с вещью. */
function WardrobeItemScreen({ scrolled }: { scrolled?: boolean }) {
  const ref = useScrolled(scrolled ? SCROLLED : 0);
  return (
    <DetailsScreen media={<PhotoArea kind="container" />} title="Сумка" scrollRef={ref}>
      <p className="y-body y-text--secondary">10 000 ₽ · Черный<br />Аксессуары · Все сезоны</p>
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

export const Wishlist: Story = {
  name: 'Wishlist / Items / Populated',
  render: () => (
    <Screen header={<Header type="large" title="Гардероб" />} bottom={<BottomNav active="wardrobe" fab />}>
      <SegmentControl value="wishlist" segments={tabs} />
      <Sticky>
        <SegmentControl size="S" fit value="items" segments={[{ value: 'items', label: 'Вещи' }, { value: 'outfits', label: 'Образы' }]} />
      </Sticky>
      <Grid rowGap={24}>
        {shoes.map((n, i) => <ProductCard key={i} kind="shoe" name={n} price={i ? '14 300 ₽' : '10 400 ₽'} showLike={false} />)}
      </Grid>
    </Screen>
  ),
};

/** Детали вещи из вишлиста (Figma `503:1150 → 503:1311`): описание, образы, BottomBar закреплён. */
function WishlistItemScreen({ scrolled }: { scrolled?: boolean }) {
  const ref = useScrolled(scrolled ? SCROLLED : 0);
  return (
    <DetailsScreen
      media={<PhotoArea kind="container" />}
      title="Сумка"
      bottom={<BottomBar label="Переместить в гардероб" secondary={{ icon: 'external-link', label: 'Открыть в магазине' }} />}
      scrollRef={ref}
    >
      <p className="y-body y-text--secondary">10 000 ₽ · Sander · Черный<br />Аксессуары · Все сезоны</p>
      <Note>Мягкая сумка округлой формы с логотипом и кожаным ремешком</Note>
      <section className="y-section y-item-looks">
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

export const ClearTrash: Story = {
  name: 'Trash / Items / Dialog / Clear',
  render: () => (
    <Screen header={<Header type="bar" titleChip="Корзина вещей" />} overlay={<Overlay><Dialog tone="destructive" title="Очистить корзину?" description="Все вещи из корзины удаляются навсегда, их уже не вернуть" cancel="Отмена" confirm="Очистить" /></Overlay>}>
      <Grid>{grid.slice(0, 4).map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>
    </Screen>
  ),
};
