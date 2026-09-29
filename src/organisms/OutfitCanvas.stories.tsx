import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { OutfitCanvas, type CanvasItem } from '.';
import { Snackbar } from '../molecules';

const initial: CanvasItem[] = [
  { id: 'glasses', kind: 'accessories', x: 32, y: 18, size: 56 },
  { id: 'top', kind: 'top', x: 66, y: 34, color: 'green' },
  { id: 'bottom', kind: 'bottom', x: 30, y: 58, size: 140, color: 'green' },
  { id: 'shoes', kind: 'shoe', x: 72, y: 76, size: 72, color: 'brown' },
];

type Args = { showHint: boolean };

const meta: Meta<Args> = {
  title: 'Organisms/OutfitCanvas',
  tags: ['autodocs'],
  args: { showHint: true },
  decorators: [(Story) => <div style={{ width: 353 }}><Story /></div>],
  parameters: { docs: { description: { component: 'Холст создания образа: тяни вещь пальцем, щипок (или колесо мыши на выбранной вещи) — масштаб 40–300, выбранная вещь поднимается наверх. Подсказка — Snackbar поверх холста. Контекст: Outfit Creation / Canvas.' } } },
  render: function Render({ showHint }) {
    const [items, setItems] = useState(initial);
    const [selected, setSelected] = useState<string>();
    const [hint, setHint] = useState(true);
    return (
      <OutfitCanvas
        items={items}
        onChange={setItems}
        selectedId={selected}
        onSelect={setSelected}
        hint={showHint && hint ? <Snackbar size="S" onClose={() => setHint(false)}>Перемещай и масштабируй вещи</Snackbar> : undefined}
      />
    );
  },
};
export default meta;
export const Playground: StoryObj<Args> = {};

const item = (canvas: HTMLElement, name: string) => within(canvas).getByRole('button', { name });
const status = (canvas: HTMLElement) => canvas.querySelector('[role="status"]')!.textContent;

/** Клавиатура: одна точка Tab, стрелки — к соседней вещи, Enter — выбрать, стрелки / ± / Delete / Esc — у выбранной. */
export const Keyboard: StoryObj<Args> = {
  name: 'Клавиатура',
  args: { showHint: false },
  parameters: { controls: { disable: true }, docs: { description: { story: 'Tab — на холст (одна точка, roving tabindex). Стрелки без выбора — к соседней вещи в порядке чтения; `Enter` / `Space` — выбрать; у выбранной стрелки двигают на 1 % (Shift — 10 %), `+` / `−` — размер ×1.1, `Delete` — удалить, `Esc` — снять выбор. Положение озвучивается.' } } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step('Tab — на первую вещь по порядку чтения, стрелка — к следующей', async () => {
      await userEvent.tab();
      await expect(item(canvasElement, 'Аксессуары')).toHaveFocus();
      await userEvent.keyboard('{ArrowDown}');
      await expect(item(canvasElement, 'Верх')).toHaveFocus();
      await expect(canvas.getAllByRole('button').filter((b) => b.tabIndex === 0)).toHaveLength(1);
    });
    await step('Enter выбирает, стрелки двигают, фокус остаётся на вещи', async () => {
      await userEvent.keyboard('{Enter}');
      await expect(item(canvasElement, 'Верх')).toHaveAttribute('aria-pressed', 'true');
      await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{Shift>}{ArrowUp}{/Shift}');
      const top = item(canvasElement, 'Верх');
      await expect(top).toHaveFocus();
      await expect(top.style.left).toBe('69%');
      await expect(top.style.top).toBe('24%');
      await expect(status(canvasElement)).toBe('Верх: 69 % по горизонтали, 24 % по вертикали, размер 96');
    });
    await step('+ и − меняют размер', async () => {
      await userEvent.keyboard('++-');
      await waitFor(() => expect(status(canvasElement)).toMatch(/размер 106$/));
    });
    await step('Esc снимает выбор, Delete удаляет — фокус на соседней вещи', async () => {
      await userEvent.keyboard('{Escape}');
      await expect(item(canvasElement, 'Верх')).toHaveAttribute('aria-pressed', 'false');
      await userEvent.keyboard('{Delete}');
      await expect(canvas.queryByRole('button', { name: 'Верх' })).toBeNull();
      await expect(status(canvasElement)).toBe('Удалено: Верх');
      await waitFor(() => expect(item(canvasElement, 'Низ')).toHaveFocus());
    });
  },
};

/** Синтетическое касание пальцем. */
const touch = (target: Element, type: string, pointerId: number, x: number, y: number) =>
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId, pointerType: 'touch', isPrimary: pointerId === 1, clientX: x, clientY: y }));

/** Щипок на уровне холста: первый палец на вещи, второй — на пустом месте; удаление посреди жеста не роняет холст. */
export const Pinch: StoryObj<Args> = {
  name: 'Щипок любой вещи',
  args: { showHint: false },
  parameters: { controls: { disable: true }, docs: { description: { story: 'Второй палец может лечь куда угодно — на пустое место или другую вещь: щипок масштабирует вещь первого пальца. Колесо мыши над холстом масштабирует выбранную вещь и не прокручивает страницу.' } } },
  play: async ({ canvasElement, step }) => {
    const board = canvasElement.querySelector('.y-canvas')!;
    const shoes = item(canvasElement, 'Обувь');
    const r = shoes.getBoundingClientRect(), b = board.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    await step('Палец на обуви, второй — на пустом месте: обувь растёт', async () => {
      touch(shoes, 'pointerdown', 1, cx, cy);
      touch(board, 'pointerdown', 2, b.left + 20, b.top + 20);
      for (let i = 1; i <= 5; i++) touch(board, 'pointermove', 2, b.left + 20 - i * 4, b.top + 20 - i * 4);
      touch(board, 'pointerup', 2, b.left, b.top);
      touch(board, 'pointerup', 1, cx, cy);
      await waitFor(() => expect(shoes).toHaveAttribute('aria-pressed', 'true'));
      await expect(shoes.firstElementChild!.getBoundingClientRect().width).toBeGreaterThan(r.width);
    });
    await step('Колесо над холстом — масштаб выбранной, без прокрутки страницы', async () => {
      const wheel = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 100, clientX: cx, clientY: cy });
      board.dispatchEvent(wheel);
      await expect(wheel.defaultPrevented).toBe(true);
    });
  },
};
