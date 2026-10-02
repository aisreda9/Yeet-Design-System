import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button, Icon, IconButton, Stamp } from '../atoms';
import { Carousel, ChipGroup, List, ListGroup, ListItem, StatRow, StatTile } from '../molecules';
import { BottomNav, ItemCard, OutfitCollage, Overlay, PhotoArea, ProductCard, Sheet, StatusBar, WeatherCard, type CollageItem, type Tab } from '../organisms';
import { DetailsScreen } from '../templates';
import { gesture, motionMs } from '../utils/gesture';
import { haptic } from '../utils/haptic';
import { LeavingContext, usePresence } from '../utils/usePresence';
import { DragGrid } from './DragGrid';
import { ReorderDemo } from './ReorderDemo';
import { CanvasDemo, FeedbackDemo, HapticChip, HeaderScrollDemo, PageStackDemo, ProfileDemo, SelectDemo, SheetDemo } from './Mechanics';
import { curves, sample, useSwipePager } from '.';
import './motion.css';

const meta = {
  title: 'Foundations/Анимации',
  parameters: { layout: 'centered', controls: { disable: true }, options: { showPanel: false } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const looks: CollageItem[][] = [
  [{ kind: 'accessories', x: 34, y: 18, size: 56 }, { kind: 'top', x: 66, y: 34, color: 'green' }, { kind: 'bottom', x: 30, y: 60, size: 130, color: 'green' }, { kind: 'shoe', x: 72, y: 76, size: 72, color: 'brown' }],
  [{ kind: 'bottom', x: 28, y: 58, size: 140, color: 'black' }, { kind: 'top', x: 64, y: 36, color: 'brown' }, { kind: 'container', x: 76, y: 76, size: 64, color: 'black' }],
  [{ kind: 'outerwear', x: 36, y: 36, size: 120, color: 'beige' }, { kind: 'bottom', x: 68, y: 58, size: 110, color: 'blue' }, { kind: 'shoe', x: 34, y: 80, size: 64, color: 'white' }],
];

/* ─── Кривые ─────────────────────────────────────────────────────────── */

function CurvePlot({ i }: { i: number }) {
  const c = curves[i];
  const W = 200, H = 120, top = 24, bottom = 12;
  const y = (v: number) => H - bottom - v * (H - top - bottom);
  const d = Array.from({ length: 81 }, (_, j) => `${j ? 'L' : 'M'}${(j / 80) * W},${y(sample(c, j / 80)).toFixed(1)}`).join('');
  return (
    <figure className="y-curve">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`${c.figma}: ${c.duration} мс`}>
        <line x1="0" x2={W} y1={y(1)} y2={y(1)} className="y-curve__grid" />
        <line x1="0" x2={W} y1={y(0)} y2={y(0)} className="y-curve__axis" />
        <path d={d} className="y-curve__line">
          <title>{`${c.token} · ${c.duration} мс`}</title>
        </path>
      </svg>
      <div className="y-curve__track">
        <span className="y-curve__dot" style={{ animationDuration: `${c.duration}ms`, animationTimingFunction: `var(${c.token})` }} />
      </div>
      <figcaption>
        <b>{c.figma}</b> · {c.duration} мс
        <code>{c.token}</code>
      </figcaption>
    </figure>
  );
}

export const Curves: Story = {
  parameters: { controls: { disable: true } },
  name: 'Кривые',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24, width: 'min(920px, 90vw)' }}>
      {curves.map((_, i) => <CurvePlot key={i} i={i} />)}
    </div>
  ),
};

/* ─── Штамп ─────────────────────────────────────────────────────────── */

function StampDemo() {
  const [done, setDone] = useState(false);
  const [skips, setSkips] = useState(0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <Stamp label="Надеть" done={done} onClick={() => setDone((v) => !v)} />
      <Stamp label="Не нравится" variant="secondary" onClick={() => setSkips((s) => s + 1)} />
      <div className="y-motion-column" style={{ alignItems: 'flex-start' }}>
        <p className="y-caption y-text--secondary" style={{ maxWidth: 220 }}>Нажми на штамп: сжатие 0.94, затем пружина bouncy — звезда 148 → 78, −60°, чернеет, «отменить». Повторное нажатие отменяет. Нажатие на выполненный штамп не сбрасывает поворот.</p>
        <span className="y-caption y-text--secondary">«Не нравится»: {skips}</span>
        <HapticChip />
      </div>
    </div>
  );
}
export const StampPress: Story = { name: 'Штамп «Надеть»', render: () => <StampDemo /> };

