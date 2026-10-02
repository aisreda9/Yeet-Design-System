import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { Slot } from '../docs/helpers';
import { DetailsScreen } from '.';

/* Каркас без данных: вместо фото, полей и кнопки — слоты-заглушки. Тот же шаблон с данными — Pages / Экраны флоу, «Детали вещи». */
const meta = {
  title: 'Templates/DetailsScreen',
  component: DetailsScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: { disable: true },
    docs: {
      description: {
        component: `Шаблон деталей вещи и образа: **шапка** \`bar\` (пилюля по центру, действия справа) → **media** — квадрат во всю ширину под шапкой →
**панель** \`Sheet type="panel"\` с заголовком и контентом → **bottom** (закреплён) + **stamp** поверх контента.

Панель — шторка над фото: потяните её вверх пальцем (мышью) или колесом — она идёт за пальцем 1 : 1 до y138 под шапкой,
а фото так же линейно сворачивается в миниатюру 48 по центру шапки. Отпустили — доводка пружиной \`--motion-sheet\` без перелёта:
бросок быстрее 500 pt/с — в его сторону, иначе к ближайшему краю (дальше половины хода — свернуть). Когда свёрнуто, прокручивается
контент панели; потянуть вниз от его начала — панель возвращается.`,
      },
    },
  },
} satisfies Meta<typeof DetailsScreen>;
export default meta;
type Story = StoryObj<typeof meta>;

const bottom = <div style={{ padding: '0 var(--screen-gutter) var(--space-20)' }}><Slot label="bottom · BottomBar" /></div>;

export const Slots: Story = {
  name: 'Слоты',
  args: {
    media: <Slot label="media · фото вещи или коллаж образа" square />,
    titleChip: 'titleChip',
    title: 'title · заголовок панели',
    bottom,
    children: (
      <>
        <Slot label="children · группа полей" height={112} />
        <Slot label="children · группа полей" height={168} />
        <Slot label="children · раздел" height={96} />
      </>
    ),
  },
};

const pause = (ms: number) => new Promise((f) => setTimeout(f, ms));

/**
 * Синтетический палец по панели: pointerdown → шаги pointermove → стоим (бросок не засчитан) → pointerup.
 * `share` — доля полного хода панели, > 0 — вверх.
 */
async function pull(screen: HTMLElement, share: number) {
  const panel = screen.querySelector<HTMLElement>('.y-sheet--panel')!;
  const travel = parseFloat(screen.style.getPropertyValue('--details-travel'));
  const r = panel.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + 24, dy = -share * travel;
  const at = (type: string, yy: number) => panel.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 11, pointerType: 'touch', isPrimary: true, clientX: x, clientY: yy }));
  at('pointerdown', y);
  for (let i = 1; i <= 12; i++) { at('pointermove', y + (dy * i) / 12); await pause(16); }
  await pause(120); // палец постоял дольше окна скорости — отпускание без броска
  at('pointerup', y + dy);
}

const p = (screen: HTMLElement) => Number(screen.style.getPropertyValue('--details-p') || 0);
const panelTop = (screen: HTMLElement) => Math.round(screen.querySelector('.y-sheet--panel')!.getBoundingClientRect().top - screen.getBoundingClientRect().top);

/** Жест шторки: дальше половины хода — сворачивается, меньше — возвращается. */
export const Gesture: Story = {
  name: 'Шторка: жест',
  args: Slots.args,
  parameters: { docs: { description: { story: 'Play-тест: панель протянута на 60 % хода и отпущена — свернулась (панель на y138, фото — миниатюра 48); на 30 % — вернулась. Без броска: палец стоит перед отпусканием.' } } },
  play: async ({ canvasElement, step }) => {
    const screen = canvasElement.querySelector<HTMLElement>('.y-details')!;
    const media = screen.querySelector<HTMLElement>('.y-details__media')!;
    const rest = panelTop(screen);
    await step('Покой: панель под фото, не свёрнуто', async () => {
      await expect(screen).not.toHaveAttribute('data-collapsed');
      await expect(rest).toBe(511);
    });
    await step('Вверх на 60 % и отпустить → свернулось', async () => {
      await pull(screen, 0.6);
      await waitFor(() => expect(p(screen)).toBe(1), { timeout: 2000 });
      await expect(screen).toHaveAttribute('data-collapsed');
      await expect(panelTop(screen)).toBe(138);
      await expect(Math.round(media.getBoundingClientRect().width)).toBe(48);
    });
    await step('Вниз на 30 % и отпустить → осталось свёрнутым', async () => {
      await pull(screen, -0.3);
      await waitFor(() => expect(p(screen)).toBe(1), { timeout: 2000 });
      await expect(screen).toHaveAttribute('data-collapsed');
    });
    await step('Вниз на 60 % и отпустить → развернулось', async () => {
      await pull(screen, -0.6);
      await waitFor(() => expect(p(screen)).toBe(0), { timeout: 2000 });
      await expect(screen).not.toHaveAttribute('data-collapsed');
      await expect(panelTop(screen)).toBe(rest);
    });
    await step('Вверх на 30 % и отпустить → вернулось в покой', async () => {
      await pull(screen, 0.3);
      await waitFor(() => expect(p(screen)).toBe(0), { timeout: 2000 });
      await expect(screen).not.toHaveAttribute('data-collapsed');
      await expect(panelTop(screen)).toBe(rest);
      await expect(Math.round(media.getBoundingClientRect().width)).toBe(353);
    });
  },
};
