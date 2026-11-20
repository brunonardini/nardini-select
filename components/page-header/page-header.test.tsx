import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('renders the heading on its own', () => {
    render(<PageHeader title="Usuários" />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Usuários' }),
    ).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('places an action beside the heading', () => {
    render(
      <PageHeader
        title="Usuários"
        action={<button type="button">Convidar usuário</button>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Usuários' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Convidar usuário' }),
    ).toBeVisible();
  });
});
