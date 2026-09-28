import type { Meta, StoryObj } from '@storybook/react-vite';
import { Hint } from '.';
import { demoPhoto, Usage, UsageGrid } from '../docs/helpers';

const meta = {
  title: 'Molecules/Hint',
  component: Hint,
  tags: ['autodocs'],
  args: { children: 'Перемещай и масштабируй вещи', icon: 'fingers-pinch', tone: 'default' },
  argTypes: { icon: { control: 'select', options: ['fingers-pinch', 'horizontal-drag', 'info'] }, tone: { control: 'inline-radio', options: ['default', 'onPhoto'] }, children: { control: 'text', name: 'label' } },
  parameters: { docs: { description: { component: 'Плавающая подсказка: иконка 16 + Body 14. **default** — пилюля 28 elevated, радиус 32, тень; **onPhoto** — без подложки, белый текст и иконка поверх фото (`--color-text-on-photo`). Figma: `hint` · Tone (Default / On Photo), Label, Icon.' } } },
} satisfies Meta<typeof Hint>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Подсказка поверх фото: белым, без пилюли. */
export const OnPhoto: Story = {
  name: 'On Photo',
  args: { tone: 'onPhoto', icon: 'fingers-pinch', children: 'Выдели вещь на фото' },
  render: (args) => (
    <div style={{ width: 353, height: 200, borderRadius: 20, overflow: 'hidden', display: 'grid', placeItems: 'end center', padding: 20, background: `center / cover url("${demoPhoto}")` }}>
      <Hint {...args} />
    </div>
  ),
};

export const InFlow: Story = {
  parameters: { controls: { disable: true } },
  name: 'В флоу',
  tags: ['bare'],
  render: () => (
    <UsageGrid min={353}>
      <Usage screen="Outfit Creation / Canvas" note="пилюля"><Hint>Перемещай и масштабируй вещи</Hint></Usage>
      <Usage screen="Search / Photo / Crop" note="On Photo">
        <div style={{ width: 353, height: 120, borderRadius: 20, display: 'grid', placeItems: 'center', background: `center / cover url("${demoPhoto}")` }}><Hint tone="onPhoto">Выдели вещь на фото</Hint></div>
      </Usage>
    </UsageGrid>
  ),
};
