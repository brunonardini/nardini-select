import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Toolbar } from './index';
import { Search } from './Search';

describe('Toolbar', () => {
  it('places the search in the content and the buttons in the actions', () => {
    render(
      <Toolbar>
        <Toolbar.Content>
          <Search
            label="Buscar por nome ou e-mail"
            value=""
            onChange={vi.fn()}
          />
        </Toolbar.Content>
        <Toolbar.Actions>
          <button type="button">Filtros</button>
          <button type="button">Ordenar</button>
        </Toolbar.Actions>
      </Toolbar>,
    );

    const field = screen.getByRole('searchbox', {
      name: 'Buscar por nome ou e-mail',
    });
    const filters = screen.getByRole('button', { name: 'Filtros' });
    const content = field.parentElement!.parentElement!.parentElement!;
    const actions = filters.parentElement!;

    expect(content).toContainElement(field);
    expect(actions).toContainElement(filters);
    expect(actions).toContainElement(
      screen.getByRole('button', { name: 'Ordenar' }),
    );
    expect(content.contains(filters)).toBe(false);
  });
});
