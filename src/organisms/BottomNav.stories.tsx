import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { BottomNav, TabBar, type Tab } from '.';
import { demoAvatar, unlessBare, Usage, UsageGrid } from '../docs/helpers';

const tabs: Tab[] = ['today', 'search', 'wardrobe', 'stylist', 'profile'];

const meta = {
  title: 'Organisms/BottomNav & TabBar',
  component: BottomNav,
  tags: ['autodocs'],
  args: { active: 'wardrobe', fab: true },
  argTypes: { active: { control: 'inline-radio', options: tabs } },
  decorators: [unlessBare((Story) => <div style={{ width: 393, paddingTop: 40 }}><Story /></div>)],
  parameters: { docs: { description: { component: 'Нижняя навигация 116: полоса затухания 40 + таб-бар 56 (радиус 48, тень), FAB «+» XL на Гардеробе и Вишлисте — таб-бар сжимается до 290 (`--motion-nav`). Вкладка «Профиль» — буква в кружке 20 или фото профиля (`avatarSrc`). Figma: `bottom-nav` · FAB, `tab-bar` · Active, Initial, Avatar=Photo.' } } },
} satisfies Meta<typeof BottomNav>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function Render(args) {
    const [, update] = useArgs();
    return <BottomNav {...args} onTabChange={(active) => update({ active, fab: active === 'wardrobe' })} />;
  },
};

export const TabBars: Story = {
  parameters: { controls: { disable: true } },
  name: 'TabBar · все вкладки',
  tags: ['bare'],
  render: () => <div style={{ display: 'grid', gap: 12, width: 353 }}>{tabs.map((t) => <TabBar key={t} active={t} />)}</div>,
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={393}>
      <Usage screen="Outfits (Сегодня)"><div style={{ width: 393, paddingTop: 40 }}><BottomNav active="today" /></div></Usage>
      <Usage screen="Profile / Overview" note="фото профиля во вкладке"><div style={{ width: 393, paddingTop: 40 }}><BottomNav active="profile" avatarSrc={demoAvatar} /></div></Usage>
      <Usage screen="Wardrobe" note="с FAB"><div style={{ width: 393, paddingTop: 40 }}><BottomNav active="wardrobe" fab /></div></Usage>
    </UsageGrid>
  ),
};
