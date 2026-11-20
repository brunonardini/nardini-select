import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SelectField } from '@/components/select/select';

import { Filter } from './filter';

function renderFilter(defaultOpen = false) {
  const onSubmit = vi.fn();
  const onClear = vi.fn();
  render(
    <Filter
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
      <SelectField
        label="Papel"
        name="papel"
        defaultValue="todos"
        options={[
          { value: 'todos', label: 'Todos os papéis' },
          { value: 'sem-papel', label: 'Sem papel' },
        ]}
      />
    </Filter>,
  );
  return { onSubmit, onClear };
}

describe('Filter', () => {
  it('submits the chosen fields and closes', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderFilter();
    await user.click(screen.getByRole('button', { name: 'Filtros' }));
    expect(
      screen.getByRole('heading', { name: 'Filtrar equipe' }),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }));
    expect(onSubmit).toHaveBeenCalledOnce();
    const data = onSubmit.mock.calls[0][0] as FormData;
    expect(data.get('papel')).toBe('todos');
    expect(data.get('estado')).toBe('todos');
    expect(
      screen.queryByRole('heading', { name: 'Filtrar equipe' }),
    ).toBeNull();
  });

  it('clears without submitting', async () => {
    const user = userEvent.setup();
    const { onSubmit, onClear } = renderFilter(true);
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(onClear).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('heading', { name: 'Filtrar equipe' }),
    ).toBeNull();
  });
});
