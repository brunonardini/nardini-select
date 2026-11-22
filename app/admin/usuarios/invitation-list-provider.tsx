'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Invite } from './invitations-list';

const EMPTY: readonly Invite[] = [];

type InvitationListApi = {
  created: readonly Invite[];
  publish: (invite: Invite) => void;
};

const InvitationListContext = createContext<InvitationListApi | null>(null);

/** Newest first. A repeated id leaves the list untouched. */
export function createdAfterPublish(
  current: readonly Invite[],
  invite: Invite,
): readonly Invite[] {
  if (current.some((item) => item.id === invite.id)) return current;
  return [invite, ...current];
}

/** Invites created during this visit, shared by the dialog and the list. */
export function InvitationListProvider({ children }: { children: ReactNode }) {
  const [created, setCreated] = useState<readonly Invite[]>(EMPTY);
  const publish = useCallback((invite: Invite) => {
    setCreated((current) => createdAfterPublish(current, invite));
  }, []);
  const value = useMemo(() => ({ created, publish }), [created, publish]);

  return (
    <InvitationListContext.Provider value={value}>
      {children}
    </InvitationListContext.Provider>
  );
}

export function useCreatedInvites(): readonly Invite[] {
  return useContext(InvitationListContext)?.created ?? EMPTY;
}

export function usePublishInvite(): (invite: Invite) => void {
  return useContext(InvitationListContext)?.publish ?? noopPublish;
}

function noopPublish() {}
