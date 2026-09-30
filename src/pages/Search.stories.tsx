import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../atoms';
import { demoAvatar, demoPhoto } from '../docs/helpers';
import { ChipGroup, EmptyState, Hint, InputBar, PhotoTile, RangeSlider } from '../molecules';
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
      <ChipGroup wrap center chips={['Nike', 'Crocs', 'Marine Serre', 'Белое платье с красными вкраплениями', 'Marine Serre', 'JAC58S Pina Jacquard', 'Обувь для бега'].map((label) => ({ label }))} />
    </Screen>
  ),
};

export const SearchResults: Story = {
  name: 'Search / Text / Results',
  render: () => (
    <Screen header={<Header type="search" query="Белые кроссовки" filters={[{ label: 'Сортировка' }, { label: 'Цена' }]} />}>
      <Grid rowGap={16}>
        {["Nike Air Force 1 '07 Edge", 'Nike Ava Edge', 'Adidas Samba', 'New Balance 550', 'Puma Palermo', 'Vans Old Skool'].map((n, i) => (
          <ProductCard key={n} kind="shoe" name={n} price={`${[10400, 14300, 11900, 13500, 9900, 7600][i].toLocaleString('ru-RU')} ₽`} discount={i % 2 ? undefined : '-10%'} liked={i === 1} />
        ))}
      </Grid>
    </Screen>
  ),
};

export const SearchEmpty: Story = {
  name: 'Search / Text / No Results Filtered',
  render: () => (
    <Screen header={<Header type="search" query="asdasd" filters={[{ label: 'Сначала дешевле', selected: true }, { label: 'до 60 000 ₽', selected: true }]} />} center>
      <div className="y-search-empty"><EmptyState title="Упс, не нашли" description="Измени запрос или попробуй поискать что-то другое" action={{ label: 'Сбросить поиск', variant: 'tertiary' }} /></div>
    </Screen>
  ),
};

function PriceSheet() {
  const [v, setV] = useState<[number, number]>([0, 30000]);
  return (
    <Screen
      header={<Header type="search" query="Белые кроссовки" filters={[{ label: 'Сортировка' }, { label: 'Цена', selected: true }]} />}
      overlay={
        <Overlay>
          <Sheet title="Цена">
            <RangeSlider label="Цена" min={0} max={60000} value={v} onChange={setV} histogram={[2, 3, 6, 12, 18, 20, 17, 19, 22, 16, 10, 6, 4, 3, 2, 2, 3, 2, 1, 1]} />
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

export const PhotoCrop: Story = {
  name: 'Search / Photo / Crop',
  render: () => (
    // рамка обрезки на всё фото (CropFrame); поверх всё белое: статус-бар, подсказка без подложки
    <Screen background="photo" className="y-crop-screen" backdrop={<div className="y-crop-layer"><CropFrame src={demoPhoto} hint={null} /></div>} end>
      <Row justify="center"><Hint tone="onPhoto" icon="fingers-pinch">Выдели вещь, которую ищем</Hint></Row>
      <Button size="L" fullWidth>Найти похожие</Button>
    </Screen>
  ),
};

export const PhotoResults: Story = {
  name: 'Search / Photo / Results',
  render: () => (
    <Screen header={<Header type="search" photo={demoPhoto} filters={[{ label: 'Сортировка' }, { label: 'Цена' }]} />} bottom={<BottomNav active="search" avatarSrc={demoAvatar} />}>
      <Grid rowGap={16}>
        {["Nike Air Force 1 '07 Edge", 'Nike Ava Edge', 'Adidas Samba', 'New Balance 550'].map((n, i) => (
          <ProductCard key={n} kind="shoe" name={n} price={`${[10400, 14300, 11900, 13500][i].toLocaleString('ru-RU')} ₽`} />
        ))}
      </Grid>
    </Screen>
  ),
};

const suggestions = ['Nike', 'Crocs', 'Marine Serre', 'Белое платье с красными вкраплениями', 'Marine Serre', 'JAC58S Pina Jacquemus', 'Обувь для бега'];

export const SearchFocused: Story = {
  name: 'Search / Text / Query Focused',
  render: () => (
    <Screen header={<Header type="search" />}>
      <ChipGroup wrap center chips={suggestions.map((label) => ({ label }))} />
    </Screen>
  ),
};

export const PhotoFocused: Story = {
  name: 'Search / Photo / Query Focused',
  render: () => (
    <Screen header={<Header type="search" photo={demoPhoto} filters={[{ label: 'Сортировка' }, { label: 'Цена' }]} />}>
      <Grid rowGap={16}>
        {["Nike Air Force 1 '07 Edge", 'Nike Ava Edge', "Nike Air Force 1 '07", "Nike Air Force 1 '07 LV8"].map((n, i) => (
          <ProductCard key={i} kind="shoe" name={n} price={i % 2 ? '14 300 ₽' : '10 400 ₽'} discount={i ? undefined : '-10%'} liked={i === 1 || i === 2} />
        ))}
      </Grid>
    </Screen>
  ),
};
