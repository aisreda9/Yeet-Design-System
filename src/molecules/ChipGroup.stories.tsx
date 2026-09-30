import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import { ChipGroup, type Chip } from '.';
import { onOverlay, unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';
import { ItemCard, Sheet } from '../organisms';
import { Grid } from '../templates';

const meta = {
  title: 'Molecules/ChipGroup',
  component: ChipGroup,
  tags: ['autodocs'],
  args: { wrap: true, chips: [{ label: 'Все', selected: true }, { label: 'Весна' }, { label: 'Лето' }, { label: 'Осень' }, { label: 'Зима' }] },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: 'Чипсы — Button S: невыбранный Tertiary, выбранный Soft. `removable` — крестик, `dropdown` — фильтр с ⌄ (отступ справа 12, иконка 20), `colorDot` — свотч 16, `editing` — чипс-поле для своего повода или тега (плейсхолдер серым), `onAdd` — кнопка «+» 40 (IconButton Primary S, иконка 20), как высота чипса. Figma: `chip-group` · Wrap, слот; `chip` · State (Default / Editing). С `onToggle` чипс — переключатель (`aria-pressed`), крестик — отдельная кнопка «Удалить: …» (`onRemove`), идентичность — `value` (по умолчанию `label`). Выбор можно отдать группе: `defaultValue` (uncontrolled) или `value` + `onValueChange` (controlled), `multiple={false}` — одиночный.' } } },
} satisfies Meta<typeof ChipGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function Render(args) {
    const [, update] = useArgs();
    const toggle = (label: string) => update({ chips: args.chips.map((c: Chip) => ({ ...c, selected: c.label === label ? !c.selected : c.selected })) });
    return <ChipGroup {...args} onToggle={toggle} />;
  },
};

/** Свой повод: «+» добавляет чипс-поле с × (Editing · Trailing=Remove), Enter сохраняет его обычным чипсом, × отменяет ввод. */
function EditingDemo() {
  const field: Chip = { label: '', editing: true, removable: true, placeholder: 'Свой повод' };
  const [chips, setChips] = useState<Chip[]>([{ label: 'Прогулка' }, { label: 'Ужин', selected: true }, field]);
  const edit = (v: string) => setChips((cur) => cur.map((c) => (c.editing ? { ...c, label: v } : c)));
  const done = (v: string) => setChips((cur) => cur.flatMap((c) => (c.editing ? (v.trim() ? [{ label: v.trim(), selected: true }] : []) : [c])));
  const cancel = () => setChips((cur) => cur.filter((c) => !c.editing));
  const add = () => setChips((cur) => (cur.some((c) => c.editing) ? cur : [...cur, field]));
  return <ChipGroup wrap chips={chips} onAdd={add} onEdit={edit} onEditDone={done} onRemove={cancel} />;
}

export const Editing: Story = {
  name: 'Редактирование',
  parameters: { controls: { disable: true } },
  render: () => <EditingDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('× у чипса-поля отменяет ввод, «+» возвращает поле', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Удалить' }));
      await expect(canvas.queryByRole('textbox')).toBeNull();
      await userEvent.click(canvas.getByRole('button', { name: 'Добавить' }));
      await expect(canvas.getByRole('textbox', { name: 'Свой повод' })).toBeInTheDocument();
    });
    await step('Ввод и Enter сохраняют чипс', async () => {
      await userEvent.type(canvas.getByRole('textbox'), 'Театр{Enter}');
      await expect(canvas.getByText('Театр')).toBeInTheDocument();
      await expect(canvas.queryByRole('textbox')).toBeNull();
    });
  },
};

