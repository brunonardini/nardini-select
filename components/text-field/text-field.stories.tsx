import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { TextField } from './text-field';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  args: { label: 'Nome completo', name: 'full_name' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('textbox', { name: 'Nome completo' }),
    ).toBeVisible();
  },
};

export const WithError: Story = {
  args: { error: 'Informe o nome completo.', defaultValue: '' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Ana' },
};
