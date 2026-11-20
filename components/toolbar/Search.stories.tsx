import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Search } from './Search';

const onChange = fn();

function SearchField({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <Search
      label="Buscar por nome ou e-mail"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

const meta = {
  title: 'Layout/Toolbar/Search',
  component: Search,
  args: {
    label: 'Buscar por nome ou e-mail',
    value: '',
    onChange,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Search field for a listing toolbar. The control fills the width of its parent.',
      },
    },
  },
} satisfies Meta<typeof Search>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty field, as wide as its parent. */
export const Empty: Story = {
  render: () => <SearchField />,
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole('searchbox', {
      name: 'Buscar por nome ou e-mail',
    });
    await expect(field).toHaveValue('');
    const parent = field.parentElement!.parentElement!;
    await expect(field.getBoundingClientRect().width).toBe(
      parent.getBoundingClientRect().width,
    );
  },
};

/** Typed text stays in the field. */
export const Typed: Story = {
  render: () => <SearchField />,
  play: async ({ canvasElement }) => {
    onChange.mockClear();
    const field = within(canvasElement).getByRole('searchbox', {
      name: 'Buscar por nome ou e-mail',
    });
    await userEvent.type(field, 'ana');
    await expect(field).toHaveValue('ana');
    await expect(onChange).toHaveBeenCalled();
  },
};
