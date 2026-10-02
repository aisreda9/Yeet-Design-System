import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Stamp } from '../atoms';
import { type Chip, ChipGroup, EmptyState } from '../molecules';
import { BottomNav, Header, OutfitPager, Overlay, type PagerLook, Sheet, WeatherCard } from '../organisms';
import { Screen } from '../templates';
import { OCCASION_PLACEHOLDER, occasions as occasionChips } from './sheets';
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

/** Образы дня: предыдущий, текущий и следующий — стопка `OutfitPager` от шапки до таб-бара (превью 96 при 393 × 852). */
const todayLooks: PagerLook[] = [
  { id: 'yellow', name: 'жёлтый топ', items: [{ kind: 'top', x: 40, y: 52, size: 160, color: 'yellow' }, { kind: 'bottom', x: 66, y: 42, size: 150, color: 'green' }] },
  { id: 'green', name: 'зелёный деним', items: [{ kind: 'top', x: 68, y: 34, size: 120, color: 'green' }, { kind: 'bottom', x: 30, y: 60, size: 150, color: 'green' }, { kind: 'accessories', x: 34, y: 22, size: 64 }, { kind: 'shoe', x: 72, y: 74, size: 80, color: 'brown' }] },
  { id: 'black', name: 'чёрная юбка', items: [{ kind: 'bottom', x: 34, y: 56, size: 150, color: 'black' }, { kind: 'top', x: 62, y: 40, size: 130, color: 'brown' }, { kind: 'container', x: 72, y: 70, size: 90, color: 'black' }] },
];

/**
 * Главная (Figma `1371:36589`): стопка образов со свайпом, погода поверх, штамп «Надеть».
 * `weather="rain"` — предупреждение о дожде (`1371:36745`); `worn` — образ надет, штамп сжат в «отменить» (`1371:36823`);
 * `occasions` — открыта шторка «Повод» из акцента шапки (DS 0.2 `1173:14091` / `1144:3546`, их кадры в New App (Raw) — `1371:43786` / `1371:43810`,
 *   теги истории: coverage сверяет теги только с кадрами Raw): чипсы с «+», «Все» выбран, свой повод с ×, под ней дождливый день.
 */
function TodayScreen({ weather, worn: initialWorn = false, occasions = false, customName }: {
  weather?: 'rain';
  worn?: boolean;
  occasions?: boolean;
  /** Шторка «Повод» с чипсом-полем своего повода вместо «Кастомный»: `''` — пустое (`1174:15483`), текст — введён (`1174:15648`). */
  customName?: string;
}) {
  const [occasionOpen, setOccasionOpen] = useState(occasions || customName !== undefined);
  // В шторке по умолчанию выбран «Все», а в шапке — повод дня
  const [occasion, setOccasion] = useState('Все');
  const [custom, setCustom] = useState<Chip[]>(customName === undefined ? [{ label: 'Кастомный', removable: true }] : [{ label: customName, value: 'new', editing: true, removable: true, placeholder: OCCASION_PLACEHOLDER }]);
  const [index, setIndex] = useState(1);
  const [worn, setWorn] = useState(initialWorn);
  const rain = weather === 'rain' || initialWorn || occasions || customName !== undefined; // «Надето» и выбор повода в макете — в дождливый день
  const pick = (o: string) => { setOccasion(o); setOccasionOpen(false); };
  const addCustom = () => setCustom((cur) => (cur.some((c) => c.editing) ? cur : [...cur, { label: '', value: 'new', editing: true, removable: true, placeholder: OCCASION_PLACEHOLDER }]));
  const editCustom = (v: string) => setCustom((cur) => cur.map((c) => (c.editing ? { ...c, label: v } : c)));
  const doneCustom = (v: string) => setCustom((cur) => cur.flatMap((c) => (c.editing ? (v.trim() ? [{ label: v.trim(), removable: true }] : []) : [c])));
  const removeCustom = (v: string) => {
    setCustom((cur) => cur.filter((c) => (c.value ?? c.label) !== v));
    if (v === occasion) setOccasion('Все');
  };
  return (
    <Screen
      header={<Header type="large" title="Твои образы" accent={{ label: (occasion === 'Все' ? 'На каждый день' : occasion).toLowerCase(), onClick: () => setOccasionOpen(true) }} />}
      bottom={<BottomNav active="today" />}
      overlay={(
        <Overlay open={occasionOpen} onOpenChange={setOccasionOpen}>
          <Sheet title="Повод">
            <ChipGroup
              wrap
              aria-label="Повод"
              chips={[...occasionChips.map((label) => ({ label, selected: label === occasion })), ...custom.map((c) => ({ ...c, selected: !c.editing && c.label === occasion }))]}
              onToggle={pick}
              onRemove={removeCustom}
              onAdd={addCustom}
              onEdit={editCustom}
              onEditDone={doneCustom}
            />
          </Sheet>
        </Overlay>
      )}
    >
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
export const TodayOccasions: Story = { name: 'Outfits / Everyday / Occasion Selector Open', tags: ['figma:1371-43786', 'figma:1371-43810'], render: () => <TodayScreen occasions /> };
/** Свой повод: «+» в шторке добавил чипс-поле с × (плейсхолдер «Название»); клавиатура — системная, в истории её нет. */
export const TodayCustomOccasionEmpty: Story = { name: 'Outfits / Everyday / Sheet / Custom Occasion Name Empty', tags: ['figma:1371-43828'], render: () => <TodayScreen customName="" /> };
export const TodayCustomOccasionEntered: Story = { name: 'Outfits / Everyday / Sheet / Custom Occasion Name Entered', tags: ['figma:1371-43855'], render: () => <TodayScreen customName="Кастом" /> };

export const RecommendationsEmpty: Story = {
  name: 'Outfits / Recommendations / Empty Wardrobe',
  render: () => (
    <Screen bottom={<BottomNav active="today" />} end>
      {/* флоу 1173:19455: блок внизу, над таб-баром; неразрывный пробел — «а» переносится вместе с «надеть» */}
      <div className="y-recommendations-empty">
        <EmptyState title={'Полный шкаф, а\u00a0надеть нечего?'} description="Добавь больше вещей, чтобы ИИ смог тебе подбирать образы под погоду и повод" action={{ label: 'Добавить вещь', variant: 'primary' }} />
      </div>
    </Screen>
  ),
};
