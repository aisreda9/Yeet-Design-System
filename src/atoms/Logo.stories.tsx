import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from '.';
import { demoPhoto, Usage, UsageGrid } from '../docs/helpers';

const meta = {
  title: 'Atoms/Logo',
  component: Logo,
  tags: ['autodocs'],
  args: { size: 'L' },
  argTypes: { size: { control: 'inline-radio', options: ['L', 'S'] }, height: { control: { type: 'range', min: 16, max: 96 } } },
  parameters: { docs: { description: { component: 'Словесный знак yeet. Figma: `yeet` (logos) · Size (L 136×88, знак 130×60 / S 61×40, знак 58×26.8) · Tone (Default / On Dark / Muted).\n\nЦвет наследуется от родителя (`currentColor`), пропа `tone` нет: Default — primary, On Dark — on-accent на синем (Splash) или on-photo поверх фото, Muted — secondary в подвале Настроек.\n\n`height` — устаревший: оставлен для экранов, где высота знака не совпадает с L / S. В новом коде бери `size`.' } } },
} satisfies Meta<typeof Logo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  name: 'Размеры',
  render: () => (
    <UsageGrid min={200}>
      <Usage screen="Size L" note="рамка 136×88"><Logo size="L" /></Usage>
      <Usage screen="Size S" note="рамка 61×40"><Logo size="S" /></Usage>
    </UsageGrid>
  ),
};

export const Tones: Story = {
  parameters: { controls: { disable: true } },
  name: 'Тона',
  render: () => (
    <UsageGrid min={200}>
      <Usage screen="Default" note="text-primary"><div style={{ color: 'var(--color-text-primary)' }}><Logo size="L" /></div></Usage>
      <Usage screen="On Dark" note="on-accent на синем">
        <div style={{ background: 'var(--color-accent)', color: 'var(--color-text-on-accent)', padding: 16, borderRadius: 20 }}><Logo size="L" /></div>
      </Usage>
      <Usage screen="Muted" note="text-secondary"><div style={{ color: 'var(--color-text-secondary)' }}><Logo size="L" /></div></Usage>
    </UsageGrid>
  ),
};

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
