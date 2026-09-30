import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from '.';
import { Matrix, Usage, UsageGrid } from '../docs/helpers';

const meta = {
  title: 'Atoms/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: { icon: 'plus', label: 'Добавить', variant: 'primary', size: 'M' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'tertiary', 'inverse', 'ghost', 'soft', 'destructive'] },
    size: { control: 'inline-radio', options: ['S', 'M', 'L', 'XL'] },
    iconSize: { control: 'inline-radio', options: [20, 24] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: { docs: { description: { component: 'Круглая кнопка-иконка (Figma: `icon-button` · Size S/M/L/XL · Icon Size 20/24 ↔ `iconSize`). Иконка по умолчанию 20 у S и 24 у остальных; `size="S" iconSize={24}` — кнопка 40 с иконкой 24 (действия в карточке аккаунта), зона нажатия ≥ 44 та же. Та же шкала и те же семантические стили, что у `Button`. `label` обязателен — это подпись для скринридера и тултип. Состояния те же, что у `Button`: нажатие, `disabled`, `loading` (спиннер вместо иконки, `aria-busy`, повтор заблокирован). `ref`, `className` и атрибуты `<button>` пробрасываются.' } } },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  name: 'Все варианты',
  render: () => (
    <Matrix
      rows={['primary', 'secondary', 'tertiary', 'inverse', 'ghost', 'soft', 'destructive']}
      cols={['S', 'M', 'L', 'XL']}
      render={(v, s) => <div style={{ background: v === 'inverse' ? 'var(--color-bg-subtle)' : undefined, padding: 4, borderRadius: 32, display: 'inline-flex' }}><IconButton icon="plus" label="Добавить" variant={v as never} size={s as never} /></div>}
    />
  ),
};

export const IconSize: Story = {
  parameters: { controls: { disable: true } },
  name: 'Icon Size 20 / 24',
  render: () => (
    <Matrix
      rows={['ghost', 'tertiary']}
      cols={['S · 20', 'S · 24', 'S · 24 loading']}
      render={(v, c) => <IconButton icon="settings" label="Настройки" variant={v as never} size="S" iconSize={c === 'S · 20' ? 20 : 24} loading={c.endsWith('loading')} />}
    />
  ),
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  render: () => (
    <UsageGrid min={170}>
      <Usage screen="Header" note="назад"><IconButton icon="chevron-left" label="Назад" /></Usage>
      <Usage screen="Header" note="меню"><IconButton icon="more" label="Ещё" /></Usage>
      <Usage screen="Search" note="поиск по фото"><IconButton icon="search-by-image" label="Поиск по фото" /></Usage>
      <Usage screen="Wardrobe" note="фильтры"><div style={{ display: 'flex', gap: 4 }}><IconButton icon="search" label="Поиск" size="S" /><IconButton icon="archive" label="Архив" size="S" /></div></Usage>
      <Usage screen="Chip group" note="добавить тег"><IconButton icon="plus" label="Добавить" variant="primary" size="S" /></Usage>
      <Usage screen="Stylist" note="отправить"><IconButton icon="arrow-up" label="Отправить" variant="primary" /></Usage>
      <Usage screen="Wardrobe" note="FAB"><IconButton icon="plus" label="Добавить вещь" variant="primary" size="XL" floating /></Usage>
      <Usage screen="Item Details" note="поделиться"><IconButton icon="external-link" label="Открыть в магазине" variant="secondary" size="XL" /></Usage>
      <Usage screen="Photo area" note="удалить фото"><IconButton icon="cross" label="Удалить фото" variant="ghost" size="S" /></Usage>
      <Usage screen="Accounts" note="настройки · S, иконка 24"><IconButton icon="settings" label="Настройки" variant="ghost" size="S" iconSize={24} /></Usage>
      <Usage screen="Outfit Creation" note="перемешать"><IconButton icon="arrows-shuffle" label="Перемешать" /></Usage>
    </UsageGrid>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  name: 'Состояния',
  render: () => (
    <Matrix
      rows={['primary', 'tertiary', 'secondary']}
      cols={['обычная', 'нажата', 'disabled', 'loading']}
      render={(v, st) => (
        <IconButton
          icon="arrow-up"
          label="Отправить"
          variant={v as never}
          disabled={st === 'disabled'}
          loading={st === 'loading'}
          style={st === 'нажата' ? { transform: 'scale(var(--gesture-press-scale))' } : undefined}
        />
      )}
    />
  ),
};
