import type { Meta, StoryObj } from '@storybook/react-vite';
import { Snackbar } from '.';
import { unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/Snackbar',
  component: Snackbar,
  tags: ['autodocs'],
  args: { children: 'Вещь перемещена в архив' },
  argTypes: { children: { control: 'text', name: 'text' } },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: 'Тост 56, радиус 16, inverse, текст Body + крестик. Figma: `snackbar` · Text, Icon.' } } },
} satisfies Meta<typeof Snackbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { onClose: () => {} } };

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Wardrobe / Item"><Snackbar onClose={() => {}}>Вещь перемещена в архив</Snackbar></Usage>
      <Usage screen="Search / Result"><Snackbar onClose={() => {}}>Вещь перемещена в вишлист</Snackbar></Usage>
      <Usage screen="Trash / Item"><Snackbar onClose={() => {}}>Вещь удалена навсегда</Snackbar></Usage>
    </UsageGrid>
  ),
};
