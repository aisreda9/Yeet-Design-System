import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sheet } from '.';
import { Button } from '../atoms';
import { onOverlay, unlessBare, Usage, UsageGrid } from '../docs/helpers';
import { ChipGroup, InputBar, List, ListItem, PhotoTile } from '../molecules';

type Args = { title: string; type: 'modal' | 'panel'; footer: boolean; content: 'actions' | 'chips' | 'photo' };

const content = {
  actions: <List><ListItem icon="ai" label="Создать образ" /><ListItem icon="pen" label="Редактировать" /><ListItem icon="archive" label="Архивировать" /><ListItem icon="trash" label="Удалить" /></List>,
  chips: <ChipGroup wrap chips={[{ label: 'Все', selected: true }, { label: 'Весна' }, { label: 'Лето' }, { label: 'Осень' }, { label: 'Зима' }]} />,
  photo: <><div style={{ display: 'flex', gap: 8 }}><PhotoTile source="gallery" /><PhotoTile source="camera" /></div><Button variant="destructive" fullWidth>Удалить фотографию</Button></>,
};

const meta: Meta<Args> = {
  title: 'Organisms/Sheet',
  tags: ['autodocs'],
  args: { title: 'Название вещи', type: 'modal', footer: false, content: 'actions' },
  argTypes: { type: { control: 'inline-radio', options: ['modal', 'panel'] }, content: { control: 'inline-radio', options: ['actions', 'chips', 'photo'] } },
  decorators: [unlessBare(onOverlay)],
  parameters: { docs: { description: { component: 'Bottom sheet: хэндл 48×4 → H3 → слот Content → пара кнопок L (Tertiary + Primary). Паддинг 8/20/20, gap 20, радиус 32 сверху. **Всё временное — sheet, а не новый экран.** Figma: `sheet` · Type, Footer, Title, слот Content.' } } },
  render: ({ title, type, footer, content: c }) => <Sheet title={title || undefined} type={type} footer={footer ? [{ label: 'Сбросить' }, { label: 'Применить' }] : undefined}>{content[c]}</Sheet>,
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
      <Usage screen="Search" note="страна">{onOverlay(() => <Sheet title="Страна"><InputBar placeholder="Поиск по странам" fieldIcon="search" /><List><ListItem type="radio" label="Россия" checked trailing="🇷🇺" /><ListItem type="radio" label="Грузия" trailing="🇬🇪" /></List></Sheet>)}</Usage>
      <Usage screen="Item Details" note="панель деталей"><div style={{ width: 393, paddingTop: 24 }}><Sheet type="panel" title="Сумка"><p className="y-body y-text--secondary">10 000 ₽ · Аксессуары · Черный · Все сезоны</p></Sheet></div></Usage>
    </UsageGrid>
  ),
};
