import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from '.';
import { demoPhoto, Usage, UsageGrid } from '../docs/helpers';

const meta = {
  title: 'Atoms/Logo',
  component: Logo,
  tags: ['autodocs'],
  args: { height: 48 },
  argTypes: { height: { control: { type: 'range', min: 16, max: 96 } } },
  parameters: { docs: { description: { component: 'Словесный знак yeet. Цвет наследуется от родителя: on-accent на синем (Splash), on-photo поверх фото (Search / Photo), secondary в подвале Настроек. Figma: `yeet` (logos) · Tone.' } } },
} satisfies Meta<typeof Logo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  render: () => (
    <UsageGrid min={200}>
      <Usage screen="App / Splash" note="on-accent на синем">
        <div style={{ background: 'var(--color-accent)', color: 'var(--color-text-on-accent)', padding: '32px 40px', borderRadius: 20 }}><Logo height={48} /></div>
      </Usage>
      <Usage screen="Search / Photo" note="on-photo, белый поверх фото">
        <div style={{ background: `center / cover url("${demoPhoto}")`, color: 'var(--color-text-on-photo)', padding: '32px 40px', borderRadius: 20 }}><Logo height={48} /></div>
      </Usage>
      <Usage screen="Settings / Main" note="подвал, secondary">
        <div style={{ color: 'var(--color-text-secondary)' }}><Logo height={28} /></div>
      </Usage>
    </UsageGrid>
  ),
};
