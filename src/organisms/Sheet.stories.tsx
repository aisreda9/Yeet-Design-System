import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Header, Overlay, Sheet } from '.';
import { Button } from '../atoms';
import { onOverlay, unlessBare, Usage, UsageGrid } from '../docs/helpers';
import { ChipGroup, InputBar, List, ListItem, PhotoTile } from '../molecules';
import { Grid, Screen } from '../templates';
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

function KeyboardDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Screen
      header={<Header type="large" title="Гардероб" />}
      overlay={<Overlay open={open} onOpenChange={setOpen}><Sheet title="Сезон" footer={[{ label: 'Сбросить', onClick: () => setOpen(false) }, { label: 'Применить', onClick: () => setOpen(false) }]}>{content.chips}</Sheet></Overlay>}
    >
      <Button variant="tertiary" size="S" rightIcon="chevron-up-down" onClick={() => setOpen(true)} aria-haspopup="dialog">Сезон</Button>
    </Screen>
  );
}

/** Модальность с клавиатуры: фокус в шторку, Tab по кругу внутри, фон inert, Escape закрывает с анимацией ухода, фокус возвращается. */
export const Keyboard: Story = {
  name: 'Клавиатура',
  tags: ['bare'],
  parameters: { controls: { disable: true }, docs: { description: { story: '`<Overlay open onOpenChange>`: при открытии фокус на первом интерактивном элементе шторки, Tab и Shift+Tab не уходят за шторку, фон `inert`, Escape и тап по затемнению закрывают с анимацией ухода, фокус возвращается на кнопку, открывшую шторку.' } } },
  render: () => <KeyboardDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const opener = canvas.getByRole('button', { name: 'Сезон' });
    await step('Открыть: фокус в шторке, фон inert', async () => {
      await userEvent.click(opener);
      const sheet = await canvas.findByRole('dialog', { name: 'Сезон' });
      await expect(sheet).toHaveAttribute('aria-modal', 'true');
      await waitFor(() => expect(sheet).toContainElement(document.activeElement as HTMLElement));
      await expect(canvasElement.querySelector('.y-screen__content')).toHaveProperty('inert', true);
    });
    await step('Tab и Shift+Tab не уходят за шторку', async () => {
      const sheet = canvas.getByRole('dialog', { name: 'Сезон' });
      for (let i = 0; i < 8; i++) {
        await userEvent.tab();
        await expect(sheet).toContainElement(document.activeElement as HTMLElement);
      }
      for (let i = 0; i < 8; i++) {
        await userEvent.tab({ shift: true });
        await expect(sheet).toContainElement(document.activeElement as HTMLElement);
      }
    });
    await step('Escape закрывает, фокус возвращается', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
      await expect(opener).toHaveFocus();
      await expect(canvasElement.querySelector('.y-screen__content')).toHaveProperty('inert', false);
    });
  },
};
