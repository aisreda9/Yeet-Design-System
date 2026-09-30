import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';
import { Field, FormField, InputGroup } from '.';
import { Button } from '../atoms';
import { unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/FormField',
  component: FormField,
  tags: ['autodocs'],
  args: {
    label: 'Почта',
    description: 'Пришлём код для входа',
    error: '',
    hideLabel: false,
    required: false,
    children: () => null,
  },
  argTypes: {
    error: { control: 'text' },
    description: { control: 'text' },
    label: { control: 'text' },
    children: { control: false },
  },
  decorators: [unlessBare(withWidth(353))],
  parameters: {
    docs: {
      description: {
        component: `Лейбл, описание и ошибка вокруг поля, связанные для скринридера: лейбл — \`aria-labelledby\`, описание и ошибка — \`aria-describedby\`,
при ошибке — \`aria-invalid\`. Ошибка живёт в постоянном live-регионе и озвучивается, когда появляется. Само поле — \`Field\` в \`InputGroup\`
(или любое другое): FormField отдаёт ему пропсы через функцию-ребёнка или \`cloneElement\`.
Текст на отступе 20 — по линии значения в \`Field\`. \`hideLabel\` — лейбл только для скринридера, когда плейсхолдер уже говорит, что вводить.`,
      },
    },
  },
} satisfies Meta<typeof FormField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <FormField {...args}>
      {(control) => (
        <InputGroup>
          <Field label="name@mail.ru" error={!!args.error} input={{ ...control, type: 'email' }} />
        </InputGroup>
      )}
    </FormField>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  name: 'Состояния',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="обычное">
        <FormField label="Имя">
          {(c) => (
            <InputGroup>
              <Field label="Как к тебе обращаться" input={{ ...c, defaultValue: 'Сима' }} />
            </InputGroup>
          )}
        </FormField>
      </Usage>
      <Usage screen="с описанием">
        <FormField label="Почта" description="Пришлём код для входа">
          {(c) => (
            <InputGroup>
              <Field label="name@mail.ru" input={{ ...c, type: 'email' }} />
            </InputGroup>
          )}
        </FormField>
      </Usage>
      <Usage screen="с ошибкой">
        <FormField label="Пароль" description="Не короче 8 символов" error="Слишком короткий пароль">
          {(c) => (
            <InputGroup>
              <Field label="Пароль" error input={{ ...c, type: 'password', defaultValue: 'yeet' }} />
            </InputGroup>
          )}
        </FormField>
      </Usage>
      <Usage screen="лейбл скрыт" note="hideLabel">
        <FormField label="Поиск по гардеробу" hideLabel>
          {(c) => (
            <InputGroup>
              <Field label="Поиск по гардеробу" input={c} />
            </InputGroup>
          )}
        </FormField>
      </Usage>
    </UsageGrid>
  ),
};

function SignInDemo() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  return (
    <form
      style={{ display: 'grid', gap: 16 }}
      onSubmit={(e) => {
        e.preventDefault();
        setError(/^\S+@\S+\.\S+$/.test(email) ? '' : 'Проверь адрес: нужен вид name@mail.ru');
      }}
    >
      <FormField label="Почта" description="Пришлём код для входа" error={error} required>
        {(c) => (
          <InputGroup>
            <Field
              label="name@mail.ru"
              error={!!error}
              input={{ ...c, type: 'email', value: email, onChange: (e) => setEmail(e.target.value) }}
            />
          </InputGroup>
        )}
      </FormField>
      <Button type="submit" size="XL" fullWidth>
        Получить код
      </Button>
    </form>
  );
}

/**
 * Сценарий проверки: нажать «Получить код» с пустым полем — под полем появляется ошибка красным, скринридер
 * озвучивает её сразу, а на поле — «Почта, недопустимое значение, Пришлём код для входа. Проверь адрес…».
 * Ввести адрес и отправить снова — ошибка исчезает.
 */
export const Validation: Story = {
  parameters: { controls: { disable: true } },
  name: 'Проверка при отправке',
  render: () => <SignInDemo />,
};

/** Клавиатура: Enter в поле отправляет форму; ошибка появляется в live-регионе и связана с полем через `aria-describedby`. */
export const Keyboard: Story = {
  parameters: { controls: { disable: true } },
  name: 'Клавиатура',
  render: () => <SignInDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Почта' });
    const describedBy = () => (field.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent ?? '');
    await step('Имя, описание и обязательность связаны с полем', async () => {
      await userEvent.tab();
      await expect(field).toHaveFocus();
      await expect(field).toHaveAccessibleDescription('Пришлём код для входа');
      await expect(field).toHaveAttribute('aria-required', 'true');
      await expect(field).not.toHaveAttribute('aria-invalid');
    });
    await step('Enter с неверным адресом: ошибка в aria-describedby и live-регионе', async () => {
      await userEvent.type(field, 'sima@mail{Enter}');
      await waitFor(() => expect(field).toHaveAttribute('aria-invalid', 'true'));
      await expect(describedBy()).toEqual(['Пришлём код для входа', 'Проверь адрес: нужен вид name@mail.ru']);
      await expect(field).toHaveAccessibleDescription('Пришлём код для входа Проверь адрес: нужен вид name@mail.ru');
      await expect(canvasElement.querySelector('[aria-live="polite"]')).toHaveTextContent('Проверь адрес');
      await expect(field).toHaveFocus();
    });
    await step('Исправить и отправить кнопкой с клавиатуры — ошибка уходит', async () => {
      await userEvent.type(field, '.ru');
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name: 'Получить код' })).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect(field).not.toHaveAttribute('aria-invalid'));
      await expect(field).toHaveAccessibleDescription('Пришлём код для входа');
    });
  },
};
