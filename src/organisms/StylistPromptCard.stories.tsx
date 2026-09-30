import type { Meta, StoryObj } from '@storybook/react-vite';
import { ItemArt, StylistPromptCard } from '.';
import { Grid } from '../templates';
import { unlessBare } from '../docs/helpers';

const meta = {
  title: 'Organisms/StylistPromptCard',
  component: StylistPromptCard,
  tags: ['autodocs'],
  args: { title: 'Удиви меня', description: 'Рулетка образов, собранных из твоих вещей', wide: false, soon: false },
  decorators: [unlessBare((Story) => <div style={{ width: 353 }}><Grid><Story /></Grid></div>)],
  parameters: { docs: { description: { component: 'Карточка функции стилиста (флоу Stylist / Catalog): H3 + описание Caption сверху, паддинг 20, радиус 20, фон card-bg. Половина — 173×220, `wide` — 353×172. `soon` — текст серым и бейдж «Скоро». `art` — иллюстрация справа снизу. Figma: `stylist-prompt-card` · Title, Description, Wide, Soon.' } } },
} satisfies Meta<typeof StylistPromptCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Catalog: Story = {
  name: 'Каталог функций',
  tags: ['bare'],
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 353 }}><Grid>
      <StylistPromptCard wide title="Конструктор" description="Образы по разным критериям" />
      <StylistPromptCard title="Удиви меня" description="Рулетка образов, собранных из твоих вещей" />
      <StylistPromptCard title="С чем носить" description="Максимум из одной вещи" />
      <StylistPromptCard wide title="Для поездок" description="Стиль и лёгкость в любой поездке" art={<ItemArt kind="container" size={150} color="grey" />} />
      <StylistPromptCard soon title="Оживи гардероб" description="Новая жизнь старым вещам" />
      <StylistPromptCard soon title="Докупить" description="Подберём интересное из сторов" />
    </Grid></div>
  ),
};
