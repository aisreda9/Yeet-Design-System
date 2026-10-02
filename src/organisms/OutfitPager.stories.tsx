import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { BottomNav, Header, OutfitPager, WeatherCard, type PagerLook } from '.';
import { Stamp } from '../atoms';
import { ChipGroup } from '../molecules';
import { Screen } from '../templates';
import { unlessBare, Usage, UsageGrid } from '../docs/helpers';

const looks: PagerLook[] = [
  { id: 'green', name: 'зелёный деним', items: [{ kind: 'accessories', x: 34, y: 18, size: 56 }, { kind: 'top', x: 66, y: 34, color: 'green' }, { kind: 'bottom', x: 30, y: 60, size: 130, color: 'green' }, { kind: 'shoe', x: 72, y: 76, size: 72, color: 'brown' }] },
  { id: 'black', name: 'чёрная юбка', items: [{ kind: 'bottom', x: 28, y: 58, size: 140, color: 'black' }, { kind: 'top', x: 64, y: 36, color: 'brown' }, { kind: 'container', x: 76, y: 76, size: 64, color: 'black' }] },
  { id: 'beige', name: 'бежевый жакет', items: [{ kind: 'outerwear', x: 36, y: 36, size: 120, color: 'beige' }, { kind: 'bottom', x: 68, y: 58, size: 110, color: 'blue' }, { kind: 'shoe', x: 34, y: 80, size: 64, color: 'white' }] },
  { id: 'yellow', name: 'жёлтая футболка', items: [{ kind: 'top', x: 40, y: 34, size: 120, color: 'yellow' }, { kind: 'bottom', x: 64, y: 62, size: 120, color: 'blue' }, { kind: 'container', x: 26, y: 74, size: 64, color: 'black' }] },
];
const occasions = ['Прогулка', 'Офис', 'На каждый день', 'Свидание', 'Вечеринка'];

type Args = { axis: 'y' | 'x'; preview: 96 | 150; count: number; weather: boolean; stamp: boolean; skip: boolean; disabled: boolean };

/** Штамп «Надеть» с отметкой на каждый образ отдельно. */
function useDone() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  return (id: string, label = 'Надеть') => <Stamp label={label} done={!!done[id]} onClick={() => setDone((d) => ({ ...d, [id]: !d[id] }))} />;
}

function Demo({ axis, preview, count, weather, stamp, skip, disabled }: Args) {
  const list = looks.slice(0, count);
  const [i, setI] = useState(1);
  const index = Math.min(i, list.length - 1);
  const stampFor = useDone();
  return (
    <OutfitPager
      looks={list}
      axis={axis}
      preview={preview}
      index={index}
      onIndexChange={setI}
      disabled={disabled}
      weather={weather ? <WeatherCard temperature="20°" description="Солнечно, ветер 14 км/ч" tilt /> : undefined}
      stamp={stamp ? stampFor(list[index].id, axis === 'x' ? 'Сохранить' : 'Надеть') : undefined}
      skip={skip ? <Stamp label="Не нравится" variant="secondary" onClick={() => setI(Math.min(index + 1, list.length - 1))} /> : undefined}
    />
  );
}

