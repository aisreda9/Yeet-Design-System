import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart, type Bar } from '.';
import { unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const categories: Bar[] = [{ label: 'Верхняя одежда', icon: 'outerwear', value: 5 }, { label: 'Верх', icon: 'top', value: 50 }, { label: 'Обувь', icon: 'shoe', value: 10 }, { label: 'Аксессуары', icon: 'accessories', value: 30 }, { label: 'Низ', icon: 'bottom', value: 5 }];

const meta = {
  title: 'Molecules/BarChart',
  component: BarChart,
  tags: ['autodocs'],
  args: { bars: categories, height: 300 },
  argTypes: { height: { control: { type: 'range', min: 160, max: 360, step: 4 } } },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: '«Палитра» аналитики как во флоу Profile / Overview / Analytics: капсулы на всю ширину (gap 7), центрированы по вертикали, высота 100…300 по значению; белая пилюля 44 с иконкой или точкой цвета, число H2 24/28.' } } },
} satisfies Meta<typeof BarChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Profile / Analytics" note="по категориям"><BarChart bars={categories} /></Usage>
      <Usage screen="Profile / Analytics" note="по цветам"><BarChart bars={[{ label: 'Синий', color: 'blue', value: 13 }, { label: 'Чёрный', color: 'black', value: 62 }, { label: 'Коричневый', color: 'brown', value: 25 }]} /></Usage>
      <Usage screen="Profile / Analytics" note="по сезонам"><BarChart bars={[{ label: 'Весна', icon: 'flower', value: 20 }, { label: 'Лето', icon: 'sun', value: 70 }, { label: 'Осень', icon: 'leaf', value: 8 }, { label: 'Зима', icon: 'snowflake', value: 1 }]} /></Usage>
    </UsageGrid>
  ),
};

/** Пустые данные и нечисловые значения: высоты без NaN, график просто пуст / капсулы минимальной высоты. */
export const EdgeCases: Story = {
  parameters: { controls: { disable: true } },
  name: 'Крайние случаи',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="нет данных" note="bars = []"><BarChart bars={[]} height={160} /></Usage>
      <Usage screen="все равны" note="полная высота"><BarChart bars={[{ label: 'Верх', icon: 'top', value: 4 }, { label: 'Низ', icon: 'bottom', value: 4 }]} height={160} /></Usage>
    </UsageGrid>
  ),
};
