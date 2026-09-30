import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputBar } from '.';
import { demoPhoto, unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/InputBar',
  component: InputBar,
  tags: ['autodocs'],
  args: { placeholder: 'Уточни текстом', value: 'Белые кроссовки', fieldIcon: 'search', leading: { icon: 'chevron-left', label: 'Назад' }, trailing: { icon: 'search-by-image', label: 'Поиск по фото' } },
  argTypes: { fieldIcon: { control: 'select', options: [undefined, 'search'] } },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: 'Поле 48 (input-group, радиус 20) с кнопками 48 по бокам. В фокусе — обводка 1.5 акцентом; с текстом — очистка «×» 20 серым внутри поля. Справа вместо кнопки может стоять превью выбранного фото — круг 48 с картинкой (`trailing.image`, поиск по фото). Figma: `input-bar` · State (Default / Focus / Typing), Show Left Button, Show Input, Show Right Button, Right=Photo.' } } },
} satisfies Meta<typeof InputBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Focus: Story = {
  name: 'Фокус',
  args: { value: '' },
  play: async ({ canvasElement }) => { canvasElement.querySelector('input')?.focus(); },
};

export const PhotoPreview: Story = {
  name: 'Превью фото справа',
  args: { value: '', trailing: { icon: 'search-by-image', label: 'Выбранное фото', image: demoPhoto } },
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Search / Text" note="назад + поле + поиск по фото"><InputBar placeholder="Уточни текстом" value="Белые кроссовки" fieldIcon="search" leading={{ icon: 'chevron-left', label: 'Назад' }} trailing={{ icon: 'search-by-image', label: 'Поиск по фото' }} /></Usage>
      <Usage screen="Search / Photo / Results" note="превью выбранного фото 48 справа"><InputBar placeholder="Уточни текстом" fieldIcon="search" leading={{ icon: 'chevron-left', label: 'Назад' }} trailing={{ icon: 'search-by-image', label: 'Выбранное фото', image: demoPhoto }} /></Usage>
      <Usage screen="Wardrobe / Item Search"><InputBar placeholder="Название вещи" fieldIcon="search" leading={{ icon: 'chevron-left', label: 'Назад' }} /></Usage>
      <Usage screen="Stylist" note="чат: белое поле 52 с тенью, «отправить» внутри"><InputBar placeholder="Спроси у стилиста" send={{ label: 'Отправить' }} /></Usage>
    </UsageGrid>
  ),
};
