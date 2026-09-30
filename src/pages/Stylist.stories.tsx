import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Icon, Stamp } from '../atoms';
import { Carousel, ChipGroup, EmptyState, InputBar, SegmentControl } from '../molecules';
import { ChatBubble, type Garment, Header, ItemArt, ItemCard, OutfitCollage, OutfitPager, type PagerLook, Sheet, StylistDock, StylistPromptCard, TripCard } from '../organisms';
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

const greeting = 'Привет! Я твой ИИ стилист. Спрашивай про образы, сочетания и что надеть сегодня';

/**
 * Чат со стилистом в белой панели с хэндлом, сообщения внизу над полем.
 * `reply` — ответ пользователя уже в ленте (Message Ready); `draft` — текст в поле (Greeting Entered); без них — пустое поле в фокусе.
 */
function StylistChat({ reply, draft }: { reply?: string; draft?: string }) {
  return (
    <Screen header={<Header type="large" title="Стилист" />} flush>
      <Sheet type="panel">
        <div className="y-chat-spacer" />
        <ChatBubble avatar={<span className="y-stylist-avatar"><Icon name="ai" /></span>}>{greeting}</ChatBubble>
        {reply && <ChatBubble from="user">{reply}</ChatBubble>}
        <InputBar placeholder="Спроси у стилиста" value={draft} send={{ label: 'Отправить' }} />
      </Sheet>
    </Screen>
  );
}

export const Stylist: Story = { name: 'Stylist / Home / Message Ready', render: () => <StylistChat reply="Приветы" /> };
export const StylistFocused: Story = { name: 'Stylist / Assistant / Input Focused', render: () => <StylistChat /> };
export const StylistGreeting: Story = { name: 'Stylist / Home / Greeting Entered', render: () => <StylistChat draft="Привет" /> };

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

const tripHeader = <Header type="bar" titleChip="Бразилиа" titleChipSub="8-13 сент · 5 ночей" actions={[{ icon: 'more', label: 'Ещё' }]} />;
const tripTabs = [{ value: 'outfits', label: 'Образы · 1' }, { value: 'items', label: 'Вещи · 4' }];

export const TripItems: Story = {
  name: 'Stylist / Trip Details / Items Tab',
  render: () => (
    <Screen header={tripHeader}>
      <SegmentControl value="items" segments={tripTabs} />
      {/* сколько раз вещь встречается в образах поездки — бейдж ×N */}
      <Grid>
        <ItemCard kind="top" color="green" label="×5" />
        <ItemCard kind="bottom" color="green" label="×2" />
        <ItemCard kind="shoe" color="brown" />
        <ItemCard kind="accessories" />
      </Grid>
    </Screen>
  ),
};

export const TripDetails: Story = {
  name: 'Stylist / Trip Details / Outfits Tab',
  render: () => (
    <Screen header={tripHeader}>
      <SegmentControl value="outfits" segments={tripTabs} />
      <div className="y-stack-8">
        <OutfitCollage label="Прогулка" items={[{ kind: 'accessories', x: 34, y: 18, size: 56 }, { kind: 'top', x: 66, y: 34, color: 'green' }, { kind: 'bottom', x: 30, y: 60, size: 130, color: 'green' }, { kind: 'shoe', x: 72, y: 76, size: 72, color: 'brown' }]} />
        <OutfitCollage label="Ужин" items={[{ kind: 'bottom', x: 28, y: 58, size: 140, color: 'black' }, { kind: 'top', x: 64, y: 40, color: 'brown' }, { kind: 'container', x: 76, y: 78, size: 64, color: 'black' }]} />
      </div>
    </Screen>
  ),
};

/** «Удиви меня»: образы закончились (Figma `1371:42727`, дубль `1371:42753`; в макете оба кадра названы «Default»). */
export const OutfitOfTheDayEmpty: Story = {
  name: 'Stylist / Outfit of the Day / No More Outfits',
  render: () => (
    <Screen header={<Header type="bar" titleChip="Удиви меня" actions={[{ icon: 'info', label: 'Как это работает' }]} />}>
      <div className="y-empty-bar">
        <EmptyState title="Не понравилось?" description={<>Добавь больше вещей для создания образов<br />вручную или с помощью ИИ</>} action={{ label: 'Показать еще', variant: 'primary' }} />
      </div>
    </Screen>
  ),
};

