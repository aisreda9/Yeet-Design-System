import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArtPlaceholder } from '.';
import { Usage, UsageGrid } from '../docs/helpers';

const meta = {
  title: 'Atoms/ArtPlaceholder',
  component: ArtPlaceholder,
  tags: ['autodocs'],
  args: { size: 120 },
  argTypes: {
    size: { control: { type: 'number', min: 24, max: 353 } },
    stretch: { control: false },
    width: { control: false },
    height: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Временная заглушка иллюстрации (решение владельца, #220): фон `--color-bg-subtle`, иконка-картинка из набора по центру, `--color-text-secondary`. ' +
          'Размер — как у заменяемого рисунка, иконка — треть меньшей стороны (24–48). Скругление — `--card-radius`; ' +
          'внутри карточки — по правилу концентричности (плитка фото: 20 − 20 → 4). Декоративная, не озвучивается. ' +
          'Вернуть иллюстрации — `SHOW_ILLUSTRATIONS = true` в `src/utils/illustrations.ts` или проп `illustration` у `PhotoTile`. В Figma компонента нет.',
      },
    },
  },
} satisfies Meta<typeof ArtPlaceholder>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  name: 'Размеры',
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <ArtPlaceholder size={63} />
      <ArtPlaceholder size={150} />
      <ArtPlaceholder width={240} height={120} />
    </div>
  ),
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={240}>
      <Usage screen="Onboarding / Welcome" note="место под анимацию: растянута на свободное место">
        <div style={{ width: 240, height: 200, display: 'flex', flexDirection: 'column' }}>
          <ArtPlaceholder stretch />
        </div>
      </Usage>
      <Usage screen="Photo sheet (PhotoTile)" note="арт 63 в плитке «Галерея» / «Камера»; в плитке радиус 4 (20 − 20)">
        <ArtPlaceholder size={63} />
      </Usage>
      <Usage screen="Stylist / Catalog (StylistPromptCard)" note="на месте чемодана 150 у «Для поездок»">
        <ArtPlaceholder size={150} />
      </Usage>
    </UsageGrid>
  ),
};
