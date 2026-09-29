import type { Meta, StoryObj } from '@storybook/react-vite';
import { Snackbar } from '.';
import { unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/Snackbar',
  component: Snackbar,
  tags: ['autodocs'],
  args: { children: 'Вещь перемещена в архив', size: 'M' },
  argTypes: { children: { control: 'text', name: 'text' }, size: { control: 'inline-radio', options: ['M', 'S'] } },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: 'Тост inverse, радиус 12, текст Body на всю ширину, справа — «Отменить» и/или крестик 24. **M** — 52, паддинг 20, gap 12 (над таб-баром); **S** — 48, паддинг 16, gap 20 (подсказка на холсте образа, 313 при отступах 20 от краёв холста). Figma: `snackbar` · Size, Text, Icon.' } } },
} satisfies Meta<typeof Snackbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { onClose: () => {} } };

export const Small: Story = { name: 'Size S', args: { size: 'S', children: 'Перемещай и масштабируй вещи', onClose: () => {} }, decorators: [unlessBare(withWidth(313))] };

/** «Отменить» и «×»: текст занимает всю ширину, обе кнопки прижаты вправо. */
export const WithUndo: Story = { name: 'С «Отменить»', args: { children: 'Вещь перемещена в архив', onUndo: () => {}, onClose: () => {} } };

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Wardrobe / Item"><Snackbar onClose={() => {}}>Вещь перемещена в архив</Snackbar></Usage>
      <Usage screen="Search / Result"><Snackbar onClose={() => {}}>Вещь перемещена в вишлист</Snackbar></Usage>
      <Usage screen="Outfit Creation / Canvas" note="Size S — подсказка на холсте" width={313}><Snackbar size="S" onClose={() => {}}>Перемещай и масштабируй вещи</Snackbar></Usage>
      <Usage screen="Trash / Item"><Snackbar onClose={() => {}}>Вещь удалена навсегда</Snackbar></Usage>
    </UsageGrid>
  ),
};
