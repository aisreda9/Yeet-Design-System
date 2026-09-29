import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: ['../src/docs/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    // Панель «Accessibility» для авторов историй; гейт — axe в npm run qa, а не аддон
    '@storybook/addon-a11y',
    // Истории как тесты в headless Chromium: npm run test-storybook (vitest.config.ts), CI — job «Play-тесты»
    '@storybook/addon-vitest',
  ],
  framework: { name: '@storybook/react-vite', options: {} },
  // Шрифты Google Fonts (Inter, Roboto Slab) раздаются из репозитория — без внешнего CDN.
  staticDirs: [{ from: '../tokens/fonts', to: '/fonts' }, { from: '../.downloads', to: '/downloads' }], // .downloads — npm run assets (раздел «Ресурсы»)
  core: { disableTelemetry: true },
  docs: { defaultName: 'Документация' },
};

export default config;