const meta: Meta<Args> = {
  title: 'Organisms/OutfitPager',
  tags: ['autodocs'],
  args: { axis: 'y', preview: 96, count: 3, weather: true, stamp: true, skip: false, disabled: false },
  argTypes: {
    axis: { control: 'inline-radio', options: ['y', 'x'] },
    preview: { control: 'inline-radio', options: [96, 150], if: { arg: 'axis', eq: 'y' }, description: 'Превью вне экрана (здесь, в блоке 353). В `Screen` стопка заполняет высоту и превью считается само — см. «В флоу».' },
    count: { control: { type: 'range', min: 1, max: 4 } },
  },
  decorators: [unlessBare((Story) => <div style={{ width: 393, padding: '0 20px', boxSizing: 'border-box', overflow: 'hidden' }}><Story /></div>)],
  parameters: {
    docs: {
      description: {
        component:
          'Пейджер образов: свайп по коллажу листает, дальше 30 % или бросок — следующий, на краях — резинка (`useSwipePager`). ' +
          '**Стопка** (`axis="y"`, главная `1371:36589`, «Удиви меня» `1371:42686`): коллаж — квадрат во всю ширину контента (353 при 393, 280 при 320, 390 при 430), соседние образы — превью в 20 над и под ним, смена на пружине `--motion-swap`; тап по превью — к нему. ' +
          'В `Screen` стопка занимает всё место между шапкой и таб-баром: превью = (высота − коллаж − 2 × 20 − низ) / 2, при 393 × 852 — 96 на главной и 150 в «Удиви меня», как в Figma. ' +
          'Превью не меньше 48 и не больше коллажа; если места мало, коллаж уменьшается — стопка всегда помещается, экран не скроллится, образы обрезаны по области стопки (погода и штамп — нет). Вне экрана превью задаёт `preview`. ' +
          '**Лента** (`axis="x"`, «С чем носить» `1371:42779`): страницы во всю ширину контента через 20, соседние за краем экрана, `--motion-page`; вертикальный жест остаётся скроллу. ' +
          'Слоты поверх текущего коллажа: `weather` (WeatherCard tilt), `stamp` (звезда поворачивается на 180° при смене), `skip` («Не нравится»). ' +
          'Клавиатура: кнопки «Предыдущий / Следующий образ» в порядке Tab (видны при фокусе), стрелки, Home, End; смена объявляется через `aria-live`. ' +
          'При «Уменьшении движения» палец ведёт 1 : 1, а доводка и смена мгновенные (токены `--motion-*` = 1ms). ' +
          'Экран не хранит индекс — `index` / `onIndexChange` (или `defaultIndex`). Figma: Animations «scale» `354:17678 → 354:17767`, лента `798:2215 → 799:2433`.',
      },
    },
  },
  render: (args) => <Demo {...args} />,
};
export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {};

