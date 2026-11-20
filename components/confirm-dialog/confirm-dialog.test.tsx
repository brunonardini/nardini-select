import { render, screen } from '@testing-library/react';
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
});
