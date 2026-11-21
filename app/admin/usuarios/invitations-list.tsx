'use client';

import { useActionState, useEffect } from 'react';

import { Alert } from '@/components/alert/alert';
import { Button } from '@/components/button/button';
import { Card } from '@/components/card/card';
import { ConfirmDialog } from '@/components/confirm-dialog/confirm-dialog';
import { LocalDateTime } from '@/components/local-date-time/local-date-time';
import { TextField } from '@/components/text-field/text-field';

import { cancelInvite, renewInvite } from './invitation-actions';
import { useCopyInviteLink } from './use-copy-invite-link';
import styles from './users.module.css';

export type Invite = { id: string; fullName: string; expiresAt: string };

function InviteRow({
  invite,
  onCanceled,
}: {
  invite: Invite;
  onCanceled: () => void;
}) {
  const [renewed, renew, renewing] = useActionState(renewInvite, null);
  const [canceled, cancel, canceling] = useActionState(cancelInvite, null);
  const copyInviteLink = useCopyInviteLink();
  const link =
    renewed?.ok === true && typeof window !== 'undefined'
      ? `${window.location.origin}/admin/convite/${renewed.token}`
      : null;
  const renewFailed = renewed?.ok === false;
  const cancelFailed = canceled?.ok === false;
  const errorTitle = renewFailed
    ? cancelFailed
      ? 'Não foi possível alterar o convite'
      : 'Não foi possível gerar um novo link'
    : 'Não foi possível cancelar o convite';

  useEffect(() => {
    if (canceled?.ok) onCanceled();
  }, [canceled, onCanceled]);

  if (canceled?.ok) return null;

  return (
    <Card
      title={invite.fullName}
      facts={[
        {
          key: 'expires',
          label: 'Expira em',
          value: <LocalDateTime value={invite.expiresAt} />,
        },
      ]}
    >
      {!link && (renewFailed || cancelFailed) ? (
        <Alert variant="danger" icon="error" title={errorTitle}>
          Atualize a lista de convites e confira se ele ainda está disponível.
        </Alert>
      ) : null}
      {link ? (
        <div className="admin-form">
          <TextField label="Novo link" readOnly value={link} />
          <p>Esse link expira em 30 minutos.</p>
          <Button
            type="button"
            variant="secondary"
            onClick={(event) => void copyInviteLink(link, event.currentTarget)}
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
          {canceling ? (
            <Button variant="outline" loading loadingLabel="Cancelando…">
              Cancelar convite
            </Button>
          ) : (
            <ConfirmDialog
              label="Cancelar convite"
              title="Cancelar convite"
              description={`O link enviado para ${invite.fullName} deixa de funcionar.`}
              confirmLabel="Cancelar convite"
              fields={{ id: invite.id }}
              action={cancel}
            />
          )}
        </div>
      )}
    </Card>
  );
}

export function InvitationsList({
  invites,
  onCanceled,
}: {
  invites: Invite[];
  onCanceled: (id: string) => void;
}) {
  if (invites.length === 0) return <p>Nenhum convite pendente.</p>;
  return (
    <ul className={styles.invitationList}>
      {invites.map((invite) => (
        <InviteRow
          key={invite.id}
          invite={invite}
          onCanceled={() => onCanceled(invite.id)}
        />
      ))}
    </ul>
  );
}
