import { requirePage } from '@/lib/auth/io/guard';

export default async function ProfilePage() {
  const { viewer } = await requirePage({ allow: ['pending', 'active'] });

  return (
    <section className="admin-panel">
      <h1>Perfil</h1>
      <p>A edição do nome e da foto fica para o próximo marco.</p>
      <dl className="admin-details">
        <div>
          <dt>Nome de exibição</dt>
          <dd>{viewer.displayName ?? '—'}</dd>
        </div>
        <div>
          <dt>Nome completo</dt>
          <dd>{viewer.fullName ?? '—'}</dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>{viewer.email}</dd>
        </div>
      </dl>
    </section>
  );
}
