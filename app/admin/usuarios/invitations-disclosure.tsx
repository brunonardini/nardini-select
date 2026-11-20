'use client';

import { Collapsible } from '@base-ui/react/collapsible';
import { useState } from 'react';

import { PawLoading } from '@/components/button/button';
import { Icon } from '@/components/icon/icon';

import { InvitationsList, type Invite } from './invitations-list';
import styles from './users.module.css';

/** Drops one invite. A list that has not loaded yet stays unloaded. */
export function invitationsAfterCancel(
  current: Invite[] | null,
  id: string,
): Invite[] | null {
  if (!current) return current;
  return current.filter((invite) => invite.id !== id);
}

/** Pending invitations behind a counted disclosure. `null` means still loading. */
export function InvitationsDisclosure({
  invites,
}: {
  invites: Invite[] | null;
}) {
  const [shown, setShown] = useState(invites);
  const loading = shown === null;

  return (
    <Collapsible.Root className={styles.invitations} disabled={loading}>
      <Collapsible.Trigger
        className={styles.disclosureTrigger}
        aria-busy={loading || undefined}
      >
        {loading ? (
          <PawLoading />
        ) : (
          <span className={styles.mailIcon}>
            <Icon name="mail" />
          </span>
        )}
        <span className={styles.disclosureLabel}>
          Convites pendentes
          <span className={styles.badge}>
            {loading ? (
              <>
                –<span className="sr-only">, carregando</span>
              </>
            ) : (
              shown.length
            )}
          </span>
        </span>
        <Icon className={styles.disclosureChevron} name="chevron" />
      </Collapsible.Trigger>
      <Collapsible.Panel className={styles.disclosurePanel}>
        {shown ? (
          <InvitationsList
            invites={shown}
            onCanceled={(id) =>
              setShown((current) => invitationsAfterCancel(current, id))
            }
          />
        ) : null}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
