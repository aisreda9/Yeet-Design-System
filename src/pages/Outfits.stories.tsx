import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Stamp } from '../atoms';
import { EmptyState } from '../molecules';
import { BottomNav, Header, OutfitPager, type PagerLook, WeatherCard } from '../organisms';
import { Screen } from '../templates';
import './pages.css';

/* Раздел: главная — образы на каждый день. Id историй — pages-экраны-флоу--<slug> (flow-diff). */
const meta = {
  title: 'Pages/Экраны флоу',
  parameters: {
    layout: 'centered', controls: { disable: true }, options: { showPanel: false },
    docs: { description: { component: 'Экраны флоу, собранные **только** из компонентов системы. Названия — как в Figma (`Раздел / Экран / Состояние`).' } },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** Образы дня: предыдущий, текущий и следующий — стопка `OutfitPager`, превью 96 сверху и снизу. */
const todayLooks: PagerLook[] = [
  { id: 'yellow', name: 'жёлтый топ', items: [{ kind: 'top', x: 40, y: 52, size: 160, color: 'yellow' }, { kind: 'bottom', x: 66, y: 42, size: 150, color: 'green' }] },
  { id: 'green', name: 'зелёный деним', items: [{ kind: 'top', x: 68, y: 34, size: 120, color: 'green' }, { kind: 'bottom', x: 30, y: 60, size: 150, color: 'green' }, { kind: 'accessories', x: 34, y: 22, size: 64 }, { kind: 'shoe', x: 72, y: 74, size: 80, color: 'brown' }] },
  { id: 'black', name: 'чёрная юбка', items: [{ kind: 'bottom', x: 34, y: 56, size: 150, color: 'black' }, { kind: 'top', x: 62, y: 40, size: 130, color: 'brown' }, { kind: 'container', x: 72, y: 70, size: 90, color: 'black' }] },
];

/**
 * Главная (Figma `1371:36589`): стопка образов со свайпом, погода поверх, штамп «Надеть».
 * `weather="rain"` — предупреждение о дожде (`1371:36745`); `worn` — образ надет, штамп сжат в «отменить» (`1371:36823`).
 */
function TodayScreen({ weather, worn: initialWorn = false }: { weather?: 'rain'; worn?: boolean }) {
  const [index, setIndex] = useState(1);
  const [worn, setWorn] = useState(initialWorn);
  const rain = weather === 'rain' || initialWorn; // «Надето» в макете — в дождливый день
  return (
    <Screen header={<Header type="large" title="Твои образы" accent={{ label: 'на каждый день' }} />} bottom={<BottomNav active="today" />}>
      <OutfitPager
        looks={todayLooks}
        index={index}
        onIndexChange={setIndex}
        weather={rain
          ? <WeatherCard temperature="20°" weather="sunny" description="Облачно, ветер 14 км/ч" alert="Через 1 час дождь, захвати зонт" tilt />
          : <WeatherCard temperature="20°" description="Солнечно, ветер 14 км/ч" tilt />}
        stamp={<Stamp label="Надеть" done={worn} onClick={() => setWorn((w) => !w)} />}
      />
    </Screen>
  );
}

export const Today: Story = { name: 'Outfits / Everyday / Sunny', render: () => <TodayScreen /> };
export const TodayRain: Story = { name: 'Outfits / Everyday / Rain Alert', render: () => <TodayScreen weather="rain" /> };
export const TodayWorn: Story = { name: 'Outfits / Everyday / Wear Action Active', render: () => <TodayScreen worn /> };

export const RecommendationsEmpty: Story = {
  name: 'Outfits / Recommendations / Empty Wardrobe',
  render: () => (
    <Screen bottom={<BottomNav active="today" />} center>
      <EmptyState title="Полный шкаф, а надеть нечего?" description="Добавь больше вещей, чтобы ИИ смог тебе подбирать образы под погоду и повод" action={{ label: 'Добавить вещь', variant: 'primary' }} />
    </Screen>
  ),
};
