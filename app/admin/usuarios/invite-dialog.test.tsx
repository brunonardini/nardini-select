import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '@/components/toast/toast';

import { InviteDialog } from './invite-dialog';
import { cancelInvite, createInvite, renewInvite } from './invitation-actions';
import {
  createdAfterPublish,
  InvitationListProvider,
} from './invitation-list-provider';
import {
  hiddenIdsAfterCancel,
  invitationsAfterCancel,
  invitationsWithCreated,
  InvitationsDisclosure,
} from './invitations-disclosure';
import { InvitationsList, type Invite } from './invitations-list';

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

const createdInvite: Invite = {
  id: 'a1d20000-0000-4000-8000-000000000002',
  fullName: 'Bruno Nardini',
  expiresAt: '2026-12-01T00:30:00.000Z',
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

  it('remembers a canceled id once', () => {
    const hidden = [invite.id];
    expect(hiddenIdsAfterCancel([], invite.id)).toEqual([invite.id]);
    expect(hiddenIdsAfterCancel(hidden, invite.id)).toBe(hidden);
  });

  it('keeps a missing list missing and prepends a new invite once', () => {
    const loaded = [invite];
    expect(invitationsWithCreated(null, [createdInvite])).toBeNull();
    expect(invitationsWithCreated([], [createdInvite])).toEqual([
      createdInvite,
    ]);
    expect(invitationsWithCreated(loaded, [invite])).toBe(loaded);
    expect(invitationsWithCreated([invite], [createdInvite])).toEqual([
      createdInvite,
      invite,
    ]);
    expect(
      invitationsWithCreated(
        [invite, createdInvite],
        [createdInvite],
        [createdInvite.id],
      ),
    ).toEqual([invite]);
  });

  it('keeps a repeated publish in place', () => {
    const published = [invite];
    expect(createdAfterPublish(published, invite)).toBe(published);
    expect(createdAfterPublish([invite], createdInvite)).toEqual([
      createdInvite,
      invite,
    ]);
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
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveClass('alert-warning');
    expect(alert).toHaveTextContent(
      'Informe o nome completo para gerar o link.',
    );
  });

  it('copies a new invite link and reports a clipboard failure', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    vi.mocked(createInvite).mockResolvedValue({
      ok: true,
      token: 'tok-1',
      invite: createdInvite,
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

  it('adds a created invite to the list and drops it after cancel', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    vi.mocked(createInvite).mockResolvedValue({
      ok: true,
      token: 'tok-1',
      invite: createdInvite,
    });
    vi.mocked(cancelInvite).mockResolvedValue({ ok: true });
    const { rerender } = render(
      <ToastProvider>
        <InvitationListProvider>
          <InviteDialog />
          <InvitationsDisclosure key="loading" invites={null} />
        </InvitationListProvider>
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Convidar usuário' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Nome completo' }),
      'Bruno Nardini',
    );
    await user.click(screen.getByRole('button', { name: 'Gerar link' }));
    expect(
      await screen.findByRole('textbox', { name: 'Link do convite' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: /Convites pendentes/,
        hidden: true,
      }),
    ).toHaveAttribute('aria-busy', 'true');

    rerender(
      <ToastProvider>
        <InvitationListProvider>
          <InviteDialog />
          <InvitationsDisclosure key="ready" invites={[invite]} />
        </InvitationListProvider>
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    const trigger = screen.getByRole('button', { name: /Convites pendentes/ });
    expect(trigger).toHaveTextContent('2');
    await user.click(trigger);
    expect(screen.getByText('Bruno Nardini')).toBeVisible();
    expect(screen.getByText('Ana Silva')).toBeVisible();

    const bruno = screen.getByText('Bruno Nardini').closest('li');
    expect(bruno).not.toBeNull();
    await user.click(
      within(bruno as HTMLElement).getByRole('button', {
        name: 'Cancelar convite',
      }),
    );
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Cancelar convite',
      }),
    );
    await waitFor(() => expect(trigger).toHaveTextContent('1'));
    expect(screen.queryByText('Bruno Nardini')).not.toBeInTheDocument();
    expect(screen.getByText('Ana Silva')).toBeVisible();
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
      await screen.findByText('Não foi possível gerar um novo link'),
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
      await screen.findByText('Não foi possível cancelar o convite'),
    ).toBeVisible();
  });
});
