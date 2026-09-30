import { addons, types, useStorybookState } from 'storybook/manager-api';
import { create } from 'storybook/theming';
import { createElement } from 'react';
import { statusMeta, storyStatus } from '../src/docs/status';
import { figmaTarget, figmaUrl } from '../src/docs/figma';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'yeet · Design System',
    brandTarget: '_self',
    colorPrimary: '#0100F4',
    colorSecondary: '#0100F4',
    appBg: '#F7F7F7',
    appContentBg: '#FFFFFF',
    appBorderColor: 'rgba(0,0,0,0.1)',
    appBorderRadius: 20,
    fontBase: '"Inter", -apple-system, sans-serif',
    textColor: '#000000',
    barSelectedColor: '#0100F4',
  }),
  sidebar: {
    showRoots: true,
    // Бейдж зрелости из src/docs/registry.ts (status) рядом с компонентом; стиль — только в менеджере, в canvas и QA-снимки не попадает
    renderLabel: (item) => {
      const status = item.type === 'component' ? storyStatus[item.id] : undefined;
      if (!status) return item.name;
      const m = statusMeta[status];
      return createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 6 } }, item.name,
        createElement('span', { title: m.rule, style: { font: '500 10px/14px sans-serif', padding: '0 6px', borderRadius: 8, color: m.color, background: m.bg } }, m.label));
    },
  },
});

// Кнопка «Figma» в тулбаре: компонент → его узел в DS 0.2, экран Pages → кадр, документация → секция уровня (src/docs/figma.ts)
function FigmaTool() {
  const { storyId, index } = useStorybookState();
  const entry = storyId ? index?.[storyId] : undefined;
  const target = entry && 'title' in entry ? figmaTarget(entry.title, storyId) : undefined;
  if (!target) return null;
  return createElement(
    'a',
    {
      href: figmaUrl(target.id),
      target: '_blank',
      rel: 'noreferrer',
      title: `${target.label} (${target.id})`,
      style: { display: 'inline-flex', alignItems: 'center', height: 28, padding: '0 10px', margin: '6px 4px', borderRadius: 14, font: '600 12px/16px "Inter", sans-serif', color: '#0100F4', background: '#EDEDFF', textDecoration: 'none' },
    },
    'Figma ↗',
  );
}

addons.register('yeet/figma', () => {
  addons.add('yeet/figma/tool', { type: types.TOOL, title: 'Figma', match: () => true, render: FigmaTool });
});
