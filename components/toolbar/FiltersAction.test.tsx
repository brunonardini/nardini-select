import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SelectField } from '@/components/select/select';

import { FiltersAction } from './FiltersAction';

function renderFilters(defaultOpen = false) {
  const onSubmit = vi.fn();
  const onClear = vi.fn();
  render(
    <FiltersAction
      label="Filtros"
      title="Filtrar equipe"
      submitLabel="Aplicar filtros"
      clearLabel="Limpar filtros"
      defaultOpen={defaultOpen}
      onSubmit={onSubmit}
      onClear={onClear}
    >
      <SelectField
        label="Estado"
        name="estado"
        defaultValue="todos"
        options={[
          { value: 'todos', label: 'Todos os estados' },
          { value: 'ativo', label: 'Ativo' },
        ]}
      />
    </FiltersAction>,
  );
  return { onSubmit, onClear };
}

describe('FiltersAction', () => {
  it('opens a modal and restores trigger focus after Escape', async () => {
    const user = userEvent.setup();
    renderFilters();
    const trigger = screen.getByRole('button', { name: 'Filtros' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Filtrar equipe' })).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('submits the chosen fields and closes', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderFilters();
    await user.click(screen.getByRole('button', { name: 'Filtros' }));
    expect(
      screen.getByRole('heading', { name: 'Filtrar equipe' }),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }));
    expect(onSubmit).toHaveBeenCalledOnce();
    const data = onSubmit.mock.calls[0][0] as FormData;
    expect(data.get('estado')).toBe('todos');
    expect(
      screen.queryByRole('heading', { name: 'Filtrar equipe' }),
    ).toBeNull();
  });

  it('clears without submitting', async () => {
    const user = userEvent.setup();
    const { onSubmit, onClear } = renderFilters(true);
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(onClear).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('heading', { name: 'Filtrar equipe' }),
    ).toBeNull();
  });
});