export const Variants: Story = {
  name: 'Варианты',
  tags: ['bare'],
  parameters: { controls: { disable: true } },
  render: () => (
    <UsageGrid min={393}>
      <Usage screen="Стопка · превью 96" note="главная" width={393}><div style={{ padding: '0 20px', width: '100%', boxSizing: 'border-box' }}><Demo axis="y" preview={96} count={3} weather stamp skip={false} disabled={false} /></div></Usage>
      <Usage screen="Стопка · превью 150" note="«Удиви меня»" width={393}><div style={{ padding: '0 20px', width: '100%', boxSizing: 'border-box' }}><Demo axis="y" preview={150} count={3} weather={false} stamp skip disabled={false} /></div></Usage>
      <Usage screen="Лента" note="«С чем носить»" width={393}><div style={{ padding: '0 20px', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}><Demo axis="x" preview={96} count={4} weather={false} stamp skip disabled={false} /></div></Usage>
      <Usage screen="Первый и последний образ" note="превью только с одной стороны, кнопка на краю недоступна" width={393}><div style={{ padding: '0 20px', width: '100%', boxSizing: 'border-box' }}><OutfitPager looks={looks.slice(0, 2)} defaultIndex={1} stamp={<Stamp label="Надеть" />} /></div></Usage>
    </UsageGrid>
  ),
};

function TodayFlow() {
  const [i, setI] = useState(1);
  const stampFor = useDone();
  return (
    <Screen header={<Header variant="large" title="Твои образы" accent={{ label: 'на каждый день' }} />} bottom={<BottomNav active="today" />}>
      <OutfitPager
        looks={looks}
        index={i}
        onIndexChange={setI}
        weather={<WeatherCard temperature="20°" description="Солнечно, ветер 14 км/ч" tilt />}
        stamp={stampFor(looks[i].id)}
      />
    </Screen>
  );
}

function SurpriseFlow() {
  const [i, setI] = useState(1);
  const stampFor = useDone();
  return (
    <Screen header={<Header variant="bar" titleChip="Удиви меня" onBack={() => {}} actions={[{ icon: 'info', label: 'Как это работает' }]} />}>
      <OutfitPager looks={looks} index={i} onIndexChange={setI} stamp={stampFor(looks[i].id, 'Сохранить')} skip={<Stamp label="Не нравится" variant="secondary" onClick={() => setI((k) => Math.min(k + 1, looks.length - 1))} />} />
    </Screen>
  );
}

function TripsFlow() {
  const [i, setI] = useState(2);
  const stampFor = useDone();
  const list = occasions.map((o, k) => ({ ...looks[k % looks.length], id: o, name: o }));
  return (
    <Screen header={<Header variant="bar" titleChip="С чем носить" onBack={() => {}} actions={[{ icon: 'info', label: 'Как это работает' }]} />}>
      <OutfitPager axis="x" looks={list} index={i} onIndexChange={setI} aria-label="Образы по поводам" stamp={stampFor(list[i].id, 'Сохранить')} skip={<Stamp label="Не нравится" variant="secondary" />} />
      <div style={{ marginTop: 81 }}>
        <ChipGroup chips={occasions.map((label, k) => ({ label, selected: k === i }))} onToggle={(label) => setI(occasions.indexOf(label))} />
      </div>
    </Screen>
  );
}

const flowDoc = (story: string) => ({ controls: { disable: true }, docs: { description: { story: `${story} Свайпни коллаж, тапни превью или штамп. Экраны \`src/pages\` переводит на компонент задача screens (#30).` } } });

export const InFlow: Story = {
  name: 'В флоу: главная',
  tags: ['bare', 'visual'], // play только проверяет геометрию, состояние не меняет — скриншот нужен
  parameters: flowDoc('Outfits / Everyday / Sunny `1371:36589`: стопка от шапки до таб-бара (превью 96 при 393 × 852), погода и штамп «Надеть». Rain Alert `1371:36745` — тот же экран с `WeatherCard alert`. Смени размер экрана в тулбаре — превью растягиваются по высоте.'),
  render: () => <Usage screen="Outfits / Everyday / Sunny" note="1371:36589"><TodayFlow /></Usage>,
  play: async ({ canvasElement, step }) => {
    const box = (s: string) => canvasElement.querySelector(s)!.getBoundingClientRect();
    await step('Коллаж во всю ширину контента, превью сверху и снизу равны и заполняют место', async () => {
      await waitFor(() => expect(box('.is-current .y-collage').width).toBeCloseTo(box('.y-outfit-pager').width, 0));
      const prev = box('.is-prev .y-collage'), next = box('.is-next .y-collage'), pager = box('.y-outfit-pager');
      await expect(prev.height).toBeCloseTo(next.height, 0);
      await expect(prev.height).toBeGreaterThanOrEqual(48);
      await expect(prev.top).toBeCloseTo(pager.top, 0);
    });
  },
};

export const InFlowSurprise: Story = {
  name: 'В флоу: «Удиви меня»',
  tags: ['bare'],
  parameters: flowDoc('Stylist / Outfit of the Day `1371:42686`: стопка на всё место под шапкой (превью 150 при 393 × 852), «Сохранить» и «Не нравится».'),
  render: () => <Usage screen="Stylist / Outfit of the Day" note="1371:42686"><SurpriseFlow /></Usage>,
};

export const InFlowTrips: Story = {
  name: 'В флоу: «С чем носить»',
  tags: ['bare'],
  parameters: flowDoc('Stylist / Trips / List `1371:42779`: лента образов, под ней поводы — чипсы и свайп ведут один индекс.'),
  render: () => <Usage screen="Stylist / Trips / List" note="1371:42779"><TripsFlow /></Usage>,
};

/** Клавиатура: Tab до кнопки «Следующий образ», Enter и стрелки листают, объявление через aria-live. */
export const Keyboard: Story = {
  name: 'Клавиатура',
  args: { axis: 'y', count: 3 },
  parameters: { docs: { description: { story: 'Кнопки навигации в порядке Tab и видны только при фокусе с клавиатуры. Стрелки по оси, Home и End листают с них же; на краю кнопка `aria-disabled`, фокус не теряется.' } } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const live = () => canvasElement.querySelector('.y-outfit-pager__live');
    await step('Tab до «Следующий образ», Enter', async () => {
      const next = canvas.getByRole('button', { name: 'Следующий образ' });
      next.focus();
      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect(live()).toHaveTextContent('Образ 3 из 3'));
      await expect(next).toHaveAttribute('aria-disabled', 'true');
      await expect(next).toHaveFocus();
    });
    await step('Home и стрелка вниз', async () => {
      await userEvent.keyboard('{Home}');
      await waitFor(() => expect(live()).toHaveTextContent('Образ 1 из 3'));
      await userEvent.keyboard('{ArrowDown}');
      await waitFor(() => expect(live()).toHaveTextContent('Образ 2 из 3'));
    });
    await step('Скрытые образы не читаются', async () => {
      await expect(canvas.getAllByRole('group', { name: /из 3/ })).toHaveLength(1);
    });
  },
};
