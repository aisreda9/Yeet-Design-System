import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Avatar, Button, Divider, Flag, Icon, IconButton, Logo, Stamp } from '../atoms';
import { demoAvatar, demoPhoto } from '../docs/helpers';
import { AccountCard, AvatarStack, type Account, BarChart, Carousel, ChipGroup, EmptyState, Field, Hint, InputBar, InputGroup, List, ListGroup, ListItem, LoadingState, Note, PhotoTile, RangeSlider, SegmentControl, Snackbar, StatRow, StatTile, UsageMeter } from '../molecules';
import { AccountsSheet, BottomBar, BottomNav, type CanvasItem, ChatBubble, Dialog, OutfitCanvas, type Garment, Header, ItemArt, ItemCard, OutfitCollage, OutfitThumbnail, Overlay, PhotoArea, ProductCard, Sheet, StatusBar, StylistDock, StylistPromptCard, TripCard, WeatherCard } from '../organisms';
import { Grid, Row, Screen, Sticky } from '../templates';
import type { ItemColor } from '../tokens/tokens';
import { motionMs } from '../utils/gesture';

const meta = {
  title: 'Pages/Экраны флоу',
  parameters: {
    layout: 'centered', controls: { disable: true }, options: { showPanel: false },
    docs: { description: { component: 'Экраны флоу, собранные **только** из компонентов системы. Названия — как в Figma (`Раздел / Экран / Состояние`).' } },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const grid: Garment[] = ['top', 'container', 'bottom', 'shoe', 'outerwear', 'accessories', 'top', 'bottom'];

export const OnboardingWelcome: Story = {
  parameters: { controls: { disable: true } },
  name: 'Onboarding / Welcome',
  render: () => (
    <Screen bottom={<BottomBar label="Начать бесплатно" />}>
      {/* флоу: заголовок на y70, подзаголовок через 12; ниже — место под анимацию */}
      <h1 className="y-h1" style={{ marginTop: -12 }}>Полный шкаф,<br />а надеть нечего?</h1>
      <p className="y-body y-text--secondary" style={{ marginTop: -8 }}>Создавай образы из своих вещей,<br />находи похожие и покупай то, что действительно подходит твоему стилю</p>
    </Screen>
  ),
};

export const SignIn: Story = {
  parameters: { controls: { disable: true } },
  name: 'Auth / Sign In',
  render: () => (
    <Screen header={<Header type="back" title="Вход и регистрация" />}>
      <InputGroup>
        <Field label="E-mail" input={{ type: 'email' }} />
        <Field label="Пароль" input={{ type: 'password' }} trailingIcon="eye" />
      </InputGroup>
      <Button size="L" fullWidth>Войти</Button>
      <Button variant="ghost" size="L" style={{ alignSelf: 'center', marginTop: -12 }}>Забыли пароль?</Button>
      <Divider label="или" />
      <Button variant="secondary" size="L" leftIcon="apple" fullWidth>Войти с Apple</Button>
      <p className="y-caption y-text--secondary y-legal">Продолжая, вы соглашаетесь <br />с <a href="#">политикой конфиденциальности</a> <br />и <a href="#">условиями использования</a></p>
    </Screen>
  ),
};

export const Today: Story = {
  parameters: { controls: { disable: true } },
  name: 'Outfits / Everyday / Sunny',
  render: () => (
    <Screen header={<Header type="large" title="Твои образы" accent={{ label: 'на каждый день' }} />} bottom={<BottomNav active="today" />}>
      {/* как во флоу: превью предыдущего образа, коллаж 353, превью следующего; погода с наклоном и штамп поверх */}
      <div className="y-today">
        <OutfitThumbnail size={96} items={[{ kind: 'top', x: 40, y: 52, size: 44, color: 'yellow' }, { kind: 'bottom', x: 64, y: 40, size: 40, color: 'green' }]} />
        <OutfitCollage items={[{ kind: 'top', x: 68, y: 34, size: 120, color: 'green' }, { kind: 'bottom', x: 30, y: 60, size: 150, color: 'green' }, { kind: 'accessories', x: 34, y: 22, size: 64 }, { kind: 'shoe', x: 72, y: 74, size: 80, color: 'brown' }]} />
        <OutfitThumbnail size={96} items={[{ kind: 'bottom', x: 34, y: 56, size: 44, color: 'black' }, { kind: 'top', x: 62, y: 40, size: 40, color: 'brown' }, { kind: 'container', x: 72, y: 70, size: 26, color: 'black' }]} />
        <div className="y-today__weather"><WeatherCard temperature="20°" description="Солнечно, ветер 14 км/ч" tilt /></div>
        <div className="y-today__stamp"><Stamp label="Надеть" /></div>
      </div>
    </Screen>
  ),
};

export const Wardrobe: Story = {
  parameters: { controls: { disable: true } },
  name: 'Wardrobe / Items / Populated',
  render: () => {
    const [tab, setTab] = useState('items');
    return (
      <Screen header={<Header type="large" title="Гардероб" />} bottom={<BottomNav active="wardrobe" fab />}>
        <SegmentControl value={tab} onChange={setTab} segments={[{ value: 'items', label: 'Вещи' }, { value: 'outfits', label: 'Образы' }, { value: 'wishlist', label: 'Вишлист' }]} />
        <Sticky>
          <Row gap={4}>
            <IconButton icon="search" label="Поиск" size="S" />
            <IconButton icon="archive" label="Архив" size="S" />
            <ChipGroup chips={[{ label: 'Категория', dropdown: true }, { label: 'Сезон', dropdown: true }, { label: 'Теги', dropdown: true }]} />
          </Row>
        </Sticky>
        <Grid>{[...grid, ...grid].map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>
      </Screen>
    );
  },
};

export const WardrobeEmpty: Story = {
  parameters: { controls: { disable: true } },
  name: 'Wardrobe / Items / Empty',
  render: () => (
    <Screen header={<Header type="large" title="Гардероб" />} bottom={<BottomNav active="wardrobe" fab />}>
      <SegmentControl value="items" segments={[{ value: 'items', label: 'Вещи' }, { value: 'o', label: 'Образы' }, { value: 'w', label: 'Вишлист' }]} />
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', paddingBottom: 98 }}>
        <EmptyState title="Гардероб пуст" description={<>Добавь первую вещь,<br />чтобы начать создавать образы</>} />
      </div>
    </Screen>
  ),
};

export const ItemDetails: Story = {
  parameters: { controls: { disable: true } },
  name: 'Wishlist / Item Details',
  render: () => (
    <Screen header={<Header type="bar" actions={[{ icon: 'more', label: 'Ещё' }]} centerOnScroll={<ItemArt kind="container" color="black" size={36} />} />} bottom={<BottomBar label="Переместить в гардероб" secondary={{ icon: 'external-link', label: 'Открыть в магазине' }} />} flush>
      <div className="y-gutter"><PhotoArea kind="container" /></div>
      <Sheet type="panel" title="Сумка">
        <p className="y-body y-text--secondary">10 000 ₽ · Sander · Черный<br />Аксессуары · Все сезоны</p>
        <Note>Мягкая сумка округлой формы с логотипом и кожаным ремешком</Note>
        <section className="y-section" style={{ gap: 20 }}>
          <h3 className="y-h3">Образы с этой вещью</h3>
          <OutfitCollage items={[{ kind: 'bottom', x: 28, y: 56, size: 150, color: 'black' }, { kind: 'top', x: 64, y: 36, size: 120, color: 'brown' }, { kind: 'container', x: 76, y: 70, size: 64, color: 'black' }]} />
        </section>
      </Sheet>
    </Screen>
  ),
};

export const OutfitDetails: Story = {
  parameters: { controls: { disable: true } },
  name: 'Wardrobe / Outfit Details',
  render: () => (
    <Screen header={<Header type="bar" actions={[{ icon: 'more', label: 'Ещё' }]} centerOnScroll={<ItemArt kind="top" color="green" size={36} />} />} flush>
      <div className="y-gutter">
        <OutfitCollage items={[{ kind: 'accessories', x: 32, y: 20, size: 64 }, { kind: 'top', x: 68, y: 34, size: 120, color: 'green' }, { kind: 'bottom', x: 30, y: 60, size: 150, color: 'green' }, { kind: 'shoe', x: 72, y: 74, size: 80, color: 'brown' }]} />
      </div>
      <Sheet type="panel" title="На каждый день">
        <p className="y-body y-text--secondary">Все сезоны</p>
        <StatRow><StatTile label="Надето раз" value={8} /><StatTile label="Д. простоя" value={1} /><StatTile label="Вещи" value={4} /></StatRow>
        <section className="y-section">
          <h3 className="y-h3">Теги</h3>
          <ChipGroup wrap chips={[{ label: 'Тег #1' }, { label: 'Тег #2' }, { label: 'Тег #3' }, { label: 'Тег #4' }]} />
        </section>
        <section className="y-section">
          <h3 className="y-h3">Вещи из образа</h3>
          <Grid><ItemCard kind="top" color="green" /><ItemCard kind="bottom" color="green" /><ItemCard kind="shoe" color="brown" /><ItemCard kind="accessories" /></Grid>
        </section>
        {/* штамп «Надеть» заходит на статистику и теги, как во флоу (x225, y676 экрана) */}
        <div style={{ position: 'absolute', top: 160, right: 20, zIndex: 2 }}><Stamp label="Надеть" /></div>
      </Sheet>
    </Screen>
  ),
};

export const SearchResults: Story = {
  parameters: { controls: { disable: true } },
  name: 'Search / Text / Results',
  render: () => (
    <Screen header={<Header type="search" query="Белые кроссовки" filters={[{ label: 'Сортировка' }, { label: 'Цена' }]} />}>
      <Grid rowGap={16}>
        {["Nike Air Force 1 '07 Edge", 'Nike Ava Edge', 'Adidas Samba', 'New Balance 550', 'Puma Palermo', 'Vans Old Skool'].map((n, i) => (
          <ProductCard key={n} kind="shoe" name={n} price={`${[10400, 14300, 11900, 13500, 9900, 7600][i].toLocaleString('ru-RU')} ₽`} discount={i % 2 ? undefined : '-10%'} liked={i === 1} />
        ))}
      </Grid>
    </Screen>
  ),
};

export const SearchEmpty: Story = {
  parameters: { controls: { disable: true } },
  name: 'Search / Text / No Results Filtered',
  render: () => (
    <Screen header={<Header type="search" query="asdasd" filters={[{ label: 'Сначала дешевле', selected: true }, { label: 'до 60 000 ₽', selected: true }]} />} center>
      {/* флоу: блок ниже центра — текст на y460 */}
      <div style={{ marginTop: 66 }}><EmptyState title="Упс, не нашли" description="Измени запрос или попробуй поискать что-то другое" action={{ label: 'Сбросить поиск' }} /></div>
    </Screen>
  ),
};

export const NewItem: Story = {
  parameters: { controls: { disable: true } },
  name: 'New Item / Removing Background',
  render: () => (
    <Screen header={<Header type="bar" titleChip="Новая вещь" />} flush>
      <div className="y-gutter"><PhotoArea><LoadingState label="Удаляем фон" /></PhotoArea></div>
      {/* как во флоу: детали в панели под фото, заголовок H2 */}
      <Sheet type="panel" title="Детали новой вещи">
        <InputGroup><Field label="Название" input={{}} /><Field label="Стоимость" input={{ inputMode: 'numeric' }} /></InputGroup>
        <InputGroup><Field label="Категория" value="Аксессуары" trailingIcon="chevron-up-down" /><Field label="Цвет" value="Черный" colorDot="black" trailingIcon="chevron-up-down" /><Field label="Сезон" value="Все" trailingIcon="chevron-up-down" /></InputGroup>
      </Sheet>
    </Screen>
  ),
};

function CanvasScreen() {
  const wardrobe: { id: string; kind: Garment; color: ItemColor }[] = [
    { id: 'bottom', kind: 'bottom', color: 'green' }, { id: 'shoes', kind: 'shoe', color: 'brown' },
    { id: 'top', kind: 'top', color: 'green' }, { id: 'glasses', kind: 'accessories', color: 'black' },
  ];
  const spots: Record<string, Pick<CanvasItem, 'x' | 'y' | 'size'>> = { bottom: { x: 30, y: 58, size: 140 }, shoes: { x: 72, y: 76, size: 72 }, top: { x: 66, y: 34 }, glasses: { x: 32, y: 18, size: 56 } };
  const [items, setItems] = useState<CanvasItem[]>(wardrobe.slice(0, 2).map((w) => ({ ...w, ...spots[w.id] })));
  const [selected, setSelected] = useState<string>();
  const [hint, setHint] = useState(true);
  const toggle = (w: (typeof wardrobe)[number]) =>
    setItems((cur) => (cur.some((c) => c.id === w.id) ? cur.filter((c) => c.id !== w.id) : [...cur, { ...w, ...spots[w.id] }]));
  return (
    <Screen
      header={<Header type="bar" center={<SegmentControl size="M" fit value="canvas" segments={[{ value: 'items', icon: 'wardrobe', ariaLabel: 'Гардероб' }, { value: 'canvas', icon: 'collage', ariaLabel: 'Коллаж' }, { value: 'info', icon: 'info', ariaLabel: 'Описание' }]} />} actions={[{ icon: 'arrows-shuffle', label: 'Перемешать' }]} />}
      bottom={<BottomBar label="Далее" />}
    >
      <OutfitCanvas items={items} onChange={setItems} selectedId={selected} onSelect={setSelected} hint={hint ? <Snackbar size="S" onClose={() => setHint(false)}>Перемещай и масштабируй вещи</Snackbar> : undefined} />
      <div style={{ margin: '0 calc(var(--screen-gutter) * -1)' }}>
        <Sheet type="panel" title="Гардероб">
          <ChipGroup chips={[{ label: 'Категория · 2', selected: true, dropdown: true }, { label: 'Зима', selected: true, dropdown: true }]} />
          <Grid>{wardrobe.map((w) => <ItemCard key={w.id} kind={w.kind} color={w.color} selected={items.some((c) => c.id === w.id)} onClick={() => toggle(w)} />)}</Grid>
        </Sheet>
      </div>
    </Screen>
  );
}

export const Canvas: Story = {
  parameters: { controls: { disable: true } },
  name: 'Outfit Creation / Canvas / Filtered',
  render: () => <CanvasScreen />,
};

export const Stylist: Story = {
  parameters: { controls: { disable: true } },
  name: 'Stylist / Home / Message Ready',
  render: () => (
    <Screen header={<Header type="large" title="Стилист" />} flush>
      {/* как во флоу: чат в белой панели с хэндлом, сообщения внизу над полем */}
      <Sheet type="panel">
        <div style={{ flex: 1, minHeight: 180 }} />
        <ChatBubble avatar={<span className="y-stylist-avatar"><Icon name="ai" /></span>}>Привет! Я твой ИИ стилист. Спрашивай про образы, сочетания и что надеть сегодня</ChatBubble>
        <ChatBubble from="user">Приветы</ChatBubble>
        <InputBar placeholder="Спроси у стилиста" send={{ label: 'Отправить' }} />
      </Sheet>
    </Screen>
  ),
};

export const FilterSheet: Story = {
  parameters: { controls: { disable: true } },
  name: 'Wardrobe / Items / Sheet / Category',
  render: () => (
    <Screen
      header={<Header type="large" title="Гардероб" />}
      overlay={
        <Overlay>
          <Sheet title="Категория" footer={[{ label: 'Сбросить' }, { label: 'Применить' }]}>
            <List><ListItem type="expandable" icon="outerwear" label="Верхняя одежда" /><ListItem type="expandable" icon="top" label="Верх" expanded /></List>
            <ChipGroup wrap chips={[{ label: 'Футболка', selected: true }, { label: 'Поло' }, { label: 'Топ' }, { label: 'Рубашка' }]} />
            <List><ListItem type="expandable" icon="bottom" label="Низ" /><ListItem type="expandable" icon="shoe" label="Обувь" /><ListItem type="expandable" icon="accessories" label="Аксессуары" /></List>
          </Sheet>
        </Overlay>
      }
    >
      <Grid>{grid.map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>
    </Screen>
  ),
};

export const ClearTrash: Story = {
  parameters: { controls: { disable: true } },
  name: 'Trash / Items / Dialog / Clear',
  render: () => (
    <Screen header={<Header type="bar" titleChip="Корзина вещей" />} overlay={<Overlay><Dialog tone="destructive" title="Очистить корзину?" description="Все вещи из корзины удаляются навсегда, их уже не вернуть" cancel="Отмена" confirm="Очистить" /></Overlay>}>
      <Grid>{grid.slice(0, 4).map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>
    </Screen>
  ),
};

export const Toast: Story = {
  parameters: { controls: { disable: true } },
  name: 'Wardrobe / Item / Toast',
  render: () => (
    <Screen header={<Header type="large" title="Гардероб" />} bottom={<BottomNav active="wardrobe" fab />} floating={<Snackbar onUndo={() => {}}>Вещь перемещена в архив</Snackbar>}>
      <Grid>{grid.map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>
    </Screen>
  ),
};

/* ─── Добавлено при синхронизации с флоу ─────────────────────────────── */

export const Splash: Story = {
  parameters: { controls: { disable: true } },
  name: 'App / Splash',
  render: () => (
    <div style={{ width: 'var(--screen-width)', height: 'var(--screen-height)', borderRadius: 56, overflow: 'hidden', background: 'var(--color-accent)', color: 'var(--color-text-on-accent)', display: 'flex', flexDirection: 'column' }}>
      <StatusBar onAccent />
      <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}><Logo height={56} /></div>
    </div>
  ),
};

export const SearchDiscover: Story = {
  parameters: { controls: { disable: true } },
  name: 'Search / Discover',
  render: () => (
    <Screen header={<Header type="large" title="Поиск в сторах" subtitle={<>Нашли классную вещь?<br />Покажем, где купить такую же или похожую.</>} />} bottom={<BottomNav active="search" />}>
      {/* флоу: блоки через 32, поле 52, подсказки по центру */}
      <div style={{ marginTop: 8 }}>
        <Row gap={7}>
          <PhotoTile source="gallery" />
          <PhotoTile source="camera" />
        </Row>
      </div>
      <div style={{ marginTop: 12 }}><InputBar size="L" placeholder="Белые кроссовки Nike" fieldIcon="search" /></div>
      <ChipGroup wrap center chips={['Nike', 'Crocs', 'Marine Serre', 'Белое платье с красными вкраплениями', 'Marine Serre', 'JAC58S Pina Jacquard', 'Обувь для бега'].map((label) => ({ label }))} />
    </Screen>
  ),
};

export const StylistHome: Story = {
  parameters: { controls: { disable: true } },
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
  parameters: { controls: { disable: true } },
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
  parameters: { controls: { disable: true } },
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

export const Settings: Story = {
  parameters: { controls: { disable: true } },
  name: 'Settings / Main',
  render: () => (
    <Screen header={<Header type="bar" title="Настройки" />}>
      {/* как во флоу: пары групп через 8, разделы через 20 */}
      <div className="y-stack-8">
        <AccountCard account={sima} kind="settings" />
        <ListGroup><ListItem label="Корзина вещей" trailing={<Icon name="chevron-right" />} onClick={() => {}} /></ListGroup>
      </div>
      <div className="y-stack-8">
        <InputGroup>
          <Field label="Страна" value="Россия" trailingIcon="chevron-up-down" />
          <Field label="Валюта" value="₽ · RUB" trailingIcon="chevron-up-down" />
        </InputGroup>
        <ListGroup>
          <ListItem label="Язык" trailing={<Icon name="external-link" />} onClick={() => {}} />
          <ListItem label="Уведомления" trailing={<Icon name="external-link" />} onClick={() => {}} />
        </ListGroup>
      </div>
      <ListGroup>
        {['Оценить приложение', 'Техническая поддержка', 'Идеи по доработке приложения', 'Сотрудничество'].map((l) => <ListItem key={l} label={l} trailing={<Icon name="external-link" />} onClick={() => {}} />)}
      </ListGroup>
      <div className="y-settings-footer">
        <Logo height={30} />
        <p className="y-caption">Политикой конфиденциальности <br />Условиями использования</p>
        <p className="y-caption">Версия 3.0.28</p>
        <Button variant="destructive" fullWidth>Удалить аккаунт</Button>
      </div>
    </Screen>
  ),
};

const sima: Account = { id: 'sima', name: 'Сима', email: 'sima@space.com', color: 'blue' };
const tina: Account = { id: 'tina', name: 'Тинатин', email: 'hello@tin.ru', color: 'orange' };
type ProfileOverlay = 'accounts' | 'period' | undefined;

/** Профиль (Figma: Profile / Overview / Analytics): аккаунты и период над панелью со статистикой. */
function ProfileScreen({ accounts, open: initial }: { accounts: Account[]; open?: ProfileOverlay }) {
  const [open, setOpen] = useState<ProfileOverlay>(initial);
  const [period, setPeriod] = useState('За всё время');
  const overlay =
    open === 'accounts' ? <AccountsSheet accounts={accounts} onSwitch={() => setOpen(undefined)} onAdd={() => setOpen(undefined)} onEdit={() => setOpen(undefined)} onSettings={() => setOpen(undefined)} /> :
    open === 'period' ? <Sheet title="Статистика"><ChipGroup wrap onToggle={(l) => { setPeriod(l); window.setTimeout(() => setOpen(undefined), motionMs('--motion-select')); /* выбор успевает отрисоваться, потом шторка уходит */ }} chips={['За всё время', 'За пол года', 'За месяц', 'За неделю'].map((label) => ({ label, selected: label === period }))} /></Sheet> : undefined;
  return (
    <Screen header={<Header type="large" title="Профиль" />} bottom={<BottomNav active="profile" />} overlay={overlay && <Overlay onClose={() => setOpen(undefined)}>{overlay}</Overlay>} flush>
      <div className="y-gutter y-profile-bar">
        <AvatarStack accounts={accounts} onOpen={() => setOpen('accounts')} onAdd={() => setOpen('accounts')} />
        <ChipGroup wrap chips={[{ label: period, dropdown: true }]} onToggle={() => setOpen('period')} />
      </div>
      <Sheet type="panel" className="y-profile-panel">
        <div className="y-stack-8 y-profile-summary">
          <UsageMeter percent={11} />
          <StatRow>
            <StatTile label="Вещи" value={43} />
            <StatTile label="Образы" value={12} />
            <StatTile label="Вишлист" value={4} />
          </StatRow>
        </div>
        <Carousel title="Чаще всего надевалось" itemWidth={173}>
          <ItemCard kind="top" color="green" label="30 раз" />
          <ItemCard kind="top" color="brown" label="12 раз" />
          <ItemCard kind="bottom" color="black" label="9 раз" />
        </Carousel>
        <BarChart bars={[{ label: 'Верхняя одежда', icon: 'outerwear', value: 5 }, { label: 'Верх', icon: 'top', value: 50 }, { label: 'Обувь', icon: 'shoe', value: 10 }, { label: 'Аксессуары', icon: 'accessories', value: 30 }, { label: 'Низ', icon: 'bottom', value: 5 }]} />
        <section className="y-section">
          <h2 className="y-h3">Самый дорогой образ</h2>
          <OutfitCollage
            label="Ужин"
            items={[{ kind: 'bottom', x: 28, y: 44, size: 130, color: 'black' }, { kind: 'top', x: 64, y: 30, color: 'brown' }, { kind: 'container', x: 78, y: 56, size: 56, color: 'black' }]}
            footer={<><span><span className="y-h2" style={{ display: 'block' }}>120 640 ₽</span><span className="y-caption y-text--secondary">4 вещи</span></span><Icon name="chevron-right" /></>}
          />
        </section>
        {/* порядок как во флоу: цвета → давно не надевалось → сезоны → лучшая инвестиция → другие цифры */}
        <BarChart bars={[{ label: 'Синий', color: 'blue', value: 13 }, { label: 'Черный', color: 'black', value: 62 }, { label: 'Коричневый', color: 'brown', value: 25 }]} />
        <Carousel title="Давно не надевалось" itemWidth={173}>
          <ItemCard kind="top" color="black" label="20 дней" />
          <ItemCard kind="top" color="white" label="1 день" />
          <ItemCard kind="shoe" color="brown" label="1 день" />
        </Carousel>
        <BarChart bars={[{ label: 'Весна', icon: 'flower', value: 20 }, { label: 'Лето', icon: 'sun', value: 70 }, { label: 'Осень', icon: 'leaf', value: 8 }, { label: 'Зима', icon: 'snowflake', value: 1 }]} />
        <section className="y-section">
          <h2 className="y-h3">Лучшая инвестиция</h2>
          <OutfitCollage
            plain
            label="Аксессуары"
            items={[{ kind: 'container', x: 50, y: 42, size: 180, color: 'black' }]}
            footer={<><span><span className="y-h2" style={{ display: 'block' }}>32 640 ₽</span><span className="y-caption y-text--secondary">5 образов</span></span><Icon name="chevron-right" /></>}
          />
        </section>
        <section className="y-section">
          <h2 className="y-h3">Другие цифры</h2>
          <StatRow>
            <StatTile label="Стоимость гардероба" value="23 600 ₽" />
            <StatTile label="Средняя стоимость одной вещи" value="1 480 ₽" />
          </StatRow>
        </section>
      </Sheet>
    </Screen>
  );
}

export const ProfileAnalytics: Story = { name: 'Profile / Overview / Analytics', render: () => <ProfileScreen accounts={[sima, tina]} /> };
export const ProfileSingle: Story = { name: 'Profile / Overview / Single Account', render: () => <ProfileScreen accounts={[sima]} /> };
export const AccountsMulti: Story = { name: 'Profile / Accounts / Sheet / List', render: () => <ProfileScreen accounts={[sima, tina]} open="accounts" /> };
export const AccountsSingle: Story = { name: 'Profile / Accounts / Sheet / Single', render: () => <ProfileScreen accounts={[sima]} open="accounts" /> };
export const PeriodSheet: Story = { name: 'Profile / Analytics / Sheet / Period', render: () => <ProfileScreen accounts={[sima, tina]} open="period" /> };

/* ─── Вишлист, архив, создание образа, профиль ────────────────────────── */

const shoes = ["Nike Air Force 1 '07 Edge", 'Nike Ava Edge', 'Nike Ava Edge', 'Nike Ava Edge'];

export const Wishlist: Story = {
  parameters: { controls: { disable: true } },
  name: 'Wishlist / Items / Populated',
  render: () => (
    <Screen header={<Header type="large" title="Гардероб" />} bottom={<BottomNav active="wardrobe" fab />}>
      <SegmentControl value="wishlist" segments={[{ value: 'items', label: 'Вещи' }, { value: 'outfits', label: 'Образы' }, { value: 'wishlist', label: 'Вишлист' }]} />
      <Sticky>
        <div style={{ alignSelf: 'flex-start' }}>
          <SegmentControl size="S" value="items" segments={[{ value: 'items', label: 'Вещи' }, { value: 'outfits', label: 'Образы' }]} />
        </div>
      </Sticky>
      <Grid rowGap={24}>
        {shoes.map((n, i) => <ProductCard key={i} kind="shoe" name={n} price={i ? '14 300 ₽' : '10 400 ₽'} showLike={false} />)}
      </Grid>
    </Screen>
  ),
};

export const Archive: Story = {
  parameters: { controls: { disable: true } },
  name: 'Archive / Items / Populated',
  render: () => (
    <Screen header={<Header type="bar" titleChip="Архив вещей" />}>
      <Grid>
        <ItemCard kind="top" color="white" />
        <ItemCard kind="top" color="black" />
      </Grid>
    </Screen>
  ),
};

const creationSteps = (step: string) => (
  <SegmentControl size="S" value={step} segments={[{ value: 'items', icon: 'wardrobe' }, { value: 'canvas', icon: 'collage' }, { value: 'info', icon: 'info' }]} />
);

export const OutfitCriteria: Story = {
  parameters: { controls: { disable: true } },
  name: 'Outfit Creation / Criteria / Default',
  render: () => (
    <Screen header={<Header type="bar" center={creationSteps('info')} />} bottom={<BottomBar label="Создать образ" />}>
      <InputGroup>
        <Field label="Повод" value="Все" trailingIcon="chevron-up-down" />
        <Field label="Сезон" value="Все" trailingIcon="chevron-up-down" />
      </InputGroup>
      <section className="y-section">
        <h3 className="y-h3">Теги</h3>
        <ChipGroup wrap onAdd={() => {}} chips={['Тег #1', 'Тег #2', 'Тег #3', 'Тег #4', 'Тег #5', 'Тег #6'].map((label) => ({ label, removable: true }))} />
      </section>
    </Screen>
  ),
};

export const OutfitItems: Story = {
  parameters: { controls: { disable: true } },
  name: 'Outfit Creation / Item Selection / Ready to Continue',
  render: () => {
    const add = <span className="y-slot__add"><IconButton icon="plus" label="Добавить вещь" size="L" /></span>;
    return (
      <Screen
        header={<Header type="bar" center={<SegmentControl size="M" fit value="items" segments={[{ value: 'items', icon: 'wardrobe' }, { value: 'canvas', icon: 'collage' }, { value: 'info', icon: 'info' }]} />} actions={[{ icon: 'arrows-shuffle', label: 'Перемешать' }]} />}
        bottom={<BottomBar label="Далее" />}
        flush
      >
        {/* флоу: разделы в панели, выбранная вещь по центру, «+» справа, соседние выглядывают */}
        <div className="y-slots">
          <section className="y-slot"><h2 className="y-h2">Верх</h2><div className="y-slot__row"><span /><ItemCard kind="top" color="green" onRemove={() => {}} />{add}</div></section>
          <section className="y-slot"><h2 className="y-h2">Низ</h2><div className="y-slot__row">{add}</div></section>
          <section className="y-slot"><h2 className="y-h2">Обувь</h2><div className="y-slot__row"><ItemCard kind="shoe" color="beige" onRemove={() => {}} /><ItemCard kind="shoe" color="brown" onRemove={() => {}} />{add}</div></section>
        </div>
      </Screen>
    );
  },
};

export const ProfileEdit: Story = {
  parameters: { controls: { disable: true } },
  name: 'Profile / Edit / No Avatar',
  render: () => (
    <Screen header={<Header type="bar" title="Редактирование профиля" />}>
      <div style={{ display: 'grid', placeItems: 'center' }}><Avatar size="L" /></div>
      {/* флоу: поля ввода без подписей — имя введено, почта подсказкой */}
      <InputGroup>
        <Field label="Имя" input={{ defaultValue: 'Сима' }} />
        <Field label="sima@space.com" input={{ type: 'email' }} />
      </InputGroup>
      <InputGroup>
        <Field label="Пол" value="Женский" trailingIcon="chevron-up-down" />
        <Field label="Стиль" value="Кэжуал" trailingIcon="chevron-up-down" />
        <Field label="Год рождения" value="1991" trailingIcon="chevron-up-down" />
      </InputGroup>
    </Screen>
  ),
};

function PriceSheet() {
  const [v, setV] = useState<[number, number]>([0, 30000]);
  return (
    <Screen
      header={<Header type="search" query="Белые кроссовки" filters={[{ label: 'Сортировка' }, { label: 'Цена', selected: true }]} />}
      overlay={
        <Overlay>
          <Sheet title="Цена">
            <RangeSlider label="Цена" min={0} max={60000} value={v} onChange={setV} histogram={[2, 3, 6, 12, 18, 20, 17, 19, 22, 16, 10, 6, 4, 3, 2, 2, 3, 2, 1, 1]} />
          </Sheet>
        </Overlay>
      }
    >
      <Grid rowGap={16}>
        {shoes.map((n, i) => <ProductCard key={i} kind="shoe" name={n} price="14 300 ₽" />)}
      </Grid>
    </Screen>
  );
}

export const PriceFilter: Story = { name: 'Search / Results / Sheet / Price Filter', render: () => <PriceSheet /> };

/* ─── Шторки и диалоги в плавающей форме, состояния главной ───────────── */

export const DeleteAccount: Story = {
  name: 'Settings / Delete Account / Dialog / Confirmation',
  render: () => (
    <Screen
      header={<Header type="bar" title="Настройки" />}
      overlay={
        <Overlay>
          <Dialog tone="danger" title="Аккаунт будет удалён" description="Сима, твой аккаунт sima@space.com будет деактивирован." cancel="Отменить" confirm="Удалить">
            <p className="y-body y-text--secondary">Ты потеряешь:</p>
            <StatRow><StatTile size="L" label="Вещи" value={43} /><StatTile size="L" label="Образы" value={12} /><StatTile size="L" label="Вишлист" value={12} /></StatRow>
            <p className="y-body y-text--secondary">У тебя будет возможность восстановить аккаунт, войдя с тем же паролем в течение 14 дней.<br /><br />После этого все данные будут удалены навсегда.</p>
          </Dialog>
        </Overlay>
      }
    >
      <AccountCard account={sima} kind="settings" />
    </Screen>
  ),
};

export const ItemActions: Story = {
  name: 'Wardrobe / Items / Sheet / Item Actions',
  render: () => (
    <Screen
      header={<Header type="large" title="Гардероб" />}
      overlay={<Overlay><Sheet title="Название вещи"><List><ListItem icon="collage" label="Создать образ" /><ListItem icon="pen" label="Редактировать" /><ListItem icon="archive" label="Архивировать" /><ListItem icon="trash" label="Удалить" /></List></Sheet></Overlay>}
    >
      <Grid>{grid.map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>
    </Screen>
  ),
};

export const CountrySheet: Story = {
  name: 'Settings / Country / Sheet / Default',
  render: () => (
    <Screen
      header={<Header type="bar" title="Настройки" />}
      overlay={<Overlay><Sheet title="Страна"><InputBar size="L" placeholder="Поиск по странам" fieldIcon="search" /><List><ListItem type="radio" label="Россия" checked trailing={<Flag code="ru" />} /><ListItem type="radio" label="Беларусь" trailing={<Flag code="by" />} /><ListItem type="radio" label="Казахстан" trailing={<Flag code="kz" />} /><ListItem type="radio" label="Грузия" trailing={<Flag code="ge" />} /></List></Sheet></Overlay>}
    >
      <AccountCard account={sima} kind="settings" />
    </Screen>
  ),
};

export const RecommendationsEmpty: Story = {
  name: 'Outfits / Recommendations / Empty Wardrobe',
  render: () => (
    <Screen bottom={<BottomNav active="today" />} center>
      <EmptyState title="Полный шкаф, а надеть нечего?" description="Добавь больше вещей, чтобы ИИ смог тебе подбирать образы под погоду и повод" action={{ label: 'Добавить вещь', variant: 'primary' }} />
    </Screen>
  ),
};

export const CurrencySheet: Story = {
  name: 'Settings / Currency / Sheet / Default',
  render: () => (
    <Screen
      header={<Header type="bar" title="Настройки" />}
      overlay={<Overlay><Sheet title="Валюта"><List><ListItem type="radio" label="Российский рубль" checked trailing="₽ · RUB" /><ListItem type="radio" label="Белорусский рубль" trailing="Br · BYN" /><ListItem type="radio" label="Казахстанский тенге" trailing="₸ · KZT" /><ListItem type="radio" label="Доллар США" trailing="$ · USD" /></List></Sheet></Overlay>}
    >
      <AccountCard account={{ ...sima, photo: demoAvatar }} kind="settings" />
    </Screen>
  ),
};

/* ─── Добавлено по сверке DS 2.0 с экранами: подзаголовок шапки, диалог с одной кнопкой, поиск по фото ─── */

export const PasswordRecovery: Story = {
  name: 'Auth / Password Recovery',
  render: () => (
    <Screen header={<Header type="back" title="Восстановление пароля" subtitle="Введи почту, на которую зарегистрирован аккаунт, — пришлём ссылку для сброса пароля" />}>
      <InputGroup><Field label="E-mail" input={{ type: 'email', defaultValue: 'sima@space.com' }} /></InputGroup>
      <Button size="L" fullWidth>Отправить ссылку</Button>
    </Screen>
  ),
};

export const PasswordRecoverySent: Story = {
  name: 'Auth / Password Recovery / Dialog / Sent',
  render: () => (
    <Screen
      header={<Header type="back" title="Восстановление пароля" subtitle="Введи почту, на которую зарегистрирован аккаунт, — пришлём ссылку для сброса пароля" />}
      overlay={<Overlay><Dialog title="Готово!" description="Мы отправили ссылку для сброса пароля на sima@space.com" confirm="Ок!" /></Overlay>}
    >
      <InputGroup><Field label="E-mail" input={{ type: 'email', defaultValue: 'sima@space.com' }} /></InputGroup>
      <Button size="L" fullWidth>Отправить ссылку</Button>
    </Screen>
  ),
};

export const FirstItemPrompt: Story = {
  name: 'Onboarding / First Item Prompt',
  render: () => (
    <Screen header={<Header type="back" title="Добавь первую вещь" subtitle="Сфотографируй вещь — фон удалим сами" textAction={{ label: 'Пропустить' }} />}>
      <Row gap={7}>
        <PhotoTile source="gallery" />
        <PhotoTile source="camera" />
      </Row>
    </Screen>
  ),
};

export const PhotoCrop: Story = {
  name: 'Search / Photo / Crop',
  render: () => (
    <div style={{ position: 'relative', width: 'var(--screen-width)', height: 'var(--screen-height)', borderRadius: 56, overflow: 'hidden', background: `center / cover url("${demoPhoto}")`, display: 'flex', flexDirection: 'column' }}>
      {/* поверх фото всё белое: статус-бар, подсказка без подложки */}
      <StatusBar onPhoto />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 20, padding: '0 var(--screen-gutter) var(--space-20)' }}>
        <Hint tone="onPhoto" icon="fingers-pinch">Выдели вещь, которую ищем</Hint>
        <Button size="L" fullWidth>Найти похожие</Button>
      </div>
    </div>
  ),
};

export const PhotoResults: Story = {
  name: 'Search / Photo / Results',
  render: () => (
    <Screen header={<Header type="search" photo={demoPhoto} filters={[{ label: 'Сортировка' }, { label: 'Цена' }]} />} bottom={<BottomNav active="search" avatarSrc={demoAvatar} />}>
      <Grid rowGap={16}>
        {["Nike Air Force 1 '07 Edge", 'Nike Ava Edge', 'Adidas Samba', 'New Balance 550'].map((n, i) => (
          <ProductCard key={n} kind="shoe" name={n} price={`${[10400, 14300, 11900, 13500][i].toLocaleString('ru-RU')} ₽`} />
        ))}
      </Grid>
    </Screen>
  ),
};
