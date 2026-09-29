import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../atoms';
import { InputBar, SegmentControl } from '../molecules';
import { ChatBubble, type Garment, Header, ItemArt, OutfitCollage, Sheet, StylistDock, StylistPromptCard, TripCard } from '../organisms';
import { Grid, Screen } from '../templates';
import './pages.css';

/* Раздел: ИИ-стилист — чат, каталог сценариев, поездки. Id историй — pages-экраны-флоу--<slug> (flow-diff). */
const meta = {
  title: 'Pages/Экраны флоу',
  parameters: {
    layout: 'centered', controls: { disable: true }, options: { showPanel: false },
    docs: { description: { component: 'Экраны флоу, собранные **только** из компонентов системы. Названия — как в Figma (`Раздел / Экран / Состояние`).' } },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Stylist: Story = {
  name: 'Stylist / Home / Message Ready',
  render: () => (
    <Screen header={<Header type="large" title="Стилист" />} flush>
      {/* как во флоу: чат в белой панели с хэндлом, сообщения внизу над полем */}
      <Sheet type="panel">
        <div className="y-chat-spacer" />
        <ChatBubble avatar={<span className="y-stylist-avatar"><Icon name="ai" /></span>}>Привет! Я твой ИИ стилист. Спрашивай про образы, сочетания и что надеть сегодня</ChatBubble>
        <ChatBubble from="user">Приветы</ChatBubble>
        <InputBar placeholder="Спроси у стилиста" send={{ label: 'Отправить' }} />
      </Sheet>
    </Screen>
  ),
};

export const StylistHome: Story = {
  name: 'Stylist / Catalog',
  render: () => (
    <Screen header={<Header type="large" title="Стилист" subtitle="Нашли классную вещь? Покажем, где купить такую же или похожую." />} bottom={<StylistDock />}>
      <Grid>
        <StylistPromptCard wide title="Конструктор" description="Образы по разным критериям" />
        <StylistPromptCard title="Удиви меня" description="Рулетка образов, собранных из ваших вещей" />
        <StylistPromptCard title="С чем носить" description="Максимум из одной вещи" />
        <StylistPromptCard wide title="Для поездок" description="Стиль и лёгкость в любой поездке" art={<ItemArt kind="container" size={150} color="grey" />} />
        <StylistPromptCard soon title="Оживи гардероб" description="Новая жизнь старым вещам" />
        <StylistPromptCard soon title="Докупить" description="Подберём интересное из сторов" />
        <StylistPromptCard wide soon title="Оцени лук" description="Разбор образов и рекомендации" />
      </Grid>
    </Screen>
  ),
};

const tripArt = (a: Garment, b: Garment, c: Garment) => [{ kind: a, x: 70, y: 28, size: 44 }, { kind: b, x: 28, y: 62, size: 72 }, { kind: c, x: 74, y: 66, size: 64 }];

export const Trips: Story = {
  name: 'Stylist / Trips / List',
  render: () => (
    <Screen header={<Header type="bar" titleChip="Все для поездок" actions={[{ icon: 'info', label: 'Как это работает' }]} />}>
      <Grid>
        <TripCard add />
        <TripCard city="Самуй" items={12} outfits={8} art={tripArt('container', 'bottom', 'top')} />
        <TripCard city="Берлин" items={12} outfits={8} art={tripArt('accessories', 'bottom', 'top')} />
        <TripCard city="Бразилиа" items={4} outfits={1} art={tripArt('accessories', 'bottom', 'top')} />
        <TripCard city="Париж" items={12} outfits={8} art={tripArt('accessories', 'bottom', 'outerwear')} />
        <TripCard city="Торонто" items={12} outfits={8} art={tripArt('container', 'top', 'bottom')} />
      </Grid>
    </Screen>
  ),
};

export const TripDetails: Story = {
  name: 'Stylist / Trip Details / Outfits Tab',
  render: () => (
    <Screen header={<Header type="bar" titleChip="Бразилиа" titleChipSub="8-13 сент · 5 ночей" actions={[{ icon: 'more', label: 'Ещё' }]} />}>
      <SegmentControl value="outfits" segments={[{ value: 'outfits', label: 'Образы · 1' }, { value: 'items', label: 'Вещи · 4' }]} />
      <div className="y-stack-8">
        <OutfitCollage label="Прогулка" items={[{ kind: 'accessories', x: 34, y: 18, size: 56 }, { kind: 'top', x: 66, y: 34, color: 'green' }, { kind: 'bottom', x: 30, y: 60, size: 130, color: 'green' }, { kind: 'shoe', x: 72, y: 76, size: 72, color: 'brown' }]} />
        <OutfitCollage label="Ужин" items={[{ kind: 'bottom', x: 28, y: 58, size: 140, color: 'black' }, { kind: 'top', x: 64, y: 40, color: 'brown' }, { kind: 'container', x: 76, y: 78, size: 64, color: 'black' }]} />
      </div>
    </Screen>
  ),
};
