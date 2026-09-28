import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Button, Icon, IconButton, Stamp } from '../atoms';
import { ChipGroup, List, ListGroup, ListItem } from '../molecules';
import { BottomNav, ItemCard, OutfitCollage, Sheet, StatusBar, type CollageItem, type Tab } from '../organisms';
import { DragGrid } from './DragGrid';
import { curves, sample } from './motion';
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
  const [spin, setSpin] = useState(0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <Stamp label="Надеть" done={done} onClick={() => setDone((v) => !v)} />
      <Stamp label="Не нравится" tone="secondary" size="S" icon="thumb-down" onClick={() => setSpin((s) => s + 1)} style={{ transform: `translateX(${spin % 2 ? -12 : 0}px)`, transition: 'transform var(--motion-exit)' }} />
      <p className="y-caption y-text--secondary" style={{ maxWidth: 200 }}>Нажми на штамп: сжатие, поворот −60° и «×» на пружине bouncy. Повторное нажатие отменяет.</p>
    </div>
  );
}
export const StampPress: Story = { name: 'Штамп «Надеть»', render: () => <StampDemo /> };

/* ─── Таб-бар и FAB ─────────────────────────────────────────────────── */

function NavDemo() {
  const [tab, setTab] = useState<Tab>('today');
  return (
    <div className="y-motion-phone y-motion-phone--short">
      <p className="y-caption y-text--secondary" style={{ padding: '24px 20px' }}>Переключай вкладки: на «Гардеробе» таб-бар уступает место кнопке «+».</p>
      <div style={{ marginTop: 'auto' }}>
        <BottomNav active={tab} fab={tab === 'wardrobe'} onTabChange={setTab} />
      </div>
    </div>
  );
}
export const NavFab: Story = { name: 'Таб-бар и FAB', render: () => <NavDemo /> };

/* ─── Главная: смена образа свайпом, штамп, выбор повода ───────────────── */

const occasionList = ['На каждый день', 'Офис', 'Свидание', 'Вечеринка', 'Спорт'];
const SWIPE = 0.3 * 353; // --gesture-swipe-distance × высота коллажа
const VELOCITY = 0.5; // --gesture-swipe-velocity 500 pt/с → px/мс
const RUBBER = 0.55; // --gesture-rubber-band

/** Какая хаптика сработала: в вебе вибрации нет, поэтому показываем токен. */
function useHaptic() {
  const [last, setLast] = useState<{ name: string; n: number } | null>(null);
  return [last, (name: string) => setLast((l) => ({ name, n: (l?.n ?? 0) + 1 }))] as const;
}
function HapticChip({ last }: { last: { name: string; n: number } | null }) {
  return <span key={last?.n} className="y-haptic-chip" aria-live="polite">{last ? <>хаптика <b>{last.name}</b></> : 'хаптика появится здесь'}</span>;
}

