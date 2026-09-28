import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { Stamp } from '.';
import { Usage, UsageGrid } from '../docs/helpers';

const meta = {
  title: 'Atoms/Stamp',
  component: Stamp,
  tags: ['autodocs'],
  args: { label: 'Надеть', tone: 'primary', size: 'L', done: false, icon: 'thumb-down' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['primary', 'secondary'] },
    size: { control: 'inline-radio', options: ['L', 'S'] },
    icon: { control: 'select', options: ['thumb-down', 'cross', 'plus'], if: { arg: 'size', eq: 'S' } },
  },
  parameters: {
    docs: {
      description: {
        component: `Штамп — фирменная кнопка-звезда для **одного главного действия** поверх коллажа образа.
Не заменяет \`Button\` в формах и sheet'ах. Нажатие анимируется токеном \`--motion-stamp\` (см. Foundations / Анимации).`,
      },
    },
  },
} satisfies Meta<typeof Stamp>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function Render(args) {
    const [, update] = useArgs();
    return <Stamp {...args} onClick={() => update({ done: !args.done })} />;
  },
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  render: () => (
    <UsageGrid min={200}>
      <Usage screen="Outfits / Everyday" note="главное действие"><Stamp label="Надеть" /></Usage>
      <Usage screen="Outfits / Everyday" note="после нажатия — отменить"><Stamp label="Надеть" done /></Usage>
      <Usage screen="Stylist / С чем носить" note="сохранить образ"><Stamp label="Сохранить" /></Usage>
      <Usage screen="Stylist / С чем носить" note="не нравится, secondary S"><Stamp label="Не нравится" tone="secondary" size="S" icon="thumb-down" /></Usage>
    </UsageGrid>
  ),
};
