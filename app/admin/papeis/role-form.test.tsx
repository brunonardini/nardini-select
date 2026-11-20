import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RoleCreateForm, RoleRenameForm } from './role-form';

vi.mock('./actions', () => ({
  saveNewRole: vi.fn(),
  saveRoleName: vi.fn(),
  removeRole: vi.fn(),
}));

describe('RoleForm', () => {
  it('creates a role from a name', () => {
    render(<RoleCreateForm />);
    expect(screen.getByRole('textbox', { name: 'Nome' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Criar papel' })).toBeVisible();
  });

  it('renames from the current name', () => {
    render(<RoleRenameForm id="role" name="estoque" />);
    expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveValue(
      'estoque',
    );
  });
});
