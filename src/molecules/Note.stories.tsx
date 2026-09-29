import type { Meta, StoryObj } from '@storybook/react-vite';
import { Note } from '.';
import { unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/Note',
  component: Note,
  tags: ['autodocs'],
  args: { children: 'Мягкая сумка округлой формы с логотипом и кожаным ремешком' },
  argTypes: { children: { control: 'text', name: 'text' } },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: 'Заметка — текст Body на карточке light-grey: паддинг 20 со всех сторон, радиус 20, ширина FILL. Описание вещи в панели деталей. Figma: `note` · Text.' } } },
} satisfies Meta<typeof Note>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Wishlist / Item Details" note="описание вещи"><Note>Мягкая сумка округлой формы с логотипом и кожаным ремешком</Note></Usage>
      <Usage screen="Wardrobe / Item Details" note="длинное описание"><Note>Оверсайз-рубашка из плотного хлопка. Хорошо сочетается с прямыми джинсами и лоферами, подходит для офиса и прогулок.</Note></Usage>
    </UsageGrid>
  ),
};
