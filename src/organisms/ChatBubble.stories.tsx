import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatBubble } from '.';

const meta = {
  title: 'Organisms/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
  args: { from: 'stylist', children: 'Привет! Я твой ИИ стилист. Спрашивай про образы, сочетания и что надеть сегодня' },
  argTypes: { from: { control: 'inline-radio', options: ['stylist', 'user'] }, children: { control: 'text', name: 'text' } },
  decorators: [(Story) => <div style={{ width: 353, display: 'flex', flexDirection: 'column' }}><Story /></div>],
  parameters: { docs: { description: { component: 'Сообщение в чате: паддинг 16/20, макс. 265, радиус 20 с «хвостом» 8. From=Stylist — light-grey слева, From=User — blue справа. Figma: `chat-bubble` · From, Text.' } } },
} satisfies Meta<typeof ChatBubble>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
export const Dialogue: StoryObj<typeof meta> = {
  parameters: { controls: { disable: true } },
  name: 'Диалог',
  render: () => (<div style={{ display: 'grid', gap: 8 }}><ChatBubble>Привет! Я твой ИИ стилист. Спрашивай про образы, сочетания и что надеть сегодня</ChatBubble><ChatBubble from="user">Что надеть на свидание?</ChatBubble></div>),
};
