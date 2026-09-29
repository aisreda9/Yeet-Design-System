import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
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

function KeyboardDemo() {
  const [value, setValue] = useState<[number, number]>([10000, 30000]);
  return <RangeSlider label="Цена" min={0} max={60000} step={1000} value={value} onChange={setValue} />;
}

/**
 * Стрелка на `input type="range"` — нативное поведение браузера: `stepUp` / `stepDown` и событие `input`.
 * Синтетический `keydown` из `userEvent` его не запускает, поэтому шаг стрелки воспроизводится тем же API.
 */
async function arrow(el: HTMLElement, n: number) {
  const input = el as HTMLInputElement;
  if (n > 0) input.stepUp(n);
  else input.stepDown(-n);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Клавиатура: у каждой ручки — свой `input type="range"` в порядке Tab («Цена: от», «Цена: до»); стрелки, PageUp / PageDown,
 * Home / End — нативные. Ручки не заходят друг за друга (зазор — `step`) и не выходят за `min` / `max`.
 */
export const Keyboard: Story = {
  name: 'Клавиатура',
  args: { min: 0, max: 60000, step: 1000, value: [10000, 30000], histogram: undefined },
  parameters: { controls: { disable: true } },
  render: () => <KeyboardDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const from = canvas.getByRole('slider', { name: 'Цена: от' });
    const to = canvas.getByRole('slider', { name: 'Цена: до' });
    const labels = () => canvasElement.querySelector('.y-range__labels')!;
    await step('Tab: «от», затем «до»; границы и шаг в атрибутах', async () => {
      await userEvent.tab();
      await expect(from).toHaveFocus();
      await userEvent.tab();
      await expect(to).toHaveFocus();
      for (const el of [from, to]) {
        await expect(el).toHaveAttribute('min', '0');
        await expect(el).toHaveAttribute('max', '60000');
        await expect(el).toHaveAttribute('step', '1000');
      }
      await expect(from).toHaveValue('10000');
      await expect(to).toHaveValue('30000');
    });
    await step('Шаг стрелкой: ±step, подпись обновляется', async () => {
      await arrow(to, 1);
      await expect(to).toHaveValue('31000');
      await arrow(to, -2);
      await expect(to).toHaveValue('29000');
      await expect(labels()).toHaveTextContent(/29\s000/);
    });
    await step('«от» не заходит за «до», «до» — за «от»', async () => {
      fireEvent.change(from, { target: { value: '50000' } });
      await expect(from).toHaveValue('28000');
      fireEvent.change(to, { target: { value: '0' } });
      await expect(to).toHaveValue('29000');
    });
    await step('Края: min и max', async () => {
      fireEvent.change(from, { target: { value: '0' } });
      await expect(from).toHaveValue('0');
      fireEvent.change(to, { target: { value: '60000' } });
      await expect(to).toHaveValue('60000');
      await expect(labels()).toHaveTextContent(/0 ₽.*60\s000 ₽/);
    });
  },
};
