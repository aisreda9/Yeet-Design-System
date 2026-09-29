import type { Meta, StoryObj } from '@storybook/react-vite';
import { TripCard } from '.';

type Args = { type: 'trip' | 'add'; city: string; items: number; outfits: number; label: string };

const meta: Meta<Args> = {
  title: 'Organisms/TripCard',
  tags: ['autodocs'],
  args: { type: 'trip', city: 'Бразилиа', items: 4, outfits: 1, label: 'Собрать новый чемодан' },
  argTypes: {
    type: { control: 'inline-radio', options: ['trip', 'add'] },
    city: { if: { arg: 'type', eq: 'trip' } }, items: { if: { arg: 'type', eq: 'trip' } }, outfits: { if: { arg: 'type', eq: 'trip' } },
    label: { if: { arg: 'type', eq: 'add' } },
  },
  decorators: [(Story) => <div style={{ width: 173 }}><Story /></div>],
  parameters: { docs: { description: { component: 'Карточка поездки 173×220: город H3, счётчики Body grey (склоняются), вещи снизу — поле 141×120 в 16 от боков и 20 от низа. Type=Add — «Собрать новый чемодан». Figma: `trip-card` · Type, City, Meta, Label.' } } },
  render: ({ type, city, items, outfits, label }) => type === 'add' ? <TripCard add label={label} /> : <TripCard city={city} items={items} outfits={outfits} art={[{ kind: 'accessories', x: 60, y: 30, size: 40 }, { kind: 'bottom', x: 28, y: 62, size: 72, color: 'green' }, { kind: 'top', x: 74, y: 62, size: 64, color: 'green' }]} />,
};
export default meta;
export const Playground: StoryObj<Args> = {};
