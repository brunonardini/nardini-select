import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Dialog } from './dialog';

describe('Dialog', () => {
  it('opens and closes', async () => {
    render(
      <Dialog
        label="Abrir"
        title="Aviso"
        description="Leia antes de continuar."
      >
        <p>Conteúdo do aviso.</p>
      </Dialog>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const trigger = screen.getByRole('button', { name: 'Abrir' });
    await userEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Aviso' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
