import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuditFiltersForm } from './filters';

const empty = {
  actorId: null,
  action: null,
  entityType: null,
  entityId: null,
  from: null,
  to: null,
};

describe('AuditFilters', () => {
  it('submits the filters as a get form', () => {
    render(
      <AuditFiltersForm
        filters={{
          actorId: 'actor-1',
          action: 'user.disabled',
          entityType: 'user',
          entityId: 'entity-1',
          from: '2026-01-01',
          to: '2026-01-31',
        }}
      />,
    );
    const form = document.querySelector('form');
    expect(form).toHaveAttribute('method', 'get');
    expect(screen.getByLabelText('Ação')).toHaveValue('user.disabled');
    expect(screen.getByLabelText('Tipo')).toHaveValue('user');
    expect(screen.getByLabelText('De')).toHaveValue('2026-01-01');
    expect(screen.getByLabelText('Até')).toHaveValue('2026-01-31');
    expect(screen.getByLabelText('Ator')).toHaveValue('actor-1');
    expect(screen.getByLabelText('Entidade')).toHaveValue('entity-1');
    expect(screen.getByRole('button', { name: 'Filtrar' })).toBeVisible();
  });

  it('leaves every field empty when the address has no filters', () => {
    render(<AuditFiltersForm filters={empty} />);
    expect(screen.getByLabelText('Ação')).toHaveValue('');
    expect(screen.getByLabelText('Tipo')).toHaveValue('');
    expect(screen.getByLabelText('De')).toHaveValue('');
    expect(screen.getByLabelText('Até')).toHaveValue('');
  });
});
