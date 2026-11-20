import Link from 'next/link';

import { Avatar } from '@/components/avatar/avatar';
import { LocalDateTime } from '@/components/local-date-time/local-date-time';
import { StatusText } from '@/components/status-text/status-text';
import type { UserCard as Card } from '@/lib/users/logic/list-query';

import styles from './users.module.css';

export function UserCard({ user }: { user: Card }) {
  return (
    <li className={styles.card}>
      <div className={styles.cardTop}>
        <Avatar name={user.email ? user.name : null} />
        <Link className={styles.cardName} href={`/admin/usuarios/${user.id}`}>
          {user.name}
        </Link>
      </div>
      {user.email ? <p className={styles.cardEmail}>{user.email}</p> : null}
      <div className={styles.cardFacts}>
        <div>
          <span>{user.roleName ?? 'Sem papel'}</span>
          <StatusText state={user.state} />
        </div>
        <div>
          <span>Último acesso</span>
          <span>
            {user.lastLoginAt ? (
              <LocalDateTime value={user.lastLoginAt} />
            ) : (
              'Sem registro'
            )}
          </span>
        </div>
      </div>
    </li>
  );
}

/** Non-interactive placeholder in the same grid as the cards. */
export function UserCardPlaceholder() {
  return <li className={styles.skeleton} aria-hidden="true" />;
}
