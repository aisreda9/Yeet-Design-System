import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Button, Icon, IconButton } from '../atoms';
import { AvatarStack, ChipGroup, Hint, List, ListItem, LoadingState, SegmentControl, Snackbar, StatRow, StatTile, UsageMeter, type Account } from '../molecules';
import { AccountsSheet, BottomNav, Dialog, Header, ItemArt, ItemCard, OutfitCanvas, Overlay, PhotoArea, Sheet, StatusBar, type CanvasItem, type Garment } from '../organisms';
import { Grid, Row, Screen, Sticky } from '../templates';
import type { ItemColor } from '../tokens/tokens';
import { gesture, motionMs, rubberBand, velocityTracker } from '../utils/gesture';
import { haptic, type HapticEvent } from '../utils/haptic';

/* ─── Хаптика в вебе: показываем, что и когда вибрирует ─────────────────── */

/** Последнее событие хаптики (utils/haptic шлёт `yeet:haptic` на window). */
export function useHapticLog() {
  const [last, setLast] = useState<{ name: HapticEvent; n: number } | null>(null);
  useEffect(() => {
    const on = (e: Event) => setLast((l) => ({ name: (e as CustomEvent<HapticEvent>).detail, n: (l?.n ?? 0) + 1 }));
    window.addEventListener('yeet:haptic', on);
    return () => window.removeEventListener('yeet:haptic', on);
  }, []);
  return last;
}

export function HapticChip() {
  const last = useHapticLog();
  return <span key={last?.n} className="y-haptic-chip" aria-live="polite">{last ? <>хаптика <b>{last.name}</b></> : 'хаптика появится здесь'}</span>;
}

const items: { kind: Garment; color: ItemColor }[] = [
  { kind: 'outerwear', color: 'beige' }, { kind: 'top', color: 'green' }, { kind: 'bottom', color: 'blue' }, { kind: 'shoe', color: 'white' },
  { kind: 'container', color: 'black' }, { kind: 'accessories', color: 'brown' }, { kind: 'top', color: 'yellow' }, { kind: 'bottom', color: 'black' },
  { kind: 'outerwear', color: 'green' }, { kind: 'shoe', color: 'brown' },
];

/* ─── Шторка и диалог: появление, уход, смахивание ─────────────────────── */

export function SheetDemo() {
  const [open, setOpen] = useState<'sheet' | 'dialog' | undefined>();
  const [season, setSeason] = useState('Все');
  const close = () => setOpen(undefined);
  const layer =
    open === 'sheet' ? (
      <Sheet title="Сезон" footer={[{ label: 'Сбросить', onClick: close }, { label: 'Применить', onClick: close }]}>
        <List>{['Все', 'Весна', 'Лето', 'Осень', 'Зима'].map((s) => <ListItem key={s} type="radio" label={s} checked={s === season} onClick={() => setSeason(s)} />)}</List>
      </Sheet>
    ) : open === 'dialog' ? (
      <Dialog tone="destructive" title="Очистить корзину?" description="Все вещи из корзины удаляются навсегда" cancel="Отменить" confirm="Очистить" onCancel={close} onConfirm={close} />
    ) : undefined;
  return (
    <Screen header={<Header type="large" title="Гардероб" />} bottom={<BottomNav active="wardrobe" fab />} overlay={layer && <Overlay onClose={close}>{layer}</Overlay>}>
      <div className="y-motion-actions">
        <Button variant="tertiary" size="M" onClick={() => setOpen('sheet')}>Шторка</Button>
        <Button variant="tertiary" size="M" onClick={() => setOpen('dialog')}>Диалог</Button>
        <HapticChip />
      </div>
      <p className="y-caption y-text--secondary">Потяни шторку вниз: дальше 30 % высоты или быстрым броском — закроется, иначе вернётся. Вверх — резинка. Строки и кнопки внутри нажимаются как обычно; тап по затемнению и Esc тоже закрывают.</p>
      <Grid>{items.slice(0, 6).map((it, k) => <ItemCard key={k} {...it} />)}</Grid>
    </Screen>
  );
}

/* ─── Шапка при скролле: большой заголовок → пилюля, липкие фильтры ─────── */

export function HeaderScrollDemo() {
  const [tab, setTab] = useState('items');
  const [chips, setChips] = useState(['Все']);
  return (
    <Screen header={<Header type="large" title="Гардероб" action={{ icon: 'search', label: 'Поиск' }} />} bottom={<BottomNav active="wardrobe" fab />}>
      <Sticky>
        <SegmentControl value={tab} onChange={setTab} segments={[{ value: 'items', label: 'Вещи' }, { value: 'outfits', label: 'Образы' }, { value: 'wish', label: 'Вишлист' }]} />
        <ChipGroup chips={['Все', 'Верх', 'Низ', 'Обувь', 'Сумки'].map((label) => ({ label, selected: chips.includes(label) }))} onToggle={(l) => setChips([l])} />
      </Sticky>
      <Grid>{[...items, ...items].map((it, k) => <ItemCard key={k} {...it} />)}</Grid>
    </Screen>
  );
}

