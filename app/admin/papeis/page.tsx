import Link from 'next/link';

import { requirePage } from '@/lib/auth/io/guard';
import { listRoles } from '@/lib/roles/io/roles';

import { RoleCreateForm } from './role-form';

export default async function RolesPage() {
  const ctx = await requirePage({ allow: ['active'], adminOnly: true });
  const roles = await listRoles(ctx);

  return (
    <section className="admin-panel">
      <h1>Papéis</h1>
      <RoleCreateForm />
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Usuários</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>
                <Link href={`/admin/papeis/${role.id}`}>{role.name}</Link>
              </td>
              <td>{role.userCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
