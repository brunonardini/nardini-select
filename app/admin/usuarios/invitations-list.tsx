'use client';

import { useActionState } from 'react';

import { Alert } from '@/components/alert/alert';
import { Button } from '@/components/button/button';
import { LocalDateTime } from '@/components/local-date-time/local-date-time';
import { TextField } from '@/components/text-field/text-field';
import { useNotice } from '@/components/toast/toast';

import { cancelInvite, renewInvite } from './invitation-actions';

type Invite = { id: string; fullName: string; expiresAt: string };

function InviteRow({ invite }: { invite: Invite }) {
  const [renewed, renew, renewing] = useActionState(renewInvite, null);
  const [canceled, cancel, canceling] = useActionState(cancelInvite, null);
  const notice = useNotice();
  const link =
    renewed?.ok === true && typeof window !== 'undefined'
      ? `${window.location.origin}/admin/convite/${renewed.token}`
      : null;
  const error =
    (renewed && !renewed.ok ? renewed.message : null) ??
    (canceled && !canceled.ok ? canceled.message : null);

  if (canceled?.ok) return null;

  return (
    <li className="admin-panel">
      <strong>{invite.fullName}</strong>
      <p>
        Expira em <LocalDateTime value={invite.expiresAt} />
      </p>
      {error ? (
        <Alert variant="danger" title="Convite não alterado">
          {error}
        </Alert>
      ) : null}
      {link ? (
        <div className="admin-form">
          <TextField label="Novo link" readOnly value={link} />
          <p>Esse link expira em 30 minutos.</p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void navigator.clipboard.writeText(link).then(
                () => notice('Link copiado', 'Esse link expira em 30 minutos.'),
                () =>
                  notice(
                    'Não foi possível copiar',
                    'Selecione o link e copie manualmente.',
                  ),
              );
            }}
          >
            Copiar link
          </Button>
        </div>
      ) : (
        <div className="dialog-actions">
          <form action={renew}>
            <input type="hidden" name="id" value={invite.id} />
            <Button
              type="submit"
              variant="secondary"
              loading={renewing}
              loadingLabel="Gerando…"
            >
              Gerar novo link
            </Button>
          </form>
          <form action={cancel}>
            <input type="hidden" name="id" value={invite.id} />
            <Button
              type="submit"
              variant="outline"
              loading={canceling}
              loadingLabel="Cancelando…"
            >
              Cancelar
            </Button>
          </form>
        </div>
      )}
    </li>
  );
}

export function InvitationsList({ invites }: { invites: Invite[] }) {
  if (invites.length === 0) return <p>Nenhum convite pendente.</p>;
  return (
    <ul className="admin-form">
      {invites.map((invite) => (
        <InviteRow key={invite.id} invite={invite} />
      ))}
    </ul>
  );
}
