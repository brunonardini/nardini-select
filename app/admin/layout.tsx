import type { Metadata } from 'next';
import Link from 'next/link';
import { unstable_rethrow } from 'next/navigation';

import { Button } from '@/components/button/button';
import { Error500 } from '@/components/error-500/error-500';
import { ToastProvider } from '@/components/toast/toast';
import type { Viewer } from '@/lib/auth/logic/access';
import { getViewer } from '@/lib/auth/io/guard';
import { isDatabaseConnectionError } from '@/lib/db/logic/connection-error';
import { reportPageError } from '@/lib/errors/io/report';

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

function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Administração">
      <Link href="/admin/usuarios">Usuários</Link>
      <Link href="/admin/papeis">Papéis</Link>
      <Link href="/admin/auditoria">Auditoria</Link>
    </nav>
  );
}

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
  const admin = viewer?.isAdmin && viewer.state === 'active';

  return (
    <ToastProvider>
      <div className="admin">
        <header className="admin-header">
          <Link className="admin-brand" href="/admin">
            Nardini Select
          </Link>
          {admin ? <AdminNav /> : null}
          {viewer ? <AccountMenu viewer={viewer} /> : null}
        </header>
        {viewer ? <SessionWatcher /> : null}
        <main className="admin-main">{children}</main>
      </div>
    </ToastProvider>
  );
}
