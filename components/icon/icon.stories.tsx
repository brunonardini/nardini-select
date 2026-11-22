import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ComponentProps } from 'react';

import { Icon } from './icon';

const feedbackIcons = ['info', 'check', 'warning', 'error'] as const;
type IconProps = ComponentProps<typeof Icon>;

function LabeledIcon({ name, ...args }: IconProps) {
  return (
    <div style={{ display: 'inline-grid', justifyItems: 'center', gap: 8 }}>
      <Icon {...args} name={name} />
      <code translate="no">{name}</code>
    </div>
  );
}

function IconGallery({
  names,
  ...args
}: Omit<IconProps, 'name'> & { names: readonly IconProps['name'][] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {names.map((name) => (
        <LabeledIcon key={name} {...args} name={name} />
      ))}
    </div>
  );
}

const meta = {
  title: 'Components/Icon',
  component: Icon,
  args: { name: 'pin', width: 32, height: 32 },
  render: (args) => <LabeledIcon {...args} />,
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
        'trash',
        ...feedbackIcons,
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Icons drawn in currentColor. Directional, feedback and social icons are grouped for comparison. They are decorative (aria-hidden): give the surrounding link or button its own text.',
      },
    },
  },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const AdminNavigationIcons: Story = {
  args: { width: 24, height: 24 },
  argTypes: { name: { control: false } },
  render: (args) => (
    <IconGallery
      {...args}
      names={[
        'home',
        'users',
        'roles',
        'history',
        'menu',
        'close',
        'collapse',
        'chevron',
        'profile',
        'sign-out',
      ]}
    />
  ),
};

/** The directional icons, using the same size and stroke. */
export const Arrows: Story = {
  argTypes: { name: { control: false } },
  render: (args) => <IconGallery {...args} names={['left', 'right', 'down']} />,
};

/** Listing controls: search, filters, sort, invitations and the next-page arrow. */
export const ListIcons: Story = {
  argTypes: { name: { control: false } },
  render: (args) => (
    <IconGallery
      {...args}
      names={['search', 'filter', 'sort', 'mail', 'left', 'right']}
    />
  ),
};

/** Information, confirmation, warning and error icons used by Alert. */
export const FeedbackIcons: Story = {
  argTypes: { name: { control: false } },
  render: (args) => <IconGallery {...args} names={feedbackIcons} />,
};

/** Instagram, WhatsApp and Google together, with the same dimensions. */
export const Social: Story = {
  argTypes: { name: { control: false } },
  render: (args) => (
    <IconGallery {...args} names={['instagram', 'whatsapp', 'google']} />
  ),
};

export const Trash: Story = { args: { name: 'trash' } };

export const Pin: Story = { args: { name: 'pin' } };
export const Lock: Story = { args: { name: 'lock' } };

/** Terracota icons and Off-white labels on the Cafe surface. */
export const OnCafe: Story = {
  ...Social,
  args: { width: 44, height: 44, color: 'var(--terracota)' },
  decorators: [
    (Story) => (
      <div
        style={{
          background: 'var(--cafe)',
          color: 'var(--off-white)',
          padding: 24,
          display: 'inline-flex',
        }}
      >
        <Story />
      </div>
    ),
  ],
};
