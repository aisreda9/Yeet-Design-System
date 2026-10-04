import type { Decorator, Preview } from '@storybook/react-vite';
import '../src/styles.css';
import './preview.css';

// Размер экрана: макеты Figma — 393×852; остальное — проверка резиновой вёрстки
const devices: Record<string, { title: string; width: number; height: number }> = {
  s320: { title: '320 × 568 · маленький (SE 1)', width: 320, height: 568 },
  a360: { title: '360 × 800 · Android', width: 360, height: 800 },
  s375: { title: '375 × 667 · iPhone SE 3', width: 375, height: 667 },
  i393: { title: '393 × 852 · iPhone 15 (Figma)', width: 393, height: 852 },
  m430: { title: '430 × 932 · iPhone 15 Pro Max', width: 430, height: 932 },
};

const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme as string) ?? 'light';
  const device = devices[(context.globals.device as string) ?? 'i393'] ?? devices.i393;
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
  return (
    <div className="sb-canvas" data-theme={theme} style={{ ['--screen-width' as string]: `${device.width}px`, ['--screen-height' as string]: `${device.height}px` }}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Тема',
      toolbar: {
        title: 'Тема',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Светлая', icon: 'sun' },
          { value: 'dark', title: 'Тёмная', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    device: {
      description: 'Размер экрана',
      toolbar: {
        title: 'Экран',
        icon: 'mobile',
        items: Object.entries(devices).map(([value, d]) => ({ value, title: d.title })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light', device: 'i393' },
  parameters: {
    layout: 'centered',
    controls: { expanded: true, sort: 'requiredFirst' },
    backgrounds: { disable: true },
    a11y: { test: 'todo' }, // addon-a11y: нарушения видны в панели, но не валят тесты
    options: {
      storySort: {
        order: [
          'Старт',
          [
            'Быстрый старт', 'О проекте', 'Введение', 'Принципы', 'Атомарная система', 'Как пользоваться',
            'Прототип', 'Процессы', ['Figma ↔ код', 'iOS и Android', 'Ресурсы'], 'Для разработчиков', ['Обзор', 'Примитивы'],
          ],
          'Foundations',
          ['Токены и семантика', 'Типографика', 'Отступы и радиусы', 'Иконки', 'Скролл и края экрана', 'Резиновая вёрстка', 'Анимации', 'Тексты и тон'],
          'Atoms',
          'Molecules',
          'Organisms',
          'Templates',
          ['Screen', 'DetailsScreen', 'Prose'],
          'Pages',
        ],
      },
    },
  },
};

export default preview;
