import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useArgs } from 'storybook/preview-api';
import { SegmentControl } from '.';
import { Button } from '../atoms';
import { Matrix, unlessBare, Usage, UsageGrid, withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/SegmentControl',
  component: SegmentControl,
  tags: ['autodocs'],
  args: { segments: [{ value: 'items', label: 'Вещи' }, { value: 'outfits', label: 'Образы' }, { value: 'wishlist', label: 'Вишлист' }], value: 'items', size: 'L', fit: false },
  argTypes: { size: { control: 'inline-radio', options: ['S', 'M', 'L', 'XL'] }, value: { control: 'inline-radio', options: ['items', 'outfits', 'wishlist'] } },
  decorators: [unlessBare(withWidth(353))],
  parameters: { docs: { description: { component: 'Переключатель вкладок: высота = размер (S 40 · M 48 · L 52 · XL 56), паддинг 4, активный сегмент — Inverse. Figma: `segment-control` · Size, Content (Text/Icon), слот Buttons. Для скринридера — `radiogroup`: стрелки и Home / End переключают сегмент, у сегментов-иконок — `ariaLabel`.' } } },
} satisfies Meta<typeof SegmentControl>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function Render(args) {
    const [, update] = useArgs();
    return <SegmentControl {...args} onChange={(value) => update({ value })} />;
  },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  name: 'Все варианты',
  tags: ['bare'],
  render: () => (
    <Matrix rows={['S', 'M', 'L', 'XL']} cols={['Текст', 'Иконки']} render={(s, c) => (
      <div style={{ width: 353 }}>
        {c === 'Текст'
          ? <SegmentControl size={s as never} value="a" segments={[{ value: 'a', label: 'Вещи' }, { value: 'b', label: 'Образы' }, { value: 'c', label: 'Вишлист' }]} />
          : <SegmentControl size={s as never} value="a" segments={[{ value: 'a', icon: 'wardrobe', ariaLabel: 'Гардероб' }, { value: 'b', icon: 'collage', ariaLabel: 'Коллаж' }, { value: 'c', icon: 'info', ariaLabel: 'Описание' }]} />}
      </div>
    )} />
  ),
};

export const IconsFit: Story = {
  parameters: { controls: { disable: true } },
  name: 'Иконки, fit',
  tags: ['bare'],
  render: () => (
    <Matrix rows={['S', 'M', 'L', 'XL']} cols={['Fit']} render={(s) => (
      <SegmentControl size={s as never} fit value="a" segments={[{ value: 'a', icon: 'wardrobe', ariaLabel: 'Гардероб' }, { value: 'b', icon: 'collage', ariaLabel: 'Коллаж' }, { value: 'c', icon: 'info', ariaLabel: 'Описание' }]} />
    )} />
  ),
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Wardrobe"><SegmentControl value="items" segments={[{ value: 'items', label: 'Вещи' }, { value: 'o', label: 'Образы' }, { value: 'w', label: 'Вишлист' }]} /></Usage>
      <Usage screen="Wishlist" note="вложенный, по содержимому"><SegmentControl size="S" fit value="i" segments={[{ value: 'i', label: 'Вещи' }, { value: 'o', label: 'Образы' }]} /></Usage>
      <Usage screen="Stylist / Trip Details"><SegmentControl value="o" segments={[{ value: 'o', label: 'Образы · 1' }, { value: 'i', label: 'Вещи · 4' }]} /></Usage>
      <Usage screen="Outfit Creation" note="шаги, иконки"><SegmentControl size="M" fit value="w" segments={[{ value: 'w', icon: 'wardrobe', ariaLabel: 'Гардероб' }, { value: 'c', icon: 'collage', ariaLabel: 'Коллаж' }, { value: 'h', icon: 'info', ariaLabel: 'Описание' }]} /></Usage>
    </UsageGrid>
  ),
};

/**
 * Uncontrolled: только `defaultValue`, без `value` и обработчика — переключатель хранит выбор сам.
 * Сценарий проверки: нажать «Образы» — пилюля переезжает; Tab в группу, стрелки ←→ и Home / End переключают сегменты.
 */
export const Uncontrolled: Story = {
  parameters: { controls: { disable: true } },
  name: 'Без состояния снаружи',
  render: () => <SegmentControl label="Раздел гардероба" defaultValue="outfits" segments={[{ value: 'items', label: 'Вещи' }, { value: 'outfits', label: 'Образы' }, { value: 'wishlist', label: 'Вишлист' }]} />,
};

/** Клавиатура (APG Radio Group): Tab попадает в выбранный сегмент, стрелки по кругу и Home / End выбирают, Tab уходит из группы. */
export const Keyboard: Story = {
  name: 'Клавиатура',
  tags: ['bare'],
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 353 }}>
      <SegmentControl label="Раздел гардероба" defaultValue="outfits" segments={[{ value: 'items', label: 'Вещи' }, { value: 'outfits', label: 'Образы' }, { value: 'wishlist', label: 'Вишлист' }]} />
      <Button variant="tertiary" size="S">После группы</Button>
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Раздел гардероба' });
    const radio = (name: string) => within(group).getByRole('radio', { name });
    /** Выбран, в фокусе и единственный с tabIndex 0 (roving tabindex). */
    const current = async (name: string) => {
      await expect(radio(name)).toHaveAttribute('aria-checked', 'true');
      await expect(radio(name)).toHaveFocus();
      await expect(within(group).getAllByRole('radio', { checked: true })).toHaveLength(1);
      await expect(within(group).getAllByRole('radio').filter((r) => r.tabIndex === 0)).toEqual([radio(name)]);
    };
    await step('Tab — в выбранный сегмент, не в первый', async () => {
      await userEvent.tab();
      await current('Образы');
    });
    await step('Стрелки по кругу', async () => {
      await userEvent.keyboard('{ArrowRight}');
      await current('Вишлист');
      await userEvent.keyboard('{ArrowRight}');
      await current('Вещи');
      await userEvent.keyboard('{ArrowLeft}');
      await current('Вишлист');
      await userEvent.keyboard('{ArrowUp}');
      await current('Образы');
      await userEvent.keyboard('{ArrowDown}');
      await current('Вишлист');
    });
    await step('Home и End', async () => {
      await userEvent.keyboard('{Home}');
      await current('Вещи');
      await userEvent.keyboard('{End}');
      await current('Вишлист');
    });
    await step('Tab уходит из группы, Shift+Tab возвращает в выбранный', async () => {
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name: 'После группы' })).toHaveFocus();
      await userEvent.tab({ shift: true });
      await current('Вишлист');
    });
  },
};
