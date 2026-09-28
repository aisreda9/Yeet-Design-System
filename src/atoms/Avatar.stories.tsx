import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '.';
import { demoAvatar, Usage, UsageGrid } from '../docs/helpers';

const meta = {
  title: 'Atoms/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { size: 'L', initial: 'С' },
  argTypes: { size: { control: 'inline-radio', options: ['S', 'M', 'L'] }, initial: { control: 'text' }, src: { control: 'text' } },
  parameters: { docs: { description: { component: 'Аватар: L 96 · M 40 · S 24. С фото (`src`) — снимок заливкой по кругу; без фото — буква на blue или иконка камеры. Фото показывают и `AccountCard` / `AvatarStack` (`Account.photo`), и вкладка «Профиль» таб-бара (`avatarSrc`). Figma: `avatar` · Size, Content (Empty / Initial / Photo), Initial.' } } },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  render: () => (
    <UsageGrid min={160}>
      <Usage screen="Profile / Edit" note="нет фото"><Avatar size="L" /></Usage>
      <Usage screen="Profile" note="буква"><Avatar size="L" initial="С" /></Usage>
      <Usage screen="Profile / Edit" note="фото"><Avatar size="L" src={demoAvatar} alt="Сима" /></Usage>
      <Usage screen="Settings" note="строка профиля"><Avatar size="M" initial="С" /></Usage>
      <Usage screen="Tab bar" note="профиль"><Avatar size="S" initial="С" /></Usage>
    </UsageGrid>
  ),
};
