import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from '.';
import { unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: { title: 'Упс, не нашли', description: 'Измени запрос или попробуй поискать что-то другое', action: { label: 'Сбросить поиск' } },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: 'Пустое состояние: H1 + Body grey через 16, опционально кнопка L через 32 — по умолчанию Primary, как в Figma («Добавить вещь», «Сбросить поиск»); вторичное действие — `tertiary`. Figma: `empty-state` · Title, Description, Action.' } } },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Аргументы по умолчанию — как у компонента `empty-state` в Figma (968:3643): «Гардероб пуст», без кнопки. */
export const Playground: Story = { args: { title: 'Гардероб пуст', description: 'Добавь первую вещь, чтобы начать создавать образы', action: undefined } };

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={300}>
      <Usage screen="Wardrobe / Items / Empty"><EmptyState title="Гардероб пуст" description="Добавь первую вещь, чтобы начать создавать образы" /></Usage>
      <Usage screen="Archive / Empty"><EmptyState title="Архив пуст" description="Вещь из архива можно вернуть в гардероб" /></Usage>
      <Usage screen="Outfits / Recommendations / Empty" note="главное действие"><EmptyState title="Полный шкаф, а надеть нечего?" description="Добавь больше вещей, чтобы ИИ смог тебе подбирать образы под погоду и повод" action={{ label: 'Добавить вещь', variant: 'primary' }} /></Usage>
      <Usage screen="Search / No Results" note="вторичное действие (tertiary), как в эталоне"><EmptyState title="Упс, не нашли" description="Измени запрос или попробуй поискать что-то другое" action={{ label: 'Сбросить поиск', variant: 'tertiary' }} /></Usage>
    </UsageGrid>
  ),
};
