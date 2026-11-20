import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { Avatar } from './avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: { name: 'Ana Silva' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('AS')).toBeVisible();
  },
};

export const Photo: Story = {
  args: { src: '/images/admin-sign-in-mobile.webp' },
};
