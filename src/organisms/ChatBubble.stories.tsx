import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatBubble, StylistAvatar } from '.';
import { Usage, UsageGrid } from '../docs/helpers';

const meta = {
  title: 'Organisms/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
  args: { from: 'stylist', children: 'Привет! Я твой ИИ стилист. Спрашивай про образы, сочетания и что надеть сегодня' },
  argTypes: { from: { control: 'inline-radio', options: ['stylist', 'user'] }, avatar: { control: 'boolean' }, children: { control: 'text', name: 'text' } },
  decorators: [(Story) => <div style={{ width: 353, display: 'flex', flexDirection: 'column' }}><Story /></div>],
  parameters: { docs: { description: { component: 'Сообщение в чате: паддинг 16/20, макс. 265, радиус 20 с «хвостом» 8. From=Stylist — light-grey слева, From=User — blue справа. `avatar` — аватар 64 слева, по низу, через 4: `true` — аватар стилиста по умолчанию (`StylistAvatar`, флоу `413:846`, `699:2858`), или свой узел. Figma: `chat-bubble` · From, Text.' } } },
} satisfies Meta<typeof ChatBubble>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
export const Dialogue: StoryObj<typeof meta> = {
  parameters: { controls: { disable: true } },
  name: 'Диалог',
  render: () => (<div style={{ display: 'grid', gap: 8 }}><ChatBubble>Привет! Я твой ИИ стилист. Спрашивай про образы, сочетания и что надеть сегодня</ChatBubble><ChatBubble from="user">Что надеть на свидание?</ChatBubble></div>),
};

export const WithAvatar: StoryObj<typeof meta> = {
  name: 'С аватаром стилиста',
  args: { avatar: true },
  parameters: { docs: { description: { story: '`avatar` (= `true`) — иллюстрация стилиста 64, выровнена по низу пузыря. Аватар декоративный: `aria-hidden`.' } } },
};

export const InFlow: StoryObj<typeof meta> = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Stylist / Assistant / Greeting" note="413:846 · 699:2858" width={353}>
        <div style={{ display: 'grid', gap: 8 }}>
          <ChatBubble avatar>Привет! Я твой ИИ стилист. Спрашивай про образы, сочетания и что надеть сегодня</ChatBubble>
          <ChatBubble from="user">Что надеть на свидание?</ChatBubble>
        </div>
      </Usage>
      <Usage screen="StylistAvatar" note="отдельно: 64 и 48" width={353}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}><StylistAvatar /><StylistAvatar size={48} /></div>
      </Usage>
    </UsageGrid>
  ),
};
