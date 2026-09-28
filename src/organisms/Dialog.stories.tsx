import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog } from '.';
import { onOverlay, unlessBare, Usage, UsageGrid } from '../docs/helpers';
import { StatRow, StatTile } from '../molecules';

const meta = {
  title: 'Organisms/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  args: { tone: 'destructive', title: 'Очистить корзину?', description: 'Все вещи из корзины удаляются навсегда, их уже не вернуть', cancel: 'Отмена', confirm: 'Очистить' },
  argTypes: { tone: { control: 'inline-radio', options: ['default', 'destructive', 'danger'] }, description: { control: 'text' } },
  decorators: [unlessBare(onOverlay)],
  parameters: { docs: { description: { component: 'Подтверждение в плавающей форме sheet Modal: H3 + Body grey через 12, блоки через 16, пара кнопок L через 7. **Безопасное действие всегда синее справа.** `destructive` — необратимое серым, `danger` — удаление аккаунта красной кнопкой. Без `cancel` — уведомление с одной кнопкой Tertiary на всю ширину («Ок!»). Figma: `dialog` · Tone, Actions (One / Two), Title, Description, слот Content (FILL).' } } },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SingleAction: Story = { name: 'Одна кнопка', args: { tone: 'default', title: 'Готово!', description: 'Мы отправили ссылку для сброса пароля на sima@space.com', cancel: undefined, confirm: 'Ок!' } };

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={393}>
      <Usage screen="Outfit Creation / Exit">{onOverlay(() => <Dialog title="Точно хочешь выйти?" description="Можно сохранить образ и вернуться к нему позже" cancel="Выйти" confirm="Сохранить и выйти" />)}</Usage>
      <Usage screen="Settings / Delete Account" note="со статистикой">{onOverlay(() => <Dialog tone="danger" title="Аккаунт будет удалён" description="Ты потеряешь:" cancel="Отменить" confirm="Удалить"><StatRow><StatTile size="L" label="Вещи" value={43} /><StatTile size="L" label="Образы" value={12} /><StatTile size="L" label="Вишлист" value={12} /></StatRow></Dialog>)}</Usage>
      <Usage screen="Auth / Password Recovery / Dialog / Sent" note="одна кнопка">{onOverlay(() => <Dialog title="Готово!" description="Мы отправили ссылку для сброса пароля на sima@space.com" confirm="Ок!" />)}</Usage>
    </UsageGrid>
  ),
};
