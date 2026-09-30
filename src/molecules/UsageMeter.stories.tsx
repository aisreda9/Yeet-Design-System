import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsageMeter } from '.';
import { withWidth } from '../docs/helpers';

const meta = {
  title: 'Molecules/UsageMeter',
  component: UsageMeter,
  tags: ['autodocs'],
  args: { percent: 11, label: 'гардероба используется' },
  argTypes: { percent: { control: { type: 'range', min: 0, max: 100 } } },
  decorators: [withWidth(353)],
  parameters: { docs: { description: { component: 'Доля используемого гардероба: H1 + точечная сетка 52×8 (точка 2 px, шаг 6). Figma: `usage-meter` · Value, Label.' } } },
} satisfies Meta<typeof UsageMeter>;
export default meta;
export const Playground: StoryObj<typeof meta> = {};
