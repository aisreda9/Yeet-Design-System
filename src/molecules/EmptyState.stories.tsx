import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from '.';
import { unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: { title: 'Упс, не нашли', description: 'Измени запрос или попробуй поискать что-то другое', action: { label: 'Сбросить поиск' } },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: 'Пустое состояние: H2 + Body grey, gap 8, опционально действие Tertiary M. Figma: `empty-state` · Title, Description, Action.' } } },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={300}>
      <Usage screen="Wardrobe / Items / Empty"><EmptyState title="Гардероб пуст" description="Добавь первую вещь, чтобы начать создавать образы" /></Usage>
      <Usage screen="Archive / Empty"><EmptyState title="Архив пуст" description="Архивировав вещь, она будет храниться здесь в течение указанного времени" /></Usage>
      <Usage screen="Search / No Results" note="с действием"><EmptyState title="Упс, не нашли" description="Измени запрос или попробуй поискать что-то другое" action={{ label: 'Сбросить поиск' }} /></Usage>
    </UsageGrid>
  ),
};
