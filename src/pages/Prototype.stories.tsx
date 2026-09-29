import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Prototype } from './prototype/Prototype';
import type { ScreenId } from './prototype/screens';

/* Кликабельный прототип: все экраны «Pages / Экраны флоу», связанные переходами и жестами. Карта переходов — prototype/routes.ts. */
const meta = {
  title: 'Старт/Прототип',
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

/* ─── Play: путь в каждую шторку и диалог из #54 ─────────────────────── */

type Canvas = ReturnType<typeof within>;
/** Переход доиграл: во время анимации прототип не принимает нажатия. */
const idle = (root: HTMLElement) => waitFor(() => expect(root.querySelector('.y-proto__frame')).not.toHaveAttribute('data-busy'));
const tap = async (root: HTMLElement, el: Element) => { await userEvent.click(el); await idle(root); };
const dialog = (c: Canvas, name: string) => c.findByRole('alertdialog', { name });
const sheet = (c: Canvas, name: string) => c.findByRole('dialog', { name });
const gone = (c: Canvas, role: 'dialog' | 'alertdialog') => waitFor(() => expect(c.queryByRole(role)).toBeNull());

/** Создание образа: перемешать, фильтр вещей, очистить (долгое нажатие на холст), выход с несохранёнными вещами. */
export const CreationOverlays: Story = {
  name: 'Оверлеи: создание образа',
  args: { start: 'OutfitItems' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    const c = within(root);
    await tap(root, await c.findByRole('button', { name: 'Перемешать' }));
    await tap(root, within(await dialog(c, 'Перемешать образ?')).getByRole('button', { name: 'Перемешать' }));
    await gone(c, 'alertdialog');

    await tap(root, c.getByRole('button', { name: 'Далее' }));
    await tap(root, await c.findByRole('button', { name: /^Категория/ }));
    await tap(root, within(await sheet(c, 'Низ')).getByRole('button', { name: 'Использовать' }));
    await gone(c, 'dialog');

    // долгое нажатие (правая кнопка) на пустой холст; рискованный диалог не закрывается по затемнению
    root.querySelector('.y-proto__layer:not([data-buried]) .y-canvas')!.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    await idle(root);
    const clear = await dialog(c, 'Очистить образ?');
    await tap(root, clear.closest('.y-overlay')!);
    await expect(clear).toBeVisible();
    await tap(root, within(clear).getByRole('button', { name: 'Отмена' }));
    await gone(c, 'alertdialog');

    // «Назад» с вещами — диалог; безопасный закрывается и Escape, и выходом
    await tap(root, c.getByRole('button', { name: 'Назад' }));
    await dialog(c, 'Точно хочешь выйти?');
    await userEvent.keyboard('{Escape}');
    await idle(root);
    await gone(c, 'alertdialog');
    await tap(root, c.getByRole('button', { name: 'Назад' }));
    await tap(root, within(await dialog(c, 'Точно хочешь выйти?')).getByRole('button', { name: 'Выйти' }));
    await waitFor(() => expect(root.querySelectorAll('.y-proto__layer:not([data-buried]) .y-canvas')).toHaveLength(0));
  },
};

/** Настройки и профиль: выход из аккаунта, фото профиля (добавить, заменить, удалить), год рождения. */
export const ProfileOverlays: Story = {
  name: 'Оверлеи: настройки и профиль',
  args: { start: 'Settings' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    const c = within(root);
    await tap(root, await c.findByRole('button', { name: 'Выйти' }));
    await tap(root, within(await dialog(c, 'Точно хочешь выйти?')).getByRole('button', { name: 'Отменить' }));
    await gone(c, 'alertdialog');

    await tap(root, c.getByRole('button', { name: /sima@space\.com/ }));
    await c.findByText('Редактирование профиля');
    await tap(root, await c.findByRole('button', { name: 'Изменить фото профиля' }));
    await tap(root, within(await sheet(c, 'Фото профиля')).getAllByRole('button')[0]);
    await gone(c, 'dialog');
    await tap(root, await c.findByRole('button', { name: 'Изменить фото профиля' }));
    await tap(root, within(await sheet(c, 'Фото профиля')).getByRole('button', { name: 'Удалить фотографию' }));
    await gone(c, 'dialog');

    await tap(root, c.getByRole('button', { name: /^Год рождения/ }));
    await tap(root, within(await sheet(c, 'Год рождения')).getByText('1995'));
    await gone(c, 'dialog');
  },
};