/** Chip · State=Editing в Figma — только с иконкой справа: ⌄ (Trailing=Dropdown, `1182:20334`) и × (Trailing=Remove, `1413:30294`), обе серые. */
export const EditingTrailing: Story = {
  name: 'Редактирование · иконка справа',
  parameters: { controls: { disable: true } },
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="chip · Editing, Trailing=Dropdown" note="⌄ серым"><ChipGroup wrap chips={[{ label: '', editing: true, dropdown: true, placeholder: 'Категория' }]} /></Usage>
      <Usage screen="chip · Editing, Trailing=Remove" note="× — отменить ввод"><ChipGroup wrap chips={[{ label: 'Театр', editing: true, removable: true, placeholder: 'Свой повод' }]} /></Usage>
    </UsageGrid>
  ),
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Outfit Creation" note="теги, перенос"><ChipGroup wrap onAdd={() => {}} chips={['Тег #1', 'Тег #2', 'Тег #3', 'Тег #4', 'Тег #5'].map((l) => ({ label: l, removable: true }))} /></Usage>
      <Usage screen="Sheet · Color" note="чипсы с цветом"><ChipGroup wrap chips={[{ label: 'Чёрный', colorDot: 'black', selected: true }, { label: 'Серый', colorDot: 'grey' }, { label: 'Белый', colorDot: 'white' }, { label: 'Зелёный', colorDot: 'green' }]} /></Usage>
      <Usage screen="Wardrobe" note="фильтры-дропдауны, скролл"><ChipGroup chips={[{ label: 'Категория · 2', selected: true, dropdown: true }, { label: 'Сезон', dropdown: true }, { label: 'Теги', dropdown: true }]} /></Usage>
      <Usage screen="Outfit Creation / Custom Occasion Name" note="чипс-поле, State=Editing, ×"><ChipGroup wrap chips={[{ label: 'Прогулка' }, { label: 'Ужин' }, { label: '', editing: true, removable: true, placeholder: 'Свой повод' }]} /></Usage>
      <Usage screen="Search / Discover" note="подсказки запросов"><ChipGroup wrap chips={['Nike', 'Crocs', 'Marine Serre', 'Обувь для бега'].map((label) => ({ label }))} /></Usage>
    </UsageGrid>
  ),
};

/**
 * Лента без `wrap` в шторке (Figma: Outfit Creation / Item Filter / Sheet, `1371:42294`): первый чипс на полях шторки, как заголовок,
 * а лента уходит под край шторки, не экрана, — последний чипс обрезан краем шторки и прокручивается.
 */
export const InSheet: Story = {
  name: 'В шторке',
  parameters: { controls: { disable: true } },
  tags: ['bare'],
  render: () =>
    onOverlay(() => (
      <Sheet title="Низ" onClose={() => {}} footer={[{ label: 'Очистить' }, { label: 'Использовать' }]}>
        <ChipGroup chips={[{ label: 'Все' }, { label: 'Джинсы', selected: true }, { label: 'Брюки' }, { label: 'Легинсы' }, { label: 'Шорты' }, { label: 'Юбки' }]} />
        <Grid><ItemCard kind="bottom" color="green" selected /><ItemCard kind="bottom" color="grey" /></Grid>
      </Sheet>
    )),
};

/**
 * Стек (`wrap`) в шторке, контент 337 (экран 393, Figma #177): чипс не сжимается — не влезающий «Кастомный ×» целиком уходит в третий ряд.
 * В ленте без `wrap` перенос не нужен: ряд прокручивается (история «В шторке»).
 */
export const InSheetWrap: Story = {
  name: 'В шторке 337',
  parameters: { controls: { disable: true } },
  tags: ['bare'],
  render: () =>
    onOverlay(() => (
      <Sheet title="Повод" onClose={() => {}} footer={[{ label: 'Очистить' }, { label: 'Использовать' }]}>
        <ChipGroup
          wrap
          aria-label="Повод"
          onAdd={() => {}}
          chips={[{ label: 'Прогулка', selected: true }, { label: 'Ужин' }, { label: 'Работа' }, { label: 'Свидание' }, { label: 'Вечеринка' }, { label: 'Путешествие' }, { label: 'Кастомный', removable: true }]}
        />
      </Sheet>
    )),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: 'Удалить: Кастомный' }).closest('.y-chip--removable') as HTMLElement;
    const group = chip.parentElement as HTMLElement;
    const tops = [...new Set([...group.children].map((c) => Math.round((c as HTMLElement).getBoundingClientRect().top)))];
    await expect(tops.length).toBe(3);
    await expect(Math.round(chip.getBoundingClientRect().top)).toBe(tops[2]);
    // Текст чипса не сжат (#177). Меряется тело чипса, а не капсула: зона нажатия «×» (::after) выходит на 4 в зазор справа и входит в scrollWidth капсулы
    const toggle = chip.querySelector('.y-chip__toggle') as HTMLElement;
    await expect(toggle.scrollWidth).toBeLessThanOrEqual(toggle.clientWidth);
  },
};

