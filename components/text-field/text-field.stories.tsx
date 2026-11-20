import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Icon } from '@/components/icon/icon';

import { TextField } from './text-field';

const meta = {
  title: 'Form/TextField',
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

export const LeadingIcon: Story = {
  args: {
    label: 'Buscar por nome ou e-mail',
    name: 'search',
    type: 'search',
    placeholder: 'Buscar por nome ou e-mail',
    leadingIcon: <Icon name="search" />,
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('searchbox', {
      name: 'Buscar por nome ou e-mail',
    });
    await userEvent.type(input, 'Ana');
    await expect(input).toHaveValue('Ana');
  },
};
