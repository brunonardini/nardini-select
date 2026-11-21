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
      reason: 'invalid_name',
      message: 'Informe o nome.',
    });
    const user = userEvent.setup();
    render(<RoleCreateForm />);
    await user.type(screen.getByRole('textbox', { name: 'Nome' }), 'Caixa');
    await user.click(screen.getByRole('button', { name: 'Criar papel' }));
    expect(await screen.findByText('Informe o nome.')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveClass('alert-warning');
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
      reason: 'taken',
      message: 'Já existe um papel com esse nome.',
    });
    const user = userEvent.setup();
    render(<RoleRenameForm id="role" name="estoque" />);
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveClass('alert-warning');
    expect(alert).toHaveTextContent(
      'Já existe um papel com esse nome. Escolha outro.',
    );
  });

  it('confirms a saved name', async () => {
    vi.mocked(saveRoleName).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<RoleRenameForm id="role" name="estoque" />);
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'O novo nome foi salvo.',
    );
  });
});
