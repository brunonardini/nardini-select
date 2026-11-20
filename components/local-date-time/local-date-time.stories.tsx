import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { LocalDateTime } from './local-date-time';

const meta = {
  title: 'Components/LocalDateTime',
  component: LocalDateTime,
  args: { value: '2026-06-01T12:00:00.000Z' },
} satisfies Meta<typeof LocalDateTime>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Instant: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('time')).toHaveAttribute(
      'dateTime',
      '2026-06-01T12:00:00.000Z',
    );
  },
};

export const Empty: Story = {
  args: { value: null },
};
