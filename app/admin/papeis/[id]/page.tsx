import { notFound } from 'next/navigation';

import { ConfirmDialog } from '@/components/confirm-dialog/confirm-dialog';
import { requirePage } from '@/lib/auth/io/guard';
import {
  canDeleteRole,
  canRenameRole,
  roleErrorText,
} from '@/lib/roles/logic/rules';
import { getRole } from '@/lib/roles/io/roles';

import { removeRole } from '../actions';
import { RoleRenameForm } from '../role-form';

export default async function RolePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const ctx = await requirePage({ allow: ['active'], adminOnly: true });
  const { id } = await params;
  const query = await searchParams;
  const role = await getRole(ctx, id);
  if (!role) notFound();
  const error = roleErrorText(query.erro);

  return (
    <section className="admin-panel">
      <h1>{role.name}</h1>
      <p>
        {role.userCount} {role.userCount === 1 ? 'usuário' : 'usuários'}
      </p>
      {error ? <p role="alert">{error}</p> : null}
      {canRenameRole(role) ? (
        <RoleRenameForm id={role.id} name={role.name} />
      ) : (
        <p>O papel admin não pode ser alterado.</p>
      )}
      {canDeleteRole(role) ? (
        <ConfirmDialog
          intent="delete"
          label="Excluir papel"
          title="Excluir papel"
          description="O papel é apagado. Esta ação não pode ser desfeita."
          confirmLabel="Excluir papel definitivamente"
          fields={{ id: role.id }}
          action={removeRole}
        />
      ) : null}
    </section>
  );
}
