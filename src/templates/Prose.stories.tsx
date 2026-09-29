import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from '../organisms';
import { Prose, Screen } from '.';

/* Каркас без данных: подписи вместо текста документа. Реальные документы — Pages / Экраны флоу, «Legal». */
const meta = {
  title: 'Templates/Prose',
  component: Prose,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: { disable: true },
    docs: {
      description: {
        component: `Шаблон текстового документа (политика, условия): **H1** и строка даты → **разделы** (H2, абзацы, важный абзац чёрным, список) →
**contact** — последний раздел в карточке. Ставится в \`Screen\` с шапкой \`bar\` без заголовка. Почта в тексте становится ссылкой.`,
      },
    },
  },
} satisfies Meta<typeof Prose>;
export default meta;
type Story = StoryObj<typeof meta>;

const section = (n: number) => ({
  title: `section.title · раздел ${n}`,
  body: [
    'Абзац (строка): текст раздела, Body серым. Разделы идут через 24, блоки внутри раздела — через 12.',
    { strong: '{ strong }: важный абзац основным цветом.' },
    { list: ['{ list }: пункт списка', 'пункт списка'] },
  ],
});

export const Slots: Story = {
  name: 'Слоты',
  args: {
    title: 'title · H1 документа',
    updated: 'updated · строка даты',
    sections: [section(1), section(2)],
    contact: { title: 'contact · раздел в карточке', body: ['Почта в тексте — ссылка: hello@yeet.app'] },
  },
  render: (args) => <Screen header={<Header type="bar" />}><Prose {...args} /></Screen>,
};
