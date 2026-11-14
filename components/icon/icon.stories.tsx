import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Icon } from './icon';

const meta = {
  title: 'Components/Icon',
  component: Icon,
  args: { name: 'down', width: 32, height: 32 },
  argTypes: {
    name: {
      control: 'inline-radio',
      options: ['down', 'pin', 'whatsapp', 'instagram'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Line icons drawn in `currentColor`. They are decorative (`aria-hidden`): give the surrounding link or button its own text.',
      },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Down: Story = {};

export const Pin: Story = { args: { name: 'pin' } };

export const WhatsApp: Story = { args: { name: 'whatsapp' } };

export const Instagram: Story = { args: { name: 'instagram' } };

/** Icons inherit the text color, here Terracota on Café. */
export const OnCafe: Story = {
  args: { name: 'whatsapp', width: 44, height: 44 },
  decorators: [
    (Story) => (
      <div
        style={{
          background: 'var(--cafe)',
          color: 'var(--terracota)',
          padding: 24,
          display: 'inline-flex',
        }}
      >
        <Story />
      </div>
    ),
  ],
};
