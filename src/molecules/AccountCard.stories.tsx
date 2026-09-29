import type { Meta, StoryObj } from '@storybook/react-vite';
import { AccountCard, AvatarStack, type Account } from '.';
import { Avatar, type AvatarColor } from '../atoms';
import { demoAvatar, unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';
import { avatarPalette, itemColors } from '../tokens/tokens';

const sima: Account = { id: 'sima', name: 'Сима', email: 'sima@space.com', color: 'blue' };
const tina: Account = { id: 'tina', name: 'Тинатин', email: 'hello@tin.ru', color: 'orange' };

const meta = {
  title: 'Molecules/AccountCard',
  component: AccountCard,
  tags: ['autodocs'],
  args: { account: sima, kind: 'current' },
  argTypes: { kind: { control: 'inline-radio', options: ['current', 'other', 'settings'] } },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: 'Карточка аккаунта 72 (Figma: `account-card` · Kind): light-grey, радиус 20, паддинг 16/20, аватар 40 + имя Body и почта Caption. **current** — «Редактировать профиль» и «Настройки», **other** — переключиться (вся карточка — кнопка), **settings** — строка аккаунта в Настройках с «Выйти». Рядом — `AvatarStack`: аккаунты в шапке профиля.' } } },
} satisfies Meta<typeof AccountCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Stack: Story = {
  name: 'AvatarStack',
  tags: ['bare'],
  parameters: { controls: { disable: true } },
  render: () => (
    <UsageGrid min={200}>
      <Usage screen="Profile / Overview" note="один аккаунт"><AvatarStack accounts={[sima]} /></Usage>
      <Usage screen="Profile / Overview" note="мультиаккаунт"><AvatarStack accounts={[sima, tina]} /></Usage>
      <Usage screen="Profile / Overview" note="с фото"><AvatarStack accounts={[{ ...sima, photo: demoAvatar }, tina]} /></Usage>
    </UsageGrid>
  ),
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Profile / Accounts / Sheet" note="текущий"><AccountCard account={sima} kind="current" /></Usage>
      <Usage screen="Profile / Accounts / Sheet" note="другой аккаунт"><AccountCard account={tina} kind="other" /></Usage>
      <Usage screen="Profile / Accounts / Sheet" note="с фото профиля"><AccountCard account={{ ...sima, photo: demoAvatar }} kind="current" /></Usage>
      <Usage screen="Settings / Main" note="с «Выйти»"><AccountCard account={sima} kind="settings" /></Usage>
    </UsageGrid>
  ),
};

export const Colors: Story = {
  name: 'Цвета аккаунтов',
  tags: ['bare'],
  parameters: { controls: { disable: true }, docs: { description: { story: 'Фон аватара — цвет из палитры аккаунтов (`tokens.avatar.palette`), буква — `--yeet-on-item-*`: чёрная или белая, у кого контраст выше, все пары ≥ 4.5 : 1 (проверяет `npm run contrast`). Без явного цвета он выбирается по id аккаунта — у одного аккаунта всегда один цвет.' } } },
  render: () => (
    <UsageGrid min={120}>
      {avatarPalette.map((c) => (
        <Usage key={c} screen={itemColors.find(([id]) => id === c)?.[1] ?? c} note={c}><Avatar size="M" initial="Т" color={c as AvatarColor} /></Usage>
      ))}
    </UsageGrid>
  ),
};
