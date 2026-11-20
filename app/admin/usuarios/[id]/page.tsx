import { notFound } from 'next/navigation';

import { LocalDateTime } from '@/components/local-date-time/local-date-time';
import { StatusText } from '@/components/status-text/status-text';
import { requirePage } from '@/lib/auth/io/guard';
import { listRoles } from '@/lib/roles/io/roles';
import {
  countActiveAdmins,
  getUser,
  userHasActed,
  viewerCanChange,
} from '@/lib/users/io/users';
import { mutationErrorText } from '@/lib/users/logic/rules';

import { UserActions } from '../user-actions';

export default async function UserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const ctx = await requirePage({ allow: ['active'], adminOnly: true });
  const { id } = await params;
  const query = await searchParams;
  const user = await getUser(ctx, id);
  if (!user) notFound();
  const [roles, admins, acted] = await Promise.all([
    listRoles(ctx),
    countActiveAdmins(ctx),
    userHasActed(ctx, id),
  ]);
  const error = mutationErrorText(query.erro);
  const target = {
    id: user.id,
    fullName: user.fullName,
    displayName: user.displayName,
    email: user.email,
    roleId: user.roleId,
    photo: user.photoSource === 'provider' && Boolean(user.photoUrl),
  };

  return (
    <section className="admin-panel">
      <h1>{user.displayName ?? user.fullName ?? 'Usuário removido'}</h1>
      {error ? <p role="alert">{error}</p> : null}
      <dl className="admin-details">
        <div>
          <dt>Estado</dt>
          <dd>
            <StatusText state={user.state} />
          </dd>
        </div>
        <div>
          <dt>Convidado em</dt>
          <dd>
            <LocalDateTime value={user.invitedAt} />
          </dd>
        </div>
        <div>
          <dt>Cadastro</dt>
          <dd>
            <LocalDateTime value={user.registeredAt} />
          </dd>
        </div>
        <div>
          <dt>Último acesso</dt>
          <dd>
            <LocalDateTime value={user.lastLoginAt} />
          </dd>
        </div>
      </dl>
      <UserActions
        user={target}
        roles={roles.map((role) => ({ id: role.id, name: role.name }))}
        allow={{
          fullName: viewerCanChange(
            ctx.viewer.id,
            user,
            { kind: 'update_full_name' },
            admins,
            acted,
          ),
          role: viewerCanChange(
            ctx.viewer.id,
            user,
            { kind: 'change_role', roleId: null },
            admins,
            acted,
          ),
          disable: viewerCanChange(
            ctx.viewer.id,
            user,
            { kind: 'disable' },
            admins,
            acted,
          ),
          enable: viewerCanChange(
            ctx.viewer.id,
            user,
            { kind: 'enable' },
            admins,
            acted,
          ),
          remove: viewerCanChange(
            ctx.viewer.id,
            user,
            { kind: 'delete' },
            admins,
            acted,
          ),
          anonymize: viewerCanChange(
            ctx.viewer.id,
            user,
            { kind: 'anonymize' },
            admins,
            acted,
          ),
        }}
      />
    </section>
  );
}
