import { signInErrorText } from '@/lib/auth/logic/errors';
import { isInvitationToken } from '@/lib/auth/logic/invitation-token';
import { findInvitationByToken } from '@/lib/invitations/io/invitations';
import { invitationPageError } from '@/lib/invitations/logic/rules';

import { InviteForm } from '../invite-form';

function formatExpiry(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const queryError = signInErrorText(query.erro);

  if (!isInvitationToken(token)) {
    return (
      <section className="admin-panel">
        <h1>Convite</h1>
        <p role="alert">{signInErrorText('convite_invalido')}</p>
      </section>
    );
  }

  const invitation = await findInvitationByToken(token);
  const statusError = invitation
    ? invitationPageError(invitation.validity)
    : 'convite_invalido';

  if (!invitation || statusError) {
    return (
      <section className="admin-panel">
        <h1>Convite</h1>
        <p role="alert">
          {queryError ?? signInErrorText(statusError ?? 'convite_invalido')}
        </p>
      </section>
    );
  }

  return (
    <section className="admin-panel">
      <h1>Convite</h1>
      <p>
        Olá, {invitation.fullName}. Este convite é válido até{' '}
        {formatExpiry(invitation.expiresAt)}.
      </p>
      {queryError ? <p role="alert">{queryError}</p> : null}
      <InviteForm token={token} />
    </section>
  );
}
