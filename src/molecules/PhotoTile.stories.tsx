import type { Meta, StoryObj } from '@storybook/react-vite';
import { PhotoTile } from '.';
import { unlessBare, Usage, UsageGrid } from '../docs/helpers';

const meta = {
  title: 'Molecules/PhotoTile',
  component: PhotoTile,
  tags: ['autodocs'],
  args: { source: 'gallery' },
  argTypes: { source: { control: 'inline-radio', options: ['gallery', 'camera'] }, label: { control: 'text' }, illustration: { control: 'boolean' } },
  decorators: [unlessBare((Story) => <div style={{ width: 173, display: 'flex' }}><Story /></div>)],
  parameters: { docs: { description: { component: 'Плитка источника фото: квадрат 173 во флоу, в ряду плитки делят ширину (flex: 1; в модальной шторке 321 — по ~157). Арт 63 сверху (паддинг 28) — пока иллюстрации перерисовываются, заглушка `ArtPlaceholder` (#220; `illustration` — вернуть 3D-рисунок), подпись Body в две строки, gap 22; на 320 плитка растёт по подписи. Figma: `photo-tile` · Label.' } } },
} satisfies Meta<typeof PhotoTile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Photo sheet / Search / Discover"><div style={{ display: 'flex', gap: 8, width: 353 }}><PhotoTile source="gallery" /><PhotoTile source="camera" /></div></Usage>
      <Usage screen="Profile / Avatar / Sheet" note="модальная шторка: контент 321, плитки по ~157"><div style={{ display: 'flex', gap: 7, width: 321 }}><PhotoTile source="gallery" /><PhotoTile source="camera" /></div></Usage>
    </UsageGrid>
  ),
};
