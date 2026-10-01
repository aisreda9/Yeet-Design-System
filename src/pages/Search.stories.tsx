import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button, IconButton } from '../atoms';
import { demoPhoto } from '../docs/helpers';
import { ChipGroup, EmptyState, InputBar, PhotoTile, RangeSlider, Snackbar } from '../molecules';
import { BottomNav, CropFrame, Header, Overlay, ProductCard, Sheet } from '../organisms';
import { Grid, Row, Screen } from '../templates';
import { shoes } from './data';
import './pages.css';

/* Раздел: поиск в сторах — по тексту и по фото. Id историй — pages-экраны-флоу--<slug> (flow-diff). */
const meta = {
  title: 'Pages/Экраны флоу',
  parameters: {
    layout: 'centered', controls: { disable: true }, options: { showPanel: false },
    docs: { description: { component: 'Экраны флоу, собранные **только** из компонентов системы. Названия — как в Figma (`Раздел / Экран / Состояние`).' } },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const SearchDiscover: Story = {
  name: 'Search / Discover',
  render: () => (
    <Screen header={<Header type="large" title="Поиск в сторах" subtitle={<>Нашли классную вещь?<br />Покажем, где купить такую же или похожую.</>} />} bottom={<BottomNav active="search" />}>
      {/* флоу: блоки через 32, поле 52, подсказки по центру */}
      <div className="y-discover-photos">
        <Row gap={7}>
          <PhotoTile source="gallery" />
          <PhotoTile source="camera" />
        </Row>
      </div>
      <div className="y-discover-query"><InputBar size="L" placeholder="Белые кроссовки Nike" fieldIcon="search" /></div>
      <ChipGroup wrap center chips={['Nike', 'Crocs', 'Marine Serre', 'Белое платье с красными вкраплениями', 'Marine Serre', 'JAC58S Pina Jacquemus', 'Обувь для бега'].map((label, k) => ({ label, value: `${k}` }))} />
    </Screen>
  ),
};

export const SearchResults: Story = {
  name: 'Search / Text / Results',
  render: () => (
    <Screen header={<Header type="search" query="Белые кроссовки" filters={[{ label: 'Сортировка' }, { label: 'Цена' }]} />}>
      <Grid rowGap={16}>
        {/* как во флоу 1141:2876: скидка только у первой, в вишлисте — вторая и третья; ряд 3 — AF1 '07 и '07 LV8 по 10 400 */}
        {["Nike Air Force 1 '07 Edge", 'Nike Ava Edge', "Nike Air Force 1 '07", "Nike Air Force 1 '07 LV8", "Nike Air Force 1 '07", "Nike Air Force 1 '07 LV8"].map((n, i) => (
          <ProductCard key={i} kind="shoe" name={n} price={`${(i === 1 ? 14300 : 10400).toLocaleString('ru-RU')} ₽`} discount={i === 0 ? '-10%' : undefined} liked={i === 1 || i === 2} />
        ))}
      </Grid>
    </Screen>
  ),
};

export const SearchEmpty: Story = {
  name: 'Search / Text / No Results Filtered',
  render: () => (
    <Screen header={<Header type="search" query="Кроссовки" filters={[{ label: 'Сначала дешевле', selected: true }, { label: 'до 60 000 ₽', selected: true }]} />} center>
      <div className="y-search-empty"><EmptyState title="Упс, не нашли" description="Измени запрос или попробуй поискать что-то другое" action={{ label: 'Сбросить поиск' }} /></div>
    </Screen>
  ),
};

function PriceSheet() {
  const [v, setV] = useState<[number, number]>([0, 60000]); // флоу 1144:3684: верхняя граница 60 000 ₽, бегунок на середине шкалы
  return (
    <Screen
      header={<Header type="search" query="Белые кроссовки" filters={[{ label: 'Сортировка' }, { label: 'Цена', selected: true }]} />}
      overlay={
        <Overlay>
          <Sheet title="Цена">
            <RangeSlider label="Цена" min={0} max={120000} value={v} onChange={setV} histogram={[2, 3, 6, 12, 18, 20, 17, 19, 22, 16, 10, 6, 4, 3, 2, 2, 3, 2, 1, 1]} />
          </Sheet>
        </Overlay>
      }
    >
      <Grid rowGap={16}>
        {shoes.map((n, i) => <ProductCard key={i} kind="shoe" name={n} price="14 300 ₽" />)}
      </Grid>
    </Screen>
  );
}

export const PriceFilter: Story = { name: 'Search / Results / Sheet / Price Filter', render: () => <PriceSheet /> };

const resultsBackdrop = <Grid rowGap={16}>{shoes.map((n, i) => <ProductCard key={i} kind="shoe" name={n} price="14 300 ₽" />)}</Grid>;

/** Сортировка результатов (#207): шторка-фильтр с чипсами, выбор применяется сразу. */
export const SortingSheet: Story = {
  name: 'Search / Results / Sheet / Sorting',
  tags: ['figma:1371-37745'],
  render: () => (
    <Screen
      header={<Header type="search" query="Белые кроссовки" filters={[{ label: 'Сортировка', selected: true }, { label: 'Цена' }]} />}
      overlay={<Overlay><Sheet title="Сортировка"><ChipGroup wrap chips={['По релевантности', 'Сначала дешевле', 'Сначала дороже', 'Со скидкой'].map((label, k) => ({ label, selected: k === 0 }))} /></Sheet></Overlay>}
    >
      {resultsBackdrop}
    </Screen>
  ),
};

/** Тост после лайка в результатах (#207): вещь ушла в вишлист, «Отменить». */
export const ToastMovedToWishlist: Story = {
  name: 'Search / Result Item / Toast / Moved to Wishlist',
  tags: ['figma:1371-41393'],
  render: () => (
    <Screen header={<Header type="search" query="Белые кроссовки" filters={[{ label: 'Сортировка' }, { label: 'Цена' }]} />} floating={<Snackbar onUndo={() => {}}>Вещь перемещена в вишлист</Snackbar>}>
      {resultsBackdrop}
    </Screen>
  ),
};

export const PhotoCrop: Story = {
  name: 'Search / Photo / Crop',
  render: () => (
    // рамка обрезки на всё фото (CropFrame, подсказка — его, в 24 над кнопкой); поверх всё белое: статус-бар, подсказка без подложки; «Назад» — белый круг слева вверху (1176:19019)
    <Screen background="photo" className="y-crop-screen" backdrop={<div className="y-crop-layer"><CropFrame src={demoPhoto} /></div>} end>
      <IconButton className="y-crop-back" icon="chevron-left" label="Назад" variant="inverse" />
      <Button size="L" fullWidth>Найти похожее</Button>
    </Screen>
  ),
};

export const PhotoResults: Story = {
  name: 'Search / Photo / Results',
  render: () => (
    <Screen header={<Header type="search" photo={demoPhoto} filters={[{ label: 'Сортировка' }, { label: 'Цена' }]} />}>
      {/* флоу 1173:14753: без таб-бара; скидка на 1-й карточке, в вишлисте 2-я и 3-я; ряды через 24 */}
      <Grid rowGap={24}>
        {["Nike Air Force 1 '07 Edge", 'Nike Ava Edge', "Nike Air Force 1 '07", "Nike Air Force 1 '07 LV8", 'Adidas Samba', 'New Balance 550'].map((n, i) => (
          <ProductCard key={n} kind="shoe" name={n} price={`${[10400, 14300, 10400, 10400, 11900, 13500][i].toLocaleString('ru-RU')} ₽`} discount={i === 0 ? '-10%' : undefined} liked={i === 1 || i === 2} />
        ))}
      </Grid>
    </Screen>
  ),
};

const suggestions = ['Nike', 'Crocs', 'Marine Serre', 'Белое платье с красными вкраплениями', 'Marine Serre', 'JAC58S Pina Jacquemus', 'Обувь для бега'];

export const SearchFocused: Story = {
  name: 'Search / Text / Query Focused',
  render: () => (
    <Screen header={<Header type="search" focused />}>
      <ChipGroup wrap center chips={suggestions.map((label, k) => ({ label, value: `${k}` }))} />
    </Screen>
  ),
};

export const PhotoFocused: Story = {
  name: 'Search / Photo / Query Focused',
  render: () => (
    <Screen header={<Header type="search" photo={demoPhoto} filters={[{ label: 'Сортировка' }, { label: 'Цена' }]} focused />}>
      <Grid rowGap={24}>
        {["Nike Air Force 1 '07 Edge", 'Nike Ava Edge', "Nike Air Force 1 '07", "Nike Air Force 1 '07 LV8"].map((n, i) => (
          <ProductCard key={i} kind="shoe" name={n} price={i % 2 ? '14 300 ₽' : '10 400 ₽'} discount={i ? undefined : '-10%'} liked={i === 1 || i === 2} />
        ))}
      </Grid>
    </Screen>
  ),
};
