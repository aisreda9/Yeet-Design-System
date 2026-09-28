/**
 * Балансировка фото вещей, вырезанных ИИ (PNG с прозрачностью).
 *
 * Проблема: после удаления фона у каждой картинки свои поля, свой размер холста и своя «масса»:
 * футболка занимает 90 % кадра, кольцо — 10 %, у сумки ручка сдвигает центр вверх.
 * Если вписывать картинку целиком (object-fit: contain), вещи в сетке прыгают по размеру и положению.
 *
 * Решение в три шага (одинаково в вебе, iOS и Android — чистые функции без DOM):
 * 1. **Измерить** (`measureArt`, один раз при загрузке вещи, результат хранить рядом с фото):
 *    рамка непрозрачных пикселей (trim), доля заполнения рамки, центр масс по альфе.
 * 2. **Отмасштабировать по визуальному весу** (`balanceArt`): площадь непрозрачного
 *    приводится к целевой для категории, а не максимальная сторона — поэтому худи и кеды
 *    выглядят одного «веса», а не одного габарита. Ограничение — рамка не больше `maxFill` ячейки.
 * 3. **Центрировать оптически**: сдвиг к центру масс наполовину и не больше 6 % ячейки
 *    (полный сдвиг перекашивает вещи с ручками и шнурками).
 *
 * Коллаж (`layoutCollage`) раскладывает вещи по колонкам (верхняя одежда / тело / аксессуары и обувь)
 * с одинаковыми зазорами между обрезанными рамками, а не между холстами картинок.
 */
import type { Garment } from '../organisms/cards';

/** Метаданные вырезанной картинки. Все размеры — доли исходного холста (0…1), чтобы не зависеть от разрешения. */
export type ArtMeta = {
  /** Рамка непрозрачных пикселей: x, y, w, h в долях ширины / высоты холста. */
  box: [number, number, number, number];
  /** Соотношение сторон холста (ширина / высота). */
  ratio: number;
  /** Доля непрозрачных пикселей внутри рамки (0…1): плотность силуэта. */
  fill: number;
  /** Центр масс по альфе в долях холста. */
  center: [number, number];
};

/** Где показывается вещь: в ячейке сетки все вещи почти одного веса, в коллаже — ближе к реальным пропорциям. */
export type ArtContext = 'card' | 'collage';

/**
 * Визуальный вес категории: во сколько раз «сторона» силуэта (√площади) отличается от эталонного верха.
 * card — спокойная сетка гардероба, разница мягкая; collage — образ как на человеке.
 */
export const artWeight: Record<ArtContext, Record<Garment, number>> = {
  card: { top: 1, outerwear: 1.04, bottom: 1, shoe: 0.74, accessories: 0.66, container: 0.86 },
  collage: { top: 1, outerwear: 1.12, bottom: 1.04, shoe: 0.62, accessories: 0.5, container: 0.72 },
};

/** Параметры баланса. Значения по умолчанию — из сетки гардероба (ячейка 173, вещь ≈ 138). */
export type BalanceOptions = {
  /** Сторона эталонного верха в долях ячейки (√площади силуэта). */
  target?: number;
  /** Максимум рамки вещи в долях ячейки по любой стороне: поля ячейки не меньше (1 − maxFill) / 2. */
  maxFill?: number;
  /** Насколько подтягивать центр масс к центру ячейки (0 — по рамке, 1 — полностью). */
  optical?: number;
  /** Предел оптического сдвига в долях ячейки. */
  maxShift?: number;
};

const defaults: Required<BalanceOptions> = { target: 0.62, maxFill: 0.8, optical: 0.5, maxShift: 0.06 };

/** Баланс внутри коллажа: вещь крупнее в своей ячейке, рамка может занять её целиком. */
export const collageBalance: BalanceOptions = { target: 0.78, maxFill: 1 };

/** Результат: размер и положение картинки (всего холста, не рамки) внутри ячейки `cell`×`cell`, px. */
export type ArtPlacement = { width: number; height: number; left: number; top: number; /** Рамка силуэта после масштаба, px. */ w: number; h: number };

