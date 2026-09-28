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
Паттерны: ввод текста (\`input\`) · «ключ — значение» (\`value\` + \`chevron-up-down\`, выбор открывает sheet; длинное значение обрезается «…») · пароль (\`type: 'password'\` — глаз встроен: показывает и скрывает пароль, \`eye\` ↔ \`eye-off\`) · многострочное поле (\`multiline\`, 104, текст сверху, паддинг 16/20 — «Комментарий»). Иконка справа — 20; с \`onTrailingClick\` это кнопка с именем \`trailingLabel\`, без обработчика — декоративная. Ошибка — красный текст, без рамок.
**Доступность:** строка с \`onClick\` фокусируется по Tab и срабатывает на Enter и пробел; фокус — кольцо 1.5 \`text-accent\` по строке (виден в Light/Dark и во всех брендах).`,
      },
    },
  },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TextInput: Story = { name: 'Ввод текста', args: { label: 'Название', value: undefined, trailingIcon: undefined, input: { placeholder: 'Название' } } };

export const Multiline: Story = { name: 'Многострочное', args: { label: 'Комментарий', value: undefined, trailingIcon: undefined, multiline: {} } };

export const Password: Story = { name: 'Пароль', args: { label: 'Пароль', value: undefined, trailingIcon: undefined, input: { type: 'password', defaultValue: 'yeet-2026' } } };

/** Фокус: кольцо 1.5 `text-accent` по строке. Без фокуса вид прежний. */
export const Focus: Story = {
  name: 'Фокус',
  args: { label: 'Название', value: undefined, trailingIcon: undefined, input: { defaultValue: 'Кожаная сумка' } },
  play: async ({ canvasElement }) => { canvasElement.querySelector('input')?.focus(); },
};

/** Строка-выбор с `onClick`: Tab доводит до неё (кольцо как у поля), Enter и пробел открывают выбор. */
export const SelectRow: Story = {
  name: 'Выбор с клавиатуры',
  args: { label: 'Страна', value: 'Россия', trailingIcon: 'chevron-up-down', onClick: () => {} },
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Auth / Sign In"><InputGroup><Field label="E-mail" input={{ type: 'email', defaultValue: 'sima@space.com' }} /><Field label="Пароль" input={{ type: 'password', defaultValue: 'yeet-2026' }} /></InputGroup></Usage>
      <Usage screen="New Item / Details" note="ввод"><InputGroup><Field label="Название" input={{}} /><Field label="Стоимость" input={{ inputMode: 'numeric' }} /></InputGroup></Usage>
      <Usage screen="New Item / Details" note="ключ — значение, выбор в sheet"><InputGroup><Field label="Категория" value="Аксессуары" trailingIcon="chevron-up-down" /><Field label="Цвет" value="Черный" colorDot="black" trailingIcon="chevron-up-down" /></InputGroup></Usage>
      <Usage screen="Settings" note="страна и валюта"><InputGroup><Field label="Страна" value="Россия" trailingIcon="chevron-up-down" /><Field label="Валюта" value="₽ · RUB" trailingIcon="chevron-up-down" /></InputGroup></Usage>
      <Usage screen="Outfit Creation / Info" note="многострочное, 104"><InputGroup><Field label="Название" input={{}} /><Field label="Комментарий" multiline={{}} /></InputGroup></Usage>
      <Usage screen="Auth / Sign In" note="ошибка"><InputGroup><Field label="Пароль" input={{ type: 'password', defaultValue: '12345' }} error /></InputGroup></Usage>
    </UsageGrid>
  ),
};
