import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';
import { Button } from '.';
import { Matrix, Usage, UsageGrid } from '../docs/helpers';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Применить', variant: 'primary', size: 'L' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'tertiary', 'inverse', 'ghost', 'soft', 'destructive'] },
    size: { control: 'inline-radio', options: ['S', 'M', 'L', 'XL'] },
    leftIcon: { control: 'select', options: [undefined, 'plus', 'apple', 'heart', 'camera'] },
    rightIcon: { control: 'select', options: [undefined, 'chevron-up-down', 'cross', 'external-link'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component: `Кнопка-капсула с текстом. Стили названы **по роли**, а не по цвету — в тёмной теме Secondary становится светлой, и имя остаётся верным.

| Стиль | Когда | Пример из флоу |
|---|---|---|
| **primary** | Главное действие — одно на экран / sheet | «Войти», «Применить», «Начать бесплатно» |
| **secondary** | Сильная альтернатива | «Войти с Apple» |
| **tertiary** | Второстепенное действие, невыбранный чипс | «Сбросить», «Выйти», «Сортировка ⌄» |
| **inverse** | Кнопка на сером фоне, активный сегмент | активная вкладка «Вещи» |
| **ghost** | Текстовая кнопка | «Пропустить» |
| **soft** | Выбранная опция / чипс | «Сначала дешевле ⌄» |
| **destructive** | Удаление и необратимые действия — всегда | «Удалить», «Очистить» |

Размеры: **S 40** (чипсы, фильтры) · **M 48** (шапка, пустые состояния) · **L 52** (пары в sheet и диалогах) · **XL 56** (главный CTA).

**Состояния:** нажатие — сжатие \`--gesture-press-scale\`; \`disabled\` — прозрачность 0.4, из фокуса выпадает;
\`loading\` — спиннер цветом текста вместо содержимого (ширина та же), \`aria-busy\`, повторные нажатия и отправка формы гасятся,
кнопка остаётся в фокусе и озвучивается «…, Загрузка» (\`loadingLabel\`).

**API:** \`ref\`, \`className\` и любые атрибуты \`<button>\` пробрасываются; тип пропсов — \`ButtonProps\`.`,
      },
    },
  },
} satisfies Meta<typeof Button>;
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
      render={(v, s) => (
        <div style={{ background: v === 'inverse' ? 'var(--color-bg-subtle)' : undefined, padding: 4, borderRadius: 32 }}>
          <Button variant={v as never} size={s as never}>Название</Button>
        </div>
      )}
    />
  ),
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  render: () => (
    <UsageGrid min={240}>
      <Usage screen="Onboarding / Welcome" note="главный CTA, на всю ширину"><Button size="XL" fullWidth>Начать бесплатно</Button></Usage>
      <Usage screen="Auth / Sign In" note="вход"><Button size="XL" fullWidth>Войти</Button></Usage>
      <Usage screen="Auth / Sign In" note="альтернативный вход"><Button variant="secondary" size="XL" leftIcon="apple" fullWidth>Войти с Apple</Button></Usage>
      <Usage screen="Outfits / Empty Wardrobe"><Button size="L">Добавить вещь</Button></Usage>
      <Usage screen="Onboarding / First Item" note="в шапке"><Button variant="ghost" size="M">Пропустить</Button></Usage>
      <Usage screen="Search / No Results" note="в пустом состоянии"><Button variant="tertiary" size="M">Сбросить поиск</Button></Usage>
      <Usage screen="Search / Results" note="фильтр-дропдаун"><Button variant="tertiary" size="S" rightIcon="chevron-up-down">Сортировка</Button></Usage>
      <Usage screen="Search / Results" note="активный фильтр"><Button variant="soft" size="S" rightIcon="chevron-up-down">Сначала дешевле</Button></Usage>
      <Usage screen="Wardrobe / Items" note="фильтр со счётчиком"><Button variant="soft" size="S" rightIcon="chevron-up-down">Категория · 2</Button></Usage>
      <Usage screen="Outfit Creation / Criteria" note="тег"><Button variant="tertiary" size="S" rightIcon="cross">Тег #1</Button></Usage>
      <Usage screen="Stylist / Outfit of the Day" note="плавающая над контентом"><Button variant="inverse" size="L" floating>Показать ещё</Button></Usage>
      <Usage screen="Sheet · Category" note="пара действий"><div style={{ display: 'flex', gap: 8, width: '100%' }}><Button variant="tertiary" fullWidth>Сбросить</Button><Button fullWidth>Применить</Button></div></Usage>
      <Usage screen="Dialog · Delete Account" note="деструктивное — всегда красное"><div style={{ display: 'flex', gap: 8, width: '100%' }}><Button variant="destructive" fullWidth>Удалить</Button><Button fullWidth>Отменить</Button></div></Usage>
    </UsageGrid>
  ),
};

