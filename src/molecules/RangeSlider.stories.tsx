import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { RangeSlider } from '.';
import { withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/RangeSlider',
  component: RangeSlider,
  tags: ['autodocs'],
  args: { label: 'Цена', min: 0, max: 60000, step: 100, value: [0, 30000], histogram: [2, 3, 6, 12, 18, 20, 17, 19, 22, 16, 10, 6, 4, 3, 2, 2, 3, 2, 1, 1] },
  decorators: [withWidth(353)],
  parameters: { docs: { description: { component: 'Двойной ползунок с гистограммой распределения. Контекст: Search / Results / Sheet / Price Filter. Figma: `range-slider` · Min, Max.' } } },
} satisfies Meta<typeof RangeSlider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function Render(args) {
    const [, update] = useArgs();
    return <RangeSlider {...args} onChange={(value) => update({ value })} />;
  },
};

export const NoHistogram: Story = { name: 'Без гистограммы', args: { histogram: undefined }, render: Playground.render };

/** min = max (в выдаче одна цена) и гистограмма из одной корзины: ручки у левого края, без NaN %. */
export const SinglePrice: Story = { name: 'min = max', args: { min: 5000, max: 5000, value: [5000, 5000], histogram: [4] }, render: Playground.render };
