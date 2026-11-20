import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/components/toast/toast';

import { InviteDialog } from './invite-dialog';
import { cancelInvite, createInvite, renewInvite } from './invitation-actions';
import {
  invitationsAfterCancel,
  InvitationsDisclosure,
} from './invitations-disclosure';
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

  it('keeps a missing list missing when a cancel arrives early', () => {
    expect(invitationsAfterCancel(null, invite.id)).toBeNull();
    expect(invitationsAfterCancel([invite], invite.id)).toEqual([]);
  });

  it('shows why the invite was not created', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    vi.mocked(createInvite).mockResolvedValue({
      ok: false,
      message: 'Informe o nome completo.',
    });
    render(
      <ToastProvider>
        <InviteDialog />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Convidar usuário' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Nome completo' }),
      'Ana Silva',
    );
    await user.click(screen.getByRole('button', { name: 'Gerar link' }));
    expect(await screen.findByText('Informe o nome completo.')).toBeVisible();
  });

  it('copies a new invite link and reports a clipboard failure', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    vi.mocked(createInvite).mockResolvedValue({ ok: true, token: 'tok-1' });
    render(
      <ToastProvider>
        <InviteDialog />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Convidar usuário' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Nome completo' }),
      'Ana Silva',
    );
    await user.click(screen.getByRole('button', { name: 'Gerar link' }));
    const link = await screen.findByRole('textbox', {
      name: 'Link do convite',
    });
    expect(link).toHaveValue(`${window.location.origin}/admin/convite/tok-1`);
    await user.click(screen.getByRole('button', { name: 'Copiar link' }));
    expect(await screen.findByText('Link copiado')).toBeVisible();
    writeText.mockRejectedValueOnce(new Error('denied'));
    await user.click(screen.getByRole('button', { name: 'Copiar link' }));
    expect(await screen.findByText('Não foi possível copiar')).toBeVisible();
  });

  it('copies a renewed link and reports a clipboard failure', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    vi.mocked(renewInvite).mockResolvedValue({ ok: true, token: 'tok-2' });
    render(
      <ToastProvider>
        <InvitationsList invites={[invite]} onCanceled={vi.fn()} />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Gerar novo link' }));
    expect(
      await screen.findByRole('textbox', { name: 'Novo link' }),
    ).toHaveValue(`${window.location.origin}/admin/convite/tok-2`);
    await user.click(screen.getByRole('button', { name: 'Copiar link' }));
    expect(await screen.findByText('Link copiado')).toBeVisible();
    writeText.mockRejectedValueOnce(new Error('denied'));
    await user.click(screen.getByRole('button', { name: 'Copiar link' }));
    expect(await screen.findByText('Não foi possível copiar')).toBeVisible();
  });

  it('shows why a renewal failed', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    vi.mocked(renewInvite).mockResolvedValue({
      ok: false,
      message: 'Este convite não pode ser alterado.',
    });
    render(
      <ToastProvider>
        <InvitationsList invites={[invite]} onCanceled={vi.fn()} />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Gerar novo link' }));
    expect(
      await screen.findByText('Este convite não pode ser alterado.'),
    ).toBeVisible();
  });

  it('shows why a cancellation failed', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    vi.mocked(cancelInvite).mockResolvedValue({
      ok: false,
      message: 'Este convite não pode ser alterado.',
    });
    render(
      <ToastProvider>
        <InvitationsList invites={[invite]} onCanceled={vi.fn()} />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Cancelar convite' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Cancelar convite',
      }),
    );
    expect(
      await screen.findByText('Este convite não pode ser alterado.'),
    ).toBeVisible();
  });
});
