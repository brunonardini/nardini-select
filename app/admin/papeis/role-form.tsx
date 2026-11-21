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
        <Alert variant="warning" title="Revise o nome do papel">
          {state.reason === 'taken'
            ? 'Já existe um papel com esse nome. Escolha outro.'
            : state.message}
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
  const error = state && !state.ok ? state : null;
  const nameError =
    error?.reason === 'invalid_name' || error?.reason === 'taken';
  return (
    <form className="admin-form" action={action}>
      <input type="hidden" name="id" value={id} />
      {error ? (
        <Alert
          variant={nameError ? 'warning' : 'danger'}
          icon={!nameError && error.reason !== 'system' ? 'error' : undefined}
          title={nameError ? 'Revise o novo nome' : 'Papel não renomeado'}
        >
          {error.reason === 'taken'
            ? 'Já existe um papel com esse nome. Escolha outro.'
            : error.message}
        </Alert>
      ) : null}
      {state?.ok ? (
        <Alert variant="success" title="Papel atualizado">
          O novo nome foi salvo.
        </Alert>
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
