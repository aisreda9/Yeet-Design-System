import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { ChipGroup, Field, InputGroup, LoadingState, SegmentControl, Snackbar } from '../molecules';
import { BottomBar, type CanvasItem, Dialog, type Garment, Header, ItemCard, ItemSlot, ItemSlots, OutfitCanvas, Overlay, PhotoArea, Sheet } from '../organisms';
import { DetailsScreen, Grid, Screen } from '../templates';
import { SCROLLED, useScrolled } from './scroll';
import { CategorySheet, PhotoSheet } from './sheets';
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
    // как во флоу: детали в панели под фото, заголовок H2; при скролле фото уходит в миниатюру вместо пилюли (1371:40849)
    <DetailsScreen media={<PhotoArea><LoadingState label="Удаляем фон" /></PhotoArea>} titleChip="Новая вещь" actions={[]} title="Детали новой вещи">
      <InputGroup><Field label="Название" input={{}} /><Field label="Стоимость" input={{ inputMode: 'numeric' }} /></InputGroup>
      <InputGroup><Field label="Категория" value="Аксессуары" trailingIcon="chevron-up-down" /><Field label="Цвет" value="Чёрный" colorDot="black" trailingIcon="chevron-up-down" /><Field label="Сезон" value="Все" trailingIcon="chevron-up-down" /></InputGroup>
    </DetailsScreen>
  ),
};

/** Шаги создания образа в шапке: вещи → коллаж → описание. */
const steps = (value: string, size: 'S' | 'M' = 'S') => (
  <SegmentControl size={size} fit={size === 'M'} value={value} segments={[{ value: 'items', icon: 'wardrobe', ariaLabel: 'Гардероб' }, { value: 'canvas', icon: 'collage', ariaLabel: 'Коллаж' }, { value: 'info', icon: 'info', ariaLabel: 'Описание' }]} />
);

/** Выбор вещей (Figma `1371:41906`, пустой `1371:41989`): панель `ItemSlots`, выбранная вещь по центру ряда, «+» в конце. */
function ItemSelectionScreen({ empty, overlay }: { empty?: boolean; overlay?: ReactNode }) {
  return (
    <Screen header={<Header type="bar" center={steps('items', 'M')} actions={[{ icon: 'arrows-shuffle', label: 'Перемешать' }]} />} bottom={empty ? undefined : <BottomBar label="Далее" />} overlay={overlay && <Overlay>{overlay}</Overlay>} flush>
      <ItemSlots>
        <ItemSlot title="Верх" onAdd={() => {}}>{!empty && <ItemCard kind="top" color="green" onRemove={() => {}} />}</ItemSlot>
        <ItemSlot title="Низ" onAdd={() => {}} />
        <ItemSlot title="Обувь" index={1} onAdd={() => {}}>{!empty && [<ItemCard key="beige" kind="shoe" color="beige" onRemove={() => {}} />, <ItemCard key="brown" kind="shoe" color="brown" onRemove={() => {}} />]}</ItemSlot>
      </ItemSlots>
    </Screen>
  );
}

export const OutfitItems: Story = { name: 'Outfit Creation / Item Selection / Ready to Continue', render: () => <ItemSelectionScreen /> };
// в макете кадр назван «Items Selected», но все слоты пустые
export const OutfitItemsEmpty: Story = { name: 'Outfit Creation / Item Selection / Items Selected', render: () => <ItemSelectionScreen empty /> };

