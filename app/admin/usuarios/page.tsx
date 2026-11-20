import Link from 'next/link';

import { requirePage } from '@/lib/auth/io/guard';
import { listOpenInvitations } from '@/lib/invitations/io/invitations';
import { listUsers } from '@/lib/users/io/users';
import { mutationErrorText } from '@/lib/users/logic/rules';

import { InviteDialog } from './invite-dialog';
import { InvitationsList } from './invitations-list';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const ctx = await requirePage({ allow: ['active'], adminOnly: true });
  const params = await searchParams;
  const error = mutationErrorText(params.erro);
  const [users, invites] = await Promise.all([
    listUsers(ctx),
    listOpenInvitations(ctx),
  ]);

  return (
    <section className="admin-panel">
      <h1>Usuários</h1>
      {error ? <p role="alert">{error}</p> : null}
      <InviteDialog />
      <h2>Convites pendentes</h2>
      <InvitationsList invites={invites} />
      <table className="admin-table">
        <thead>
          <tr>
            <th>Pessoa</th>
            <th>Estado</th>
            <th>Papel</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <Link href={`/admin/usuarios/${user.id}`}>
                  {user.displayName ?? user.fullName ?? 'Usuário removido'}
                </Link>
                <div>{user.email}</div>
              </td>
              <td>{user.state}</td>
              <td>{user.roleName ?? 'Sem papel'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
