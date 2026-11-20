import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Checkbox } from './checkbox';

const meta = {
  title: 'Form/Checkbox',
  component: Checkbox,
  args: {
    label: 'Li e aceito os termos de uso',
    onCheckedChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Brand checkbox on Base UI. The label is the accessible name. Interface text stays in pt-BR.',
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox', {
      name: 'Li e aceito os termos de uso',
    });
    await expect(checkbox).not.toBeChecked();
  },
};

export const Checked: Story = {
  args: { checked: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('checkbox')).toBeChecked();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await expect(checkbox).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(checkbox);
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

/** Mixed state for a page whose cards are only partly selected. */
export const Indeterminate: Story = {
  args: { indeterminate: true, label: 'Selecionar página' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('checkbox')).toHaveAttribute(
      'aria-checked',
      'mixed',
    );
  },
};

/** The label stays the accessible name when the card shows only the box. */
export const HiddenLabel: Story = {
  args: { labelHidden: true, label: 'Selecionar Ana Souza' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('checkbox', {
        name: 'Selecionar Ana Souza',
      }),
    ).toBeInTheDocument();
  },
};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('checkbox')).toHaveFocus();
  },
};
