import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from '.';
import { demoPhoto, unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

type Args = { variant: 'large' | 'bar' | 'back' | 'search'; title: string; subtitle: string; titleChip: string; query: string; withAction: boolean };

const meta: Meta<Args> = {
  title: 'Organisms/Header',
  tags: ['autodocs'],
  args: { variant: 'large', title: 'Гардероб', subtitle: '', titleChip: 'Новая вещь', query: 'Белые кроссовки', withAction: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['large', 'bar', 'back', 'search'] },
    title: { if: { arg: 'variant', neq: 'search' } },
    subtitle: { if: { arg: 'variant', neq: 'search' } },
    titleChip: { if: { arg: 'variant', eq: 'bar' } },
    query: { if: { arg: 'variant', eq: 'search' } },
  },
  decorators: [unlessBare(withWidth(393))],
  parameters: {
    docs: {
      description: {
        component: `Закреплённая шапка со статус-баром 62, подложкой и полосой затухания 24 снизу. Figma: \`header\` · Type (Large / Bar / Back / Search), Title, Subtitle, Show Action.

| variant | Где |
|---|---|
| large | Корневые вкладки: Гардероб, Стилист, Профиль, Поиск |
| bar | Новая вещь, Архив, Корзина, детали, создание образа (центр — чип или шаги) |
| back | Вход, восстановление пароля и онбординг (подзаголовок Body серым через 12; «Пропустить» — Tertiary M, отступы 20) |
| search | Поиск, результаты, поиск по гардеробу; поиск по фото — превью снимка 48 справа (\`photo\`) |`,
      },
    },
  },
  render: ({ variant, title, subtitle, titleChip, query, withAction }) =>
    variant === 'large' ? <Header variant="large" title={title} subtitle={subtitle || undefined} action={withAction ? { icon: 'more', label: 'Ещё' } : undefined} />
    : variant === 'bar' ? <Header variant="bar" titleChip={titleChip} actions={withAction ? [{ icon: 'more', label: 'Ещё' }] : undefined} />
    : variant === 'back' ? <Header variant="back" title={title} subtitle={subtitle || undefined} textAction={withAction ? { label: 'Пропустить' } : undefined} />
    : <Header variant="search" query={query} filters={withAction ? [{ label: 'Сортировка' }, { label: 'Цена' }] : undefined} />,
};
export default meta;
type Story = StoryObj<Args>;

/** По умолчанию — как компонент в Figma (`967:3624`): Large с «⋮». Строка заголовка растёт до 48 (IconButton), шапка 118. */
export const Playground: Story = { args: { withAction: true } };

/** Large без кнопки: корневые вкладки (Гардероб, Поиск). Строка заголовка — высота строки H1 36, шапка 106 (флоу: заголовок y70). */
export const Large: Story = { args: { variant: 'large', withAction: false } };

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={393}>
      <Usage screen="Wardrobe" note="корневая вкладка"><div style={{ width: 393 }}><Header variant="large" title="Гардероб" /></div></Usage>
      <Usage screen="Search / Discover" note="с подзаголовком"><div style={{ width: 393 }}><Header variant="large" title="Поиск в сторах" subtitle="Нашли классную вещь? Покажем, где купить такую же или похожую." /></div></Usage>
      <Usage screen="New Item" note="назад + title-chip"><div style={{ width: 393 }}><Header variant="bar" titleChip="Новая вещь" /></div></Usage>
      <Usage screen="Trash" note="2 действия"><div style={{ width: 393 }}><Header variant="bar" titleChip="Корзина вещей" actions={[{ icon: 'trash', label: 'Очистить' }, { icon: 'more', label: 'Ещё' }]} /></div></Usage>
      <Usage screen="Outfits / Everyday" note="акцентная строка «повод ⌃» (Show Accent)"><div style={{ width: 393 }}><Header variant="large" title="Твои образы" accent={{ label: 'на каждый день' }} /></div></Usage>
      <Usage screen="Profile / Edit" note="простой заголовок (Show Plain Title)"><div style={{ width: 393 }}><Header variant="bar" title="Редактирование профиля" /></div></Usage>
      <Usage screen="Stylist / Trip Details" note="капсула с датами (Show Trip Chip)"><div style={{ width: 393 }}><Header variant="bar" titleChip="Бразилиа" titleChipSub="8–13 сент · 5 ночей" actions={[{ icon: 'more', label: 'Ещё' }]} /></div></Usage>
      <Usage screen="Onboarding / First Item"><div style={{ width: 393 }}><Header variant="back" title="Добавь первую вещь в гардероб" textAction={{ label: 'Пропустить' }} /></div></Usage>
      <Usage screen="Auth / Password Recovery" note="back + подзаголовок через 12"><div style={{ width: 393 }}><Header variant="back" title="Не помнишь пароль?" subtitle="Пришлём код на почту, указанную при регистрации" /></div></Usage>
      <Usage screen="Onboarding / First Item Prompt" note="подзаголовок + «Пропустить»"><div style={{ width: 393 }}><Header variant="back" title="Добавь первую вещь" subtitle="Сфотографируй вещь — фон удалим сами" textAction={{ label: 'Пропустить' }} /></div></Usage>
      <Usage screen="Search / Photo / Results" note="превью фото справа"><div style={{ width: 393 }}><Header variant="search" photo={demoPhoto} filters={[{ label: 'Сортировка' }, { label: 'Цена' }]} /></div></Usage>
      <Usage screen="Search / Results" note="с фильтрами"><div style={{ width: 393 }}><Header variant="search" query="Белые кроссовки Nike" filters={[{ label: 'Сортировка' }, { label: 'Цена' }]} /></div></Usage>
    </UsageGrid>
  ),
};
