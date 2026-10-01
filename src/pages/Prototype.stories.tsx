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
/** Заголовки шторок действий — имя вещи и повод образа, как в Figma (#216, строки 1–2). */
const ITEM = 'Белое платье с красными вкраплениями';
const OCCASION = 'На каждый день';

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
    await tap(root, within(clear).getByRole('button', { name: 'Отменить' }));
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

    await tap(root, root.querySelector('.y-account')!); // строка со своей кнопкой «Выйти» — не role=button
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

/* ─── Play: цепочки #136 — новая вещь, онбординг, стилист, поездка, поиск ─ */

/** Верхний экран стека (`data-screen` у слоя прототипа). */
const at = async (root: HTMLElement, id: ScreenId, timeout = 2000) => {
  await waitFor(() => expect([...root.querySelectorAll<HTMLElement>('.y-proto__layer')].at(-1)?.dataset.screen).toBe(id), { timeout });
  await idle(root);
};
const topEl = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>('.y-proto__layer')].at(-1)!;
const topLayer = (root: HTMLElement) => within(topEl(root));
const q = (root: HTMLElement, sel: string) => topEl(root).querySelector<HTMLElement>(sel)!;
const back = (root: HTMLElement) => tap(root, topLayer(root).getByRole('button', { name: 'Назад' }));
/** «Добавить» внизу формы — не «+» у тегов. */
const submit = (root: HTMLElement) => topLayer(root).getAllByRole('button', { name: 'Добавить' }).find((b) => b.matches('.y-button--full'))!;

/** Новая вещь: FAB → без фото → фото → загрузка (сама) → фото добавлено → «Добавить» → гардероб со snackbar. */
export const NewItemChain: Story = {
  name: 'Цепочка: новая вещь',
  args: { start: 'Wardrobe' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    const c = within(root);
    const fab = () => q(root, '.y-bottom-nav__fab button');
    await tap(root, fab());
    await at(root, 'NewItemNoPhotoV2');
    await back(root);
    await at(root, 'Wardrobe');

    await tap(root, fab());
    await at(root, 'NewItemNoPhotoV2');
    await tap(root, q(root, '.y-photo-area__add'));
    await at(root, 'NewItem');
    await at(root, 'NewItemPhotoV2', 5000);
    await tap(root, submit(root));
    await at(root, 'Wardrobe');
    await c.findByText('Вещь добавлена в гардероб');
  },
};

/** Онбординг: вход → имя → первая вещь; «Пропустить» — сразу на главную (Figma `1173:21880`). С каждого шага — «Назад». */
export const OnboardingChain: Story = {
  name: 'Цепочка: онбординг',
  args: { start: 'SignIn' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    const c = within(root);
    await tap(root, await c.findByRole('button', { name: 'Войти' }));
    await at(root, 'OnboardingName');
    await back(root);
    await at(root, 'SignIn');
    await tap(root, c.getByRole('button', { name: 'Войти' }));
    await at(root, 'OnboardingName');
    await tap(root, topLayer(root).getByRole('button', { name: 'Далее' }));
    await at(root, 'FirstItemPrompt');

    await tap(root, topLayer(root).getByRole('button', { name: 'Добавить' }));
    await at(root, 'NewItemNoPhotoV1');
    await back(root);
    await at(root, 'FirstItemPrompt');

    await tap(root, topLayer(root).getByRole('button', { name: 'Пропустить' }));
    await at(root, 'Today');
  },
};

/** Первая вещь в онбординге — форма Variant 01: без фото → загрузка (сама) → фото → поле → заполнено → «Добавить» → первый образ → главная. */
export const OnboardingFirstItem: Story = {
  name: 'Цепочка: первая вещь в онбординге',
  args: { start: 'FirstItemPrompt' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    const c = within(root);
    await at(root, 'FirstItemPrompt');
    await tap(root, topLayer(root).getByRole('button', { name: 'Добавить' }));
    await at(root, 'NewItemNoPhotoV1');
    await tap(root, q(root, '.y-photo-area__add'));
    await at(root, 'NewItemLoadingV1');
    await at(root, 'NewItemPhotoV1', 5000);
    await tap(root, q(root, '.y-field input'));
    await at(root, 'NewItemCompletedV1');
    await tap(root, submit(root));
    await at(root, 'FirstOutfit');
    await c.findByText('Первая вещь добавлена');
    await tap(root, topLayer(root).getByRole('button', { name: 'Сохранить образ и завершить' }));
    await at(root, 'Today');
  },
};

