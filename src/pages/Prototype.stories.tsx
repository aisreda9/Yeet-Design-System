import type { Meta, StoryObj } from '@storybook/react-vite';
import { Prototype } from './prototype/Prototype';
import type { ScreenId } from './prototype/screens';

/* Кликабельный прототип: все экраны «Pages / Экраны флоу», связанные переходами и жестами. Карта переходов — prototype/routes.ts. */
const meta = {
  title: 'Прототип/Приложение',
  component: Prototype,
  tags: ['no-visual'], // без пиксельного эталона: экраны те же, что в Pages/* (scripts/qa/run.mjs)
  parameters: {
    layout: 'centered', controls: { disable: true }, options: { showPanel: false },
    docs: { description: { component: 'Предпросмотр приложения: экраны из «Pages / Экраны флоу» связаны в один флоу — переходы push / pop, шторки и диалоги, вкладки, скролл, свайп назад и смахивание шторки.' } },
  },
} satisfies Meta<typeof Prototype>;
export default meta;
type Story = StoryObj<typeof meta>;

/** С запуска: сплэш → онбординг → вход → главная. */
export const FromStart: Story = { name: 'С запуска', args: {} };

/** Сразу главная, без онбординга: удобно смотреть вкладки и гардероб. */
export const FromHome: Story = { name: 'Главная', args: { start: 'Today' satisfies ScreenId } };
