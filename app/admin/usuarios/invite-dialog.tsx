'use client';

import { useActionState, useEffect } from 'react';

import { Alert } from '@/components/alert/alert';
import { Button } from '@/components/button/button';
import { Dialog, DialogClose } from '@/components/dialog/dialog';
import { TextField } from '@/components/text-field/text-field';
import { useNotice } from '@/components/toast/toast';

import { createInvite } from './invitation-actions';
import { usePublishInvite } from './invitation-list-provider';

export function InviteDialog() {
  const [state, action, pending] = useActionState(createInvite, null);
  const publish = usePublishInvite();
  const notice = useNotice();

  useEffect(() => {
    if (state?.ok !== true) return;
    publish(state.invite);
  }, [publish, state]);

  const link =
    state?.ok === true && typeof window !== 'undefined'
      ? `${window.location.origin}/admin/convite/${state.token}`
      : null;

  return (
    <Dialog
      label="Convidar usuário"
      variant="primary"
      title="Convidar usuário"
      description="O link vale por 30 minutos e pode ser usado uma vez."
    >
      {link ? (
        <div className="dialog-form">
          <TextField label="Link do convite" readOnly value={link} />
          <p>Esse link expira em 30 minutos.</p>
          <div className="dialog-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void navigator.clipboard.writeText(link).then(
                  () =>
                    notice('Link copiado', 'Esse link expira em 30 minutos.'),
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
            <DialogClose>Fechar</DialogClose>
          </div>
        </div>
      ) : (
        <form className="dialog-form" action={action}>
          {state && !state.ok ? (
            <Alert variant="danger" title="Convite não criado">
              {state.message}
            </Alert>
          ) : null}
          <TextField label="Nome completo" name="full_name" required />
          <div className="dialog-actions">
            <DialogClose>Cancelar</DialogClose>
            <Button type="submit" loading={pending} loadingLabel="Criando…">
              Gerar link
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
