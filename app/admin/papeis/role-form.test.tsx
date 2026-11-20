import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { saveNewRole, saveRoleName } from './actions';
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

  it('shows why a role was not created', async () => {
    vi.mocked(saveNewRole).mockResolvedValue({
      ok: false,
      reason: 'invalid',
      message: 'Informe o nome.',
    });
    const user = userEvent.setup();
    render(<RoleCreateForm />);
    await user.type(screen.getByRole('textbox', { name: 'Nome' }), 'Caixa');
    await user.click(screen.getByRole('button', { name: 'Criar papel' }));
    expect(await screen.findByText('Informe o nome.')).toBeVisible();
  });

  it('keeps the form when the role is created', async () => {
    vi.mocked(saveNewRole).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<RoleCreateForm />);
    await user.type(screen.getByRole('textbox', { name: 'Nome' }), 'Caixa');
    await user.click(screen.getByRole('button', { name: 'Criar papel' }));
    expect(
      await screen.findByRole('button', { name: 'Criar papel' }),
    ).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows why a role was not renamed', async () => {
    vi.mocked(saveRoleName).mockResolvedValue({
      ok: false,
      reason: 'invalid',
      message: 'Esse nome já existe.',
    });
    const user = userEvent.setup();
    render(<RoleRenameForm id="role" name="estoque" />);
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Esse nome já existe.')).toBeVisible();
  });

  it('confirms a saved name', async () => {
    vi.mocked(saveRoleName).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<RoleRenameForm id="role" name="estoque" />);
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('O nome foi salvo.')).toBeVisible();
  });
});