/* ─── Таб-бар и FAB ─────────────────────────────────────────────────── */

function NavDemo() {
  const [tab, setTab] = useState<Tab>('today');
  return (
    <div className="y-motion-phone y-motion-phone--short">
      <p className="y-caption y-text--secondary" style={{ padding: '24px 20px 8px' }}>Переключай вкладки: пилюля переезжает на пружине quick; на «Гардеробе» таб-бар уступает место кнопке «+», уход «+» быстрее появления.</p>
      <div style={{ padding: '0 20px' }}><HapticChip /></div>
      <div style={{ marginTop: 'auto' }}>
        <BottomNav active={tab} fab={tab === 'wardrobe'} onTabChange={setTab} />
      </div>
    </div>
  );
}
export const NavFab: Story = { name: 'Таб-бар и FAB', render: () => <NavDemo /> };

/* ─── Главная: смена образа свайпом, штамп, выбор повода ───────────────── */

const occasionList = ['На каждый день', 'Офис', 'Свидание', 'Вечеринка', 'Спорт'];
const LOOK = 353; // высота коллажа: от неё порог свайпа и резинка

function TodayDemo() {
  const [occ, setOcc] = useState(0);
  const [i, setI] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [sheet, setSheet] = useState(false);
  // у каждого повода свой порядок образов
  const order = looks.map((_, k) => (k + occ) % looks.length);
  const n = order.length;
  const id = `${occ}-${i}`;
  // вертикальный свайп по стопке: порог и резинка от высоты коллажа, при смене — хаптика skip
  const { drag, dragging, bind } = useSwipePager({ axis: 'y', count: n, index: i, onChange: setI, size: LOOK });
  const pick = (k: number) => {
    setOcc(k); setI(0);
    window.setTimeout(() => setSheet(false), motionMs('--motion-select')); // выбор успевает отрисоваться, потом шторка уходит
  };
  // шторка «Повод» уходит и когда её закрыли жестом, и когда закрыл выбор повода
  const layer = usePresence(sheet ? (
    <Overlay onClose={() => setSheet(false)}>
      <Sheet title="Повод">
        <List>{occasionList.map((o, k) => <ListItem key={o} type="radio" label={o} checked={k === occ} onClick={() => pick(k)} />)}</List>
      </Sheet>
    </Overlay>
  ) : undefined);
  const cls = (k: number) => (k === i ? 'is-current' : k === i + 1 ? 'is-next' : k === i - 1 ? 'is-prev' : k > i ? 'is-below' : 'is-above');

  return (
    <div className="y-motion-phone y-today-demo">
      <StatusBar />
      <div className="y-today-demo__head">
        <h2 className="y-h1">Твои образы</h2>
        <button type="button" className="y-header__accent y-h1" onClick={() => setSheet(true)} aria-haspopup="dialog">
          <span key={occ} className="y-today-demo__occ">{occasionList[occ].toLowerCase()}</span>
          <Icon name="chevron-up-down" size={20} />
        </button>
      </div>
      <div
        className="y-swap y-swap--drag"
        data-dragging={dragging || undefined}
        style={{ ['--drag' as string]: `${drag ?? 0}px`, ['--turn' as string]: `${i * 180}deg` }}
        {...bind}
        role="group" aria-label="Образы: свайп вверх — следующий, вниз — предыдущий"
      >
        {order.map((look, k) => (
          <div key={look} className={`y-swap__look ${cls(k)}`}>
            <OutfitCollage items={looks[look]} />
          </div>
        ))}
        <div className="y-today__weather" onPointerDown={(e) => e.stopPropagation()}><WeatherCard temperature="20°" description="Солнечно, ветер 14 км/ч" tilt /></div>
        <span className="y-swap__stamp" onPointerDown={(e) => e.stopPropagation()}>
          <Stamp label="Надеть" done={!!done[id]} onClick={() => setDone((d) => ({ ...d, [id]: !d[id] }))} />
        </span>
      </div>
      <div className="y-today-demo__foot">
        <HapticChip />
        <span className="y-caption y-text--secondary">Свайп вверх или вниз по коллажу · образ {i + 1} из {n}</span>
      </div>
      {layer.node && <LeavingContext.Provider value={layer.leaving}>{layer.node}</LeavingContext.Provider>}
    </div>
  );
}
export const OutfitSwap: Story = { name: 'Главная: смена образа и повод', render: () => <TodayDemo /> };

