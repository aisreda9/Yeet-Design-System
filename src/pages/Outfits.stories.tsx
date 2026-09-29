import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stamp } from '../atoms';
import { EmptyState } from '../molecules';
import { BottomNav, Header, OutfitCollage, OutfitThumbnail, WeatherCard } from '../organisms';
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

export const Today: Story = {
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

export const RecommendationsEmpty: Story = {
  name: 'Outfits / Recommendations / Empty Wardrobe',
  render: () => (
    <Screen bottom={<BottomNav active="today" />} center>
      <EmptyState title="Полный шкаф, а надеть нечего?" description="Добавь больше вещей, чтобы ИИ смог тебе подбирать образы под погоду и повод" action={{ label: 'Добавить вещь', variant: 'primary' }} />
    </Screen>
  ),
};
