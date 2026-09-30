import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Header, Overlay, Sheet } from '.';
import { Button } from '../atoms';
import { onOverlay, unlessBare, Usage, UsageGrid } from '../docs/helpers';
import { ChipGroup, InputBar, List, ListItem, PhotoTile } from '../molecules';
import { Grid, Screen } from '../templates';
import { ItemCard } from '.';
import { Flag, type FlagCode } from '../atoms';

type Args = { title: string; description: string; type: 'modal' | 'panel'; footer: boolean; handle: boolean; content: 'actions' | 'chips' | 'photo' };

const content = {
  actions: <List><ListItem icon="ai" label="Создать образ" /><ListItem icon="pen" label="Редактировать" /><ListItem icon="archive" label="Архивировать" /><ListItem icon="trash" label="Удалить" /></List>,
  chips: <ChipGroup wrap chips={[{ label: 'Все', selected: true }, { label: 'Весна' }, { label: 'Лето' }, { label: 'Осень' }, { label: 'Зима' }]} />,
  photo: <><div style={{ display: 'flex', gap: 8 }}><PhotoTile source="gallery" /><PhotoTile source="camera" /></div><Button variant="destructive" fullWidth>Удалить фотографию</Button></>,
};

const meta: Meta<Args> = {
  title: 'Organisms/Sheet',
  tags: ['autodocs'],
  args: { title: 'Название вещи', description: '', type: 'modal', footer: false, handle: true, content: 'actions' },
  argTypes: { description: { control: 'text' }, type: { control: 'inline-radio', options: ['modal', 'panel'] }, content: { control: 'inline-radio', options: ['actions', 'chips', 'photo'] } },
  decorators: [unlessBare(onOverlay)],
  parameters: { docs: { description: { component: 'Bottom sheet. **Modal** — плавающая карточка: 8 от краёв экрана, радиус 48 на все углы (`--radius-overlay`, концентрично углу экрана), паддинг 8/20/20; хэндл 48×4 → 16 → H3 → 16 → слот Content → 16 → пара кнопок L через 7. **Panel** — панель деталей во всю ширину, 32 сверху, тень. `handle={false}` — без хэндла, контент на 20 от верха (панель выбора вещей); `onClose` — «×» Ghost S справа от заголовка вместо хэндла. `description` — абзац Body серым под заголовком: 16 от заголовка, 20 до контента (Валюта). Высокая модальная шторка не выше экрана, контент прокручивается. **Всё временное — sheet, а не новый экран.** Figma: `sheet` · Type, Footer, Show Handle, Show Close, Title, слот Content.' } } },
  render: ({ title, description, type, footer, handle, content: c }) => <Sheet title={title || undefined} description={description || undefined} type={type} handle={handle} footer={footer ? [{ label: 'Сбросить' }, { label: 'Применить' }] : undefined}>{content[c]}</Sheet>,
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

const currencies: [string, string, string][] = [['ru', 'Российский рубль', '₽ · RUB'], ['us', 'Доллар США', '$ · USD'], ['eu', 'Евро', '€ · EUR'], ['kz', 'Казахский тенге', '₸ · KZT'], ['by', 'Белорусский рубль', 'BYN']];

export const Description: Story = {
  name: 'С описанием',
  parameters: { controls: { disable: true }, docs: { description: { story: 'Settings / Currency `1371:43380`: пояснение под заголовком — Body серым, 12 от заголовка и 20 до списка; шторка ссылается на него через `aria-describedby`.' } } },
  render: () => (
    <Sheet title="Валюта" description="Цены пересчитываются по курсу ЦБ на 10 августа 2026 и помечаются как примерные. Сохранённая цена не меняется.">
      <List>{currencies.map(([code, label, trailing], k) => <ListItem key={code} type="radio" label={label} checked={k === 0} trailing={trailing} />)}</List>
    </Sheet>
  ),
};

/** Пресет «Действия»: Sheet + List из ListItem action. Отдельного ActionSheet нет — во флоу 9 таких шторок. */
const actions = {
  item: <List><ListItem icon="collage" label="Создать образ" /><ListItem icon="pen" label="Редактировать" /><ListItem icon="archive" label="Архивировать" /><ListItem icon="trash" label="Удалить" /></List>,
  wishlist: <List><ListItem icon="external-link" label="Перейти по ссылке" /><ListItem icon="collage" label="Создать образ" /><ListItem icon="bag-check" label="Переместить в гардероб" /><ListItem icon="pen" label="Редактировать" /><ListItem icon="trash" label="Удалить" /></List>,
  archive: <List><ListItem icon="undo" label="Вернуть в гардероб" /><ListItem icon="trash" label="Удалить" /></List>,
  trash: <List><ListItem icon="undo" label="Вернуть в гардероб" /><ListItem icon="trash" label="Удалить навсегда" /></List>,
  occasion: <List><ListItem icon="pen" label="Редактировать" /><ListItem icon="trash" label="Удалить навсегда" /></List>,
  add: <List><ListItem icon="wardrobe" label="Вещь" /><ListItem icon="collage" label="Образ" /></List>,
};

export const Actions: Story = {
  name: 'Действия',
  tags: ['bare'],
  parameters: { controls: { disable: true }, docs: { description: { story: 'Шторка действий — это `Sheet` с заголовком (имя вещи или повода) и `List` из `ListItem` action с иконкой 24; необратимое действие — последним. Отдельного компонента ActionSheet нет. Кадры: вещь `1371:37501`, `1371:43508`; вишлист `1371:40512`; архив `1371:37535`; корзина `1371:37565`; повод `1371:40430`, `1371:40451`, `1371:41135`; «Добавить в вишлист» `1371:40549`.' } } },
  render: () => (
    <UsageGrid min={393}>
      <Usage screen="Wardrobe / Item / Actions" note="1371:37501 · 1371:43508">{onOverlay(() => <Sheet title="Название вещи">{actions.item}</Sheet>)}</Usage>
      <Usage screen="Wishlist / Item / Actions" note="1371:40512">{onOverlay(() => <Sheet title="Название вещи">{actions.wishlist}</Sheet>)}</Usage>
      <Usage screen="Archive / Item / Actions" note="1371:37535">{onOverlay(() => <Sheet title="Название вещи">{actions.archive}</Sheet>)}</Usage>
      <Usage screen="Trash / Item / Actions" note="1371:37565">{onOverlay(() => <Sheet title="Название вещи">{actions.trash}</Sheet>)}</Usage>
      <Usage screen="Occasion / Actions" note="1371:40430 · 1371:40451 (в 1371:41135 — «Удалить»)">{onOverlay(() => <Sheet title="Повод образа">{actions.occasion}</Sheet>)}</Usage>
      <Usage screen="Wishlist / Add" note="1371:40549">{onOverlay(() => <Sheet title="Добавить в вишлист">{actions.add}</Sheet>)}</Usage>
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

const countries: [string, string, FlagCode?][] = [['ru', 'Россия', 'ru'], ['by', 'Беларусь', 'by'], ['kz', 'Казахстан', 'kz'], ['ge', 'Грузия', 'ge'], ['am', 'Армения', 'am'], ['az', 'Азербайджан'], ['uz', 'Узбекистан'], ['kg', 'Киргизия'], ['rs', 'Сербия'], ['me', 'Черногория'], ['tr', 'Турция', 'tr'], ['cy', 'Кипр'], ['ae', 'ОАЭ'], ['th', 'Таиланд'], ['de', 'Германия', 'de'], ['fr', 'Франция', 'fr'], ['it', 'Италия', 'it'], ['gb', 'Великобритания', 'gb'], ['us', 'США', 'us'], ['jp', 'Япония', 'jp'], ['cn', 'Китай', 'cn']];

function LongDemo() {
  const [open, setOpen] = useState(true);
  const [country, setCountry] = useState('ru');
  return (
    <Screen
      header={<Header type="large" title="Настройки" />}
      overlay={
        <Overlay open={open} onOpenChange={setOpen}>
          <Sheet title="Страна" description="Влияет на валюту и размерную сетку." footer={[{ label: 'Сбросить', onClick: () => setCountry('ru') }, { label: 'Сохранить и выйти', onClick: () => setOpen(false) }]}>
            <ChipGroup chips={[{ label: 'Все', selected: true }, { label: 'СНГ' }, { label: 'Европа' }, { label: 'Азия' }, { label: 'Ближний Восток' }, { label: 'Кавказ' }]} />
            <List>{countries.map(([code, label, flag]) => <ListItem key={code} type="radio" label={label} checked={country === code} onClick={() => setCountry(code)} trailing={flag && <Flag code={flag} />} />)}</List>
          </Sheet>
        </Overlay>
      }
    >
      <Button variant="tertiary" size="S" rightIcon="chevron-up-down" onClick={() => setOpen(true)} aria-haspopup="dialog">Страна</Button>
    </Screen>
  );
}

/** Синтетическое касание: pointerdown → шаги pointermove → pointerup (настоящую прокрутку пальцем проверяет CDP, см. PR #69). */
async function drag(target: Element, dy: number) {
  const r = target.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + Math.min(r.height / 2, 40);
  const at = (type: string, yy: number) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: yy }));
  at('pointerdown', y);
  for (let i = 1; i <= 10; i++) { at('pointermove', y + (dy * i) / 10); await new Promise((f) => setTimeout(f, 16)); }
  at('pointerup', y + dy);
}

