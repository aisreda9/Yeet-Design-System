import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { Avatar, Icon } from '../atoms';
import { type Account, AvatarStack, BarChart, Carousel, ChipGroup, Field, InputGroup, List, ListItem, StatRow, StatTile, UsageMeter } from '../molecules';
import { AccountsSheet, BottomNav, Header, ItemCard, OutfitCollage, Overlay, Sheet } from '../organisms';
import { Row, Screen, Stack } from '../templates';
import { demoAvatar } from '../docs/helpers';
import { motionMs } from '../utils/gesture';
import { sima, tina } from './data';
import { SCROLLED_LIST, useScrolled } from './scroll';
import { ChipSheet, PhotoSheet } from './sheets';
import './pages.css';

/* Раздел: профиль — аналитика гардероба, аккаунты, редактирование. Id историй — pages-экраны-флоу--<slug> (flow-diff). */
const meta = {
  title: 'Pages/Экраны флоу',
  parameters: {
    layout: 'centered', controls: { disable: true }, options: { showPanel: false },
    docs: { description: { component: 'Экраны флоу, собранные **только** из компонентов системы. Названия — как в Figma (`Раздел / Экран / Состояние`).' } },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

type ProfileOverlay = 'accounts' | 'period' | undefined;

/** Цена образа или вещи в плашке коллажа: сумма H2, под ней подпись. */
const price = (sum: string, caption: string) => (
  <><Stack gap={0}><span className="y-h2">{sum}</span><span className="y-caption y-text--secondary">{caption}</span></Stack><Icon name="chevron-right" /></>
);

/** Профиль (Figma: Profile / Overview / Analytics): аккаунты и период над панелью со статистикой. */
function ProfileScreen({ accounts, open: initial, scrollTo = 0 }: { accounts: Account[]; open?: ProfileOverlay; /** Прокрутка: заголовок уехал, закреплён только статус-бар (#170). */ scrollTo?: number }) {
  const [open, setOpen] = useState<ProfileOverlay>(initial);
  const ref = useScrolled(scrollTo);
  const [period, setPeriod] = useState('За всё время');
  const overlay =
    open === 'accounts' ? <AccountsSheet accounts={accounts} onSwitch={() => setOpen(undefined)} onAdd={() => setOpen(undefined)} onEdit={() => setOpen(undefined)} onSettings={() => setOpen(undefined)} /> :
    open === 'period' ? <Sheet title="Статистика"><ChipGroup wrap onToggle={(l) => { setPeriod(l); window.setTimeout(() => setOpen(undefined), motionMs('--motion-select')); /* выбор успевает отрисоваться, потом шторка уходит */ }} chips={['За всё время', 'За полгода', 'За месяц', 'За неделю'].map((label) => ({ label, selected: label === period }))} /></Sheet> : undefined;
  return (
    <Screen header={<Header type="large" title="Профиль" />} bottom={<BottomNav active="profile" avatarSrc={demoAvatar} />} overlay={overlay && <Overlay onClose={() => setOpen(undefined)}>{overlay}</Overlay>} scrollRef={ref} flush>
      <div className="y-gutter y-profile-bar">
        <Row gap={0} align="center" justify="space-between">
          <AvatarStack accounts={accounts} onOpen={() => setOpen('accounts')} onAdd={() => setOpen('accounts')} />
          <ChipGroup wrap chips={[{ label: period, dropdown: true }]} onToggle={() => setOpen('period')} />
        </Row>
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
            footer={price('120 640 ₽', '4 вещи')}
          />
        </section>
        {/* порядок как во флоу: цвета → давно не надевалось → сезоны → лучшая инвестиция → другие цифры */}
        <BarChart bars={[{ label: 'Синий', color: 'blue', value: 13 }, { label: 'Чёрный', color: 'black', value: 62 }, { label: 'Оранжевый', color: 'orange', value: 25 }]} />
        <Carousel title="Давно не надевалось" itemWidth={173}>
          <ItemCard kind="top" color="black" label="20 дней" />
          <ItemCard kind="top" color="white" label="1 день" />
          <ItemCard kind="shoe" color="brown" label="1 день" />
        </Carousel>
        <BarChart bars={[{ label: 'Весна', icon: 'flower', value: 20 }, { label: 'Лето', icon: 'sun', value: 70 }, { label: 'Осень', icon: 'leaf', value: 8 }, { label: 'Зима', icon: 'snowflake', value: 1 }]} />
        <section className="y-section">
          <h2 className="y-h3">Лучшая инвестиция</h2>
          <OutfitCollage label="Аксессуары" items={[{ kind: 'container', x: 50, y: 42, size: 180, color: 'black' }]} footer={price('32 640 ₽', '5 образов')} />
        </section>
        {/* флоу: высокие карточки 171 лентой, третья выглядывает справа */}
        <Carousel title="Другие цифры" itemWidth={171} className="y-profile-figures">
          <StatTile label="Стоимость гардероба" value="23 600 ₽" />
          <StatTile label="Средняя стоимость одной вещи" value="1 480 ₽" />
          <StatTile label="Средняя стоимость образа" value="5 900 ₽" />
        </Carousel>
      </Sheet>
    </Screen>
  );
}

export const ProfileAnalytics: Story = { name: 'Profile / Overview / Analytics', render: () => <ProfileScreen accounts={[sima, tina]} /> };
/** Прокрутка как в Figma `1205:21115`: заголовок «Чаще всего надевалось» на y82 (#216, строка 22). */
const PROFILE_SCROLLED = SCROLLED_LIST + 120;
export const ProfileAnalyticsScrolled: Story = { name: 'Profile / Overview / Analytics / Scrolled', render: () => <ProfileScreen accounts={[sima, tina]} scrollTo={PROFILE_SCROLLED} /> };
export const ProfileSingle: Story = { name: 'Profile / Overview / Single Account', render: () => <ProfileScreen accounts={[sima]} /> };
export const AccountsMulti: Story = { name: 'Profile / Accounts / Sheet / List', render: () => <ProfileScreen accounts={[sima, tina]} open="accounts" /> };
export const AccountsSingle: Story = { name: 'Profile / Accounts / Sheet / Single', render: () => <ProfileScreen accounts={[sima]} open="accounts" /> };
export const PeriodSheet: Story = { name: 'Profile / Analytics / Sheet / Period', render: () => <ProfileScreen accounts={[sima, tina]} open="period" /> };

/** Редактирование профиля (Figma `Profile / Edit`): без фото — камера в круге, с фото — снимок. */
function ProfileEditScreen({ photo, overlay }: { photo?: string; overlay?: ReactNode }) {
  return (
    <Screen header={<Header type="bar" title="Редактирование профиля" />} overlay={overlay && <Overlay>{overlay}</Overlay>}>
      <Row justify="center"><Avatar size="L" src={photo} /></Row>
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
  );
}

export const ProfileEdit: Story = { name: 'Profile / Edit / No Avatar', render: () => <ProfileEditScreen /> };
export const ProfileEditAvatar: Story = { name: 'Profile / Edit / Avatar Added', render: () => <ProfileEditScreen photo={demoAvatar} /> };

/* ─── Профиль: шторки редактирования (#30) ─────────────────────────── */

const years = Array.from({ length: 10 }, (_, i) => String(1991 + i));

export const BirthYearSheet: Story = {
  name: 'Profile / Edit / Sheet / Birth Year',
  render: () => (
    <ProfileEditScreen photo={demoAvatar} overlay={<Sheet title="Год рождения"><List>{years.map((y) => <ListItem key={y} type="radio" label={y} checked={y === '1991'} />)}</List></Sheet>} />
  ),
};

/** Фото профиля: галерея или камера, у готового фото — ещё «Удалить фотографию». */
export const AvatarAddSheet: Story = { name: 'Profile / Avatar / Sheet / Add', render: () => <ProfileEditScreen overlay={<PhotoSheet label="Фото профиля" />} /> };
export const AvatarReplaceSheet: Story = { name: 'Profile / Avatar / Sheet / Replace', render: () => <ProfileEditScreen photo={demoAvatar} overlay={<PhotoSheet label="Фото профиля" replace />} /> };

/** Пол и стиль: выбор чипсами применяется сразу, выбрано текущее значение поля (Figma `1147:3502`, `1173:14403`). */
export const ProfileGenderSheet: Story = {
  name: 'Profile / Edit / Sheet / Gender',
  tags: ['figma:1371-40486'],
  render: () => <ProfileEditScreen photo={demoAvatar} overlay={<ChipSheet title="Пол" chips={['Женский', 'Мужской', 'Унисекс']} />} />,
};

export const ProfileStyleSheet: Story = {
  name: 'Profile / Edit / Sheet / Style',
  tags: ['figma:1371-40498'],
  render: () => <ProfileEditScreen photo={demoAvatar} overlay={<ChipSheet title="Стиль" chips={['Кэжуал', 'Деловой', 'Тренди', 'Минимал']} />} />,
};
