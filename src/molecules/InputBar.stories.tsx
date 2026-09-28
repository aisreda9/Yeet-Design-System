import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputBar } from '.';
import { unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/InputBar',
  component: InputBar,
  tags: ['autodocs'],
  args: { placeholder: 'Уточните текстом', value: 'Белые кроссовки', fieldIcon: 'search', leading: { icon: 'chevron-left', label: 'Назад' }, trailing: { icon: 'search-by-image', label: 'Поиск по фото' } },
  argTypes: { fieldIcon: { control: 'select', options: [undefined, 'search'] } },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: 'Поле 48 (input-group, радиус 20) с кнопками 48 по бокам. Figma: `input-bar` · Show Left Button, Show Input, Show Right Button.' } } },
} satisfies Meta<typeof InputBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Search / Text" note="назад + поле + поиск по фото"><InputBar placeholder="Уточните текстом" value="Белые кроссовки" fieldIcon="search" leading={{ icon: 'chevron-left', label: 'Назад' }} trailing={{ icon: 'search-by-image', label: 'Поиск по фото' }} /></Usage>
      <Usage screen="Wardrobe / Item Search"><InputBar placeholder="Название вещи" fieldIcon="search" leading={{ icon: 'chevron-left', label: 'Назад' }} /></Usage>
      <Usage screen="Stylist" note="чат: белое поле 52 с тенью, «отправить» внутри"><InputBar placeholder="Спроси у стилиста" send={{ label: 'Отправить' }} /></Usage>
    </UsageGrid>
  ),
};