/* ─── Snackbar, подсказка, загрузка ─────────────────────────────────────── */

export function FeedbackDemo() {
  const [toast, setToast] = useState(0);
  const [archived, setArchived] = useState(false);
  const [hint, setHint] = useState(true);
  const [photo, setPhoto] = useState<'empty' | 'loading' | 'done'>('empty');
  useEffect(() => {
    if (photo !== 'loading') return;
    const t = window.setTimeout(() => { setPhoto('done'); haptic('success'); }, 2400);
    return () => window.clearTimeout(t);
  }, [photo]);
  return (
    <Screen
      header={<Header type="bar" title="Новая вещь" />}
      floating={toast ? <Snackbar key={toast} autoHide onClose={() => setToast(0)} onUndo={() => setArchived(false)}>Вещь перемещена в архив</Snackbar> : undefined}
      floatingOffset={24}
    >
      <PhotoArea loading={photo === 'loading'} onAdd={() => setPhoto('loading')}>
        {photo === 'loading' ? <LoadingState label="Удаляем фон" /> : photo === 'done' ? <span className="y-motion-appear"><ItemArt kind="outerwear" color="beige" size={200} /></span> : undefined}
      </PhotoArea>
      <div className="y-motion-actions">
        <Button variant="tertiary" size="M" onClick={() => setPhoto(photo === 'empty' ? 'loading' : 'empty')}>{photo === 'empty' ? 'Удалить фон' : 'Сначала'}</Button>
        <Button variant="tertiary" size="M" onClick={() => { setArchived(true); setToast((n) => n + 1); }}>В архив</Button>
        <Button variant="tertiary" size="M" onClick={() => setHint((v) => !v)}>Подсказка</Button>
      </div>
      <div className="y-motion-actions">
        {hint && <Hint>Перемещай и масштабируй вещи</Hint>}
        <span className="y-caption y-text--secondary">{archived ? 'в архиве' : 'в гардеробе'}</span>
        <HapticChip />
      </div>
    </Screen>
  );
}

/* ─── Холст образа ──────────────────────────────────────────────────────── */

const canvasStart: CanvasItem[] = [
  { id: 'glasses', kind: 'accessories', x: 32, y: 18, size: 56 },
  { id: 'top', kind: 'top', x: 66, y: 34, color: 'green' },
  { id: 'bottom', kind: 'bottom', x: 30, y: 58, size: 140, color: 'green' },
  { id: 'shoes', kind: 'shoe', x: 72, y: 76, size: 72, color: 'brown' },
];

export function CanvasDemo() {
  const [list, setList] = useState(canvasStart);
  const [selected, setSelected] = useState<string>();
  return (
    <div className="y-motion-column">
      <div style={{ width: 353 }}><OutfitCanvas items={list} onChange={setList} selectedId={selected} onSelect={setSelected} /></div>
      <HapticChip />
      <p className="y-caption y-text--secondary" style={{ maxWidth: 353 }}>Возьми вещь — подъём 1.04 с тенью; отпусти — садится на пружине quick. Щипок (или колесо мыши на выбранной) за 40 / 300 % тянется резинкой и возвращается.</p>
    </div>
  );
}

/* ─── Профиль: аккаунты и период ────────────────────────────────────────── */

const people: Account[] = [
  { id: 'sima', name: 'Сима', email: 'sima@space.com' },
  { id: 'tina', name: 'Тинатин', email: 'hello@tin.ru', color: 'orange' },
];
const stats: Record<string, [number, number, number, number]> = { sima: [11, 43, 12, 7], tina: [34, 18, 4, 21] };

export function ProfileDemo() {
  const [accounts, setAccounts] = useState(people);
  const [open, setOpen] = useState<'accounts' | 'period'>();
  const [period, setPeriod] = useState('За всё время');
  const me = accounts[0];
  const [usage, worn, idle, looks] = stats[me.id];
  const close = () => setOpen(undefined);
  const layer =
    open === 'accounts' ? <AccountsSheet accounts={accounts} onSwitch={(id) => { close(); setAccounts((a) => [...a.filter((x) => x.id === id), ...a.filter((x) => x.id !== id)]); }} onAdd={close} onEdit={close} onSettings={close} /> :
    open === 'period' ? <Sheet title="Статистика"><ChipGroup wrap onToggle={(l) => { setPeriod(l); window.setTimeout(close, motionMs('--motion-select')); }} chips={['За всё время', 'За полгода', 'За месяц', 'За неделю'].map((label) => ({ label, selected: label === period }))} /></Sheet> : undefined;
  return (
    <Screen header={<Header type="large" title="Профиль" />} bottom={<BottomNav active="profile" />} overlay={layer && <Overlay onClose={close}>{layer}</Overlay>}>
      <Row gap={0} align="center" justify="space-between">
        <AvatarStack accounts={accounts} onOpen={() => setOpen('accounts')} onAdd={() => setOpen('accounts')} />
        <ChipGroup wrap chips={[{ label: period, dropdown: true }]} onToggle={() => setOpen('period')} />
      </Row>
      {/* смена аккаунта: содержимое пересоздаётся по ключу и проявляется (appear), а не подменяется мгновенно */}
      <div key={`${me.id}-${period}`} className="y-motion-appear y-stack-8">
        <UsageMeter percent={usage} />
        <StatRow><StatTile label="надето" value={worn} /><StatTile label="простой" value={idle} /><StatTile label="образов" value={looks} /></StatRow>
      </div>
      <HapticChip />
    </Screen>
  );
}

