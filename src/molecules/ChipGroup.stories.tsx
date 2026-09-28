import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { ChipGroup, type Chip } from '.';
import { unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/ChipGroup',
  component: ChipGroup,
  tags: ['autodocs'],
  args: { wrap: true, chips: [{ label: 'Все', selected: true }, { label: 'Весна' }, { label: 'Лето' }, { label: 'Осень' }, { label: 'Зима' }] },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: 'Чипсы — Button S: невыбранный Tertiary, выбранный Soft. `removable` — крестик, `dropdown` — фильтр с ⌄, `onAdd` — кнопка «+». Figma: `chip-group` · Wrap, слот.' } } },
} satisfies Meta<typeof ChipGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function Render(args) {
    const [, update] = useArgs();
    const toggle = (label: string) => update({ chips: args.chips.map((c: Chip) => ({ ...c, selected: c.label === label ? !c.selected : c.selected })) });
    return <ChipGroup {...args} onToggle={toggle} />;
  },
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Outfit Creation" note="теги, перенос"><ChipGroup wrap onAdd={() => {}} chips={['Тег #1', 'Тег #2', 'Тег #3', 'Тег #4', 'Тег #5'].map((l) => ({ label: l, removable: true }))} /></Usage>
      <Usage screen="Sheet · Color" note="чипсы с цветом"><ChipGroup wrap chips={[{ label: 'Черный', colorDot: 'black', selected: true }, { label: 'Серый', colorDot: 'grey' }, { label: 'Белый', colorDot: 'white' }, { label: 'Зеленый', colorDot: 'green' }]} /></Usage>
      <Usage screen="Wardrobe" note="фильтры-дропдауны, скролл"><ChipGroup chips={[{ label: 'Категория · 2', selected: true, dropdown: true }, { label: 'Сезон', dropdown: true }, { label: 'Теги', dropdown: true }]} /></Usage>
      <Usage screen="Search / Discover" note="подсказки запросов"><ChipGroup wrap chips={['Nike', 'Crocs', 'Marine Serre', 'Обувь для бега'].map((label) => ({ label }))} /></Usage>
    </UsageGrid>
  ),
};
