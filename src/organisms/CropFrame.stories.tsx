import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { CropFrame, cropDefault, StatusBar, type CropRect } from '.';
import { Button, IconButton } from '../atoms';
import { demoPhoto, unlessBare, Usage } from '../docs/helpers';

type Args = { hint: string; min: number };

function Demo({ hint, min }: Args) {
  const [rect, setRect] = useState<CropRect>(cropDefault);
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <div style={{ width: 393, height: 852, borderRadius: 44, overflow: 'hidden' }}>
        <CropFrame src={demoPhoto} value={rect} onChange={setRect} hint={hint || null} min={min} />
      </div>
      <code className="y-caption y-text--secondary">{`x ${rect.x.toFixed(3)} · y ${rect.y.toFixed(3)} · w ${rect.w.toFixed(3)} · h ${rect.h.toFixed(3)}`}</code>
    </div>
  );
}

const meta: Meta<Args> = {
  title: 'Organisms/CropFrame',
  tags: ['autodocs'],
  args: { hint: 'Перемещай и масштабируй рамку', min: 64 },
  decorators: [unlessBare((Story) => <Story />)],
  parameters: {
    docs: {
      description: {
        component:
          'Рамка обрезки фото (crop-frame `1356:29832`, экран Search / Photo / Crop · DS `1176:19019`): вне рамки — затемнение `--color-bg-overlay`, по углам белые уголки 32 × 2 с радиусом 20, подсказка `Hint onPhoto` в 24 над кнопкой L. ' +
          'Рамку двигают пальцем, углы тянут (зона захвата 44), двумя пальцами — масштаб вокруг центра. Рамка не выходит за фото и не меньше `min`. ' +
          'Геометрия — в долях контейнера (`CropRect` 0…1), `cropDefault` — рамка 353 × 227, верх на 313, как в Figma. Клавиатура: Tab на рамку, стрелки двигают (Shift — крупнее), + / − масштабируют.',
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
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <Usage screen="Без подсказки" note="hint={null}" width={240}><div style={{ width: 240, height: 320, borderRadius: 20, overflow: 'hidden' }}><CropFrame src={demoPhoto} hint={null} defaultValue={{ x: 0.1, y: 0.2, w: 0.8, h: 0.5 }} /></div></Usage>
      <Usage screen="Квадрат" note="своя рамка" width={240}><div style={{ width: 240, height: 320, borderRadius: 20, overflow: 'hidden' }}><CropFrame src={demoPhoto} hint={null} defaultValue={{ x: 0.15, y: 0.25, w: 0.7, h: 0.525 }} /></div></Usage>
    </div>
  ),
};

export const InFlow: Story = {
  name: 'В флоу',
  tags: ['bare'],
  parameters: { controls: { disable: true }, docs: { description: { story: 'Search / Photo / Crop · DS `1176:19019`: фото на весь экран, статус-бар и «Назад» поверх, внизу «Найти похожее», подсказка в 24 над ним.' } } },
  render: () => (
    <Usage screen="Search / Photo / Crop" note="1176:19019">
      <div style={{ position: 'relative', width: 'var(--screen-width)', height: 'var(--screen-height)', borderRadius: 56, overflow: 'hidden' }}>
        <CropFrame src={demoPhoto} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 3 }}><StatusBar tone="onPhoto" /></div>
        <div style={{ position: 'absolute', left: 20, top: 70, zIndex: 3 }}><IconButton icon="chevron-left" label="Назад" variant="inverse" /></div>
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 20, zIndex: 3 }}><Button size="L" fullWidth>Найти похожее</Button></div>
      </div>
    </Usage>
  ),
};

export const Keyboard: Story = {
  name: 'Клавиатура',
  parameters: { docs: { description: { story: 'Tab на рамку: → сдвигает на 4 px, + увеличивает на 5 % вокруг центра.' } } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByRole('group', { name: /Рамка/ });
    const code = () => canvasElement.querySelector('code')!.textContent!;
    await step('→ двигает рамку', async () => {
      frame.focus();
      const before = code();
      await userEvent.keyboard('{ArrowRight}');
      await expect(code()).not.toBe(before);
    });
    await step('+ увеличивает рамку', async () => {
      const w = parseFloat(code().split('w ')[1]);
      await userEvent.keyboard('+');
      await expect(parseFloat(code().split('w ')[1])).toBeGreaterThan(w);
    });
  },
};
