import 'server-only';

import type { AuthorizedContext } from '@/lib/auth/io/guard';
import {
  AUDIT_PAGE_SIZE,
  type AuditCursor,
  type AuditQuery,
} from '@/lib/audit/logic/query';
import { getDatabase } from '@/lib/db/io/client';

export type AuditPerson = {
  displayName: string | null;
  fullName: string | null;
  anonymizedAt: string | null;
};

export async function loadAuditPeople(
  ids: string[],
): Promise<Map<string, AuditPerson>> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return new Map();
  const db = await getDatabase();
  const rows = await db
    .selectFrom('users')
    .select(['id', 'display_name', 'full_name', 'anonymized_at'])
    .where('id', 'in', unique)
    .execute();
  return new Map(
    rows.map((row) => [
      row.id,
      {
        displayName: row.display_name,
        fullName: row.full_name,
        anonymizedAt: row.anonymized_at,
      },
    ]),
  );
}

export type AuditRow = {
  id: string;
  occurredAt: string;
  actorType: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
};

export async function searchAudit(
  _ctx: AuthorizedContext,
  query: AuditQuery,
): Promise<{ rows: AuditRow[]; next: AuditCursor | null }> {
  if (!query.range) return { rows: [], next: null };
  const db = await getDatabase();
  let request = db
    .selectFrom('audit.events')
    .select([
      'id',
      'occurred_at',
      'actor_type',
      'actor_id',
      'action',
      'entity_type',
      'entity_id',
      'metadata',
    ]);
  const { filters, range, cursor } = query;
  if (filters.actorId)
    request = request.where('actor_id', '=', filters.actorId);
  if (filters.action) request = request.where('action', '=', filters.action);
  if (filters.entityType) {
    request = request.where('entity_type', '=', filters.entityType);
  }
  if (filters.entityId)
    request = request.where('entity_id', '=', filters.entityId);
  if (range.from) request = request.where('occurred_at', '>=', range.from);
  if (range.to) request = request.where('occurred_at', '<', range.to);
  if (cursor) {
    request = request.where((eb) =>
      eb.or([
        eb('occurred_at', '<', cursor.occurredAt),
        eb.and([
          eb('occurred_at', '=', cursor.occurredAt),
          eb('id', '<', cursor.id),
        ]),
      ]),
    );
  }
  const rows = await request
    .orderBy('occurred_at', 'desc')
    .orderBy('id', 'desc')
    .limit(AUDIT_PAGE_SIZE + 1)
    .execute();
  const page = rows.slice(0, AUDIT_PAGE_SIZE);
  const last = page.at(-1);
  return {
    rows: page.map((row) => ({
      id: row.id,
      occurredAt: row.occurred_at,
      actorType: row.actor_type,
      actorId: row.actor_id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
    })),
    next:
      rows.length > AUDIT_PAGE_SIZE && last
        ? { occurredAt: last.occurred_at, id: last.id }
        : null,
  };
}
