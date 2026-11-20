import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Dialog, DialogClose } from './dialog';

describe('Dialog', () => {
  it('opens and closes', async () => {
    render(
      <Dialog
        label="Abrir"
        title="Aviso"
        description="Leia antes de continuar."
      >
        <DialogClose>Fechar</DialogClose>
      </Dialog>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    expect(screen.getByRole('dialog', { name: 'Aviso' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
