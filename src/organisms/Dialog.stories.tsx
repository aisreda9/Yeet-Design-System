import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Dialog, Header, Overlay } from '.';
import { Button } from '../atoms';
import { Screen } from '../templates';
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

function KeyboardDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Screen
      header={<Header type="bar" titleChip="Корзина вещей" />}
      overlay={<Overlay open={open} onOpenChange={setOpen}><Dialog tone="destructive" title="Очистить корзину?" description="Все вещи из корзины удаляются навсегда, их уже не вернуть" cancel="Отмена" confirm="Очистить" onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)} /></Overlay>}
    >
      <Button variant="destructive" fullWidth onClick={() => setOpen(true)} aria-haspopup="dialog">Очистить корзину</Button>
    </Screen>
  );
}

/** Модальность с клавиатуры: фокус на безопасном действии, Tab по кругу, Escape = «Отмена», фокус возвращается. */
export const Keyboard: Story = {
  name: 'Клавиатура',
  tags: ['bare'],
  parameters: { controls: { disable: true }, docs: { description: { story: '`<Overlay open onOpenChange>` с `Dialog`: при открытии фокус на безопасном действии (синяя кнопка справа), Tab не уходит за диалог, Escape вызывает `onCancel`, фокус возвращается на кнопку, открывшую диалог.' } } },
  render: () => <KeyboardDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const opener = canvas.getByRole('button', { name: 'Очистить корзину' });
    await step('Открыть: фокус на «Отмена»', async () => {
      await userEvent.click(opener);
      const dialog = await canvas.findByRole('alertdialog', { name: 'Очистить корзину?' });
      await expect(dialog).toHaveAttribute('aria-modal', 'true');
      await expect(dialog).toHaveAccessibleDescription('Все вещи из корзины удаляются навсегда, их уже не вернуть');
      await waitFor(() => expect(canvas.getByRole('button', { name: 'Отмена' })).toHaveFocus());
    });
    await step('Tab по кругу внутри диалога', async () => {
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name: 'Очистить' })).toHaveFocus();
      await userEvent.tab({ shift: true });
      await userEvent.tab({ shift: true });
      await expect(canvas.getByRole('button', { name: 'Очистить' })).toHaveFocus();
    });
    await step('Escape = «Отмена», фокус возвращается', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(canvas.queryByRole('alertdialog')).toBeNull());
      await expect(opener).toHaveFocus();
    });
  },
};
