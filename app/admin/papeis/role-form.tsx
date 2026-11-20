'use client';

import { useActionState } from 'react';

import { Alert } from '@/components/alert/alert';
import { Button } from '@/components/button/button';
import { TextField } from '@/components/text-field/text-field';

import { saveNewRole, saveRoleName } from './actions';

export function RoleCreateForm() {
  const [state, action, pending] = useActionState(saveNewRole, null);
  return (
    <form className="admin-form" action={action}>
      {state && !state.ok ? (
        <Alert variant="danger" title="Papel não criado">
          {state.message}
        </Alert>
      ) : null}
      <TextField label="Nome" name="name" required maxLength={40} />
      <Button type="submit" loading={pending} loadingLabel="Salvando…">
        Criar papel
      </Button>
    </form>
  );
}

export function RoleRenameForm({ id, name }: { id: string; name: string }) {
  const [state, action, pending] = useActionState(saveRoleName, null);
  return (
    <form className="admin-form" action={action}>
      <input type="hidden" name="id" value={id} />
      {state && !state.ok ? (
        <Alert variant="danger" title="Papel não renomeado">
          {state.message}
        </Alert>
      ) : null}
      {state?.ok ? (
        <Alert title="Papel atualizado">O nome foi salvo.</Alert>
      ) : null}
      <TextField
        label="Nome"
        name="name"
        defaultValue={name}
        required
        maxLength={40}
      />
      <Button type="submit" loading={pending} loadingLabel="Salvando…">
        Salvar
      </Button>
    </form>
  );
}
