import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, InputGroup } from '.';
import { unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';
import { itemColors } from '../tokens/tokens';

const meta = {
  title: 'Molecules/Field & InputGroup',
  component: Field,
  tags: ['autodocs'],
  args: { label: 'Категория', value: 'Аксессуары', trailingIcon: 'chevron-up-down', error: false },
  argTypes: {
    trailingIcon: { control: 'select', options: [undefined, 'chevron-up-down', 'eye', 'eye-off', 'external-link', 'chevron-right'] },
    colorDot: { control: 'select', options: [undefined, ...itemColors.map(([id]) => id)] },
    value: { control: 'text' },
  },
  decorators: [unlessBare((Story) => withWidth(353)(() => <InputGroup><Story /></InputGroup>))],
  parameters: {
    docs: {
      description: {
        component: `**Field** — строка поля 56 (Figma: \`input\` + \`input-value\`), всегда внутри **InputGroup** (карточка light-grey, радиус 20, слот Inputs).
Паттерны: ввод текста (\`input\`) · «ключ — значение» (\`value\` + \`chevron-up-down\`, выбор открывает sheet) · пароль (\`eye\`). Ошибка — красный текст, без рамок.`,
      },
    },
  },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TextInput: Story = { name: 'Ввод текста', args: { label: 'Название', value: undefined, trailingIcon: undefined, input: { placeholder: 'Название' } } };

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Auth / Sign In"><InputGroup><Field label="E-mail" input={{ type: 'email', defaultValue: 'sima@space.com' }} /><Field label="Пароль" input={{ type: 'password', defaultValue: 'yeet-2026' }} trailingIcon="eye" /></InputGroup></Usage>
      <Usage screen="New Item / Details" note="ввод"><InputGroup><Field label="Название" input={{}} /><Field label="Стоимость" input={{ inputMode: 'numeric' }} /></InputGroup></Usage>
      <Usage screen="New Item / Details" note="ключ — значение, выбор в sheet"><InputGroup><Field label="Категория" value="Аксессуары" trailingIcon="chevron-up-down" /><Field label="Цвет" value="Черный" colorDot="black" trailingIcon="chevron-up-down" /></InputGroup></Usage>
      <Usage screen="Settings" note="страна и валюта"><InputGroup><Field label="Страна" value="Россия" trailingIcon="chevron-up-down" /><Field label="Валюта" value="₽ · RUB" trailingIcon="chevron-up-down" /></InputGroup></Usage>
      <Usage screen="Auth / Sign In" note="ошибка"><InputGroup><Field label="Пароль" input={{ type: 'password', defaultValue: '12345' }} error /></InputGroup></Usage>
    </UsageGrid>
  ),
};