/* ─── Сворачивание фото ─────────────────────────────────────────────── */

/**
 * То же, что на экранах деталей: `DetailsScreen` — шторка за пальцем / колесом с прогрессом p, доводка `--motion-sheet` (#231).
 * Демо не повторяет логику, а показывает сам шаблон: поведение в документации и на экране одно.
 */
function CollapseDemo() {
  return (
    <DetailsScreen media={<PhotoArea kind="container" />} title="Сумка">
      <p className="y-body y-text--secondary">10 000 ₽ · Чёрный<br />Аксессуары · Все сезоны</p>
      <StatRow><StatTile label="Надето раз" value={43} /><StatTile label="Д. простоя" value={12} /><StatTile label="Образы" value={7} /></StatRow>
      <section className="y-section">
        <h3 className="y-h3">Образы с этой вещью</h3>
        <div className="y-stack-8">{collapseLooks.map((items, i) => <OutfitCollage key={i} items={items} />)}</div>
      </section>
    </DetailsScreen>
  );
}
const collapseLooks: CollageItem[][] = [
  [{ kind: 'bottom', x: 28, y: 56, size: 150, color: 'black' }, { kind: 'top', x: 64, y: 36, size: 120, color: 'brown' }, { kind: 'container', x: 76, y: 70, size: 64, color: 'black' }],
  [{ kind: 'bottom', x: 30, y: 58, size: 150, color: 'green' }, { kind: 'top', x: 66, y: 34, size: 110, color: 'white' }, { kind: 'container', x: 76, y: 74, size: 64, color: 'black' }],
];
export const PhotoCollapse: Story = { name: 'Сворачивание фото', render: () => <CollapseDemo /> };

/* ─── Микро-анимации: нажатие ───────────────────────────────────────── */

function PressDemo() {
  const [chips, setChips] = useState(['Офис']);
  const [check, setCheck] = useState(true);
  const [liked, setLiked] = useState(false);
  return (
    <div className="y-press-grid">
      <figure><Button size="M">Кнопка</Button><figcaption>scale 0.97 · press</figcaption></figure>
      <figure><IconButton icon="plus" label="Добавить" variant="primary" /><figcaption>scale 0.97 · press</figcaption></figure>
      <figure>
        <ChipGroup chips={['Офис', 'Прогулка'].map((label) => ({ label, selected: chips.includes(label) }))} onToggle={(l) => setChips((c) => (c.includes(l) ? c.filter((x) => x !== l) : [...c, l]))} />
        <figcaption>фон и цвет · select 150 мс</figcaption>
      </figure>
      <figure style={{ width: 120 }}><ItemCard kind="top" color="green" selected={check} onClick={() => setCheck((v) => !v)} /><figcaption>карточка 0.98 · галочка drop</figcaption></figure>
      <figure style={{ width: 260 }}>
        <ListGroup><ListItem label="Корзина вещей" trailing={<Icon name="chevron-right" />} onClick={() => {}} /></ListGroup>
        <figcaption>строка — подсветка фона, без сжатия</figcaption>
      </figure>
      <figure><Stamp label="Не нравится" variant="secondary" /><figcaption>штамп 0.94 · stamp</figcaption></figure>
      <figure style={{ width: 173 }}><ProductCard kind="outerwear" name="Пальто" price="12 990 ₽" liked={liked} onLike={() => setLiked((v) => !v)} /><figcaption>лайк — прыжок на пружине drop · toggle</figcaption></figure>
      <figure><HapticChip /><figcaption>хаптика последнего действия</figcaption></figure>
    </div>
  );
}
export const Press: Story = { name: 'Микро: нажатие', render: () => <PressDemo /> };

