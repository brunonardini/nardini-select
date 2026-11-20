import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/components/toast/toast';

import { InviteDialog } from './invite-dialog';
import { cancelInvite } from './invitation-actions';
import { InvitationsDisclosure } from './invitations-disclosure';
import { InvitationsList } from './invitations-list';

vi.mock('./invitation-actions', () => ({
  createInvite: vi.fn(),
  renewInvite: vi.fn(),
  cancelInvite: vi.fn(),
}));

const invite = {
  id: 'a1d20000-0000-4000-8000-000000000001',
  fullName: 'Ana Silva',
  expiresAt: '2026-12-01T00:00:00.000Z',
};

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
        <InvitationsList invites={[invite]} onCanceled={vi.fn()} />
      </ToastProvider>,
    );
    expect(screen.getByText('Ana Silva')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Gerar novo link' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Cancelar convite' }),
    ).toBeVisible();
  });

  it('says when there is no pending invite', () => {
    render(
      <ToastProvider>
        <InvitationsList invites={[]} onCanceled={vi.fn()} />
      </ToastProvider>,
    );
    expect(screen.getByText('Nenhum convite pendente.')).toBeVisible();
  });

  it('cancels an invite only after confirmation', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    vi.mocked(cancelInvite).mockResolvedValue({ ok: true });
    const onCanceled = vi.fn();
    render(
      <ToastProvider>
        <InvitationsList invites={[invite]} onCanceled={onCanceled} />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Cancelar convite' }));
    expect(cancelInvite).not.toHaveBeenCalled();
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Cancelar convite',
      }),
    );
    await waitFor(() => expect(onCanceled).toHaveBeenCalled());
  });

  it('keeps the disclosure disabled while invitations load', () => {
    render(<InvitationsDisclosure invites={null} />);
    const trigger = screen.getByRole('button', { name: /Convites pendentes/ });
    expect(trigger).toHaveAttribute('aria-busy', 'true');
    expect(trigger).toHaveTextContent('carregando');
  });

  it('shows the count and removes a canceled invite', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    vi.mocked(cancelInvite).mockResolvedValue({ ok: true });
    render(
      <ToastProvider>
        <InvitationsDisclosure invites={[invite]} />
      </ToastProvider>,
    );
    const trigger = screen.getByRole('button', { name: /Convites pendentes/ });
    expect(trigger).toHaveTextContent('1');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'Cancelar convite' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Cancelar convite',
      }),
    );
    await waitFor(() => expect(trigger).toHaveTextContent('0'));
    expect(screen.getByText('Nenhum convite pendente.')).toBeVisible();
  });
});
