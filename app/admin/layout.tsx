import type { Metadata } from 'next';
import Link from 'next/link';

import type { Viewer } from '@/lib/auth/logic/access';
import { getViewer } from '@/lib/auth/io/guard';

import { SessionWatcher } from './session-watcher';
import { SignOutForm } from './sign-out-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Área interna | Nardini Select',
  robots: { index: false, follow: false },
};

function AccountMenu({ viewer }: { viewer: Viewer }) {
  return (
    <nav className="admin-account" aria-label="Conta">
      {viewer.displayName ? <span>{viewer.displayName}</span> : null}
      {viewer.state === 'terms_outdated' ? null : (
        <a href="/admin/perfil">Perfil</a>
      )}
      <SignOutForm />
    </nav>
  );
}

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const viewer = await getViewer();

  return (
    <div className="admin">
      <header className="admin-header">
        <Link className="admin-brand" href="/">
          Nardini Select
        </Link>
        {viewer ? <AccountMenu viewer={viewer} /> : null}
      </header>
      {viewer ? <SessionWatcher /> : null}
      <main className="admin-main">{children}</main>
    </div>
  );
}
