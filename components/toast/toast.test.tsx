import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ToastProvider, useNotice } from './toast';

function Notify() {
  const notice = useNotice();
  return (
    <button
      type="button"
      onClick={() =>
        notice({
          variant: 'success',
          title: 'Link copiado',
          description: 'Envie o link à pessoa convidada.',
        })
      }
    >
      Avisar
    </button>
  );
}

describe('Toast', () => {
  it('shows a notice and closes it', async () => {
    render(
      <ToastProvider>
        <Notify />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Avisar' }));
    expect(screen.getByText('Link copiado')).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: 'Fechar: Link copiado' }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Link copiado' }),
      ).not.toBeInTheDocument(),
    );
  });
});