/** Главная: «на каждый день ⌄» открывает шторку «Повод» (Figma OPEN_OVERLAY `1173:14091`), выбор меняет акцент в шапке. */
export const TodayOccasion: Story = {
  name: 'Цепочка: повод на главной',
  args: { start: 'Today' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    const c = within(root);
    await at(root, 'Today');
    await tap(root, q(root, '.y-header__accent'));
    await tap(root, await within(await sheet(c, 'Повод')).findByRole('button', { name: 'Офис' }));
    await gone(c, 'dialog');
    await waitFor(() => expect(q(root, '.y-header__accent')).toHaveTextContent('офис'));
  },
};

/** Вишлист: «+» → пустая форма → поле → заполненная форма → «Добавить» → вишлист с тостом. */
export const WishlistNewItemChain: Story = {
  name: 'Цепочка: новая вещь в вишлисте',
  args: { start: 'Wishlist' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    const c = within(root);
    await at(root, 'Wishlist');
    await tap(root, q(root, '.y-bottom-nav__fab button'));
    await at(root, 'WishlistNewItem');
    await tap(root, q(root, '.y-field input'));
    await at(root, 'WishlistNewItemCompleted');
    await tap(root, submit(root));
    await at(root, 'Wishlist');
    await c.findByText('Вещь добавлена в вишлист');
  },
};

/** Стилист: «Удиви меня» → стопка до конца → «образы закончились» → «Показать ещё»; «С чем носить» → вещь из образа. */
export const StylistChain: Story = {
  name: 'Цепочка: стилист',
  args: { start: 'StylistHome' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    const card = (name: RegExp) => [...topEl(root).querySelectorAll<HTMLElement>('.y-prompt-card')].find((e) => name.test(e.textContent ?? ''))!;
    await tap(root, card(/^Удиви меня/));
    await at(root, 'OutfitOfTheDay');
    // (i) «Как это работает» → диалог об инструменте, «Ок!» закрывает
    await tap(root, topLayer(root).getByRole('button', { name: 'Как это работает' }));
    await tap(root, within(await dialog(within(root), 'Удиви меня')).getByRole('button', { name: 'Ок!' }));
    await gone(within(root), 'alertdialog');
    const skip = () => topLayer(root).getByRole('button', { name: 'Не нравится' });
    await tap(root, skip()); // второй образ → третий, последний
    await expect(topLayer(root).getByRole('button', { name: 'Следующий образ' })).toHaveAttribute('aria-disabled', 'true');
    await tap(root, skip());
    await at(root, 'OutfitOfTheDayEmpty');
    await tap(root, topLayer(root).getByRole('button', { name: 'Показать ещё' }));
    await at(root, 'OutfitOfTheDay');
    await back(root);
    await at(root, 'StylistHome');

    await tap(root, card(/^С чем носить/));
    await at(root, 'WhatToWear');
    await tap(root, q(root, '.y-item-card'));
    await at(root, 'WardrobeItemDetails');
    await back(root);
    await at(root, 'WhatToWear');
    await back(root);
    await at(root, 'StylistHome');
  },
};

/** Поездка: вкладки «Образы» ↔ «Вещи», вещь → детали и обратно. */
export const TripChain: Story = {
  name: 'Цепочка: вещи поездки',
  args: { start: 'Trips' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    await tap(root, [...topEl(root).querySelectorAll('.y-trip-card')].find((e) => /^Бразилиа/.test(e.textContent ?? ''))!);
    await at(root, 'TripDetails');
    await tap(root, topLayer(root).getByRole('radio', { name: /^Вещи/ }));
    await at(root, 'TripItems');
    await tap(root, q(root, '.y-item-card'));
    await at(root, 'WardrobeItemDetails');
    await back(root);
    await at(root, 'TripItems');
    await tap(root, topLayer(root).getByRole('radio', { name: /^Образы/ }));
    await at(root, 'TripDetails');
    await back(root);
    await at(root, 'Trips');
  },
};

/** Поиск: поле на «Discover» → фокус с подсказками → результаты; «Назад» с фокуса. */
export const SearchChain: Story = {
  name: 'Цепочка: фокус поиска',
  args: { start: 'SearchDiscover' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    const field = () => q(root, '.y-input-bar__field');
    await tap(root, field());
    await at(root, 'SearchFocused');
    await back(root);
    await at(root, 'SearchDiscover');
    await tap(root, field());
    await at(root, 'SearchFocused');
    const chip = [...topEl(root).querySelectorAll<HTMLElement>('.y-chip-group > .y-button')].find((b) => !/^Белое платье/.test(b.textContent ?? ''))!;
    await tap(root, chip);
    await at(root, 'SearchResults');
  },
};

/* ─── Play: тост с «Отменить» — удаление окончательное, когда тост закрылся (#184) ─ */

