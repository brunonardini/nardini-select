import 'server-only';

import type { Transaction } from 'kysely';

import type { DB, Json } from '@/db/schema';
import {
  auditCatalog,
  parseAuditMetadata,
  storedActorType,
  type AuditAction,
} from '@/lib/audit/logic/actions';

export async function recordAudit(
  trx: Transaction<DB>,
  event: {
    action: AuditAction;
    actorId: string;
    entityId: string | null;
    metadata: unknown;
    occurredAt: string;
    traceId?: string | null;
  },
): Promise<void> {
  const spec = auditCatalog[event.action];
  const metadata = parseAuditMetadata(event.action, event.metadata);
  await trx
    .insertInto('audit.events')
    .values({
      occurred_at: event.occurredAt,
      actor_type: storedActorType(spec.actor),
      actor_id: event.actorId,
      action: event.action,
      entity_type: spec.entity,
      entity_id: event.entityId,
      metadata: metadata as Json,
      metadata_version: spec.version,
      trace_id: event.traceId ?? null,
    })
    .execute();
}
