import { useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { Grid, Screen, Sticky } from '.';
import { BottomNav, Header, ItemCard, type Garment } from '../organisms';
import { ChipGroup, SegmentControl } from '../molecules';

const meta = {
  title: 'Templates/Screen',
  component: Screen,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Каркас экрана 393×852: статус-бар и **header** → **контент** (скроллится) → **bottom** (закреплён) + слои \`floating\` и \`overlay\`.
Большой заголовок (\`Header variant="large"\`) уезжает вместе с контентом, закреплён только статус-бар; остальные шапки закреплены (\`pinHeader\`).
Ряд фильтров в \`Sticky\` прилипает под статус-бар (#170).
У \`Header variant="back"\` закреплён ряд «назад», заголовок уезжает, в ряду проявляется компактный (#203). Проскролльте пример: заголовок уезжает, карточки уходят под статус-бар и таб-бар и плавно гаснут.`,
      },
    },
  },
} satisfies Meta<typeof Screen>;
export default meta;
type Story = StoryObj<typeof meta>;

const kinds: Garment[] = ['top', 'container', 'bottom', 'shoe', 'outerwear', 'accessories', 'top', 'bottom', 'shoe', 'container'];

export const Scroll: Story = {
  name: 'Скролл под навигацией',
  args: {
    header: <Header type="large" title="Гардероб" />,
    bottom: <BottomNav active="wardrobe" fab />,
    children: (
      <>
        <SegmentControl value="items" segments={[{ value: 'items', label: 'Вещи' }, { value: 'o', label: 'Образы' }, { value: 'w', label: 'Вишлист' }]} />
        <Grid>{kinds.map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>
      </>
    ),
  },
};

/** Экран с шапкой «назад»: заголовок, подзаголовок, фильтры и сетка. `scrollTo` — прокрутка при открытии. */
function BackScreen({ scrollTo = 0 }: { scrollTo?: number }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = scrollTo;
  }, [scrollTo]);
  return (
    <Screen scrollRef={ref} header={<Header variant="back" title="Вещи для поездки" subtitle="Собрали из твоего гардероба под погоду в Стамбуле" />}>
      <Sticky>
        <ChipGroup chips={[{ label: 'Категория', dropdown: true }, { label: 'Сезон', dropdown: true }, { label: 'Теги', dropdown: true }]} />
      </Sticky>
      <Grid>{kinds.map((k, i) => <ItemCard key={i} kind={k} />)}</Grid>
    </Screen>
  );
}

/**
 * Шапка «назад» (#203, как large title в iOS и top app bar в M3): ряд «назад» закреплён под статус-баром,
 * большой заголовок и подзаголовок уезжают с контентом. Проскролльте: когда заголовок ушёл под ряд,
 * по центру ряда проявляется компактный заголовок; фильтры прилипают под ряд, под ними — затухание.
 */
export const BackHeader: Story = {
  name: 'Шапка «назад» · скролл',
  render: () => <BackScreen />,
  play: async ({ canvasElement }) => {
    // экран ищется заново на каждой попытке: декораторы темы и размера могут перерисовать историю
    const screen = () => canvasElement.querySelector<HTMLElement>('.y-screen')!;
    const scrollTo = (y: number) => {
      const main = screen().querySelector<HTMLElement>('main')!;
      if (main.scrollTop !== y) { main.scrollTop = y; main.dispatchEvent(new Event('scroll')); }
    };
    await expect(screen()).not.toHaveAttribute('data-collapsed');
    // заголовок ушёл под ряд «назад» → компактный заголовок; фильтры прилипли под ряд
    await waitFor(() => { scrollTo(200); expect(screen()).toHaveAttribute('data-collapsed'); expect(screen()).toHaveAttribute('data-stuck'); });
    await waitFor(() => { scrollTo(0); expect(screen()).not.toHaveAttribute('data-collapsed'); });
  },
};

/** Прокручено: заголовок уехал, в ряду «назад» — компактный заголовок, фильтры прилипли под ряд. */
export const BackHeaderScrolled: Story = {
  name: 'Шапка «назад» · прокручено',
  render: () => <BackScreen scrollTo={300} />,
};
