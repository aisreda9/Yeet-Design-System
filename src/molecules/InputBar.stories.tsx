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

/** Аргументы по умолчанию — как у компонента `input-bar` в Figma (942:7282): справа кнопка Primary «+». */
export const Playground: Story = { args: { trailing: { icon: 'plus', label: 'Добавить', variant: 'primary' } } };

export const Focus: Story = {
  name: 'Фокус',
  args: { value: '' },
  play: async ({ canvasElement }) => { canvasElement.querySelector('input')?.focus(); },
};

/** `focused` — состояние фокуса статично, без фокуса и мигания: для экранов флоу «Query Focused» и скриншот-тестов. */
export const Focused: Story = {
  name: 'Фокус (focused)',
  args: { value: '', placeholder: 'Название вещи', trailing: undefined, focused: true },
};

export const PhotoPreview: Story = {
  name: 'Превью фото справа',
  args: { value: '', trailing: { icon: 'search-by-image', label: 'Выбранное фото', image: demoPhoto } },
};

/** Чат со стилистом с текстом: «Отправить» Primary 44 внутри поля 52 (Figma: input-bar · Chat). */
export const Chat: Story = {
  name: 'Чат с текстом',
  args: { placeholder: 'Спроси у стилиста', value: 'Что надеть на ужин?', fieldIcon: undefined, leading: undefined, trailing: undefined, send: { label: 'Отправить' } },
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
