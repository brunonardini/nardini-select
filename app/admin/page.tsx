import { EmptyState } from '@/components/empty-state/empty-state';
import { requirePage } from '@/lib/auth/io/guard';

import { SignOutForm } from './sign-out-form';

export default async function AdminHomePage() {
  const { viewer } = await requirePage({ allow: ['pending', 'active'] });

  if (viewer.state === 'pending') {
    return (
      <EmptyState title="Cadastro em aprovação">
        <p>Um administrador ainda precisa aprovar o seu acesso.</p>
        <SignOutForm />
      </EmptyState>
    );
  }

  return <h1>Olá, {viewer.displayName ?? 'bem-vindo'}.</h1>;
}