/* ─── «Удиви меня» и «С чем носить»: пейджер образов (#30, после #25) ── */

const stylistLooks: PagerLook[] = [
  { id: 'green', name: 'зелёный деним', items: [{ kind: 'accessories', x: 34, y: 18, size: 56 }, { kind: 'top', x: 66, y: 34, color: 'green' }, { kind: 'bottom', x: 30, y: 60, size: 130, color: 'green' }, { kind: 'shoe', x: 72, y: 76, size: 72, color: 'brown' }] },
  { id: 'black', name: 'чёрная юбка', items: [{ kind: 'bottom', x: 28, y: 58, size: 140, color: 'black' }, { kind: 'top', x: 64, y: 36, color: 'brown' }, { kind: 'container', x: 76, y: 76, size: 64, color: 'black' }] },
  { id: 'beige', name: 'бежевый жакет', items: [{ kind: 'outerwear', x: 36, y: 36, size: 120, color: 'beige' }, { kind: 'bottom', x: 68, y: 58, size: 110, color: 'blue' }, { kind: 'shoe', x: 34, y: 80, size: 64, color: 'white' }] },
];

/** «Удиви меня» (Figma `1371:42686`): стопка образов с превью 150, «Сохранить» и «Не нравится» — следующий образ. */
function SurpriseScreen() {
  const [index, setIndex] = useState(1);
  const [saved, setSaved] = useState(false);
  return (
    <Screen header={<Header type="bar" titleChip="Удиви меня" actions={[{ icon: 'info', label: 'Как это работает' }]} />}>
      <OutfitPager
        looks={stylistLooks}
        preview={150}
        index={index}
        onIndexChange={(k) => { setIndex(k); setSaved(false); }}
        stamp={<Stamp label="Сохранить" done={saved} onClick={() => setSaved((v) => !v)} />}
        skip={<Stamp label="Не нравится" tone="secondary" onClick={() => setIndex((k) => Math.min(k + 1, stylistLooks.length - 1))} />}
      />
    </Screen>
  );
}

export const OutfitOfTheDay: Story = { name: 'Stylist / Outfit of the Day / Default', render: () => <SurpriseScreen /> };

const occasions = ['Прогулка', 'Вечеринка', 'Офис', 'На каждый день', 'Свидание', 'Вечеринка ', 'Офис '];

/**
 * «С чем носить» (Figma `1371:42779`, в макете кадр назван «Stylist / Trips / List»): лента образов с одной вещью,
 * под ней поводы — чипсы и свайп ведут один индекс, ниже вещи из образа.
 */
function WhatToWearScreen() {
  const [index, setIndex] = useState(3);
  const looks = occasions.map((o, k) => ({ ...stylistLooks[k % stylistLooks.length], id: o, name: o.trim() }));
  return (
    <Screen header={<Header type="bar" titleChip="С чем носить" actions={[{ icon: 'info', label: 'Как это работает' }]} />}>
      <OutfitPager axis="x" looks={looks} index={index} onIndexChange={setIndex} aria-label="Образы по поводам" stamp={<Stamp label="Сохранить" />} skip={<Stamp label="Не нравится" tone="secondary" onClick={() => setIndex((k) => Math.min(k + 1, looks.length - 1))} />} />
      <div className="y-occasions">
        <ChipGroup chips={occasions.map((label, k) => ({ label: label.trim(), selected: k === index }))} onToggle={(label) => setIndex(occasions.findIndex((o) => o.trim() === label))} />
      </div>
      <Carousel itemWidth={173}>
        <ItemCard kind="top" color="green" />
        <ItemCard kind="bottom" color="green" />
        <ItemCard kind="shoe" color="brown" />
      </Carousel>
    </Screen>
  );
}

export const WhatToWear: Story = { name: 'Stylist / What to Wear / Outfits', render: () => <WhatToWearScreen /> };