/**
 * Uncontrolled: `defaultValue` — группа сама переключает чипсы и сообщает новый выбор в `onValueChange`.
 * Сценарий проверки: в «Сезонах» нажать «Лето» — выбраны «Весна» и «Лето»; в «Поводе» нажать «Ужин» — «Прогулка» снимается.
 */
export const Uncontrolled: Story = {
  parameters: { controls: { disable: true } },
  name: 'Без состояния снаружи',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Sheet · Season" note="множественный выбор"><ChipGroup wrap defaultValue={['spring']} chips={[{ label: 'Весна', value: 'spring' }, { label: 'Лето', value: 'summer' }, { label: 'Осень', value: 'autumn' }, { label: 'Зима', value: 'winter' }]} /></Usage>
      <Usage screen="Outfit Creation / Occasion" note="multiple={false}"><ChipGroup wrap multiple={false} defaultValue={['walk']} chips={[{ label: 'Прогулка', value: 'walk' }, { label: 'Ужин', value: 'dinner' }, { label: 'Работа', value: 'work' }]} /></Usage>
    </UsageGrid>
  ),
};

function KeyboardDemo() {
  const [tags, setTags] = useState(['Офис', 'Вечер', 'Отпуск']);
  return (
    <div style={{ display: 'grid', gap: 16, width: 353 }}>
      <ChipGroup wrap aria-label="Сезон" defaultValue={['spring']} chips={[{ label: 'Весна', value: 'spring' }, { label: 'Лето', value: 'summer' }, { label: 'Осень', value: 'autumn' }]} />
      <ChipGroup wrap aria-label="Повод" multiple={false} defaultValue={['walk']} chips={[{ label: 'Прогулка', value: 'walk' }, { label: 'Ужин', value: 'dinner' }]} />
      <ChipGroup wrap aria-label="Теги" chips={tags.map((label) => ({ label, removable: true }))} onToggle={() => {}} onRemove={(v) => setTags((cur) => cur.filter((t) => t !== v))} />
    </div>
  );
}

/** Клавиатура: чипсы — кнопки в порядке Tab; Enter и пробел переключают `aria-pressed`; одиночный выбор снимает прежний; крестик — своя кнопка. */
export const Keyboard: Story = {
  name: 'Клавиатура',
  tags: ['bare'],
  parameters: { controls: { disable: true } },
  render: () => <KeyboardDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const chip = (name: string) => canvas.getByRole('button', { name });
    await step('Множественный выбор: пробел и Enter переключают', async () => {
      await userEvent.tab();
      await expect(chip('Весна')).toHaveFocus();
      await expect(chip('Весна')).toHaveAttribute('aria-pressed', 'true');
      await userEvent.tab();
      await expect(chip('Лето')).toHaveFocus();
      await userEvent.keyboard(' ');
      await expect(chip('Лето')).toHaveAttribute('aria-pressed', 'true');
      await expect(chip('Весна')).toHaveAttribute('aria-pressed', 'true');
      await userEvent.tab({ shift: true });
      await userEvent.keyboard('{Enter}');
      await expect(chip('Весна')).toHaveAttribute('aria-pressed', 'false');
      await expect(chip('Весна')).toHaveFocus();
    });
    await step('Одиночный выбор: новый чипс снимает прежний', async () => {
      chip('Прогулка').focus();
      await userEvent.tab();
      await expect(chip('Ужин')).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await expect(chip('Ужин')).toHaveAttribute('aria-pressed', 'true');
      await expect(chip('Прогулка')).toHaveAttribute('aria-pressed', 'false');
    });
    await step('Крестик — отдельная кнопка «Удалить: …» после чипса', async () => {
      await userEvent.tab();
      await expect(chip('Офис')).toHaveFocus();
      await userEvent.tab();
      await expect(chip('Удалить: Офис')).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await expect(canvas.queryByRole('button', { name: 'Офис' })).toBeNull();
      await expect(chip('Вечер')).toBeInTheDocument();
    });
  },
};