/** Длинная шторка: шапка и футер закреплены, прокручивается только тело; верх — под статус-баром + 8. */
export const Long: Story = {
  name: 'Длинная шторка',
  tags: ['bare'],
  parameters: { controls: { disable: true }, docs: { description: { story: 'Высокая шторка не выше «экран − статус-бар − 8» (`--sheet-top-gap`). Хэндл, заголовок и футер закреплены и не сжимаются; прокручивается только тело `.y-sheet__body` — пальцем (`touch-action: pan-y`), колесом и клавиатурой, без прокрутки фона (`overscroll-behavior: contain`). Смахнуть шторку можно с шапки и футера, а из тела — только когда оно прокручено к началу и палец идёт вниз. Кнопки футера — равные половины; не влезает подпись — одна под другой (при 320).' } } },
  render: () => <LongDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const sheet = await canvas.findByRole('dialog', { name: 'Страна' });
    const body = sheet.querySelector<HTMLElement>('.y-sheet__body')!;
    await step('Геометрия: верх под статус-баром, ничего не сжато, футер виден', async () => {
      const screen = canvasElement.querySelector('.y-screen')!.getBoundingClientRect();
      const r = sheet.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(sheet.parentElement!).paddingTop);
      await expect(Math.round(r.top - screen.top)).toBeGreaterThanOrEqual(Math.round(gap));
      await expect(sheet.querySelector('.y-sheet__handle')!.getBoundingClientRect().height).toBe(4);
      await expect(sheet.querySelector('.y-chip-group--scroll')!.getBoundingClientRect().height).toBeGreaterThanOrEqual(40);
      const f = sheet.querySelector('.y-sheet__footer')!.getBoundingClientRect();
      await expect(f.bottom).toBeLessThanOrEqual(r.bottom);
      await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    });
    await step('Тело прокручено: палец вниз не тянет шторку, футер на месте', async () => {
      const footer = sheet.querySelector('.y-sheet__footer')!.getBoundingClientRect().top;
      body.scrollTop = 300;
      await expect(body.scrollTop).toBeGreaterThan(0);
      await expect(sheet.querySelector('.y-sheet__footer')!.getBoundingClientRect().top).toBe(footer);
      await drag(body.querySelector('.y-list-item')!, 200);
      await expect(sheet.style.transform).toBe('');
      await expect(canvas.getByRole('dialog', { name: 'Страна' })).toBeInTheDocument();
      body.scrollTop = 0;
    });
    await step('Из верха тела палец вверх — прокрутка, не шторка', async () => {
      await drag(body.querySelector('.y-list-item')!, -150);
      await expect(sheet.style.transform).toBe('');
    });
    await step('Из верха тела палец вниз — смахивание закрывает', async () => {
      await drag(body.querySelector('.y-list-item')!, sheet.offsetHeight * 0.6);
      await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    });
    await step('Открыть снова', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Страна' }));
      await canvas.findByRole('dialog', { name: 'Страна' });
    });
  },
};
