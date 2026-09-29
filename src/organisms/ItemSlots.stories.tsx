import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Header, ItemCard, ItemSlot, ItemSlots, type Garment } from '.';
import { Button } from '../atoms';
import type { ItemColor } from '../tokens/tokens';
import { Screen } from '../templates';
import { unlessBare, Usage, UsageGrid } from '../docs/helpers';

type Card = { kind: Garment; color: ItemColor };
const wardrobe: Record<'top' | 'bottom' | 'shoe', Card[]> = {
  top: [{ kind: 'top', color: 'green' }, { kind: 'top', color: 'yellow' }, { kind: 'top', color: 'brown' }],
  bottom: [{ kind: 'bottom', color: 'black' }, { kind: 'bottom', color: 'blue' }],
  shoe: [{ kind: 'shoe', color: 'beige' }, { kind: 'shoe', color: 'brown' }],
};
const titles = { top: 'Верх', bottom: 'Низ', shoe: 'Обувь' };

type Args = { top: number; bottom: number; shoe: number };

/** Секции с выбором: у каждой свой индекс, «×» убирает вещь из слота, «+» добавляет следующую из гардероба. */
function Slots({ top, bottom, shoe, initial }: Args & { initial?: Partial<Record<keyof Args, number>> }) {
  const [items, setItems] = useState({ top: wardrobe.top.slice(0, top), bottom: wardrobe.bottom.slice(0, bottom), shoe: wardrobe.shoe.slice(0, shoe) });
  const [index, setIndex] = useState({ top: initial?.top ?? 0, bottom: initial?.bottom ?? 0, shoe: initial?.shoe ?? Math.max(shoe - 1, 0) });
  const keys = ['top', 'bottom', 'shoe'] as const;
  return (
    <ItemSlots>
      {keys.map((key) => (
        <ItemSlot
          key={key}
          title={titles[key]}
          index={Math.min(index[key], Math.max(items[key].length - 1, 0))}
          onIndexChange={(k) => setIndex((s) => ({ ...s, [key]: k }))}
          onAdd={() => { const next = wardrobe[key][items[key].length % wardrobe[key].length]; setItems((s) => ({ ...s, [key]: [...s[key], next] })); setIndex((s) => ({ ...s, [key]: items[key].length })); }}
        >
          {items[key].map((c, k) => <ItemCard key={k} kind={c.kind} color={c.color} onRemove={() => setItems((s) => ({ ...s, [key]: s[key].filter((_, j) => j !== k) }))} />)}
        </ItemSlot>
      ))}
    </ItemSlots>
  );
}

const meta: Meta<Args> = {
  title: 'Organisms/ItemSlots',
  tags: ['autodocs'],
  args: { top: 1, bottom: 0, shoe: 2 },
  argTypes: { top: { control: { type: 'range', min: 0, max: 3 } }, bottom: { control: { type: 'range', min: 0, max: 2 } }, shoe: { control: { type: 'range', min: 0, max: 2 } } },
  decorators: [unlessBare((Story) => <div style={{ width: 393, overflow: 'hidden', paddingTop: 24 }}><Story /></div>)],
  parameters: {
    docs: {
      description: {
        component:
          'Выбор вещей в образ (Outfit Creation / Item Selection `414:1459`, пустой `414:1541`). `ItemSlots` — панель: фон elevated, радиус 32 сверху, тень, секции через разделитель во всю ширину. ' +
          '`ItemSlot` — секция: H2 → 16 → ряд карточек 173 × 172 через 8. Выбранная вещь стоит по центру экрана, соседние обрезаны краем, в конце — карточка «+» (кнопка L 52 в 22 от её края). Пустая секция — только «+» по центру. ' +
          'Ряд листается свайпом со снапом по центру, выбор — по карточке в центре после остановки (`onIndexChange`, хаптика select); с клавиатуры — Tab на ряд и ← / →.',
      },
    },
  },
  render: (args) => <Slots key={`${args.top}${args.bottom}${args.shoe}`} {...args} />,
};
export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Варианты',
  tags: ['bare'],
  parameters: { controls: { disable: true } },
  render: () => (
    <UsageGrid min={393}>
      <Usage screen="Все секции пустые" note="414:1541" width={393}><Slots top={0} bottom={0} shoe={0} /></Usage>
      <Usage screen="Одна вещь" note="по центру, «+» справа" width={393}><ItemSlots><ItemSlot title="Верх" onAdd={() => {}}><ItemCard kind="top" color="green" onRemove={() => {}} /></ItemSlot></ItemSlots></Usage>
      <Usage screen="Несколько вещей" note="выбрана вторая: первая обрезана слева" width={393}><ItemSlots><ItemSlot title="Обувь" index={1} onAdd={() => {}}><ItemCard kind="shoe" color="beige" onRemove={() => {}} /><ItemCard kind="shoe" color="brown" onRemove={() => {}} /></ItemSlot></ItemSlots></Usage>
      <Usage screen="Без «+»" note="onAdd не передан" width={393}><ItemSlots><ItemSlot title="Низ" index={1}><ItemCard kind="bottom" color="black" /><ItemCard kind="bottom" color="blue" /><ItemCard kind="bottom" color="green" /></ItemSlot></ItemSlots></Usage>
    </UsageGrid>
  ),
};

export const InFlow: Story = {
  name: 'В флоу',
  tags: ['bare'],
  parameters: { controls: { disable: true }, docs: { description: { story: 'Outfit Creation / Item Selection / Ready to Continue `414:1459`. Экран `src/pages` переводит на компонент задача screens (#30).' } } },
  render: () => (
    <Usage screen="Outfit Creation / Item Selection / Ready to Continue" note="414:1459">
      <Screen header={<Header variant="bar" titleChip="Выбор вещей" onBack={() => {}} actions={[{ icon: 'arrows-shuffle', label: 'Перемешать' }]} />} bottom={<div style={{ padding: '20px var(--screen-gutter)', background: 'var(--color-bg-elevated)' }}><Button size="L" fullWidth>Далее</Button></div>} flush>
        <Slots top={1} bottom={0} shoe={2} />
      </Screen>
    </Usage>
  ),
};

export const Keyboard: Story = {
  name: 'Клавиатура',
  args: { top: 3, bottom: 0, shoe: 0 },
  parameters: { docs: { description: { story: 'Tab на ряд, ← / → — соседняя вещь по центру.' } } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('→ выбирает вторую вещь', async () => {
      const row = canvas.getByRole('group', { name: /Верх: 1 из 3/ });
      row.focus();
      await userEvent.keyboard('{ArrowRight}');
      await waitFor(() => expect(canvas.getByRole('group', { name: /Верх: 2 из 3/ })).toBeInTheDocument());
    });
  },
};