/** Нажатие показано статично (то же сжатие, что даёт `:active`). В живой истории «Загрузка по нажатию» — полный цикл. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  name: 'Состояния',
  render: () => (
    <Matrix
      rows={['primary', 'secondary', 'tertiary', 'soft', 'destructive']}
      cols={['обычная', 'нажата', 'disabled', 'loading']}
      render={(v, st) => (
        <Button
          variant={v as never}
          size="L"
          disabled={st === 'disabled'}
          loading={st === 'loading'}
          style={st === 'нажата' ? { transform: 'scale(var(--gesture-press-scale))' } : undefined}
        >
          Сохранить
        </Button>
      )}
    />
  ),
};

function LoadingDemo() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 12, width: 313 }}>
      <Button
        size="XL"
        fullWidth
        loading={loading}
        loadingLabel="Входим"
        onClick={() => { setCount((n) => n + 1); setLoading(true); window.setTimeout(() => setLoading(false), 1500); }}
      >
        Войти
      </Button>
      <span className="y-caption y-text--secondary">Запросов отправлено: {count}</span>
    </div>
  );
}

/**
 * Сценарий проверки: нажать «Войти» — спиннер 1,5 с, счётчик +1. Нажать ещё несколько раз, пока крутится, —
 * счётчик не растёт (повтор заблокирован), фокус остаётся на кнопке, скринридер слышит «Войти Входим, занято».
 */
export const LoadingOnPress: Story = {
  parameters: { controls: { disable: true } },
  name: 'Загрузка по нажатию',
  render: () => <LoadingDemo />,
};

/** Клавиатура: Enter и пробел нажимают кнопку; во время `loading` — `aria-busy`, повтор заблокирован, фокус на кнопке. */
export const LoadingKeyboard: Story = {
  parameters: { controls: { disable: true } },
  name: 'Загрузка с клавиатуры',
  render: () => <LoadingDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Войти/ });
    const sent = (n: number) => expect(canvas.getByText(/Запросов отправлено/)).toHaveTextContent(`Запросов отправлено: ${n}`);
    await step('Enter: запрос ушёл, кнопка занята, но в фокусе', async () => {
      await userEvent.tab();
      await expect(button).toHaveFocus();
      await expect(button).not.toHaveAttribute('aria-busy');
      await userEvent.keyboard('{Enter}');
      await sent(1);
      await expect(button).toHaveAttribute('aria-busy', 'true');
      await expect(button).toHaveAttribute('aria-disabled', 'true');
      await expect(button).toHaveAccessibleName('Войти Входим');
      await expect(button).toHaveFocus();
    });
    await step('Повтор во время загрузки заблокирован', async () => {
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      await userEvent.click(button);
      await sent(1);
      await expect(button).toHaveFocus();
    });
    await step('Загрузка кончилась — пробел снова отправляет', async () => {
      await waitFor(() => expect(button).not.toHaveAttribute('aria-busy'), { timeout: 5000 });
      await userEvent.keyboard(' ');
      await sent(2);
      await waitFor(() => expect(button).not.toHaveAttribute('aria-busy'), { timeout: 5000 });
    });
  },
};
