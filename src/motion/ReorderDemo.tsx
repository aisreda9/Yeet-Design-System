import { useState } from 'react';
import { garmentNames, ItemCard, StatusBar, type Garment } from '../organisms';
import { Grid } from '../templates';
import type { ItemColor } from '../tokens/tokens';
import { HapticChip } from './Mechanics';
import { useGridReorder } from './useGridReorder';

type Thing = { id: string; kind: Garment; color: ItemColor };

/** Вещи демо: id — буква, чтобы play-тест проверял порядок строкой. */
export const reorderDemoItems: Thing[] = [
  { id: 'a', kind: 'outerwear', color: 'beige' },
  { id: 'b', kind: 'top', color: 'green' },
  { id: 'c', kind: 'bottom', color: 'blue' },
  { id: 'd', kind: 'shoe', color: 'white' },
  { id: 'e', kind: 'container', color: 'black' },
  { id: 'f', kind: 'accessories', color: 'brown' },
  { id: 'g', kind: 'top', color: 'yellow' },
  { id: 'h', kind: 'bottom', color: 'black' },
  { id: 'i', kind: 'outerwear', color: 'green' },
  { id: 'j', kind: 'shoe', color: 'brown' },
  { id: 'k', kind: 'top', color: 'blue' },
  { id: 'l', kind: 'container', color: 'beige' },
];

/**
 * Сетка вещей с перестановкой долгим тапом (`useGridReorder`, #209) — та же, что в Гардеробе и Вишлисте.
 * Экран прокручивается: у краёв при перетаскивании включается автоскролл.
 */
export function ReorderDemo() {
  const [items, setItems] = useState(reorderDemoItems);
  const reorder = useGridReorder({
    items,
    getKey: (it) => it.id,
    onReorder: setItems,
    getLabel: (it) => garmentNames[it.kind],
  });
  return (
    <div className="y-motion-phone">
      <StatusBar />
      <div className="y-reorder-demo">
        <p className="y-caption y-text--secondary">
          Подержи вещь и веди — соседи раздвигаются; у края экрана сетка прокручивается сама. Подержать и отпустить, не
          двигая, — шторка действий (в прототипе). С клавиатуры: пробел — взять, стрелки — двигать, пробел или Enter —
          поставить, Esc — отменить.
        </p>
        <Grid {...reorder.gridProps}>
          {reorder.items.map((it) => (
            <ItemCard key={it.id} kind={it.kind} color={it.color} {...reorder.itemProps(it.id)} />
          ))}
          {reorder.announcer}
        </Grid>
      </div>
      <div className="y-reorder-demo__haptic">
        <HapticChip />
      </div>
    </div>
  );
}