export const DragDrop: Story = { name: 'Микро: перетаскивание', render: () => <DragGrid /> };

/* ─── Сетка: перестановка долгим тапом (#209, useGridReorder) ───────────── */

export const GridReorder: Story = {
  name: 'Сетка: перестановка долгим тапом',
  parameters: { docs: { description: { story: 'Удержание 400 мс и сдвиг дальше 10 pt — подъём (1.04, тень floating, `lift`). Соседи раздвигаются FLIP на `--motion-drop`, каждая новая позиция — `select`. Отпускание — вещь садится (`drop`); Esc или палец далеко за сеткой — всё назад на `--motion-return`. У краёв экрана — автоскролл. Так же в Гардеробе и Вишлисте.' } } },
  render: () => <ReorderDemo />,
};

/** Порядок вещей в сетке демо — строкой из id. */
const orderOf = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>('[data-reorder-key]')].map((n) => n.dataset.reorderKey).join('');
const statusOf = (root: HTMLElement) => root.querySelector('[role=status][aria-live]')?.textContent ?? '';

/** Указатель мышью (pointerId 1): нажать, подержать дольше долгого нажатия, провести к центру `to` шагами, отпустить. */
async function holdAndDrag(from: HTMLElement, to: HTMLElement, opts: { release?: boolean } = {}) {
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
  const fire = (type: string, x: number, y: number) =>
    from.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1, clientX: x, clientY: y }));
  fire('pointerdown', x0, y0);
  await wait(gesture.longPress + 100);
  for (let i = 1; i <= 10; i++) { fire('pointermove', x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10); await wait(16); }
  if (opts.release !== false) fire('pointerup', x1, y1);
}

export const GridReorderPointer: Story = {
  name: 'Сетка: перестановка — палец',
  tags: ['no-visual'], // play-тест поведения: конечный кадр зависит от тайминга жеста; вид проверяет «Сетка: перестановка долгим тапом»
  parameters: { docs: { description: { story: 'Play-тест: подъём долгим нажатием, перенос первой вещи на 2 позиции вперёд, проверка порядка и хаптики; затем Esc посреди жеста возвращает порядок.' } } },
  render: () => <ReorderDemo />,
  play: async ({ canvasElement: root, step }) => {
    const card = (k: string) => root.querySelector<HTMLElement>(`[data-reorder-key="${k}"]`)!;
    const log: string[] = [];
    const on = (e: Event) => log.push((e as CustomEvent<string>).detail);
    window.addEventListener('yeet:haptic', on);
    try {
      await step('Удержание и сдвиг — подъём, перенос на 2 позиции', async () => {
        await expect(orderOf(root)).toBe('abcdefghijkl');
        await holdAndDrag(card('a'), card('c'));
        await waitFor(() => expect(orderOf(root)).toBe('bcadefghijkl'));
        await expect(log).toEqual(['lift', 'select', 'drop']);
        await expect(statusOf(root)).toBe('Перемещено на позицию 3 из 12');
        await waitFor(() => expect(card('a').classList.contains('is-lifted')).toBe(false));
      });
      await step('Esc посреди жеста — всё на место', async () => {
        await wait(motionMs('--motion-drop', 744));
        await holdAndDrag(card('b'), card('d'), { release: false });
        await waitFor(() => expect(orderOf(root)).toBe('cadbefghijkl'));
        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(orderOf(root)).toBe('bcadefghijkl'));
        await expect(statusOf(root)).toMatch(/^Перестановка отменена/);
        card('b').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, pointerType: 'mouse' }));
      });
    } finally {
      window.removeEventListener('yeet:haptic', on);
    }
  },
};

