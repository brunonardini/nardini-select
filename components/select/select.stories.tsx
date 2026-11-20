import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

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

/** A choice that applies at once, like the page size of a listing. */
export const AppliesOnChange: Story = {
  args: {
    label: 'Por página',
    name: 'por_pagina',
    defaultValue: '6',
    options: ['3', '6', '12', '24'].map((value) => ({ value, label: value })),
    onValueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const combobox = within(canvasElement).getByRole('combobox', {
      name: 'Por página',
    });
    await userEvent.click(combobox);
    if (combobox.getAttribute('aria-expanded') !== 'true') {
      combobox.focus();
      await userEvent.keyboard('{ArrowDown}');
    }
    await userEvent.click(
      within(document.body).getByRole('option', { name: '12' }),
    );
    await expect(args.onValueChange).toHaveBeenCalledWith('12');
  },
};
