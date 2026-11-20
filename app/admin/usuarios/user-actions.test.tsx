import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { UserActions } from './user-actions';

vi.mock('./actions', () => ({
  saveFullName: vi.fn(),
  saveRole: vi.fn(),
  disableAccount: vi.fn(),
  enableAccount: vi.fn(),
  removeAccount: vi.fn(),
  anonymizeAccount: vi.fn(),
}));

const user = {
  id: 'a1d10000-0000-4000-8000-000000000010',
  fullName: 'Ana Silva',
  displayName: 'Ana',
  email: 'ana@example.com',
  roleId: null,
  photo: false,
};

describe('UserActions', () => {
  it('hides operations the server would refuse', () => {
    render(
      <UserActions
        user={user}
        roles={[{ id: 'role', name: 'estoque' }]}
        allow={{
          fullName: true,
          role: false,
          disable: false,
          enable: false,
          remove: false,
          anonymize: false,
        }}
      />,
    );
    expect(
      screen.getByRole('textbox', { name: 'Nome completo' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Desabilitar' }),
    ).not.toBeInTheDocument();
  });

  it('offers disable, delete, and typed anonymizing when allowed', () => {
    render(
      <UserActions
        user={user}
        roles={[]}
        allow={{
          fullName: false,
          role: true,
          disable: true,
          enable: true,
          remove: true,
          anonymize: true,
        }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Desabilitar' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Habilitar' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Anonimizar' })).toBeVisible();
  });
});
