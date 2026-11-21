import type { Metadata } from 'next';
import { unstable_rethrow } from 'next/navigation';

import { Button } from '@/components/button/button';
import { Error500 } from '@/components/error-500/error-500';
import { ToastProvider } from '@/components/toast/toast';
import { accountAvatarSrc, type Viewer } from '@/lib/auth/logic/access';
import { getViewer } from '@/lib/auth/io/guard';
import { isDatabaseConnectionError } from '@/lib/db/logic/connection-error';
import { reportPageError } from '@/lib/errors/io/report';

import { signOut } from './actions';
import { AdminShell } from './admin-shell';
import { SessionWatcher } from './session-watcher';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Área interna | Nardini Select',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  let viewer: Viewer | null;
  try {
    viewer = await getViewer();
  } catch (error) {
    unstable_rethrow(error);
    reportPageError(error);
    return (
      <main className="page-error">
        <Error500
          description={
            isDatabaseConnectionError(error)
              ? 'Não conseguimos conectar ao banco de dados.'
              : undefined
          }
        >
          <Button href="/admin">Tentar novamente</Button>
          <Button href="/" variant="secondary">
            Voltar ao site
          </Button>
        </Error500>
      </main>
    );
  }
  const access = !viewer
    ? null
    : viewer.state === 'terms_outdated'
      ? 'terms'
      : viewer.state === 'pending'
        ? 'pending'
        : viewer.isAdmin
          ? 'administrator'
          : 'staff';

  return (
    <ToastProvider>
      <AdminShell
        access={access}
        name={viewer?.displayName ?? viewer?.fullName ?? null}
        photoSrc={viewer ? accountAvatarSrc(viewer) : null}
        signOutAction={signOut}
      >
        {viewer ? <SessionWatcher /> : null}
        <main className="admin-main">{children}</main>
      </AdminShell>
    </ToastProvider>
  );
}
