import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { SegmentControl } from '.';
import { Matrix, unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/SegmentControl',
  component: SegmentControl,
  tags: ['autodocs'],
  args: { segments: [{ value: 'items', label: 'Вещи' }, { value: 'outfits', label: 'Образы' }, { value: 'wishlist', label: 'Вишлист' }], value: 'items', size: 'L', fit: false },
  argTypes: { size: { control: 'inline-radio', options: ['S', 'M', 'L', 'XL'] }, value: { control: 'inline-radio', options: ['items', 'outfits', 'wishlist'] } },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: 'Переключатель вкладок: высота = размер (S 40 · M 48 · L 52 · XL 56), паддинг 4, активный сегмент — Inverse. Figma: `segment-control` · Size, Content (Text/Icon), слот Buttons. Для скринридера — `radiogroup`: стрелки и Home / End переключают сегмент, у сегментов-иконок — `ariaLabel`.' } } },
} satisfies Meta<typeof SegmentControl>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function Render(args) {
    const [, update] = useArgs();
    return <SegmentControl {...args} onChange={(value) => update({ value })} />;
  },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  name: 'Все варианты',
  tags: ['bare'],
  render: () => (
    <Matrix rows={['S', 'M', 'L', 'XL']} cols={['Текст', 'Иконки']} render={(s, c) => (
      <div style={{ width: 353 }}>
        {c === 'Текст'
          ? <SegmentControl size={s as never} value="a" segments={[{ value: 'a', label: 'Вещи' }, { value: 'b', label: 'Образы' }, { value: 'c', label: 'Вишлист' }]} />
          : <SegmentControl size={s as never} value="a" segments={[{ value: 'a', icon: 'wardrobe', ariaLabel: 'Гардероб' }, { value: 'b', icon: 'collage', ariaLabel: 'Коллаж' }, { value: 'c', icon: 'info', ariaLabel: 'Описание' }]} />}
      </div>
    )} />
  ),
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Wardrobe"><SegmentControl value="items" segments={[{ value: 'items', label: 'Вещи' }, { value: 'o', label: 'Образы' }, { value: 'w', label: 'Вишлист' }]} /></Usage>
      <Usage screen="Wishlist" note="вложенный, по содержимому"><SegmentControl size="S" fit value="i" segments={[{ value: 'i', label: 'Вещи' }, { value: 'o', label: 'Образы' }]} /></Usage>
      <Usage screen="Stylist / Trip Details"><SegmentControl value="o" segments={[{ value: 'o', label: 'Образы · 1' }, { value: 'i', label: 'Вещи · 4' }]} /></Usage>
      <Usage screen="Outfit Creation" note="шаги, иконки"><SegmentControl size="M" fit value="w" segments={[{ value: 'w', icon: 'wardrobe', ariaLabel: 'Гардероб' }, { value: 'c', icon: 'collage', ariaLabel: 'Коллаж' }, { value: 'h', icon: 'info', ariaLabel: 'Описание' }]} /></Usage>
    </UsageGrid>
  ),
};
