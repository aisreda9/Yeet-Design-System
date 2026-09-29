import type { ComponentType } from 'react';

/**
 * Реестр экранов прототипа: те же истории, что в «Pages / Экраны флоу», — без копий.
 * Файлы `src/pages/*.stories.tsx` подхватываются сами (id = имя экспорта, имена в разделах не повторяются):
 * новая история раздела или целый новый файл появляется в списке без правок здесь. Ссылка на неё — запись в `routes.ts`.
 */
const files = import.meta.glob<Record<string, unknown>>(['../*.stories.tsx', '!../Prototype.stories.tsx'], { eager: true });
const modules: Record<string, unknown> = Object.assign({}, ...Object.values(files));
export type ScreenId = string;

type StoryLike = { name?: string; render?: () => unknown };

export type ScreenDef = {
  id: ScreenId;
  /** Имя как в Figma: `Раздел / Экран / Состояние`. */
  name: string;
  Component: ComponentType;
  /** Шторка или диалог: открываются поверх текущего экрана, а не вместо него. */
  overlay: boolean;
};

/**
 * Шторка или диалог — по имени истории (`… / Sheet / …`, `… / Dialog / …`, правило Figma-имён): в прототипе от такой истории
 * остаётся только слой поверх текущего экрана. Исключение — шторки, которыми экран управляет сам (профиль: аккаунты, период):
 * там открывается весь экран с уже открытой шторкой.
 */
const NATIVE_SHEETS = new Set<string>(['AccountsMulti', 'AccountsSingle', 'PeriodSheet']);
const isOverlay = (id: string, name: string) => /\/ (Sheet|Dialog) \//.test(name) && !NATIVE_SHEETS.has(id);

export const screens = Object.fromEntries(
  Object.entries(modules)
    .filter(([id, story]) => id !== 'default' && typeof (story as StoryLike).render === 'function')
    .map(([id, story]) => [id, { id, name: (story as StoryLike).name ?? id, Component: (story as { render: ComponentType }).render, overlay: isOverlay(id, (story as StoryLike).name ?? '') }]),
) as Record<ScreenId, ScreenDef>;

/** Корневые экраны пяти вкладок таб-бара. */
export const TAB_ROOTS = { today: 'Today', search: 'SearchDiscover', wardrobe: 'Wardrobe', stylist: 'StylistHome', profile: 'ProfileAnalytics' } as const satisfies Record<string, ScreenId>;