function TodayDemo() {
  const [occ, setOcc] = useState(0);
  const [i, setI] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [sheet, setSheet] = useState<'closed' | 'open' | 'leaving'>('closed');
  const [drag, setDrag] = useState(0);
  const [haptic, fire] = useHaptic();
  const g = useRef<{ y: number; t: number; crossed: boolean } | null>(null);
  // у каждого повода свой порядок образов
  const order = looks.map((_, k) => (k + occ) % looks.length);
  const n = order.length;
  const id = `${occ}-${i}`;

  const down = (e: PointerEvent) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); g.current = { y: e.clientY, t: e.timeStamp, crossed: false }; };
  const move = (e: PointerEvent) => {
    if (!g.current) return;
    let dy = e.clientY - g.current.y;
    const edge = (dy < 0 && i === n - 1) || (dy > 0 && i === 0);
    if (edge) dy *= RUBBER; // сопротивление на первом и последнем образе
    const crossed = !edge && Math.abs(dy) > SWIPE;
    if (crossed && !g.current.crossed) fire('threshold'); // один раз при пересечении порога
    g.current.crossed = crossed;
    setDrag(dy);
  };
  const up = (e: PointerEvent) => {
    if (!g.current) return;
    const dy = e.clientY - g.current.y, v = Math.abs(dy) / Math.max(1, e.timeStamp - g.current.t);
    g.current = null;
    setDrag(0);
    const dir = dy < 0 ? 1 : -1;
    const target = i + dir;
    if ((Math.abs(dy) > SWIPE || (v > VELOCITY && Math.abs(dy) > 10)) && target >= 0 && target < n) { setI(target); fire('skip'); }
  };
  const pick = (k: number) => {
    fire('select');
    setOcc(k); setI(0);
    setTimeout(() => setSheet('leaving'), 150); // выбор успевает отрисоваться
    setTimeout(() => setSheet('closed'), 150 + 150);
  };
  const cls = (k: number) => (k === i ? 'is-current' : k === i + 1 ? 'is-next' : k === i - 1 ? 'is-prev' : k > i ? 'is-below' : 'is-above');
  const live: CSSProperties | undefined = drag ? { transform: `translateY(${drag}px) scale(${1 - Math.min(0.3, Math.abs(drag) / 1200)})`, transition: 'none' } : undefined;

  return (
    <div className="y-motion-phone y-today-demo">
      <StatusBar />
      <div className="y-today-demo__head">
        <h2 className="y-h1">Твои образы</h2>
        <button type="button" className="y-header__accent y-h1" onClick={() => setSheet('open')} aria-haspopup="dialog">
          <span key={occ} className="y-today-demo__occ">{occasionList[occ].toLowerCase()}</span>
          <Icon name="chevron-up-down" size={20} />
        </button>
      </div>
      <div className="y-swap y-swap--drag" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} role="group" aria-label="Образы: свайп вверх — следующий, вниз — предыдущий">
        {order.map((look, k) => (
          <div key={look} className={`y-swap__look ${cls(k)}`} style={k === i ? live : undefined}>
            <OutfitCollage items={looks[look]} />
          </div>
        ))}
        <span className="y-swap__stamp" onPointerDown={(e) => e.stopPropagation()}>
          <Stamp label="Надеть" done={!!done[id]} onClick={() => { setDone((d) => ({ ...d, [id]: !d[id] })); if (!done[id]) fire('stamp'); }} />
        </span>
      </div>
      <div className="y-today-demo__foot">
        <HapticChip last={haptic} />
        <span className="y-caption y-text--secondary">Свайп вверх или вниз по коллажу · образ {i + 1} из {n}</span>
      </div>
      {sheet !== 'closed' && (
        <div className={`y-overlay${sheet === 'leaving' ? ' is-leaving' : ''}`} onClick={() => setSheet('leaving')}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%' }}>
            <Sheet title="Повод">
              <List>{occasionList.map((o, k) => <ListItem key={o} type="radio" label={o} checked={k === occ} onClick={() => pick(k)} />)}</List>
            </Sheet>
          </div>
        </div>
      )}
    </div>
  );
}
export const OutfitSwap: Story = { name: 'Главная: смена образа и повод', render: () => <TodayDemo /> };

/* ─── Сворачивание фото ─────────────────────────────────────────────── */

function CollapseDemo() {
  const [collapsed, setCollapsed] = useState(false);
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
      <div className="y-collapse__scroll" onScroll={(e) => setCollapsed(e.currentTarget.scrollTop > 24)}>
        <div className="y-collapse__panel">
          <h2 className="y-h2">Сумка</h2>
          <p className="y-caption y-text--secondary">10 000 ₽ · Аксессуары · Чёрный · Все сезоны</p>
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
      <figure><Stamp label="Надеть" size="S" /><figcaption>штамп 0.94 · stamp</figcaption></figure>
    </div>
  );
}
export const Press: Story = { name: 'Микро: нажатие', render: () => <PressDemo /> };

export const DragDrop: Story = { name: 'Микро: перетаскивание', render: () => <DragGrid /> };

/* ─── Листание поводов ──────────────────────────────────────────────── */

const occasions = ['Офис', 'На каждый день', 'Свидание', 'Вечеринка'];

function PagerDemo() {
  const [i, setI] = useState(1);
  const start = useRef<number | null>(null);
  const go = (d: number) => setI((v) => Math.min(occasions.length - 1, Math.max(0, v + d)));
  const down = (e: PointerEvent) => (start.current = e.clientX);
  const up = (e: PointerEvent) => {
    if (start.current === null) return;
    const dx = e.clientX - start.current;
    start.current = null;
    if (Math.abs(dx) > 30) go(dx < 0 ? 1 : -1);
  };
  const track: CSSProperties = { transform: `translateX(calc(${-i} * (353px + 20px)))` };
  return (
    <div className="y-motion-phone">
      <StatusBar />
      <div className="y-pager" onPointerDown={down} onPointerUp={up}>
        <div className="y-pager__track" style={track}>
          {occasions.map((o, k) => (
            <div key={o} className="y-pager__page"><OutfitCollage items={looks[k % looks.length]} /></div>
          ))}
        </div>
      </div>
      <div className="y-pager__chips" style={{ transform: `translateX(${80 - i * 110}px)` }}>
        <ChipGroup chips={occasions.map((label, k) => ({ label, selected: k === i }))} onToggle={(label) => setI(occasions.indexOf(label))} />
      </div>
      <p className="y-caption y-text--secondary" style={{ padding: '16px 20px', textAlign: 'center' }}>Свайпни образ или выбери повод.</p>
    </div>
  );
}
export const OccasionPager: Story = { name: 'Листание поводов', render: () => <PagerDemo /> };
