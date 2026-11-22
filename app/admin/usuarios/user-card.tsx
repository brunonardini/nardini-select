import { Avatar } from '@/components/avatar/avatar';
import { Card } from '@/components/card/card';
import { LocalDateTime } from '@/components/local-date-time/local-date-time';
import { StatusText } from '@/components/status-text/status-text';
import type { UserCard as ListedUser } from '@/lib/users/logic/list-query';

export function UserCard({ user }: { user: ListedUser }) {
  return (
    <Card
      title={user.name}
      href={`/admin/usuarios/${user.id}`}
      leading={
        <Avatar
          name={user.email ? user.name : null}
          src={user.photo ? `/admin/api/avatar/${user.id}` : null}
        />
      }
      description={user.email}
      facts={[
        {
          key: 'role',
          label: user.roleName ?? 'Sem papel',
          value: <StatusText state={user.state} />,
        },
        {
          key: 'access',
          label: 'Último acesso',
          value: user.lastLoginAt ? (
            <LocalDateTime value={user.lastLoginAt} />
          ) : (
            'Sem registro'
          ),
        },
      ]}
    />
  );
}
