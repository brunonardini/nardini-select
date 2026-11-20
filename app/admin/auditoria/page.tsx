import Link from 'next/link';

import { LocalDateTime } from '@/components/local-date-time/local-date-time';
import { requirePage } from '@/lib/auth/io/guard';
import { renderKnownAudit, shownPerson } from '@/lib/audit/logic/render';
import { auditHref, parseAuditQuery } from '@/lib/audit/logic/query';
import { loadAuditPeople, searchAudit } from '@/lib/audit/io/search';

import { AuditFiltersForm } from './filters';

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await requirePage({ allow: ['active'], adminOnly: true });
  const query = parseAuditQuery(await searchParams);
  const { rows, next } = await searchAudit(ctx, query);
  const people = await loadAuditPeople(
    rows.flatMap((row) => [row.actorId, row.entityId ?? '']),
  );

  return (
    <section className="admin-panel">
      <h1>Auditoria</h1>
      {query.range ? null : <p role="alert">O período informado é inválido.</p>}
      <AuditFiltersForm filters={query.filters} />
      {rows.length === 0 ? (
        <p>Nenhum evento neste filtro.</p>
      ) : (
        <ul className="admin-form">
          {rows.map((row) => {
            const actor =
              row.actorType === 'system'
                ? 'Sistema'
                : shownPerson(people.get(row.actorId) ?? null);
            const user =
              row.entityType === 'user'
                ? shownPerson(people.get(row.entityId ?? '') ?? null)
                : null;
            return (
              <li key={row.id}>
                <LocalDateTime value={row.occurredAt} />
                {' — '}
                {actor} {renderKnownAudit(row.action, row.metadata, { user })}
              </li>
            );
          })}
        </ul>
      )}
      {next ? (
        <Link href={auditHref(query.filters, next)}>Próximos</Link>
      ) : null}
    </section>
  );
}
