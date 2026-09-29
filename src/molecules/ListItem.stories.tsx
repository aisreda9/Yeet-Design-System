import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { List, ListItem } from '.';
import { Flag } from '../atoms';
import { unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/ListItem',
  component: ListItem,
  tags: ['autodocs'],
  args: { variant: 'action', label: 'Создать образ', icon: 'ai', expanded: false, checked: false },
  argTypes: { variant: { control: 'inline-radio', options: ['action', 'expandable', 'radio'] }, icon: { control: 'select', options: [undefined, 'ai', 'pen', 'archive', 'trash', 'top', 'bottom', 'shoe'] } },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: 'Строка внутри sheet (высота 24, gap 12). action — действие, expandable — категория, radio — одиночный выбор; справа — флаг (`Flag`) или текст серым (валюта «₽ · RUB»). `List` — колонка строк с gap 20. Radio-строки группой — `RadioList` (radiogroup, стрелки, uncontrolled). `variant` заменил `type` (старое имя работает, помечено `@deprecated`). Figma: `list-item` · Type, State, Label, Icon, Trailing.' } } },
} satisfies Meta<typeof ListItem>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function Render(args) {
    const [, update] = useArgs();
    return <ListItem {...args} onClick={() => (args.variant === 'radio' ? update({ checked: !args.checked }) : args.variant === 'expandable' ? update({ expanded: !args.expanded }) : undefined)} />;
  },
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={300}>
      <Usage screen="Sheet · Item Actions" note="action"><List><ListItem icon="ai" label="Создать образ" /><ListItem icon="pen" label="Редактировать" /><ListItem icon="archive" label="Архивировать" /><ListItem icon="trash" label="Удалить" /></List></Usage>
      <Usage screen="Sheet · Category" note="expandable"><List><ListItem variant="expandable" icon="outerwear" label="Верхняя одежда" /><ListItem variant="expandable" icon="top" label="Верх" expanded /><ListItem variant="expandable" icon="bottom" label="Низ" /></List></Usage>
      <Usage screen="Sheet · Birth Year" note="radio"><List>{[1991, 1992, 1993].map((y, i) => <ListItem key={y} variant="radio" label={String(y)} checked={i === 0} />)}</List></Usage>
      <Usage screen="Settings / Country / Sheet" note="radio + флаг"><List><ListItem variant="radio" label="Россия" checked trailing={<Flag code="ru" />} /><ListItem variant="radio" label="Беларусь" trailing={<Flag code="by" />} /><ListItem variant="radio" label="Грузия" trailing={<Flag code="ge" />} /></List></Usage>
      <Usage screen="Settings / Currency / Sheet" note="radio + текст справа"><List><ListItem variant="radio" label="Российский рубль" checked trailing="₽ · RUB" /><ListItem variant="radio" label="Белорусский рубль" trailing="Br · BYN" /><ListItem variant="radio" label="Доллар США" trailing="$ · USD" /></List></Usage>
    </UsageGrid>
  ),
};