/**
 * Разместить вырезанную вещь в квадратной ячейке.
 * Без метаданных (ещё не измерена) — как object-fit: contain, чтобы не было скачка пустоты.
 */
export function balanceArt(meta: ArtMeta | undefined, cell: number, kind: Garment, context: ArtContext = 'card', opts: BalanceOptions = {}): ArtPlacement {
  const o = { ...defaults, ...opts };
  if (!meta) {
    const s = cell * o.maxFill;
    return { width: s, height: s, left: (cell - s) / 2, top: (cell - s) / 2, w: s, h: s };
  }
  const [bx, by, bw, bh] = meta.box;
  // холст картинки в px при «единичном» масштабе: ширина 1, высота 1/ratio
  const W = 1, H = 1 / meta.ratio;
  const boxW = bw * W, boxH = bh * H;
  // 2. масштаб по визуальному весу: √(площадь силуэта) → target × вес категории
  const area = boxW * boxH * Math.max(meta.fill, 0.05);
  let s = (cell * o.target * artWeight[context][kind]) / Math.sqrt(area);
  // …но рамка не выходит за maxFill ячейки
  s = Math.min(s, (cell * o.maxFill) / boxW, (cell * o.maxFill) / boxH);
  const width = W * s, height = H * s;
  const w = boxW * s, h = boxH * s;
  // 3. центр рамки → центр ячейки, затем частичный сдвиг к центру масс
  const boxCx = (bx + bw / 2) * width, boxCy = (by + bh / 2) * height;
  const massCx = meta.center[0] * width, massCy = meta.center[1] * height;
  const lim = cell * o.maxShift;
  const clamp = (v: number) => Math.max(-lim, Math.min(lim, v));
  const dx = clamp((massCx - boxCx) * o.optical), dy = clamp((massCy - boxCy) * o.optical);
  // сдвиг не выталкивает рамку за поля ячейки
  const pad = (cell - Math.max(w, h)) / 2;
  const left = cell / 2 - boxCx - Math.max(-pad, Math.min(pad, dx));
  const top = cell / 2 - boxCy - Math.max(-pad, Math.min(pad, dy));
  return { width, height, left, top, w, h };
}

/**
 * Измерить картинку: альфа-рамка, плотность, центр масс. Порог альфы 8/255 отсекает полупрозрачный «ореол» после вырезания.
 * Картинку уменьшаем до 128 по длинной стороне — точности хватает, а считается за ~1 мс.
 * Нужен тот же origin или CORS, иначе холст «грязный» и вернётся undefined (тогда — contain).
 */
export function measureArt(img: HTMLImageElement | ImageBitmap, alphaThreshold = 8): ArtMeta | undefined {
  const nw = 'naturalWidth' in img ? img.naturalWidth : img.width;
  const nh = 'naturalHeight' in img ? img.naturalHeight : img.height;
  if (!nw || !nh) return undefined;
  const k = Math.min(1, 128 / Math.max(nw, nh));
  const w = Math.max(1, Math.round(nw * k)), h = Math.max(1, Math.round(nh * k));
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return undefined;
  ctx.drawImage(img, 0, 0, w, h);
  let data: Uint8ClampedArray;
  try { data = ctx.getImageData(0, 0, w, h).data; } catch { return undefined; }
  return measureAlpha(data, w, h, alphaThreshold);
}

/** То же по сырому RGBA-буферу: для сервера / скрипта (sharp, pngjs) и тестов. */
export function measureAlpha(rgba: ArrayLike<number>, w: number, h: number, alphaThreshold = 8): ArtMeta | undefined {
  let x0 = w, y0 = h, x1 = -1, y1 = -1, n = 0, sx = 0, sy = 0, sa = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const a = rgba[(y * w + x) * 4 + 3];
      if (a <= alphaThreshold) continue;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      n++; sx += (x + 0.5) * a; sy += (y + 0.5) * a; sa += a;
    }
  if (x1 < 0) return undefined;
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
  const r = (v: number) => Math.round(v * 1e4) / 1e4;
  return { box: [r(x0 / w), r(y0 / h), r(bw / w), r(bh / h)], ratio: r(w / h), fill: r(n / (bw * bh)), center: [r(sx / sa / w), r(sy / sa / h)] };
}