function CanvasScreen({ filtered, hint: withHint = filtered, overlay }: { filtered?: boolean; hint?: boolean; overlay?: ReactNode }) {
  const wardrobe: { id: string; kind: Garment; color: ItemColor }[] = [
    { id: 'bottom', kind: 'bottom', color: 'green' }, { id: 'shoes', kind: 'shoe', color: 'brown' },
    { id: 'top', kind: 'top', color: 'green' }, { id: 'glasses', kind: 'accessories', color: 'black' },
  ];
  const spots: Record<string, Pick<CanvasItem, 'x' | 'y' | 'size'>> = { bottom: { x: 30, y: 58, size: 140 }, shoes: { x: 72, y: 76, size: 72 }, top: { x: 66, y: 34 }, glasses: { x: 32, y: 18, size: 56 } };
  const [items, setItems] = useState<CanvasItem[]>(filtered ? wardrobe.map((w) => ({ ...w, ...spots[w.id] })) : []);
  const [selected, setSelected] = useState<string>();
  const [hint, setHint] = useState(withHint);
  const toggle = (w: (typeof wardrobe)[number]) =>
    setItems((cur) => (cur.some((c) => c.id === w.id) ? cur.filter((c) => c.id !== w.id) : [...cur, { ...w, ...spots[w.id] }]));
  return (
    <Screen header={<Header type="bar" center={steps('canvas', 'M')} actions={[{ icon: 'arrows-shuffle', label: 'Перемешать' }]} />} bottom={filtered ? <BottomBar label="Далее" /> : undefined} overlay={overlay && <Overlay>{overlay}</Overlay>} flush>
      <div className="y-gutter">
        <OutfitCanvas items={items} onChange={setItems} selectedId={selected} onSelect={setSelected} hint={hint ? <Snackbar onClose={() => setHint(false)}>Перемещай и масштабируй вещи</Snackbar> : undefined} />
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
    <Screen header={<Header type="bar" center={steps('info', 'M')} actions={[{ icon: 'arrows-shuffle', label: 'Перемешать' }]} />} bottom={<BottomBar label="Создать образ" />}>
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

function NewItemScreen({ state, variant, overlay }: { state: NewItemState; variant: 1 | 2; overlay?: ReactNode }) {
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
      overlay={overlay && <Overlay>{overlay}</Overlay>}
      scrollRef={ref}
    >
      <InputGroup>
        <Field label="Название" input={name ? { defaultValue: name } : {}} />
        <Field label="Стоимость" input={state === 'completed' ? { defaultValue: '10 000 ₽', inputMode: 'numeric' } : { inputMode: 'numeric' }} />
      </InputGroup>
      <InputGroup>
        <Field label="Категория" value="Аксессуары" trailingIcon="chevron-up-down" />
        <Field label="Цвет" value="Чёрный" colorDot="black" trailingIcon="chevron-up-down" />
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

/* ─── Новая вещь: шторки фото и категории (#220) ─────────────────────── */

/** Фото вещи: шторка над формой без фото (Figma `1173:16837`). */
export const NewItemPhotoSheet: Story = {
  name: 'New Item / Photo / Sheet / Add',
  tags: ['figma:1371-40568'],
  render: () => <NewItemScreen state="no-photo" variant={2} overlay={<PhotoSheet label="Фото вещи" />} />,
};

/** Поле «Категория» формы: выбор применяется сразу. Корень списка (`1144:3161`) — с кнопками, раскрытый «Верх» (`1173:17360`) — без них, как в макете. */
export const NewItemCategoryRoot: Story = {
  name: 'New Item / Details / Sheet / Category Root',
  tags: ['figma:1371-43882'],
  render: () => <NewItemScreen state="photo" variant={2} overlay={<CategorySheet footer />} />,
};

export const NewItemCategoryExpanded: Story = {
  name: 'New Item / Details / Sheet / Category Expanded',
  tags: ['figma:1371-41398'],
  render: () => <NewItemScreen state="photo" variant={2} overlay={<CategorySheet expanded />} />,
};

/* ─── Создание образа: диалоги и шторка фильтра (#30) ───────────────── */

export const ShuffleDialog: Story = {
  name: 'Outfit Creation / Shuffle / Dialog / Unsaved Changes',
  render: () => <CanvasScreen filtered hint={false} overlay={<Dialog title="Перемешать образ?" description="Сохрани текущий образ, прежде чем перемешать вещи" cancel="Перемешать" confirm="Сохранить и начать" />} />,
};

export const ExitDialog: Story = {
  name: 'Outfit Creation / Exit / Dialog / Unsaved Changes',
  render: () => <CanvasScreen filtered hint={false} overlay={<Dialog title="Точно хочешь выйти?" description="Можно сохранить образ и вернуться к нему позже" cancel="Выйти" confirm="Сохранить и выйти" />} />,
};

export const ClearDialog: Story = {
  name: 'Outfit Creation / Clear / Dialog / Confirmation',
  render: () => <CanvasScreen filtered hint={false} overlay={<Dialog variant="destructive" title="Очистить образ?" description="Все выбранные вещи будут убраны" cancel="Отменить" confirm="Очистить" />} />,
};

/** Категория при выборе вещей (Figma `1173:17042`): раскрыт «Верх», выбрана «Футболка», «Сбросить» / «Применить». */
export const OutfitItemsCategorySheet: Story = {
  name: 'Outfit Creation / Items / Sheet / Category with Selection',
  tags: ['figma:1371-41747'],
  render: () => <ItemSelectionScreen overlay={<CategorySheet expanded footer />} />,
};

export const ItemFilterSheet: Story = {
  name: 'Outfit Creation / Item Filter / Sheet / Bottoms',
  render: () => (
    <CanvasScreen
      filtered
      hint={false}
      overlay={
        <Sheet title="Низ" onClose={() => {}} footer={[{ label: 'Очистить' }, { label: 'Использовать' }]}>
          <ChipGroup chips={['Все', 'Джинсы', 'Брюки', 'Леггинсы', 'Джоггеры', 'Аксессуары'].map((label) => ({ label, selected: label === 'Джинсы' }))} />
          <Grid>{(['green', 'black', 'blue', 'beige'] as ItemColor[]).map((color, i) => <ItemCard key={i} kind="bottom" color={color} selected={i < 3} />)}</Grid>
        </Sheet>
      }
    />
  ),
};
