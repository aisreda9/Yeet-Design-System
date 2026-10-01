import { useState } from 'react';
import { Button } from '../atoms';
import { ChipGroup, List, ListItem, PhotoTile } from '../molecules';
import { Sheet } from '../organisms';
import { Row } from '../templates';
import type { ItemColor } from '../tokens/tokens';

/* Шторки, которые повторяются в нескольких разделах флоу: фото, категория, выбор чипсами. Только данные и сборка из компонентов DS. */

/** Категории одежды в шторке «Категория» — порядок и иконки как в Figma (`1173:16925`). */
const categories = [
  ['outerwear', 'Верхняя одежда'],
  ['top', 'Верх'],
  ['bottom', 'Низ'],
  ['shoe', 'Обувь'],
  ['accessories', 'Аксессуары'],
] as const;
/** Подкатегории раскрытого «Верха» (Figma `1144:3290`): выбрана «Футболка». */
const tops = ['Футболка', 'Поло', 'Топ', 'Рубашка'];

/**
 * Шторка «Категория»: строки раскрываются по нажатию, под раскрытой — подкатегории чипсами.
 * `expanded` — раскрыт «Верх» (Category Expanded), без него — все свёрнуты (Category Root).
 * `footer` — «Сбросить» / «Применить» у фильтра гардероба и выбора вещей; в форме вещи выбор применяется сразу, кнопок нет.
 */
export function CategorySheet({ expanded, footer }: { expanded?: boolean; footer?: boolean }) {
  const [open, setOpen] = useState<string | undefined>(expanded ? 'top' : undefined);
  const row = ([icon, label]: (typeof categories)[number]) => (
    <ListItem
      key={icon}
      variant="expandable"
      icon={icon}
      label={label}
      expanded={open === icon}
      onClick={() => setOpen((cur) => (cur === icon ? undefined : icon))}
    />
  );
  const at = categories.findIndex(([icon]) => icon === open);
  return (
    <Sheet title="Категория" footer={footer ? [{ label: 'Сбросить' }, { label: 'Применить' }] : undefined}>
      {at < 0 ? (
        <List>{categories.map(row)}</List>
      ) : (
        <>
          <List>{categories.slice(0, at + 1).map(row)}</List>
          <ChipGroup wrap chips={tops.map((label, k) => ({ label, selected: k === 0 }))} />
          {at < categories.length - 1 && <List>{categories.slice(at + 1).map(row)}</List>}
        </>
      )}
    </Sheet>
  );
}

/**
 * Шторка выбора чипсами без кнопок: заголовок → 16 → чипсы, выбран первый — выбор применяется сразу.
 * Сезон, пол, стиль, цвет вещи (`colorDot`).
 */
export function ChipSheet({
  title,
  chips,
}: {
  title: string;
  chips: (string | { label: string; colorDot: ItemColor })[];
}) {
  return (
    <Sheet title={title}>
      <ChipGroup
        wrap
        chips={chips.map((c, k) => ({ ...(typeof c === 'string' ? { label: c } : c), selected: k === 0 }))}
      />
    </Sheet>
  );
}

/** Сезоны — как в фильтре гардероба и в форме вещи. */
export const seasons = ['Все', 'Весна', 'Лето', 'Осень', 'Зима'];

/** Цвета вещи в шторке «Цвет» (Figma `1173:14464`): подписи с «ё», порядок как в макете. */
export const colors: { label: string; colorDot: ItemColor }[] = [
  { label: 'Чёрный', colorDot: 'black' },
  { label: 'Серый', colorDot: 'grey' },
  { label: 'Белый', colorDot: 'white' },
  { label: 'Фиолетовый', colorDot: 'purple' },
  { label: 'Розовый', colorDot: 'pink' },
  { label: 'Зелёный', colorDot: 'green' },
  { label: 'Синий', colorDot: 'blue' },
  { label: 'Жёлтый', colorDot: 'yellow' },
  { label: 'Оранжевый', colorDot: 'orange' },
  { label: 'Красный', colorDot: 'red' },
  { label: 'Бежевый', colorDot: 'beige' },
  { label: 'Коричневый', colorDot: 'brown' },
];

/**
 * Шторка фото без заголовка: галерея или камера; `replace` — у готового фото ещё «Удалить фотографию» (Figma `1147:3377`).
 * `label` — имя шторки для скринридера: видимого заголовка у неё нет.
 */
export function PhotoSheet({ label, replace }: { label: string; replace?: boolean }) {
  return (
    <Sheet label={label}>
      <Row gap={7}>
        <PhotoTile source="gallery" />
        <PhotoTile source="camera" />
      </Row>
      {replace && (
        <Button variant="tertiary" size="L" fullWidth>
          Удалить фотографию
        </Button>
      )}
    </Sheet>
  );
}

/** Поводы в шторке «Повод» — на главной и в фильтре образов. */
export const occasions = ['Все', 'На каждый день', 'Офис', 'Свидание', 'Вечеринка'];
/** Плейсхолдер чипса-поля своего повода (Figma `1174:15483`). */
export const OCCASION_PLACEHOLDER = 'Название';