const cards = (root: HTMLElement) => [...topEl(root).querySelectorAll<HTMLElement>('.y-item-card')].filter((e) => e.style.display !== 'none');
const toastEl = (root: HTMLElement) => root.querySelector<HTMLElement>('.y-proto__toast .y-snackbar');
const noToast = (root: HTMLElement, timeout = 1000) => waitFor(() => expect(toastEl(root)).toBeNull(), { timeout });
/** Вещь в корзине → шторка действий → «Удалить навсегда»: вещь пропадает сразу, тост с «Отменить». */
const deleteForever = async (root: HTMLElement, c: Canvas) => {
  await tap(root, cards(root)[0]);
  await tap(root, await within(await sheet(c, ITEM)).findByRole('button', { name: 'Удалить навсегда' }));
  await gone(c, 'dialog');
  await c.findByText('Вещь удалена навсегда');
};

/** Корзина: «Отменить» возвращает вещь; «×» и таймер — удаление окончательное; последняя вещь — пустая корзина и обратно. */
export const TrashUndo: Story = {
  name: 'Тост: удалить навсегда и отменить',
  args: { start: 'TrashPopulated' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root, step }) => {
    const c = within(root);
    await at(root, 'TrashPopulated');
    await expect(cards(root)).toHaveLength(2);

    await step('удалить → «Отменить» → вещь на месте', async () => {
      await deleteForever(root, c);
      await expect(cards(root)).toHaveLength(1);
      await tap(root, within(toastEl(root)!).getByRole('button', { name: 'Отменить' }));
      await noToast(root);
      await idle(root);
      await expect(cards(root)).toHaveLength(2);
    });

    await step('удалить → закрыть тост → вещи нет', async () => {
      await deleteForever(root, c);
      await tap(root, within(toastEl(root)!).getByRole('button', { name: 'Закрыть' }));
      await noToast(root);
      await expect(cards(root)).toHaveLength(1);
    });

    await step('удалить последнюю → пустая корзина → «Отменить» → корзина с вещью', async () => {
      await deleteForever(root, c);
      await at(root, 'TrashEmpty');
      await tap(root, within(toastEl(root)!).getByRole('button', { name: 'Отменить' }));
      await at(root, 'TrashPopulated');
      await expect(cards(root)).toHaveLength(1);
    });
  },
};

/** Корзина: тост закрылся сам (6 с с «Отменить») — удаление окончательное. Отдельно: ожидание таймера не укладывается в общий сценарий. */
export const TrashAutoHide: Story = {
  name: 'Тост: удалить навсегда и дождаться',
  args: { start: 'TrashPopulated' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    const c = within(root);
    await at(root, 'TrashPopulated');
    await deleteForever(root, c);
    await expect(cards(root)).toHaveLength(1);
    await noToast(root, 8000);
    await expect(cards(root)).toHaveLength(1);
  },
};

/* ─── Play: фильтры, «Ещё», долгое нажатие, поиск (#210) ─────────────── */

/** Фильтры: у каждого чипса гардероба и образов своя шторка; выбор в шторке без кнопок применяется сразу, «Сбросить» и «Все» — сброс. */
export const FiltersChain: Story = {
  name: 'Цепочка: фильтры',
  args: { start: 'Wardrobe' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    const c = within(root);
    const chip = (name: RegExp) => topLayer(root).getByRole('button', { name });
    await at(root, 'Wardrobe');
    await tap(root, chip(/^Теги/));
    await sheet(c, 'Теги');
    await userEvent.keyboard('{Escape}');
    await idle(root);
    await gone(c, 'dialog');

    await tap(root, chip(/^Сезон/));
    await tap(root, await within(await sheet(c, 'Сезон')).findByRole('button', { name: 'Весна' }));
    await gone(c, 'dialog');
    await at(root, 'ItemsNoFilterResults');
    // «Категория» — список свёрнут (Category Root), «Верх» раскрывается в самой шторке (Category Expanded)
    await tap(root, chip(/^Категория/));
    const category = await sheet(c, 'Категория');
    await expect(within(category).queryByText('Футболка')).toBeNull();
    await userEvent.click(within(category).getByRole('button', { name: 'Верх' }));
    await expect(within(category).getByRole('button', { name: 'Верх' })).toHaveAttribute('aria-expanded', 'true');
    await expect(within(category).getByText('Футболка')).toBeVisible();
    await tap(root, within(category).getByRole('button', { name: 'Сбросить' }));
    await gone(c, 'dialog');
    await at(root, 'Wardrobe');
    await tap(root, chip(/^Категория/));
    await tap(root, within(await sheet(c, 'Категория')).getByRole('button', { name: 'Применить' }));
    await gone(c, 'dialog');
    await at(root, 'ItemsNoFilterResults');
    await tap(root, topLayer(root).getByRole('button', { name: 'Сбросить фильтры' }));
    await at(root, 'Wardrobe');

    await tap(root, topLayer(root).getByRole('radio', { name: 'Образы' }));
    await at(root, 'OutfitsPopulated');
    await tap(root, chip(/^Повод/));
    const occasion = await sheet(c, 'Повод');
    await expect(within(occasion).getByRole('button', { name: 'Добавить' })).toBeVisible();
    await expect(within(occasion).getByRole('button', { name: 'Удалить: Кастомный' })).toBeVisible();
    await tap(root, await within(occasion).findByRole('button', { name: 'Офис' }));
    await gone(c, 'dialog');
    await at(root, 'OutfitsNoFilterResults');
    await tap(root, chip(/^Сезон/));
    await tap(root, await within(await sheet(c, 'Сезон')).findByRole('button', { name: 'Все' }));
    await gone(c, 'dialog');
    await at(root, 'OutfitsPopulated');
  },
};

