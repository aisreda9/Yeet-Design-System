import type { Meta, StoryObj } from '@storybook/react-vite';
import { AccountsSheet } from '.';
import { onOverlay, unlessBare, Usage, UsageGrid } from '../docs/helpers';
import type { Account } from '../molecules';

const sima: Account = { id: 'sima', name: 'Сима', email: 'sima@space.com', color: 'blue' };
const tina: Account = { id: 'tina', name: 'Тинатин', email: 'hello@tin.ru', color: 'orange' };

const meta = {
  title: 'Organisms/AccountsSheet',
  component: AccountsSheet,
  tags: ['autodocs'],
  args: { accounts: [sima, tina] },
  decorators: [unlessBare(onOverlay)],
  parameters: { docs: { description: { component: 'Шторка «Аккаунты» (Figma: Profile / Accounts / Sheet / List) — открывается по аватарам в шапке профиля. Первый аккаунт — текущий. Один аккаунт — только он и «Добавить аккаунт».' } } },
} satisfies Meta<typeof AccountsSheet>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={393}>
      <Usage screen="Profile / Accounts" note="один аккаунт">{onOverlay(() => <AccountsSheet accounts={[sima]} />)}</Usage>
      <Usage screen="Profile / Accounts" note="мультиаккаунт">{onOverlay(() => <AccountsSheet accounts={[sima, tina]} />)}</Usage>
    </UsageGrid>
  ),
};
