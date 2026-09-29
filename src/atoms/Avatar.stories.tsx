import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, type AvatarColor } from '.';
import { demoAvatar, Usage, UsageGrid } from '../docs/helpers';
import { avatarPalette, itemColors } from '../tokens/tokens';

const meta = {
  title: 'Atoms/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { size: 'L', initial: 'С', name: 'Сима' },
  argTypes: { size: { control: 'inline-radio', options: ['S', 'M', 'L'] }, initial: { control: 'text' }, name: { control: 'text' }, src: { control: 'text' }, color: { control: 'select', options: avatarPalette } },
  parameters: { docs: { description: { component: 'Аватар: L 96 · M 40 · S 24. С фото (`src`) — снимок заливкой по кругу; без фото — буква на цвете аккаунта (`color`, 9 цветов из Figma: без grey, white, beige — они теряются на белом фоне; по умолчанию blue) или иконка камеры. Фото показывают и `AccountCard` / `AvatarStack` (`Account.photo`), и вкладка «Профиль» таб-бара (`avatarSrc`). Figma: `avatar` · Size, Content (Empty / Initial / Photo), Initial.\n\n**Скринридер:** `name` озвучивается как «Сима, изображение» и у фото, и у буквы; без `name` аватар декоративный (рядом и так написано имя). `alt` — устаревший синоним `name`.' } } },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Colors: Story = {
  parameters: { controls: { disable: true } },
  name: 'Цвета',
  render: () => (
    <UsageGrid min={120}>
      {avatarPalette.map((c) => (
        <Usage key={c} screen={itemColors.find(([id]) => id === c)?.[1] ?? c} note={c}><Avatar size="M" initial="С" color={c as AvatarColor} /></Usage>
      ))}
    </UsageGrid>
  ),
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  render: () => (
    <UsageGrid min={160}>
      <Usage screen="Profile / Edit" note="нет фото"><Avatar size="L" /></Usage>
      <Usage screen="Profile" note="буква"><Avatar size="L" initial="С" /></Usage>
      <Usage screen="Profile / Edit" note="фото"><Avatar size="L" src={demoAvatar} name="Сима" /></Usage>
      <Usage screen="Settings" note="строка профиля"><Avatar size="M" initial="С" /></Usage>
      <Usage screen="Tab bar" note="профиль"><Avatar size="S" initial="С" /></Usage>
    </UsageGrid>
  ),
};
