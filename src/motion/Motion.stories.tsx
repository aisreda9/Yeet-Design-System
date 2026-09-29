import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState, type CSSProperties } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button, Icon, IconButton, Stamp } from '../atoms';
import { Carousel, ChipGroup, List, ListGroup, ListItem } from '../molecules';
import { BottomNav, ItemCard, OutfitCollage, Overlay, ProductCard, Sheet, StatusBar, WeatherCard, type CollageItem, type Tab } from '../organisms';
import { motionMs } from '../utils/gesture';
import { haptic } from '../utils/haptic';
import { LeavingContext, usePresence } from '../utils/usePresence';
import { DragGrid } from './DragGrid';
import { CanvasDemo, FeedbackDemo, HapticChip, HeaderScrollDemo, PageStackDemo, ProfileDemo, SelectDemo, SheetDemo } from './Mechanics';
import { curves, sample, usePhotoCollapse, useSwipePager } from '.';
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
      <Stamp label="Не нравится" tone="secondary" onClick={() => setSkips((s) => s + 1)} />
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

function CollapseDemo() {
  const scroll = useRef<HTMLDivElement>(null);
  const { collapsed } = usePhotoCollapse(scroll, { threshold: 24 });
  return (
    <div className={`y-motion-phone y-collapse ${collapsed ? 'is-collapsed' : ''}`}>
      <StatusBar />
      <div className="y-collapse__bar">
        <IconButton icon="chevron-left" label="Назад" />
        <IconButton icon="more" label="Ещё" />
      </div>
      <div className="y-collapse__photo" aria-hidden>
        <OutfitCollage items={[{ kind: 'container', x: 50, y: 50, size: 180, color: 'black' }]} />
      </div>
      <div ref={scroll} className="y-collapse__scroll">
        <div className="y-collapse__panel">
          <h2 className="y-h2">Сумка</h2>
          <p className="y-caption y-text--secondary">10 000 ₽ · Аксессуары · Черный · Все сезоны</p>
          {Array.from({ length: 6 }, (_, k) => <div key={k} style={{ height: 96, borderRadius: 20, background: 'var(--card-bg)' }} />)}
        </div>
      </div>
    </div>
  );
}
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
      <figure><Stamp label="Не нравится" tone="secondary" /><figcaption>штамп 0.94 · stamp</figcaption></figure>
      <figure style={{ width: 173 }}><ProductCard kind="outerwear" name="Пальто" price="12 990 ₽" liked={liked} onLike={() => setLiked((v) => !v)} /><figcaption>лайк — прыжок на пружине drop · toggle</figcaption></figure>
      <figure><HapticChip /><figcaption>хаптика последнего действия</figcaption></figure>
    </div>
  );
}
export const Press: Story = { name: 'Микро: нажатие', render: () => <PressDemo /> };

export const DragDrop: Story = { name: 'Микро: перетаскивание', render: () => <DragGrid /> };

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