/* ─── Коллаж ─────────────────────────────────────────────────────────── */

/** Вещь коллажа для автораскладки. */
export type CollageArt = { kind: Garment; meta?: ArtMeta };
/** Положение вещи на площадке: центр в %, size — сторона ячейки в px макета (как CollageItem). */
export type CollageSlot = { x: number; y: number; size: number };

/**
 * Колонка по категории: тело (верх, низ) и мелкое (аксессуары, сумка, обувь).
 * Если в образе и верхняя одежда, и верх — верхняя одежда уходит в свою колонку слева, иначе стопка слишком высокая и всё мельчает.
 */
const columnOf = (items: CollageArt[]) => {
  const layered = items.some((i) => i.kind === 'outerwear') && items.some((i) => i.kind === 'top');
  return (k: Garment) => (k === 'outerwear' ? 0 : k === 'top' || k === 'bottom' ? (layered ? 1 : 0) : 2);
};
/** Порядок сверху вниз: верхняя одежда → верх → низ; аксессуары → сумка → обувь. */
const order: Record<Garment, number> = { outerwear: 0, top: 1, bottom: 2, accessories: 0, container: 1, shoe: 2 };

/**
 * Автораскладка коллажа `base`×`base` (353): колонки (верхняя одежда · тело · мелкое), внутри — стопка сверху вниз.
 * Зазор `gap` — между рамками силуэтов (не холстами), одинаковый по вертикали и между колонками.
 * Композиция центрируется и, если не влезает в `base − 2·pad`, уменьшается целиком — пропорции вещей сохраняются.
 * Отрицательный gap даёт лёгкий нахлёст «как в журнале».
 */
export function layoutCollage(items: CollageArt[], { base = 353, pad = 24, gap = 12, cell = 150 }: { base?: number; /** Поля площадки: число или [сверху, справа, снизу, слева] — под бейдж повода и панель цены. */ pad?: number | [number, number, number, number]; gap?: number; /** Ячейка эталонного верха, px макета. */ cell?: number } = {}): CollageSlot[] {
  const [pt, pr, pb, pl] = typeof pad === 'number' ? [pad, pad, pad, pad] : pad;
  const column = columnOf(items);
  const placed = items.map((it, i) => {
    const p = balanceArt(it.meta, cell, it.kind, 'collage', collageBalance);
    return { i, col: column(it.kind), ord: order[it.kind], w: p.w, h: p.h };
  });
  const cols = [0, 1, 2].map((c) => placed.filter((p) => p.col === c).sort((a, b) => a.ord - b.ord)).filter((c) => c.length);
  const colW = cols.map((c) => Math.max(...c.map((p) => p.w)));
  const colH = cols.map((c) => c.reduce((s, p) => s + p.h, 0) + gap * (c.length - 1));
  const totalW = colW.reduce((s, w) => s + w, 0) + gap * Math.max(0, cols.length - 1);
  const totalH = Math.max(0, ...colH);
  const availW = base - pl - pr, availH = base - pt - pb;
  // одна-две вещи можно чуть укрупнить (до 1.25), много вещей — уменьшаем всю композицию
  const k = Math.min(1.25, availW / totalW, availH / totalH);
  const out: CollageSlot[] = new Array(items.length);
  let x = pl + (availW - totalW * k) / 2;
  cols.forEach((c, ci) => {
    let y = pt + (availH - colH[ci] * k) / 2;
    for (const p of c) {
      const cx = x + (colW[ci] * k) / 2, cy = y + (p.h * k) / 2;
      out[p.i] = { x: (cx / base) * 100, y: (cy / base) * 100, size: cell * k };
      y += (p.h + gap) * k;
    }
    x += (colW[ci] + gap) * k;
  });
  return out;
}