export const GridReorderKeyboard: Story = {
  name: 'Сетка: перестановка — клавиатура',
  tags: ['no-visual'], // play-тест поведения: конечный кадр зависит от тайминга жеста; вид проверяет «Сетка: перестановка долгим тапом»
  parameters: { docs: { description: { story: 'Play-тест: фокус на вещи, пробел — взять, стрелки — двигать, пробел — поставить; Escape — отмена. Каждое перемещение объявляется через aria-live.' } } },
  render: () => <ReorderDemo />,
  play: async ({ canvasElement: root, step }) => {
    const card = (k: string) => root.querySelector<HTMLElement>(`[data-reorder-key="${k}"]`)!;
    await step('Пробел, стрелка вправо дважды, пробел', async () => {
      card('a').focus();
      await userEvent.keyboard(' ');
      await expect(statusOf(root)).toMatch(/взято, позиция 1 из 12/);
      await expect(card('a').classList.contains('is-lifted')).toBe(true);
      await userEvent.keyboard('{ArrowRight}');
      await expect(statusOf(root)).toBe('Перемещено на позицию 2 из 12');
      await userEvent.keyboard('{ArrowRight}');
      await expect(statusOf(root)).toBe('Перемещено на позицию 3 из 12');
      await userEvent.keyboard(' ');
      await expect(orderOf(root)).toBe('bcadefghijkl');
      await expect(card('a').classList.contains('is-lifted')).toBe(false);
      await expect(document.activeElement).toBe(card('a'));
    });
    await step('Стрелка вниз — на ряд, Escape — отмена', async () => {
      await userEvent.keyboard(' ');
      await userEvent.keyboard('{ArrowDown}');
      await expect(orderOf(root)).toBe('bcdeafghijkl');
      await userEvent.keyboard('{Escape}');
      await expect(orderOf(root)).toBe('bcadefghijkl');
      await expect(statusOf(root)).toMatch(/^Перестановка отменена\. Верхняя одежда: позиция 3 из 12/);
    });
  },
};

/* ─── Листание поводов ──────────────────────────────────────────────── */

const occasions = ['Офис', 'На каждый день', 'Свидание', 'Вечеринка'];

function PagerDemo() {
  const [i, setI] = useState(1);
  const PAGE = 353 + 20;
  const last = occasions.length - 1;
  const go = (k: number) => { if (k !== i) haptic('select'); setI(Math.min(last, Math.max(0, k))); };
  // горизонтальная лента: вертикальный жест остаётся скроллу; хаптику смены даёт go (select), как у чипсов
  const { drag, bind } = useSwipePager({ axis: 'x', count: occasions.length, index: i, onChange: go, size: 353, changeHaptic: false });
  const track: CSSProperties = { transform: `translateX(${-i * PAGE + (drag ?? 0)}px)`, transition: drag === null ? undefined : 'none' };
  return (
    <div className="y-motion-phone">
      <StatusBar />
      <div className="y-pager" {...bind}>
        <div className="y-pager__track" style={track}>
          {occasions.map((o, k) => (
            <div key={o} className="y-pager__page"><OutfitCollage items={looks[k % looks.length]} /></div>
          ))}
        </div>
      </div>
      <div className="y-pager__chips" style={{ transform: `translateX(${80 - i * 110 + (drag ?? 0) * (110 / PAGE)}px)`, transition: drag === null ? undefined : 'none' }}>
        <ChipGroup chips={occasions.map((label, k) => ({ label, selected: k === i }))} onToggle={(label) => go(occasions.indexOf(label))} />
      </div>
      <p className="y-caption y-text--secondary" style={{ padding: '16px 20px 8px', textAlign: 'center' }}>Свайпни образ или выбери повод: лента едет за пальцем, дальше 30 % или бросок — следующий, на краях — резинка.</p>
      <div style={{ display: 'flex', justifyContent: 'center' }}><HapticChip /></div>
      <div style={{ marginTop: 'auto', padding: '0 20px 24px' }}>
        <Carousel title="Давно не надевалось" itemWidth={138}>{looks.flat().slice(0, 7).map((it, k) => <ItemCard key={k} kind={it.kind} color={it.color} />)}</Carousel>
      </div>
    </div>
  );
}
export const OccasionPager: Story = { name: 'Листание поводов и карусель', render: () => <PagerDemo /> };

/* ─── Механики экранов ──────────────────────────────────────────────── */

