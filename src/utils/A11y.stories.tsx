import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Icon, VisuallyHidden } from '../atoms';
import { Column, Usage, UsageGrid } from '../docs/helpers';
import { useControllableState } from './useControllableState';

const meta = {
  title: 'Старт/Для разработчиков/Примитивы',
  tags: ['autodocs'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: `Общие примитивы поведения и доступности для атомов и молекул (\`src/utils\`).

| Примитив | Зачем |
|---|---|
| \`useControllableState\` | Один компонент — два режима: controlled (\`value\` + \`onChange\`) и uncontrolled (\`defaultValue\`, состояние внутри). Режим фиксируется на первом рендере, как у \`<input>\` |
| \`VisuallyHidden\` | Текст только для скринридера: в дереве доступности есть, на экране не виден |
| \`.y-focus-ring\` (\`src/utils/a11y.css\`) | Общее кольцо фокуса 2px акцентом с отступом 2 по \`:focus-visible\`. Уже включено у \`Button\`, \`IconButton\`, \`Link\`, чипсов |`,
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Counter({ value, defaultValue = 0, onChange }: { value?: number; defaultValue?: number; onChange?: (v: number) => void }) {
  const [n, setN] = useControllableState({ value, defaultValue, onChange });
  return (
    <Button variant="tertiary" size="M" leftIcon="plus" onClick={() => setN((v) => v + 1)}>
      Нажато: {n}
    </Button>
  );
}

/**
 * Сценарий проверки: нажать кнопку — счётчик растёт без обработчика снаружи (uncontrolled).
 * У controlled-кнопки со значением 3 и без обновления снаружи число не меняется.
 */
export const ControllableState: Story = {
  name: 'useControllableState',
  render: () => (
    <UsageGrid min={200}>
      <Usage screen="uncontrolled" note="defaultValue = 0"><Counter /></Usage>
      <Usage screen="controlled" note="value = 3, без onChange"><Counter value={3} /></Usage>
    </UsageGrid>
  ),
};

/** Скринридер читает «Удалить вещь», на экране — только иконка. */
export const VisuallyHiddenText: Story = {
  name: 'VisuallyHidden',
  render: () => (
    <Column>
      <button type="button" className="y-icon-button y-icon-button--M y-style--tertiary">
        <Icon name="trash" />
        <VisuallyHidden>Удалить вещь</VisuallyHidden>
      </button>
    </Column>
  ),
};

/** Кольцо видно только при навигации с клавиатуры: нажмите Tab. */
export const FocusRing: Story = {
  name: 'Кольцо фокуса',
  render: () => (
    <Column>
      <button type="button" className="y-focus-ring" style={{ padding: '12px 16px', border: 0, borderRadius: 16, background: 'var(--color-bg-subtle)', color: 'var(--color-text-primary)', font: 'inherit' }}>
        Свой элемент с классом y-focus-ring
      </button>
    </Column>
  ),
};
