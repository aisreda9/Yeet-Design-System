import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { List, ListItem } from '.';
import { Flag } from '../atoms';
import { unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/ListItem',
  component: ListItem,
  tags: ['autodocs'],
  args: { type: 'action', label: 'Создать образ', icon: 'ai', expanded: false, checked: false },
  argTypes: { type: { control: 'inline-radio', options: ['action', 'expandable', 'radio'] }, icon: { control: 'select', options: [undefined, 'ai', 'pen', 'archive', 'trash', 'top', 'bottom', 'shoe'] } },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: 'Строка внутри sheet (высота 24, gap 12). action — действие, expandable — категория, radio — одиночный выбор; справа — флаг (`Flag`) или текст серым (валюта «₽ · RUB»). `List` — колонка строк с gap 20. Figma: `list-item` · Type, State, Label, Icon, Trailing.' } } },
} satisfies Meta<typeof ListItem>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function Render(args) {
    const [, update] = useArgs();
    return <ListItem {...args} onClick={() => (args.type === 'radio' ? update({ checked: !args.checked }) : args.type === 'expandable' ? update({ expanded: !args.expanded }) : undefined)} />;
  },
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={300}>
      <Usage screen="Sheet · Item Actions" note="action"><List><ListItem icon="ai" label="Создать образ" /><ListItem icon="pen" label="Редактировать" /><ListItem icon="archive" label="Архивировать" /><ListItem icon="trash" label="Удалить" /></List></Usage>
      <Usage screen="Sheet · Category" note="expandable"><List><ListItem type="expandable" icon="outerwear" label="Верхняя одежда" /><ListItem type="expandable" icon="top" label="Верх" expanded /><ListItem type="expandable" icon="bottom" label="Низ" /></List></Usage>
      <Usage screen="Sheet · Birth Year" note="radio"><List>{[1991, 1992, 1993].map((y, i) => <ListItem key={y} type="radio" label={String(y)} checked={i === 0} />)}</List></Usage>
      <Usage screen="Settings / Country / Sheet" note="radio + флаг"><List><ListItem type="radio" label="Россия" checked trailing={<Flag code="ru" />} /><ListItem type="radio" label="Беларусь" trailing={<Flag code="by" />} /><ListItem type="radio" label="Грузия" trailing={<Flag code="ge" />} /></List></Usage>
      <Usage screen="Settings / Currency / Sheet" note="radio + текст справа"><List><ListItem type="radio" label="Российский рубль" checked trailing="₽ · RUB" /><ListItem type="radio" label="Белорусский рубль" trailing="Br · BYN" /><ListItem type="radio" label="Доллар США" trailing="$ · USD" /></List></Usage>
    </UsageGrid>
  ),
};
