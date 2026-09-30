import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';
import { Link } from '.';
import { Usage, UsageGrid } from '../docs/helpers';

const meta = {
  title: 'Atoms/Link',
  component: Link,
  tags: ['autodocs'],
  args: { href: '#', children: 'политикой конфиденциальности' },
  argTypes: { children: { control: 'text' }, external: { control: 'boolean' } },
  render: (args) => <p className="y-caption y-text--secondary">Продолжая, вы соглашаетесь с <Link {...args} /></p>,
  parameters: {
    docs: {
      description: {
        component: `Инлайн-ссылка в тексте: цвет и шрифт текста вокруг (\`color: inherit\`), подчёркивание, фокус — обводка accent 2px,
зона нажатия ≥ 44 невидимым \`::after\`. Посещённая ссылка не перекрашивается. Внешний \`href\` (http/https) открывается в новой вкладке с \`rel="noopener noreferrer"\`.
Действие без адреса — не ссылка, а \`Button variant="ghost"\`. В Figma — подчёркнутый текст (\`1371:36904\`, \`517:7004\`, \`1371:43055\`).`,
      },
    },
  },
} satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Фокус с клавиатуры показываем программно: в статичной истории нет Tab. */
function Focused() {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => ref.current?.focus({ preventScroll: true }), []);
  return <Link ref={ref} href="#focus">условиями использования</Link>;
}

export const States: Story = {
  parameters: { controls: { disable: true } },
  name: 'Состояния',
  render: () => (
    <UsageGrid min={220}>
      <Usage screen="default"><p className="y-caption y-text--secondary">и <Link href="#terms">условиями использования</Link></p></Usage>
      <Usage screen="focus" note="Tab: обводка accent"><p className="y-caption y-text--secondary">и <Focused /></p></Usage>
      <Usage screen="visited" note="цвет не меняется"><p className="y-caption y-text--secondary">и <Link href="">условиями использования</Link></p></Usage>
      <Usage screen="на Body" note="цвет текста вокруг"><p className="y-body">Напиши на <Link href="mailto:hello@yeet.app">hello@yeet.app</Link></p></Usage>
    </UsageGrid>
  ),
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  render: () => (
    <UsageGrid min={300}>
      <Usage screen="Auth / Sign In" note="юридическая подпись, Caption серым">
        <p className="y-caption y-text--secondary" style={{ textAlign: 'center' }}>Продолжая, вы соглашаетесь <br />с <Link href="#privacy">политикой конфиденциальности</Link> <br />и <Link href="#terms">условиями использования</Link></p>
      </Usage>
      <Usage screen="Settings / Legal" note="e-mail, Body"><p className="y-body">По вопросам данных: <Link href="mailto:privacy@yeet.app">privacy@yeet.app</Link></p></Usage>
    </UsageGrid>
  ),
};