export const SheetDismiss: Story = { name: 'Шторка: появление, уход, смахивание', render: () => <SheetDemo /> };
export const HeaderScroll: Story = { name: 'Шапка и липкие фильтры при скролле', render: () => <HeaderScrollDemo /> };
export const Selection: Story = { name: 'Микро: сегмент и радио', render: () => <SelectDemo /> };
export const Feedback: Story = { name: 'Snackbar, подсказка, загрузка', render: () => <FeedbackDemo /> };
export const CanvasGesture: Story = { name: 'Холст: подъём, бросок, щипок', render: () => <CanvasDemo /> };
export const ProfileAccounts: Story = { name: 'Профиль: аккаунты и период', render: () => <ProfileDemo /> };
export const PushPop: Story = { name: 'Переход между экранами', render: () => <PageStackDemo /> };

/* ─── Бросок после паузы (C10): протянул, подержал, отпустил — не бросок ─── */

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Протяжка мышью (pointerId 1 — мышь всегда «активна», setPointerCapture не бросает) с отпусканием после паузы.
 * Скорость считается по `e.timeStamp` (время создания события), поэтому жест без паузы не отдаёт поток таймерам.
 * 84 px за 6 шагов по ~10 мс ≈ 1,4 px/мс — быстрее порога броска 0,5 px/мс, но короче порога дистанции (30 % ≈ 106).
 */
async function drag(el: Element, dx: number, dy: number, pause: number) {
  const r = el.getBoundingClientRect();
  const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
  const fire = (type: string, k: number) =>
    el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1, clientX: x0 + dx * k, clientY: y0 + dy * k }));
  // Шаги — синхронно с ожиданием по часам, а не setTimeout: под нагрузкой (параллельный прогон в CI) таймер
  // растягивается дальше окна скорости 80 мс, и бросок без паузы превращается в «палец стоял» — флейк теста, не баг.
  const spin = (ms: number) => { const end = performance.now() + ms; while (performance.now() < end); };
  fire('pointerdown', 0);
  for (let i = 1; i <= 6; i++) { spin(10); fire('pointermove', i / 6); }
  if (pause) await wait(pause);
  fire('pointerup', 1);
}

/** Регрессия C10 для шторки: протяжка ниже порога + пауза 1 с → шторка остаётся; без паузы тот же жест — бросок. */
export const SheetFlickAfterPause: Story = {
  name: 'Шторка: пауза перед отпусканием — не бросок',
  parameters: { docs: { description: { story: 'Протяжка на 84 px (порог — 30 % высоты) быстрым движением. Отпустил сразу — бросок, шторка закрывается. Подержал палец 1 с и отпустил — шторка возвращается: скорость броска считается с точкой отпускания, а стоявший палец даёт 0.' } } },
  render: () => <SheetDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const open = async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Шторка' }));
      await waitFor(() => expect(canvas.getByRole('dialog', { name: 'Сезон' })).toBeVisible());
      await wait(400); // появление доиграло
    };
    await step('Без паузы — бросок закрывает', async () => {
      await open();
      await drag(canvas.getByText('Сезон'), 0, 84, 0);
      await waitFor(() => expect(canvas.queryByRole('dialog', { name: 'Сезон' })).toBeNull());
    });
    await step('Пауза 1 с — шторка остаётся', async () => {
      await open();
      await drag(canvas.getByText('Сезон'), 0, 84, 1000);
      await wait(400);
      await expect(canvas.getByRole('dialog', { name: 'Сезон' })).toBeInTheDocument();
    });
  },
};

/** Регрессия C10 для пейджера (`useSwipePager`): то же на ленте поводов. */
export const PagerFlickAfterPause: Story = {
  name: 'Пейджер: пауза перед отпусканием — не бросок',
  parameters: { docs: { description: { story: 'Свайп на 84 px (порог — 30 % от 353). Без паузы — бросок, следующий повод. С паузой 1 с — лента возвращается на место.' } } },
  render: () => <PagerDemo />,
  play: async ({ canvasElement, step }) => {
    const pager = canvasElement.querySelector('.y-pager')!, track = canvasElement.querySelector<HTMLElement>('.y-pager__track')!;
    const at = (i: number) => expect(track.style.transform).toBe(`translateX(${-i * 373}px)`);
    await step('Без паузы — бросок листает', async () => {
      await at(1);
      await drag(pager, -84, 0, 0);
      await waitFor(() => at(2));
    });
    await step('Пауза 1 с — остаётся на месте', async () => {
      await drag(pager, 84, 0, 1000);
      await wait(100);
      await at(2);
    });
  },
};
