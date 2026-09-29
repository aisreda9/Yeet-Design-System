import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { RadioList } from '.';
import { Flag } from '../atoms';
import { unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const years = ['1991', '1992', '1993', '1994'].map((y) => ({ value: y, label: y }));

const meta = {
  title: 'Molecules/RadioList',
  component: RadioList,
  tags: ['autodocs'],
  args: { label: 'Год рождения', options: years, value: '1991' },
  argTypes: { value: { control: 'inline-radio', options: years.map((y) => y.value) } },
  decorators: [unlessBare(withWidth(353))],
  parameters: {
    docs: {
      description: {
        component:
          'Одиночный выбор строками `ListItem variant="radio"` в колонке `List` (вид тот же). Для скринридера — `radiogroup` с именем `label`: Tab попадает в выбранную строку, стрелки и Home / End выбирают соседнюю. Controlled (`value` + `onChange`) или uncontrolled (`defaultValue`). Figma: `list-item` · Type=Radio.',
      },
    },
  },
} satisfies Meta<typeof RadioList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function Render(args) {
    const [, update] = useArgs();
    return <RadioList {...args} onChange={(value) => update({ value })} />;
  },
};

/**
 * Uncontrolled: только `defaultValue`.
 * Сценарий проверки: нажать «Грузия» — отметка переезжает; Tab в список, стрелки ↑↓ выбирают соседнюю страну, Tab уходит из группы.
 */
export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={300}>
      <Usage screen="Sheet · Birth Year" note="uncontrolled">
        <RadioList label="Год рождения" defaultValue="1991" options={years.slice(0, 3)} />
      </Usage>
      <Usage screen="Settings / Country / Sheet" note="с флагом">
        <RadioList
          label="Страна"
          defaultValue="ru"
          options={[
            { value: 'ru', label: 'Россия', trailing: <Flag code="ru" /> },
            { value: 'by', label: 'Беларусь', trailing: <Flag code="by" /> },
            { value: 'ge', label: 'Грузия', trailing: <Flag code="ge" /> },
          ]}
        />
      </Usage>
      <Usage screen="Settings / Currency / Sheet" note="текст справа">
        <RadioList
          label="Валюта"
          defaultValue="rub"
          options={[
            { value: 'rub', label: 'Российский рубль', trailing: '₽ · RUB' },
            { value: 'byn', label: 'Белорусский рубль', trailing: 'Br · BYN' },
            { value: 'usd', label: 'Доллар США', trailing: '$ · USD' },
          ]}
        />
      </Usage>
    </UsageGrid>
  ),
};
