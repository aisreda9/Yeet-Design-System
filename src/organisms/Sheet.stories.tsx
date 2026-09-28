import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sheet } from '.';
import { Button } from '../atoms';
import { onOverlay, unlessBare, Usage, UsageGrid } from '../docs/helpers';
import { ChipGroup, InputBar, List, ListItem, PhotoTile } from '../molecules';
import { Grid } from '../templates';
import { ItemCard } from '.';
import { Flag } from '../atoms';

type Args = { title: string; type: 'modal' | 'panel'; footer: boolean; handle: boolean; content: 'actions' | 'chips' | 'photo' };

const content = {
  actions: <List><ListItem icon="ai" label="Создать образ" /><ListItem icon="pen" label="Редактировать" /><ListItem icon="archive" label="Архивировать" /><ListItem icon="trash" label="Удалить" /></List>,
  chips: <ChipGroup wrap chips={[{ label: 'Все', selected: true }, { label: 'Весна' }, { label: 'Лето' }, { label: 'Осень' }, { label: 'Зима' }]} />,
  photo: <><div style={{ display: 'flex', gap: 8 }}><PhotoTile source="gallery" /><PhotoTile source="camera" /></div><Button variant="destructive" fullWidth>Удалить фотографию</Button></>,
};

const meta: Meta<Args> = {
  title: 'Organisms/Sheet',
  tags: ['autodocs'],
  args: { title: 'Название вещи', type: 'modal', footer: false, handle: true, content: 'actions' },
  argTypes: { type: { control: 'inline-radio', options: ['modal', 'panel'] }, content: { control: 'inline-radio', options: ['actions', 'chips', 'photo'] } },
  decorators: [unlessBare(onOverlay)],
  parameters: { docs: { description: { component: 'Bottom sheet. **Modal** — плавающая карточка: 8 от краёв экрана, радиус 32 сверху и 48 снизу (концентрично углу экрана), паддинг 8/20/20; хэндл 48×4 → 16 → H3 → 12 → слот Content → 16 → пара кнопок L через 7. **Panel** — панель деталей во всю ширину, 32 сверху, тень. `handle={false}` — без хэндла, контент на 20 от верха (панель выбора вещей); `onClose` — «×» Ghost S справа от заголовка вместо хэндла. Высокая модальная шторка не выше экрана, контент прокручивается. **Всё временное — sheet, а не новый экран.** Figma: `sheet` · Type, Footer, Show Handle, Show Close, Title, слот Content.' } } },
  render: ({ title, type, footer, handle, content: c }) => <Sheet title={title || undefined} type={type} handle={handle} footer={footer ? [{ label: 'Сбросить' }, { label: 'Применить' }] : undefined}>{content[c]}</Sheet>,
};
export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={393}>
      <Usage screen="Filter" note="сезон">{onOverlay(() => <Sheet title="Сезон">{content.chips}</Sheet>)}</Usage>
      <Usage screen="Picker" note="с парой кнопок">{onOverlay(() => <Sheet title="Категория" footer={[{ label: 'Сбросить' }, { label: 'Применить' }]}><List><ListItem type="expandable" icon="outerwear" label="Верхняя одежда" /><ListItem type="expandable" icon="top" label="Верх" expanded /></List></Sheet>)}</Usage>
      <Usage screen="Search" note="страна">{onOverlay(() => <Sheet title="Страна"><InputBar placeholder="Поиск по странам" fieldIcon="search" /><List><ListItem type="radio" label="Россия" checked trailing={<Flag code="ru" />} /><ListItem type="radio" label="Беларусь" trailing={<Flag code="by" />} /></List></Sheet>)}</Usage>
      <Usage screen="Outfit Creation / Item Filter" note="с крестиком, без хэндла">{onOverlay(() => <Sheet title="Низ" onClose={() => {}} footer={[{ label: 'Очистить' }, { label: 'Использовать' }]}><ChipGroup chips={[{ label: 'Все' }, { label: 'Джинсы', selected: true }, { label: 'Брюки' }, { label: 'Легинсы' }]} /><Grid><ItemCard kind="bottom" color="green" selected /><ItemCard kind="bottom" color="green" selected /></Grid></Sheet>)}</Usage>
      <Usage screen="Outfit Creation / Item Selection" note="панель без хэндла (Show Handle=false)"><div style={{ width: 393, paddingTop: 24 }}><Sheet type="panel" title="Гардероб" handle={false}><ChipGroup chips={[{ label: 'Категория · 2', selected: true, dropdown: true }, { label: 'Зима', selected: true, dropdown: true }]} /></Sheet></div></Usage>
      <Usage screen="Item Details" note="панель деталей"><div style={{ width: 393, paddingTop: 24 }}><Sheet type="panel" title="Сумка"><p className="y-body y-text--secondary">10 000 ₽ · Аксессуары · Черный · Все сезоны</p></Sheet></div></Usage>
    </UsageGrid>
  ),
};
