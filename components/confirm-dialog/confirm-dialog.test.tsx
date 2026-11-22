import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('confirms immediately when no phrase is required', async () => {
    const action = vi.fn();
    render(
      <ConfirmDialog
        label="Excluir"
        title="Excluir papel"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        fields={{ id: '1' }}
        action={action}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(action).toHaveBeenCalled();
  });

  it('keeps the action disabled until the phrase matches', async () => {
    render(
      <ConfirmDialog
        label="Anonimizar"
        title="Anonimizar usuário"
        description="O nome é apagado."
        confirmLabel="Anonimizar"
        expectedText="Ana Silva"
        fields={{ id: '1' }}
        action={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Anonimizar' }));
    const confirm = screen.getByRole('button', { name: 'Anonimizar' });
    expect(confirm).toBeDisabled();
    await userEvent.type(screen.getByRole('textbox'), 'Ana Silva');
    expect(confirm).toBeEnabled();
  });
  it('focuses cancel, clears the typed phrase on dismissal and submits only after confirmation', async () => {
    const action = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        intent="delete"
        label="Excluir papel"
        title="Excluir papel"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir papel definitivamente"
        expectedText="Papel de teste"
        fields={{ id: '1' }}
        action={action}
      />,
    );
    const opener = screen.getByRole('button', { name: 'Excluir papel' });
    const confirm = () =>
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Excluir papel definitivamente',
      });

    await user.click(opener);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus(),
    );
    expect(confirm()).toBeDisabled();
    await user.type(screen.getByRole('textbox'), 'Papel de teste');
    expect(confirm()).toBeEnabled();

    await user.click(
      screen.getByRole('button', { name: 'Fechar confirmação' }),
    );
    await waitFor(() => expect(opener).toHaveFocus());
    expect(action).not.toHaveBeenCalled();
    await user.click(opener);
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(confirm()).toBeDisabled();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(opener).toHaveFocus());

    await user.click(opener);
    await user.type(screen.getByRole('textbox'), 'Papel de teste');
    await user.click(confirm());
    expect(action).toHaveBeenCalledOnce();
    expect(action.mock.calls[0][0].get('id')).toBe('1');
  });
});