/* ─── Переход между экранами: push / pop и свайп назад от края ─────────── */

export function PageStackDemo() {
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const g = useRef<{ x: number; w: number; crossed: boolean } | null>(null);
  const [width, setWidth] = useState(393); // ширина экрана на момент жеста — в state, а не в ref: её читает рендер
  const speed = useRef(velocityTracker());
  const push = (on: boolean) => { setOpen(on); setDrag(null); };

  // свайп назад начинается у левого края (24 pt), как в iOS
  const down = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX - r.left > 24) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    g.current = { x: e.clientX, w: r.width, crossed: false };
    speed.current.reset();
    speed.current.add(e.clientX, e.clientY, e.timeStamp);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!g.current) return;
    speed.current.add(e.clientX, e.clientY, e.timeStamp);
    const dx = e.clientX - g.current.x;
    setDrag(dx >= 0 ? dx : rubberBand(dx, g.current.w));
    setWidth(g.current.w);
    const crossed = dx > g.current.w * gesture.swipeDistance;
    if (crossed && !g.current.crossed) haptic('threshold');
    g.current.crossed = crossed;
  };
  const up = (e: PointerEvent<HTMLDivElement>) => {
    if (!g.current) return;
    speed.current.add(e.clientX, e.clientY, e.timeStamp); // точка отпускания: после паузы бросок не засчитывается
    const dx = e.clientX - g.current.x, v = speed.current.get(e.timeStamp).x;
    const back = dx > g.current.w * gesture.swipeDistance || (v > gesture.swipeVelocity && dx > 0);
    g.current = null;
    push(!back);
  };
  const progress = drag === null ? (open ? 1 : 0) : 1 - Math.max(0, drag) / width;
  return (
    <div className="y-motion-phone y-stack" data-dragging={drag !== null || undefined} style={{ ['--stack' as string]: progress }}>
      <div className="y-stack__page y-stack__page--under" inert={open || undefined}>
        <StatusBar />
        <div className="y-motion-pad">
          <h2 className="y-h1">Гардероб</h2>
          <Grid>{items.slice(0, 4).map((it, k) => <ItemCard key={k} {...it} onClick={() => push(true)} />)}</Grid>
          <p className="y-caption y-text--secondary">Нажми на вещь — экран деталей придёт справа.</p>
        </div>
      </div>
      <div className="y-stack__page y-stack__page--top" inert={!open || undefined} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={drag !== null ? { translate: `${drag}px 0` } : undefined}>
        <StatusBar />
        <div className="y-motion-pad">
          <div className="y-motion-actions"><IconButton icon="chevron-left" label="Назад" onClick={() => push(false)} /><span className="y-body">Верхняя одежда</span></div>
          <div className="y-motion-hero"><ItemArt kind="outerwear" color="beige" size={200} /></div>
          <p className="y-caption y-text--secondary">Назад — кнопкой или свайпом от левого края: дальше 30 % ширины или бросок — экран уходит, иначе возвращается.</p>
          <HapticChip />
        </div>
      </div>
    </div>
  );
}

/* ─── Нажатие и выбор: лайк, радио, сегмент ─────────────────────────────── */

export function SelectDemo() {
  const [seg, setSeg] = useState('items');
  const [radio, setRadio] = useState('Россия');
  return (
    <div className="y-motion-column" style={{ width: 353 }}>
      <SegmentControl value={seg} onChange={setSeg} segments={[{ value: 'items', label: 'Вещи' }, { value: 'outfits', label: 'Образы' }, { value: 'wish', label: 'Вишлист' }]} />
      <List>{['Россия', 'Беларусь', 'Грузия'].map((c) => <ListItem key={c} type="radio" label={c} checked={c === radio} onClick={() => setRadio(c)} />)}</List>
      <span className="y-motion-actions"><Icon name="info" size={16} /><span className="y-caption y-text--secondary">сегмент и радио — хаптика select</span><HapticChip /></span>
    </div>
  );
}
