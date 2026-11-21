import { Suspense } from 'react';

import { PageHeader } from '@/components/page-header/page-header';
import { requirePage, type AuthorizedContext } from '@/lib/auth/io/guard';
import { listOpenInvitations } from '@/lib/invitations/io/invitations';
import { listRoles } from '@/lib/roles/io/roles';
import { pageSizeFrom, parseUserListQuery } from '@/lib/users/logic/list-query';

import { InvitationListProvider } from './invitation-list-provider';
import { InvitationsDisclosure } from './invitations-disclosure';
import { InviteDialog } from './invite-dialog';
import { UsersList } from './users-list';
import styles from './users.module.css';

async function Invitations({ ctx }: { ctx: AuthorizedContext }) {
  const invites = await listOpenInvitations(ctx);
  return (
    <InvitationsDisclosure
      invites={invites.map(({ id, fullName, expiresAt }) => ({
        id,
        fullName,
        expiresAt,
      }))}
    />
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await requirePage({ allow: ['active'], adminOnly: true });
  const params = await searchParams;
  const values = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
  // The search term never comes from the URL.
  const initialQuery = parseUserListQuery({ ...values, busca: '' });
  const roles = await listRoles(ctx);

  return (
    <InvitationListProvider>
      <div className={styles.page}>
        <div className={styles.body}>
          <PageHeader title="Usuários" action={<InviteDialog />} />
          <Suspense fallback={<InvitationsDisclosure invites={null} />}>
            <Invitations ctx={ctx} />
          </Suspense>
          <UsersList
            roles={roles.map(({ id, name }) => ({ id, name }))}
            initialQuery={initialQuery}
            pageSizeInAddress={pageSizeFrom(values.por_pagina) !== null}
          />
        </div>
      </div>
    </InvitationListProvider>
  );
}
