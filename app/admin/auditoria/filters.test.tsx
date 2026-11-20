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
      <AuditFiltersForm filters={{ ...empty, action: 'user.disabled' }} />,
    );
    const form = document.querySelector('form');
    expect(form).toHaveAttribute('method', 'get');
    expect(screen.getByLabelText('Ação')).toHaveValue('user.disabled');
    expect(screen.getByRole('button', { name: 'Filtrar' })).toBeVisible();
  });
});
