import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Dialog, Header, Overlay, Sheet } from '.';
import { Button } from '../atoms';
import { Screen } from '../templates';
import { onOverlay, unlessBare, Usage, UsageGrid } from '../docs/helpers';
import { List, ListItem, StatRow, StatTile } from '../molecules';

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

function DismissDemo() {
  const [layer, setLayer] = useState<null | 'actions' | 'confirm' | 'exit' | 'filter'>(null);
  const [log, setLog] = useState<string[]>([]);
  const note = (m: string) => setLog((l) => [...l, m]);
  const close = () => setLayer(null);
  return (
    <Screen
      header={<Header type="bar" titleChip="Корзина вещей" />}
      overlay={
        <Overlay open={!!layer} onOpenChange={(o) => !o && close()}>
          {layer === 'actions' && <Sheet title="Название вещи"><List><ListItem icon="undo" label="Вернуть в гардероб" onClick={close} /><ListItem icon="trash" label="Удалить навсегда" onClick={() => setLayer('confirm')} /></List></Sheet>}
          {layer === 'confirm' && <Dialog tone="destructive" title="Удалить навсегда?" description="Вещь удалится без возможности восстановления" cancel="Отмена" confirm="Удалить" onCancel={() => note('отмена')} onConfirm={close} />}
          {layer === 'exit' && <Dialog title="Точно хочешь выйти?" description="Можно сохранить образ и вернуться к нему позже" cancel="Выйти" confirm="Сохранить и выйти" onCancel={() => note('выйти')} onConfirm={close} />}
          {layer === 'filter' && <Sheet title="Низ" onClose={() => note('шторка')} footer={[{ label: 'Очистить' }, { label: 'Использовать', onClick: close }]}><p className="y-body">Фильтр</p></Sheet>}
        </Overlay>
      }
    >
      <Button variant="tertiary" fullWidth onClick={() => setLayer('actions')} aria-haspopup="dialog">Действия</Button>
      <Button variant="tertiary" fullWidth onClick={() => setLayer('exit')} aria-haspopup="dialog">Выйти</Button>
      <Button variant="tertiary" fullWidth onClick={() => setLayer('filter')} aria-haspopup="dialog">Фильтр</Button>
      <p className="y-body y-text--secondary" data-testid="log">Закрытия: {log.join(', ') || '—'}</p>
    </Screen>
  );
}

/** Синтетическое касание: pointerdown → pointermove → pointerup. */
async function swipe(target: Element, dy: number) {
  const r = target.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + 20;
  const at = (type: string, yy: number) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 9, pointerType: 'touch', isPrimary: true, clientX: x, clientY: yy }));
  at('pointerdown', y);
  for (let i = 1; i <= 10; i++) { at('pointermove', y + (dy * i) / 10); await new Promise((f) => setTimeout(f, 16)); }
  at('pointerup', y + dy);
}

/** Закрытие одним путём: onCancel / onClose при любом закрытии; рискованное подтверждение — только кнопками и Escape; фокус после смены шторки. */
export const Dismiss: Story = {
  name: 'Закрытие',
  tags: ['bare'],
  args: { title: '', confirm: '' },
  parameters: { controls: { disable: true }, docs: { description: { story: 'Шторка действий → «Удалить навсегда» → подтверждение в том же слое: фокус переходит на безопасную «Отмена», Escape работает. `destructive` / `danger` (решение D6) не закрываются свайпом и тапом по затемнению — только кнопками и Escape. Любое закрытие вызывает `onCancel` диалога (или `onClose` шторки) ровно один раз. Подтверждение — без хэндла (D1), появляется за `--motion-appear`.' } } },
  render: () => <DismissDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const log = () => canvas.getByTestId('log').textContent;
    await step('Шторка → подтверждение в том же слое: фокус на «Отмена», хэндла нет', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Действия' }));
      await userEvent.click(await canvas.findByRole('button', { name: 'Удалить навсегда' }));
      const dialog = await canvas.findByRole('alertdialog', { name: 'Удалить навсегда?' });
      await waitFor(() => expect(canvas.getByRole('button', { name: 'Отмена' })).toHaveFocus());
      await expect(dialog.querySelector('.y-sheet__handle')).toBeNull();
    });
    await step('Рискованное: затемнение и свайп не закрывают', async () => {
      const dialog = canvas.getByRole('alertdialog');
      await userEvent.click(dialog.parentElement!);
      await swipe(dialog, dialog.offsetHeight * 0.8);
      await expect(canvas.getByRole('alertdialog')).toBeInTheDocument();
      await expect(log()).toBe('Закрытия: —');
    });
    await step('Escape → onCancel один раз, слой уходит', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(canvas.queryByRole('alertdialog')).toBeNull());
      await expect(log()).toBe('Закрытия: отмена');
    });
    await step('Обычное подтверждение: тап по затемнению → onCancel', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Выйти' }));
      const dialog = await canvas.findByRole('alertdialog', { name: 'Точно хочешь выйти?' });
      await userEvent.click(dialog.parentElement!);
      await waitFor(() => expect(canvas.queryByRole('alertdialog')).toBeNull());
      await expect(log()).toBe('Закрытия: отмена, выйти');
    });
    await step('Шторка с крестиком: × и Escape — оба через onClose', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Фильтр' }));
      await userEvent.click(await canvas.findByRole('button', { name: 'Закрыть' }));
      await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
      await userEvent.click(canvas.getByRole('button', { name: 'Фильтр' }));
      await canvas.findByRole('dialog', { name: 'Низ' });
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
      await expect(log()).toBe('Закрытия: отмена, выйти, шторка, шторка');
    });
  },
};
