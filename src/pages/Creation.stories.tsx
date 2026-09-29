import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { IconButton } from '../atoms';
import { ChipGroup, Field, InputGroup, LoadingState, SegmentControl, Snackbar } from '../molecules';
import { BottomBar, type CanvasItem, type Garment, Header, ItemCard, OutfitCanvas, PhotoArea, Sheet } from '../organisms';
import { DetailsScreen, Grid, Screen } from '../templates';
import { SCROLLED, useScrolled } from './scroll';
import type { ItemColor } from '../tokens/tokens';
import './pages.css';

/* Раздел: новая вещь и создание образа. Id историй — pages-экраны-флоу--<slug> (flow-diff). */
const meta = {
  title: 'Pages/Экраны флоу',
  parameters: {
    layout: 'centered', controls: { disable: true }, options: { showPanel: false },
    docs: { description: { component: 'Экраны флоу, собранные **только** из компонентов системы. Названия — как в Figma (`Раздел / Экран / Состояние`).' } },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const NewItem: Story = {
  name: 'New Item / Removing Background',
  render: () => (
    // как во флоу: детали в панели под фото, заголовок H2; при скролле фото уходит в миниатюру вместо пилюли (349:10770)
    <DetailsScreen media={<PhotoArea><LoadingState label="Удаляем фон" /></PhotoArea>} titleChip="Новая вещь" actions={[]} title="Детали новой вещи">
      <InputGroup><Field label="Название" input={{}} /><Field label="Стоимость" input={{ inputMode: 'numeric' }} /></InputGroup>
      <InputGroup><Field label="Категория" value="Аксессуары" trailingIcon="chevron-up-down" /><Field label="Цвет" value="Черный" colorDot="black" trailingIcon="chevron-up-down" /><Field label="Сезон" value="Все" trailingIcon="chevron-up-down" /></InputGroup>
    </DetailsScreen>
  ),
};

/** Шаги создания образа в шапке: вещи → коллаж → описание. */
const steps = (value: string, size: 'S' | 'M' = 'S') => (
  <SegmentControl size={size} fit={size === 'M'} value={value} segments={[{ value: 'items', icon: 'wardrobe', ariaLabel: 'Гардероб' }, { value: 'canvas', icon: 'collage', ariaLabel: 'Коллаж' }, { value: 'info', icon: 'info', ariaLabel: 'Описание' }]} />
);

export const OutfitItems: Story = {
  name: 'Outfit Creation / Item Selection / Ready to Continue',
  render: () => {
    const add = <span className="y-slot__add"><IconButton icon="plus" label="Добавить вещь" size="L" /></span>;
    return (
      <Screen header={<Header type="bar" center={steps('items', 'M')} actions={[{ icon: 'arrows-shuffle', label: 'Перемешать' }]} />} bottom={<BottomBar label="Далее" />} flush>
        {/* флоу: разделы в панели, выбранная вещь по центру, «+» справа, соседние выглядывают */}
        <div className="y-slots">
          <section className="y-slot"><h2 className="y-h2">Верх</h2><div className="y-slot__row"><span /><ItemCard kind="top" color="green" onRemove={() => {}} />{add}</div></section>
          <section className="y-slot"><h2 className="y-h2">Низ</h2><div className="y-slot__row">{add}</div></section>
          <section className="y-slot"><h2 className="y-h2">Обувь</h2><div className="y-slot__row"><ItemCard kind="shoe" color="beige" onRemove={() => {}} /><ItemCard kind="shoe" color="brown" onRemove={() => {}} />{add}</div></section>
        </div>
      </Screen>
    );
  },
};

/** Коллаж образа. `filtered` — выбраны фильтры и первые вещи, внизу «Далее»; иначе холст пуст (Figma `414:1679`). */
function CanvasScreen({ filtered, hint: withHint = filtered }: { filtered?: boolean; hint?: boolean }) {
  const wardrobe: { id: string; kind: Garment; color: ItemColor }[] = [
    { id: 'bottom', kind: 'bottom', color: 'green' }, { id: 'shoes', kind: 'shoe', color: 'brown' },
    { id: 'top', kind: 'top', color: 'green' }, { id: 'glasses', kind: 'accessories', color: 'black' },
  ];
  const spots: Record<string, Pick<CanvasItem, 'x' | 'y' | 'size'>> = { bottom: { x: 30, y: 58, size: 140 }, shoes: { x: 72, y: 76, size: 72 }, top: { x: 66, y: 34 }, glasses: { x: 32, y: 18, size: 56 } };
  const [items, setItems] = useState<CanvasItem[]>(filtered ? wardrobe.slice(0, 2).map((w) => ({ ...w, ...spots[w.id] })) : []);
  const [selected, setSelected] = useState<string>();
  const [hint, setHint] = useState(withHint);
  const toggle = (w: (typeof wardrobe)[number]) =>
    setItems((cur) => (cur.some((c) => c.id === w.id) ? cur.filter((c) => c.id !== w.id) : [...cur, { ...w, ...spots[w.id] }]));
  return (
    <Screen header={<Header type="bar" center={steps('canvas', 'M')} actions={[{ icon: 'arrows-shuffle', label: 'Перемешать' }]} />} bottom={filtered ? <BottomBar label="Далее" /> : undefined} flush>
      <div className="y-gutter">
        <OutfitCanvas items={items} onChange={setItems} selectedId={selected} onSelect={setSelected} hint={hint ? <Snackbar size="S" onClose={() => setHint(false)}>Перемещай и масштабируй вещи</Snackbar> : undefined} />
      </div>
      <Sheet type="panel" title="Гардероб">
        <ChipGroup chips={filtered ? [{ label: 'Категория · 2', selected: true, dropdown: true }, { label: 'Зима', selected: true, dropdown: true }] : [{ label: 'Категория', dropdown: true }, { label: 'Сезон', dropdown: true }]} />
        <Grid>{wardrobe.map((w) => <ItemCard key={w.id} kind={w.kind} color={w.color} selected={items.some((c) => c.id === w.id)} onClick={() => toggle(w)} />)}</Grid>
      </Sheet>
    </Screen>
  );
}

export const Canvas: Story = {
  name: 'Outfit Creation / Canvas / Filtered',
  render: () => <CanvasScreen filtered />,
};

export const CanvasDefault: Story = { name: 'Outfit Creation / Canvas / Default', render: () => <CanvasScreen /> };
export const CanvasHint: Story = { name: 'Outfit Creation / Canvas / Gesture Hint', render: () => <CanvasScreen hint /> };

export const OutfitCriteria: Story = {
  name: 'Outfit Creation / Criteria / Default',
  render: () => (
    <Screen header={<Header type="bar" center={steps('info')} />} bottom={<BottomBar label="Создать образ" />}>
      <InputGroup>
        <Field label="Повод" value="Все" trailingIcon="chevron-up-down" />
        <Field label="Сезон" value="Все" trailingIcon="chevron-up-down" />
      </InputGroup>
      <section className="y-section">
        <h3 className="y-h3">Теги</h3>
        <ChipGroup wrap onAdd={() => {}} chips={['Тег #1', 'Тег #2', 'Тег #3', 'Тег #4', 'Тег #5', 'Тег #6'].map((label) => ({ label, removable: true }))} />
      </section>
    </Screen>
  ),
};

/* ─── Новая вещь: состояния деталей (#30) ───────────────────────────────
 * В Figma каждое состояние в двух вариантах: Variant 01 — заголовок «Детали вещи», Variant 02 — «Детали новой вещи».
 */

type NewItemState = 'no-photo' | 'photo' | 'loading' | 'focused' | 'completed';

function NewItemScreen({ state, variant }: { state: NewItemState; variant: 1 | 2 }) {
  const collapsed = state === 'focused' || state === 'completed';
  const ref = useScrolled(collapsed ? SCROLLED : 0);
  const media =
    state === 'no-photo' ? <PhotoArea onAdd={() => {}} /> :
    state === 'loading' ? <PhotoArea><LoadingState label="Удаляем фон" /></PhotoArea> :
    <PhotoArea kind="container" onRemove={() => {}} />;
  const name = state === 'focused' ? 'Сум' : state === 'completed' ? 'Сумка' : undefined;
  return (
    <DetailsScreen
      media={media}
      titleChip="Новая вещь"
      actions={[]}
      title={variant === 1 ? 'Детали вещи' : 'Детали новой вещи'}
      bottom={state === 'photo' || state === 'completed' ? <BottomBar label="Добавить" /> : undefined}
      scrollRef={ref}
    >
      <InputGroup>
        <Field label="Название" input={name ? { defaultValue: name } : {}} />
        <Field label="Стоимость" input={state === 'completed' ? { defaultValue: '10 000 ₽', inputMode: 'numeric' } : { inputMode: 'numeric' }} />
      </InputGroup>
      <InputGroup>
        <Field label="Категория" value="Аксессуары" trailingIcon="chevron-up-down" />
        <Field label="Цвет" value="Черный" colorDot="black" trailingIcon="chevron-up-down" />
        <Field label="Сезон" value="Все" trailingIcon="chevron-up-down" />
      </InputGroup>
      <section className="y-section">
        <h3 className="y-h3">Теги</h3>
        <ChipGroup wrap onAdd={() => {}} chips={['Тег #1', 'Тег #2', 'Тег #3', 'Тег #4', 'Тег #5', 'Тег #6'].map((label) => ({ label, removable: true }))} />
      </section>
    </DetailsScreen>
  );
}

export const NewItemNoPhotoV1: Story = { name: 'New Item / Details / No Photo Variant 01', render: () => <NewItemScreen state="no-photo" variant={1} /> };
export const NewItemNoPhotoV2: Story = { name: 'New Item / Details / No Photo Variant 02', render: () => <NewItemScreen state="no-photo" variant={2} /> };
export const NewItemPhotoV1: Story = { name: 'New Item / Details / Photo Added Variant 01', render: () => <NewItemScreen state="photo" variant={1} /> };
export const NewItemPhotoV2: Story = { name: 'New Item / Details / Photo Added Variant 02', render: () => <NewItemScreen state="photo" variant={2} /> };
export const NewItemFocusedV1: Story = { name: 'New Item / Details / Name Focused Variant 01', render: () => <NewItemScreen state="focused" variant={1} /> };
export const NewItemFocusedV2: Story = { name: 'New Item / Details / Name Focused Variant 02', render: () => <NewItemScreen state="focused" variant={2} /> };
export const NewItemCompletedV1: Story = { name: 'New Item / Details / Completed Variant 01', render: () => <NewItemScreen state="completed" variant={1} /> };
export const NewItemCompletedV2: Story = { name: 'New Item / Details / Completed Variant 02', render: () => <NewItemScreen state="completed" variant={2} /> };
export const NewItemLoadingV1: Story = { name: 'New Item / Photo / Removing Background Variant 01', render: () => <NewItemScreen state="loading" variant={1} /> };
