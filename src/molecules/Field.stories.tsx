import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
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

function KeyboardDemo() {
  const [opened, setOpened] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 12, width: 353 }}>
      <InputGroup>
        <Field label="Название" input={{ defaultValue: 'Кожаная сумка' }} />
        <Field label="Страна" value="Россия" trailingIcon="chevron-up-down" onClick={() => setOpened((n) => n + 1)} />
        <Field label="Пароль" input={{ type: 'password', defaultValue: 'yeet-2026' }} />
      </InputGroup>
      <span className="y-caption y-text--secondary">Выбор страны открыт: {opened}</span>
    </div>
  );
}

/** Клавиатура: Tab по полю, строке-выбору и глазу пароля; Enter и пробел открывают выбор; глаз показывает и скрывает пароль. */
export const Keyboard: Story = {
  name: 'Клавиатура',
  tags: ['bare'],
  parameters: { controls: { disable: true } },
  render: () => <KeyboardDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const opened = (n: number) => expect(canvas.getByText(/Выбор страны открыт/)).toHaveTextContent(`Выбор страны открыт: ${n}`);
    await step('Tab: поле ввода, затем строка-выбор', async () => {
      await userEvent.tab();
      await expect(canvas.getByRole('textbox', { name: 'Название' })).toHaveFocus();
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name: /Страна/ })).toHaveFocus();
    });
    await step('Enter и пробел открывают выбор', async () => {
      await userEvent.keyboard('{Enter}');
      await opened(1);
      await userEvent.keyboard(' ');
      await opened(2);
    });
    await step('Пароль скрыт, глаз показывает и скрывает его', async () => {
      await userEvent.tab();
      const password = canvasElement.querySelector<HTMLInputElement>('input[aria-label="Пароль"]')!;
      await expect(password).toHaveFocus();
      await expect(password).toHaveAttribute('type', 'password');
      await userEvent.tab();
      const eye = canvas.getByRole('button', { name: 'Показать пароль' });
      await expect(eye).toHaveFocus();
      await expect(eye).toHaveAttribute('aria-pressed', 'false');
      await userEvent.keyboard('{Enter}');
      await expect(password).toHaveAttribute('type', 'text');
      const hide = canvas.getByRole('button', { name: 'Скрыть пароль' });
      await expect(hide).toHaveAttribute('aria-pressed', 'true');
      await expect(hide).toHaveFocus();
      await userEvent.keyboard(' ');
      await expect(password).toHaveAttribute('type', 'password');
      await expect(canvas.getByRole('button', { name: 'Показать пароль' })).toHaveFocus();
      await opened(2);
    });
  },
};
