'use client';

import { usePathname } from 'next/navigation';
import {
  useSyncExternalStore,
  type ComponentProps,
  type ReactNode,
} from 'react';

import { AdminNavigation } from '@/components/admin-navigation/admin-navigation';
import { isPublicAdminPath } from '@/lib/auth/logic/public-routes';
import { browserStorage } from '@/lib/browser-storage/io/browser-storage';

const preferenceKey = 'nardini-select:admin-nav:v1';
const listeners = new Set<() => void>();
let cachedCollapsed: boolean | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getCollapsed() {
  cachedCollapsed ??= browserStorage.getItem(preferenceKey) === 'collapsed';
  return cachedCollapsed;
}

function getServerCollapsed() {
  return false;
}

function toggleSidebar() {
  cachedCollapsed = !getCollapsed();
  browserStorage.setItem(
    preferenceKey,
    cachedCollapsed ? 'collapsed' : 'expanded',
  );
  listeners.forEach((listener) => listener());
}

type Props = {
  access: ComponentProps<typeof AdminNavigation>['access'] | null;
  name: string | null;
  signOutAction: ComponentProps<typeof AdminNavigation>['signOutAction'];
  children: ReactNode;
};

function PrivateShell({
  access,
  name,
  signOutAction,
  children,
  pathname,
}: Omit<Props, 'access'> & {
  access: NonNullable<Props['access']>;
  pathname: string;
}) {
  const collapsed = useSyncExternalStore(
    subscribe,
    getCollapsed,
    getServerCollapsed,
  );
  return (
    <AdminNavigation
      pathname={pathname}
      access={access}
      name={name}
      signOutAction={signOutAction}
      collapsed={collapsed}
      onToggle={toggleSidebar}
    >
      {children}
    </AdminNavigation>
  );
}

export function AdminShell({ access, name, signOutAction, children }: Props) {
  const pathname = usePathname();
  if (!access || isPublicAdminPath(pathname))
    return <div className="admin">{children}</div>;
  return (
    <PrivateShell
      access={access}
      name={name}
      signOutAction={signOutAction}
      pathname={pathname}
    >
      {children}
    </PrivateShell>
  );
}
