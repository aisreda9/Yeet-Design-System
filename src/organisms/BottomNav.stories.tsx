import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
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

function KeyboardDemo() {
  const [active, setActive] = useState<Tab>('today');
  return (
    <div style={{ width: 393, paddingTop: 40 }}>
      <BottomNav active={active} fab={active === 'wardrobe'} onTabChange={setActive} />
    </div>
  );
}

/** Клавиатура: вкладки — кнопки в порядке Tab с именами; Enter и пробел переключают, текущая — `aria-current="page"`; FAB в Tab только когда виден. */
export const Keyboard: Story = {
  parameters: { controls: { disable: true } },
  name: 'Клавиатура',
  tags: ['bare'],
  render: () => <KeyboardDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Основная навигация' });
    const tab = (name: string) => within(nav).getByRole('button', { name });
    const current = async (name: string) => {
      await expect(tab(name)).toHaveAttribute('aria-current', 'page');
      await expect(nav.querySelectorAll('[aria-current]')).toHaveLength(1);
    };
    await step('Tab по вкладкам по порядку', async () => {
      await current('Сегодня');
      for (const name of ['Сегодня', 'Поиск', 'Гардероб', 'Стилист', 'Профиль']) {
        await userEvent.tab();
        await expect(tab(name)).toHaveFocus();
      }
    });
    await step('FAB скрыт — не в порядке Tab и не озвучивается', async () => {
      await expect(canvas.queryByRole('button', { name: 'Добавить' })).toBeNull();
      await expect(canvasElement.querySelector('.y-bottom-nav__fab button')).toHaveAttribute('tabindex', '-1');
    });
    await step('Enter и пробел переключают вкладку', async () => {
      tab('Поиск').focus();
      await userEvent.keyboard('{Enter}');
      await current('Поиск');
      await expect(tab('Поиск')).toHaveFocus();
      await userEvent.tab();
      await userEvent.keyboard(' ');
      await current('Гардероб');
    });
    await step('На вкладке с FAB «Добавить» доступна с клавиатуры', async () => {
      const fab = canvas.getByRole('button', { name: 'Добавить' });
      await expect(fab).not.toHaveAttribute('tabindex', '-1');
      tab('Профиль').focus();
      await userEvent.tab();
      await expect(fab).toHaveFocus();
    });
  },
};
