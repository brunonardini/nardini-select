import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { SelectField } from './select';

const options = [
  { value: 'none', label: 'Sem papel' },
  { value: 'estoque', label: 'Estoque' },
];

const meta = {
  title: 'Components/Select',
  component: SelectField,
  args: {
    label: 'Papel',
    name: 'role_id',
    defaultValue: 'none',
    options,
  },
} satisfies Meta<typeof SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const combobox = within(canvasElement).getByRole('combobox', {
      name: 'Papel',
    });
    await userEvent.click(combobox);
    if (combobox.getAttribute('aria-expanded') !== 'true') {
      combobox.focus();
      await userEvent.keyboard('{ArrowDown}');
    }
    const option = within(document.body).getByRole('option', {
      name: 'Estoque',
    });
    await expect(option).toBeInTheDocument();
    await userEvent.click(option);
    await expect(combobox).toHaveTextContent('Estoque');
  },
};
