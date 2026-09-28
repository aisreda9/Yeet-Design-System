import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from '.';
import { unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

type Args = { type: 'large' | 'bar' | 'back' | 'search'; title: string; subtitle: string; titleChip: string; query: string; withAction: boolean };

const meta: Meta<Args> = {
  title: 'Organisms/Header',
  tags: ['autodocs'],
  args: { type: 'large', title: 'Гардероб', subtitle: '', titleChip: 'Новая вещь', query: 'Белые кроссовки', withAction: false },
  argTypes: {
    type: { control: 'inline-radio', options: ['large', 'bar', 'back', 'search'] },
    title: { if: { arg: 'type', neq: 'search' } },
    subtitle: { if: { arg: 'type', eq: 'large' } },
    titleChip: { if: { arg: 'type', eq: 'bar' } },
    query: { if: { arg: 'type', eq: 'search' } },
  },
  decorators: [unlessBare(withWidth(393))],
  parameters: {
    docs: {
      description: {
        component: `Закреплённая шапка со статус-баром 62, подложкой и полосой затухания 24 снизу. Figma: \`header\` · Type (Large / Bar / Back / Search), Title, Subtitle, Show Action.

| type | Где |
|---|---|
| large | Корневые вкладки: Гардероб, Стилист, Профиль, Поиск |
| bar | Новая вещь, Архив, Корзина, детали, создание образа (центр — чип или шаги) |
| back | Вход, восстановление пароля, онбординг |
| search | Поиск, результаты, поиск по гардеробу |`,
      },
    },
  },
  render: ({ type, title, subtitle, titleChip, query, withAction }) =>
    type === 'large' ? <Header type="large" title={title} subtitle={subtitle || undefined} action={withAction ? { icon: 'more', label: 'Ещё' } : undefined} />
    : type === 'bar' ? <Header type="bar" titleChip={titleChip} actions={withAction ? [{ icon: 'more', label: 'Ещё' }] : undefined} />
    : type === 'back' ? <Header type="back" title={title} textAction={withAction ? { label: 'Пропустить' } : undefined} />
    : <Header type="search" query={query} filters={withAction ? [{ label: 'Сортировка' }, { label: 'Цена' }] : undefined} />,
};
export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={393}>
      <Usage screen="Wardrobe" note="корневая вкладка"><div style={{ width: 393 }}><Header type="large" title="Гардероб" /></div></Usage>
      <Usage screen="Search / Discover" note="с подзаголовком"><div style={{ width: 393 }}><Header type="large" title="Поиск в сторах" subtitle="Нашли классную вещь? Покажем, где купить такую же или похожую." /></div></Usage>
      <Usage screen="New Item" note="назад + title-chip"><div style={{ width: 393 }}><Header type="bar" titleChip="Новая вещь" /></div></Usage>
      <Usage screen="Trash" note="2 действия"><div style={{ width: 393 }}><Header type="bar" titleChip="Корзина вещей" actions={[{ icon: 'trash', label: 'Очистить' }, { icon: 'more', label: 'Ещё' }]} /></div></Usage>
      <Usage screen="Outfits / Everyday" note="акцентная строка «повод ⌃» (Show Accent)"><div style={{ width: 393 }}><Header type="large" title="Твои образы" accent={{ label: 'на каждый день' }} /></div></Usage>
      <Usage screen="Profile / Edit" note="простой заголовок (Show Plain Title)"><div style={{ width: 393 }}><Header type="bar" title="Редактирование профиля" /></div></Usage>
      <Usage screen="Stylist / Trip Details" note="капсула с датами (Show Trip Chip)"><div style={{ width: 393 }}><Header type="bar" titleChip="Бразилиа" titleChipSub="8-13 сент · 5 ночей" actions={[{ icon: 'more', label: 'Ещё' }]} /></div></Usage>
      <Usage screen="Onboarding / First Item"><div style={{ width: 393 }}><Header type="back" title="Добавь первую вещь в гардероб" textAction={{ label: 'Пропустить' }} /></div></Usage>
      <Usage screen="Search / Results" note="с фильтрами"><div style={{ width: 393 }}><Header type="search" query="Белые кроссовки Nike" filters={[{ label: 'Сортировка' }, { label: 'Цена' }]} /></div></Usage>
    </UsageGrid>
  ),
};
