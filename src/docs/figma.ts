/**
 * Навигация Storybook → Figma: для любой истории или страницы документации — узел на странице Design System 0.2.
 * Кнопка «Figma» в тулбаре (`.storybook/manager.ts`) и колонка «Секция Figma» в «Figma ↔ код» (`blocks.tsx`).
 * Файл без React и CSS: его импортирует и менеджер Storybook, и документация.
 */
import { registry, type Entry } from './registry';
import snapshot from './figma-nodes.json';
import flows from '../../design/figma-flows.json';

export const FIGMA_FILE = '1LAkot5WySMWhwiiFJqJ0e';

/** Ссылка на узел в файле YeetStyle 2.0. */
export const figmaUrl = (id: string) =>
  `https://www.figma.com/design/${FIGMA_FILE}/YeetStyle-2.0?node-id=${id.replace(':', '-')}`;

/** Снимок узлов DS 0.2: node-id → [имя, тип, верхняя секция] (`figma-nodes.json`). */
export const figmaNodes = snapshot.nodes as unknown as Record<string, [name: string, type: string, section: string]>;

/** Секции страницы DS 0.2 — те же, что корни сайдбара Storybook. Ключ — префикс `title`, самый длинный выигрывает. */
const sections: Record<string, string> = {
  Старт: '971:3417',
  Foundations: '971:3420',
  'Foundations/Анимации': '1005:5032',
  'Foundations/Иконки': '942:5714',
  Atoms: '1392:18500',
  Molecules: '1392:31250',
  Organisms: '1392:31277',
  Templates: '1392:31304',
  Pages: '1168:12824',
};

/** Экран Pages → кадр в «Pages/Экраны флоу · Light» (`figma-flows.json → flow2`, первый id — светлая тема). */
const screens = Object.fromEntries(
  Object.entries(flows.flow2 as Record<string, unknown>).flatMap(([slug, ids]) =>
    Array.isArray(ids) && ids[0] ? [[slug, ids[0] as string]] : [],
  ),
);

const byStory = new Map<string, Entry[]>();
for (const e of registry) if (e.figmaId) byStory.set(e.story, [...(byStory.get(e.story) ?? []), e]);

export type FigmaTarget = { id: string; label: string };

/**
 * Куда вести из истории: компонент из реестра (хозяин — тот, чьё имя есть в `title`: `BottomNav & TabBar` → bottom-nav),
 * экран Pages по слагу, иначе секция уровня. `storyId` — id истории Storybook (`pages-экраны-флоу--wardrobe`).
 */
export function figmaTarget(title: string, storyId = ''): FigmaTarget | undefined {
  if (title.startsWith('Pages/')) {
    const id = screens[storyId.split('--')[1] ?? ''];
    if (id) return { id, label: 'Экран в Figma' };
  }
  const entries = byStory.get(title);
  if (entries?.length) {
    const words = title
      .split('/')
      .pop()!
      .split(/[^A-Za-z]+/);
    const owner = entries.find((e) => words.includes(e.code)) ?? entries[0];
    return { id: owner.figmaId!, label: `${owner.code} в Figma` };
  }
  const key = Object.keys(sections)
    .filter((k) => title === k || title.startsWith(`${k}/`))
    .sort((a, b) => b.length - a.length)[0];
  return key ? { id: sections[key], label: `Секция ${key} в Figma` } : undefined;
}

/** Верхняя секция DS 0.2, где лежит узел (`Atoms`, `Foundations`…), — по снимку. */
export const figmaSection = (id: string) => figmaNodes[id]?.[2];
