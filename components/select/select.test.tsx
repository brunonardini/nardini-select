import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SelectField } from './select';

const options = [
  { value: 'none', label: 'Sem papel' },
  { value: 'estoque', label: 'Estoque' },
];

describe('SelectField', () => {
  it('opens the list and chooses an option', async () => {
    render(
      <form>
        <SelectField
          label="Papel"
          name="role_id"
          defaultValue="none"
          options={options}
        />
      </form>,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Papel' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'Estoque' }),
    );
    expect(screen.getByRole('combobox', { name: 'Papel' })).toHaveTextContent(
      'Estoque',
    );
  });

  it('reports a chosen value at once', async () => {
    const onValueChange = vi.fn();
    render(
      <SelectField
        label="Por página"
        name="por_pagina"
        defaultValue="6"
        options={[
          { value: '6', label: '6' },
          { value: '12', label: '12' },
        ]}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Por página' }));
    await userEvent.click(await screen.findByRole('option', { name: '12' }));
    expect(onValueChange).toHaveBeenCalledWith('12');
  });
});
