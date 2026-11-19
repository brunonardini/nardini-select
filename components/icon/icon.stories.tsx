import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Icon } from './icon';

const meta = {
  title: 'Components/Icon',
  component: Icon,
  args: { name: 'pin', width: 32, height: 32 },
  argTypes: {
    name: {
      control: 'inline-radio',
      options: [
        'down',
        'pin',
        'whatsapp',
        'instagram',
        'lock',
        'google',
        'left',
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Icons drawn in currentColor. Directional and social icons are grouped for comparison. They are decorative (aria-hidden): give the surrounding link or button its own text.',
      },
    },
  },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The two directional icons, using the same size and stroke. */
export const Arrows: Story = {
  argTypes: { name: { control: false } },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <Icon {...args} name="left" />
      <Icon {...args} name="down" />
    </div>
  ),
};

/** Instagram, WhatsApp and Google together, with the same dimensions. */
export const Social: Story = {
  argTypes: { name: { control: false } },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <Icon {...args} name="instagram" />
      <Icon {...args} name="whatsapp" />
      <Icon {...args} name="google" />
    </div>
  ),
};

export const Pin: Story = { args: { name: 'pin' } };
export const Lock: Story = { args: { name: 'lock' } };

/** The social group inherits Terracota on the Cafe surface. */
export const OnCafe: Story = {
  ...Social,
  args: { width: 44, height: 44 },
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
