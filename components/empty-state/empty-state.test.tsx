import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('shows the title and the extra content', () => {
    render(
      <EmptyState title="Cadastro em aprovação">
        <p>Aguarde um administrador.</p>
      </EmptyState>,
    );

    expect(
      screen.getByRole('heading', { name: 'Cadastro em aprovação' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Aguarde um administrador.')).toBeInTheDocument();
  });

  it('renders the title alone', () => {
    render(<EmptyState title="Nada por aqui" />);
    expect(
      screen.getByRole('heading', { name: 'Nada por aqui' }),
    ).toBeInTheDocument();
  });
});
