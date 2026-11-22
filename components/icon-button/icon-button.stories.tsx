import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';

import { Icon } from '../icon/icon';
import { IconButton } from './icon-button';

const onClick = fn();
const meta = {
  title: 'Form/IconButton',
  component: IconButton,
  args: { 'aria-label': 'Abrir menu', icon: <Icon name="menu" />, onClick },
  parameters: {
    docs: {
      description: {
        component:
          'A named, icon-only action with a 44px target. Supply an accessible label and a decorative icon. Use Button for actions that need a visible label.',
      },
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Abrir menu' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onClick).toHaveBeenCalledOnce();
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const OnCafe: Story = {
  args: { 'aria-label': 'Fechar menu', icon: <Icon name="close" /> },
  decorators: [
    (Story) => (
      <div className="button-surface-dark" style={{ padding: 24 }}>
        <Story />
      </div>
    ),
  ],
};
