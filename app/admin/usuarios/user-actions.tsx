'use client';

import { Avatar } from '@/components/avatar/avatar';
import { Button } from '@/components/button/button';
import { ConfirmDialog } from '@/components/confirm-dialog/confirm-dialog';
import { SelectField } from '@/components/select/select';
import { TextField } from '@/components/text-field/text-field';

import {
  anonymizeAccount,
  disableAccount,
  enableAccount,
  removeAccount,
  saveFullName,
  saveRole,
} from './actions';

type RoleOption = { id: string; name: string };

export function UserActions({
  user,
  roles,
  allow,
}: {
  user: {
    id: string;
    fullName: string | null;
    displayName: string | null;
    email: string;
    roleId: string | null;
    photo: boolean;
  };
  roles: RoleOption[];
  allow: {
    fullName: boolean;
    role: boolean;
    disable: boolean;
    enable: boolean;
    remove: boolean;
    anonymize: boolean;
  };
}) {
  const options = [
    { value: 'none', label: 'Sem papel' },
    ...roles.map((role) => ({ value: role.id, label: role.name })),
  ];

  return (
    <div className="admin-form">
      <div className="admin-person">
        <Avatar
          name={user.displayName ?? user.fullName}
          src={user.photo ? `/admin/api/avatar/${user.id}` : null}
        />
        <div>
          <strong>{user.displayName ?? 'Usuário removido'}</strong>
          <p>{user.email}</p>
        </div>
      </div>
      {allow.fullName ? (
        <form className="admin-form" action={saveFullName}>
          <input type="hidden" name="id" value={user.id} />
          <TextField
            label="Nome completo"
            name="full_name"
            defaultValue={user.fullName ?? ''}
            required
          />
          <Button type="submit">Salvar nome</Button>
        </form>
      ) : null}
      {allow.role ? (
        <form className="admin-form" action={saveRole}>
          <input type="hidden" name="id" value={user.id} />
          <SelectField
            label="Papel"
            name="role_id"
            defaultValue={user.roleId ?? 'none'}
            options={options}
          />
          <Button type="submit" variant="secondary">
            Salvar papel
          </Button>
        </form>
      ) : null}
      <div className="dialog-actions">
        {allow.disable ? (
          <ConfirmDialog
            label="Desabilitar"
            title="Desabilitar usuário"
            description="A pessoa perde o acesso na hora, em todos os aparelhos."
            confirmLabel="Desabilitar"
            fields={{ id: user.id }}
            action={disableAccount}
          />
        ) : null}
        {allow.enable ? (
          <ConfirmDialog
            label="Habilitar"
            title="Habilitar usuário"
            description="A pessoa volta a poder entrar com a conta Google."
            confirmLabel="Habilitar"
            fields={{ id: user.id }}
            action={enableAccount}
          />
        ) : null}
        {allow.remove ? (
          <ConfirmDialog
            label="Excluir"
            title="Excluir usuário"
            description="A conta é apagada. Esta ação não pode ser desfeita."
            confirmLabel="Excluir"
            fields={{ id: user.id }}
            action={removeAccount}
          />
        ) : null}
        {allow.anonymize && user.fullName ? (
          <ConfirmDialog
            label="Anonimizar"
            title="Anonimizar usuário"
            description="O nome, o e-mail e a foto são apagados. Esta ação não pode ser desfeita."
            confirmLabel="Anonimizar"
            expectedText={user.fullName}
            fields={{ id: user.id }}
            action={anonymizeAccount}
          />
        ) : null}
      </div>
    </div>
  );
}