/** «Ещё» в деталях: вещь из вишлиста → шторка действий → в гардероб с «Отменить»; образ («Ещё» и долгое нажатие в списке) → шторка действий → удалить навсегда. */
export const MoreChain: Story = {
  name: 'Цепочка: «Ещё» в деталях',
  args: { start: 'Wishlist' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    const c = within(root);
    await tap(root, q(root, '.y-product-card'));
    await at(root, 'ItemDetails');
    await tap(root, topLayer(root).getByRole('button', { name: 'Ещё' }));
    await tap(root, await within(await sheet(c, ITEM)).findByRole('button', { name: 'Переместить в гардероб' }));
    await gone(c, 'dialog');
    await at(root, 'Wardrobe');
    await c.findByText('Вещь перемещена в гардероб');
    await expect(within(toastEl(root)!).getByRole('button', { name: 'Отменить' })).toBeInTheDocument(); // ↶, не «×» (Figma 1371:37590)

    await tap(root, topLayer(root).getByRole('radio', { name: 'Образы' }));
    await at(root, 'OutfitsPopulated');
    await tap(root, q(root, '.y-collage'));
    await at(root, 'OutfitDetails');
    await tap(root, topLayer(root).getByRole('button', { name: 'Ещё' }));
    await tap(root, await within(await sheet(c, OCCASION)).findByRole('button', { name: 'Удалить навсегда' }));
    await gone(c, 'dialog');
    await at(root, 'OutfitsPopulated');
    await c.findByText('Образ удалён навсегда');
    await tap(root, within(toastEl(root)!).getByRole('button', { name: 'Отменить' }));
    await at(root, 'OutfitDetails');
    await back(root);
    await at(root, 'OutfitsPopulated');

    // долгое нажатие (правая кнопка) на образ в списке — та же шторка (решение владельца, #216 строка 35)
    q(root, '.y-collage').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    await idle(root);
    await tap(root, await within(await sheet(c, OCCASION)).findByRole('button', { name: 'Удалить навсегда' }));
    await gone(c, 'dialog');
    await at(root, 'OutfitsPopulated');
    await c.findByText('Образ удалён навсегда');
  },
};

/** Архив: долгое нажатие (правая кнопка) на вещь → шторка действий → «Вернуть в гардероб» → вещь уходит, тост. */
export const ArchiveLongPress: Story = {
  name: 'Цепочка: действия в архиве',
  args: { start: 'Archive' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    const c = within(root);
    await at(root, 'Archive');
    const before = cards(root).length;
    cards(root)[0].dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    await idle(root);
    await tap(root, await within(await sheet(c, ITEM)).findByRole('button', { name: 'Вернуть в гардероб' }));
    await gone(c, 'dialog');
    await c.findByText('Вещь возвращена в гардероб');
    await expect(cards(root)).toHaveLength(before - 1);
  },
};

/** Результаты поиска: «Сортировка» → шторка; сердечко → вещь в вишлисте, тост. */
export const SearchSortAndLike: Story = {
  name: 'Цепочка: сортировка и вишлист',
  args: { start: 'SearchResults' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    const c = within(root);
    await at(root, 'SearchResults');
    await tap(root, topLayer(root).getByRole('button', { name: /^Сортировка/ }));
    await tap(root, await within(await sheet(c, 'Сортировка')).findByRole('button', { name: 'Сначала дешевле' }));
    await gone(c, 'dialog');
    await tap(root, topLayer(root).getAllByRole('button', { name: 'В вишлист' })[0]);
    await c.findByText('Вещь перемещена в вишлист');
  },
};

/** Стилист: из каталога в чат (Message Ready) и обратно видимым «Назад» — у чата нет таб-бара (#210). */
export const StylistBack: Story = {
  name: 'Цепочка: чат стилиста и «Назад»',
  args: { start: 'StylistHome' satisfies ScreenId, panel: false },
  play: async ({ canvasElement: root }) => {
    await at(root, 'StylistHome');
    await tap(root, q(root, '.y-dock .y-input-bar__field'));
    await at(root, 'Stylist');
    await back(root);
    await at(root, 'StylistHome');
  },
};
