import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../atoms';
import { ItemCard, OutfitCollage, type AutoCollageItem, type Garment } from '.';
import { Usage, UsageGrid } from '../docs/helpers';
import { useArtMetas } from './cards';
import bag from '../docs/cutouts/bag.svg';
import cap from '../docs/cutouts/cap.svg';
import coat from '../docs/cutouts/coat.svg';
import hoodie from '../docs/cutouts/hoodie.svg';
import jeans from '../docs/cutouts/jeans.svg';
import sneaker from '../docs/cutouts/sneaker.svg';
import tshirt from '../docs/cutouts/tshirt.svg';

/**
 * Демо-вырезки нарочно «как из нейросети»: разные холсты (600×1400 … 1600×1000), поля от 4 до 70 %,
 * вещь сдвинута в угол, у сумки тонкая ручка сверху. Настоящие фото из Figma подставятся сюда же.
 */
const cutouts: { kind: Garment; src: string; name: string }[] = [
  { kind: 'outerwear', src: hoodie, name: 'Худи · холст 1000×1000, поля 4 %' },
  { kind: 'top', src: tshirt, name: 'Футболка · 1000×800, сдвинута влево' },
  { kind: 'bottom', src: jeans, name: 'Джинсы · 600×1400' },
  { kind: 'shoe', src: sneaker, name: 'Кеды · 1600×1000, в углу' },
  { kind: 'container', src: bag, name: 'Сумка · ручка сверху' },
  { kind: 'accessories', src: cap, name: 'Кепка · поля 70 %' },
];

const meta = {
  title: 'Organisms/PhotoBalance',
  tags: ['autodocs'],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          'Фото вещей после удаления фона (ИИ) приходят с разными полями, холстами и «массой». `balanceArt` выравнивает их в три шага: ' +
          '**1. обрезка** по альфа-рамке (порог 8/255 срезает ореол), **2. визуальный вес** — масштаб по √площади силуэта с весом категории ' +
          '(в сетке мягкий: обувь 0.86, аксессуары 0.8; в коллаже реальный: обувь 0.62, аксессуары 0.5), рамка не больше 80 % ячейки, ' +
          '**3. оптический центр** — сдвиг к центру масс наполовину, не больше 6 % ячейки. `layoutCollage` раскладывает образ в две колонки ' +
          '(тело / аксессуары и обувь) с одинаковым зазором 12 между силуэтами, обходя бейдж повода и панель цены. ' +
          'Метаданные (`measureArt`) считаются один раз при загрузке вещи и хранятся рядом с фото; без них — меряются в браузере при первом показе.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** «Как было»: картинка целиком вписана в ячейку (object-fit: contain). */
function NaiveCard({ src }: { src: string }) {
  return (
    <div className="y-item-card" style={{ display: 'grid', placeItems: 'center' }}>
      <img src={src} alt="" style={{ width: 138, height: 138, objectFit: 'contain' }} />
    </div>
  );
}

const grid = { display: 'grid', gridTemplateColumns: 'repeat(2, 173px)', gap: 7 } as const;

export const Cards: Story = {
  name: 'Сетка гардероба: до / после',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="До" note="object-fit: contain — вещи прыгают по размеру и положению" width={353}>
        <div style={grid}>{cutouts.map((c) => <NaiveCard key={c.src} src={c.src} />)}</div>
      </Usage>
      <Usage screen="После" note="balanceArt · card: один визуальный вес, оптический центр" width={353}>
        <div style={grid}>{cutouts.map((c) => <ItemCard key={c.src} kind={c.kind} image={c.src} name={c.name} />)}</div>
      </Usage>
    </UsageGrid>
  ),
};

const look: AutoCollageItem[] = [
  { kind: 'outerwear', src: coat },
  { kind: 'top', src: tshirt },
  { kind: 'bottom', src: jeans },
  { kind: 'accessories', src: cap },
  { kind: 'container', src: bag },
  { kind: 'shoe', src: sneaker },
];
const price = <><span><span className="y-h2" style={{ display: 'block' }}>48 900 ₽</span><span className="y-caption y-text--secondary">{look.length} вещей</span></span><Icon name="chevron-right" /></>;

export const Collage: Story = {
  name: 'Коллаж: автораскладка',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Outfit Details" note="6 вещей, повод и цена" width={353}><OutfitCollage label="Прогулка" footer={price} items={look} /></Usage>
      <Usage screen="Outfits" note="3 вещи без панели" width={353}><OutfitCollage items={[{ kind: 'top', src: hoodie }, { kind: 'bottom', src: jeans }, { kind: 'shoe', src: sneaker }]} /></Usage>
      <Usage screen="Profile / Лучшая инвестиция" note="одна вещь, plain" width={353}><OutfitCollage plain items={[{ kind: 'container', src: bag }]} /></Usage>
    </UsageGrid>
  ),
};

/** Что измерено: рамка силуэта (синим) и центр масс (точка) поверх исходного холста. */
function Measured({ src, name }: { src: string; name: string }) {
  const [m] = useArtMetas([{ src }]);
  return (
    <Usage screen={name} note={m ? `заполнение ${Math.round(m.fill * 100)} % · центр масс ${Math.round(m.center[0] * 100)} / ${Math.round(m.center[1] * 100)} %` : 'меряем…'} width={173}>
      <div style={{ position: 'relative', width: 173, height: 173, background: 'var(--color-bg-secondary)', borderRadius: 20, display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'relative', aspectRatio: m ? String(m.ratio) : '1', maxWidth: 150, maxHeight: 150, width: m && m.ratio >= 1 ? 150 : undefined, height: m && m.ratio < 1 ? 150 : undefined }}>
          <img src={src} alt="" style={{ width: '100%', height: '100%', display: 'block', outline: '1px dashed var(--color-divider)' }} />
          {m && (
            <>
              <span style={{ position: 'absolute', left: `${m.box[0] * 100}%`, top: `${m.box[1] * 100}%`, width: `${m.box[2] * 100}%`, height: `${m.box[3] * 100}%`, outline: '1.5px solid var(--color-accent)' }} />
              <span style={{ position: 'absolute', left: `${m.center[0] * 100}%`, top: `${m.center[1] * 100}%`, width: 8, height: 8, margin: -4, borderRadius: 4, background: 'var(--color-accent)' }} />
            </>
          )}
        </div>
      </div>
    </Usage>
  );
}

export const Measure: Story = {
  name: 'Измерение (measureArt)',
  tags: ['bare'],
  render: () => <UsageGrid min={173}>{cutouts.map((c) => <Measured key={c.src} {...c} />)}</UsageGrid>,
};
