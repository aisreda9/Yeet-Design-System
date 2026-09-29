/**
 * Статус компонента из `registry.ts` → бейдж в сайдбаре Storybook (`.storybook/manager.ts`) и колонка в «Figma ↔ код».
 * Файл без React и CSS: его импортирует и менеджер Storybook, и документация.
 */
import { registry, type Status } from './registry';

export const statusMeta: Record<Status, { label: string; color: string; bg: string; rule: string }> = {
  stable: { label: 'stable', color: '#0B6B3A', bg: '#E3F5EA', rule: 'Figma-компонент + код + история «В флоу» + на экранах + эталоны QA. Можно брать в продукт.' },
  beta: { label: 'beta', color: '#7A4B00', bg: '#FFF1D6', rule: 'Уже на экранах и под QA, но чего-то не хватает (Figma-компонента или истории «В флоу»). API меняется только с записью в PR.' },
  alpha: { label: 'alpha', color: '#0100F4', bg: '#EDEDFF', rule: 'Ещё не на экранах или без Figma. API может поменяться без предупреждения.' },
  deprecated: { label: 'deprecated', color: '#A3231A', bg: '#FDE8E6', rule: 'Не использовать в новом коде. Чем заменить — в причине.' },
};

/** Порядок «хуже → лучше»: у истории с несколькими компонентами бейдж — по самому незрелому. */
const rank: Status[] = ['deprecated', 'alpha', 'beta', 'stable'];

/** id ветки сайдбара так же, как его строит Storybook из `title` (`Organisms/BottomNav & TabBar` → `organisms-bottomnav-tabbar`). */
export const storyId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Статус истории для бейджа. Хозяева истории — компоненты из её имени (`Organisms/BottomNav & TabBar` → BottomNav, TabBar);
 * вспомогательные (ItemArt в `Organisms/ItemCard`) бейдж не портят. Из нескольких хозяев берётся самый незрелый.
 * `Pages/…` пропускаются: экран — не компонент.
 */
export const storyStatus: Record<string, Status> = {};
const byStory = new Map<string, typeof registry>();
for (const e of registry) {
  if (e.story.startsWith('Pages/')) continue;
  byStory.set(e.story, [...(byStory.get(e.story) ?? []), e]);
}
for (const [title, entries] of byStory) {
  const words = title.split('/').pop()!.split(/[^A-Za-z]+/);
  const owners = entries.filter((e) => words.includes(e.code));
  const statuses = (owners.length ? owners : entries).map((e) => e.status);
  storyStatus[storyId(title)] = statuses.sort((a, b) => rank.indexOf(a) - rank.indexOf(b))[0];
}
