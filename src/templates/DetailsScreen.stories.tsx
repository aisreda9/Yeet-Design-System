import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slot } from '../docs/helpers';
import { DetailsScreen } from '.';

/* Каркас без данных: вместо фото, полей и кнопки — слоты-заглушки. Тот же шаблон с данными — Pages / Экраны флоу, «Детали вещи». */
const meta = {
  title: 'Templates/DetailsScreen',
  component: DetailsScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: { disable: true },
    docs: {
      description: {
        component: `Шаблон деталей вещи и образа: **шапка** \`bar\` (пилюля по центру, действия справа) → **media** — квадрат во всю ширину под шапкой →
**панель** \`Sheet type="panel"\` с заголовком и контентом → **bottom** (закреплён) + **stamp** поверх контента.
Проскролльте панель: после 24 pt она поднимается поверх фото, а фото сворачивается в миниатюру 48 по центру шапки.`,
      },
    },
  },
} satisfies Meta<typeof DetailsScreen>;
export default meta;
type Story = StoryObj<typeof meta>;

const bottom = <div style={{ padding: '0 var(--screen-gutter) var(--space-20)' }}><Slot label="bottom · BottomBar" /></div>;

export const Slots: Story = {
  name: 'Слоты',
  args: {
    media: <Slot label="media · фото вещи или коллаж образа" square />,
    titleChip: 'titleChip',
    title: 'title · заголовок панели',
    bottom,
    children: (
      <>
        <Slot label="children · группа полей" height={112} />
        <Slot label="children · группа полей" height={168} />
        <Slot label="children · раздел" height={96} />
      </>
    ),
  },
};
