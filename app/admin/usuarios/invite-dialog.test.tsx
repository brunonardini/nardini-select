import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/components/toast/toast';

import { InviteDialog } from './invite-dialog';
import { InvitationsList } from './invitations-list';

vi.mock('./invitation-actions', () => ({
  createInvite: vi.fn(),
  renewInvite: vi.fn(),
  cancelInvite: vi.fn(),
}));

describe('invitation UI', () => {
  it('asks for the full name before creating a link', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(
      <ToastProvider>
        <InviteDialog />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Convidar usuário' }));
    expect(
      screen.getByRole('textbox', { name: 'Nome completo' }),
    ).toBeVisible();
    expect(screen.getByText(/30 minutos/)).toBeVisible();
  });

  it('lists a pending invite with renew and cancel', () => {
    render(
      <ToastProvider>
        <InvitationsList
          invites={[
            {
              id: 'a1d20000-0000-4000-8000-000000000001',
              fullName: 'Ana Silva',
              expiresAt: '2026-12-01T00:00:00.000Z',
            },
          ]}
        />
      </ToastProvider>,
    );
    expect(screen.getByText('Ana Silva')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Gerar novo link' }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeVisible();
  });

  it('says when there is no pending invite', () => {
    render(
      <ToastProvider>
        <InvitationsList invites={[]} />
      </ToastProvider>,
    );
    expect(screen.getByText('Nenhum convite pendente.')).toBeVisible();
  });
});
