'use client';

import { Collapsible } from '@base-ui/react/collapsible';
import { useState } from 'react';

import { PawLoading } from '@/components/button/button';
import { Icon } from '@/components/icon/icon';

import { useCreatedInvites } from './invitation-list-provider';
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

/** Remembers a canceled id once. A repeated cancel leaves the list as it is. */
export function hiddenIdsAfterCancel(
  current: readonly string[],
  id: string,
): readonly string[] {
  if (current.includes(id)) return current;
  return [...current, id];
}

/**
 * Created invites lead the loaded list. Hidden ids stay out, and an id already
 * loaded is not repeated. A list that has not loaded yet stays unloaded.
 */
export function invitationsWithCreated(
  current: Invite[] | null,
  created: readonly Invite[],
  hiddenIds: readonly string[] = [],
): Invite[] | null {
  if (!current) return null;
  const hidden = new Set(hiddenIds);
  const ids = new Set(current.map((invite) => invite.id));
  const fresh = created.filter(
    (invite) => !hidden.has(invite.id) && !ids.has(invite.id),
  );
  const base =
    hidden.size === 0
      ? current
      : current.filter((invite) => !hidden.has(invite.id));
  if (fresh.length === 0) return base;
  return [...fresh, ...base];
}

/** Pending invitations behind a counted disclosure. `null` means still loading. */
export function InvitationsDisclosure({
  invites,
}: {
  invites: Invite[] | null;
}) {
  const created = useCreatedInvites();
  const [shown, setShown] = useState(invites);
  const [hiddenIds, setHiddenIds] = useState<readonly string[]>([]);
  const visible = invitationsWithCreated(shown, created, hiddenIds);
  const loading = visible === null;

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
            {visible === null ? (
              <>
                –<span className="sr-only">, carregando</span>
              </>
            ) : (
              visible.length
            )}
          </span>
        </span>
        <Icon className={styles.disclosureChevron} name="chevron" />
      </Collapsible.Trigger>
      <Collapsible.Panel className={styles.disclosurePanel}>
        {visible ? (
          <InvitationsList
            invites={visible}
            onCanceled={(id) => {
              setHiddenIds((current) => hiddenIdsAfterCancel(current, id));
              setShown((current) => invitationsAfterCancel(current, id));
            }}
          />
        ) : null}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
