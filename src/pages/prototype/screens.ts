import type { ComponentType } from 'react';
import * as creation from '../Creation.stories';
import * as onboarding from '../Onboarding.stories';
import * as outfits from '../Outfits.stories';
import * as profile from '../Profile.stories';
import * as search from '../Search.stories';
import * as settings from '../Settings.stories';
import * as stylist from '../Stylist.stories';
import * as wardrobe from '../Wardrobe.stories';

/**
 * Реестр экранов прототипа: те же истории, что в «Pages / Экраны флоу», — без копий.
 * Новая история раздела появляется здесь сама (id = имя экспорта); связь с соседями — в `routes.ts`.
 */
const modules = { ...onboarding, ...outfits, ...creation, ...search, ...stylist, ...profile, ...settings, ...wardrobe };
type Modules = typeof modules;
export type ScreenId = Exclude<keyof Modules, 'default'>;

type StoryLike = { name?: string; render?: () => unknown };

export type ScreenDef = {
  id: ScreenId;
  /** Имя как в Figma: `Раздел / Экран / Состояние`. */
  name: string;
  Component: ComponentType;
  /** Шторка или диалог: открываются поверх текущего экрана, а не вместо него. */
  overlay: boolean;
};

/** Истории, где экран — лишь подложка для шторки или диалога: в прототипе показывается только сам слой. */
const OVERLAYS = new Set<string>(['FilterSheet', 'ItemActions', 'ClearTrash', 'PasswordRecoverySent', 'DeleteAccount', 'CountrySheet', 'CurrencySheet', 'PriceFilter']);

export const screens = Object.fromEntries(
  Object.entries(modules)
    .filter(([id, story]) => id !== 'default' && typeof (story as StoryLike).render === 'function')
    .map(([id, story]) => [id, { id, name: (story as StoryLike).name ?? id, Component: (story as { render: ComponentType }).render, overlay: OVERLAYS.has(id) }]),
) as Record<ScreenId, ScreenDef>;

/** Корневые экраны пяти вкладок таб-бара. */
export const TAB_ROOTS = { today: 'Today', search: 'SearchDiscover', wardrobe: 'Wardrobe', stylist: 'StylistHome', profile: 'ProfileAnalytics' } as const satisfies Record<string, ScreenId>;
