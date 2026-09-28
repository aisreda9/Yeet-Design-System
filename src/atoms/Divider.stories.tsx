import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from '.';
import { Usage, UsageGrid } from '../docs/helpers';

const meta = {
  title: 'Atoms/Divider',
  component: Divider,
  tags: ['autodocs'],
  args: { label: '' },
  argTypes: { label: { control: 'text' } },
  render: ({ label }) => <div style={{ width: 313 }}><Divider label={label || undefined} /></div>,
  parameters: { docs: { description: { component: 'Разделитель 1px `--color-border-subtle`. С `label` — «— или —» между способами входа. Figma: `divider`.' } } },
} satisfies Meta<typeof Divider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  render: () => (
    <UsageGrid min={313}>
      <Usage screen="Settings" note="линия 1px"><Divider /></Usage>
      <Usage screen="Auth / Sign In" note="между способами входа"><Divider label="или" /></Usage>
    </UsageGrid>
  ),
};
