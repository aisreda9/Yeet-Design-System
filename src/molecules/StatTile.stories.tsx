import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatRow, StatTile } from '.';
import { unlessBare, Usage, UsageGrid } from '../docs/helpers';

const meta = {
  title: 'Molecules/StatTile',
  component: StatTile,
  tags: ['autodocs'],
  args: { label: 'Надето раз', value: 8, size: 'M' },
  argTypes: { size: { control: 'inline-radio', options: ['M', 'L'] } },
  decorators: [unlessBare((Story) => <div style={{ width: 112 }}><Story /></div>)],
  parameters: { docs: { description: { component: 'Плитка статистики: Caption grey + H2 через 4, паддинг 16/20, высота 80, радиус 20 (флоу Outfit Details). В ряду `StatRow` по 3. `size="L"` — число H1 32, высота 88 (диалог удаления аккаунта). Плитка тянется по ширине ряда. Figma: `stat-tile` · Size, Label, Value.' } } },
} satisfies Meta<typeof StatTile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Large: Story = { name: 'Size L', args: { label: 'Вещи', value: 43, size: 'L' } };

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Wardrobe / Outfit Details"><StatRow><StatTile label="Надето раз" value={8} /><StatTile label="Д. простоя" value={1} /><StatTile label="Вещи" value={4} /></StatRow></Usage>
      <Usage screen="Settings / Delete Account / Dialog" note="Size L: H1, 88"><StatRow><StatTile size="L" label="Вещи" value={43} /><StatTile size="L" label="Образы" value={12} /><StatTile size="L" label="Вишлист" value={12} /></StatRow></Usage>
      <Usage screen="Profile / Analytics"><StatRow><StatTile label="Вещи" value={43} /><StatTile label="Образы" value={12} /><StatTile label="Вишлист" value={4} /></StatRow></Usage>
    </UsageGrid>
  ),
};
