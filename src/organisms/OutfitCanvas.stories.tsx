import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
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
