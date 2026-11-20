import { auditCatalog, type AuditAction } from './actions';

export const AUDIT_PAGE_SIZE = 20;

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const AUDIT_ENTITY_TYPES = ['user', 'invitation', 'role'] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export type AuditFilters = {
  actorId: string | null;
  action: AuditAction | null;
  entityType: AuditEntityType | null;
  entityId: string | null;
  from: string | null;
  to: string | null;
};

export type AuditCursor = {
  occurredAt: string;
  id: string;
};

export type AuditQuery = {
  filters: AuditFilters;
  range: { from: string | null; to: string | null } | null;
  cursor: AuditCursor | null;
};

function first(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? '';
}

function day(value: string): string | null {
  if (!DAY.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.toISOString().slice(0, 10) !== value) return null;
  return value;
}

function nextDay(value: string): string {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString();
}

function uuid(value: string): string | null {
  return UUID.test(value) ? value : null;
}

export function parseAuditQuery(
  params: Record<string, string | string[] | undefined>,
): AuditQuery {
  const actionValue = first(params.acao);
  const action = (actionValue in auditCatalog ? actionValue : '') as
    AuditAction | '';
  const entityValue = first(params.entidade);
  const entityType = AUDIT_ENTITY_TYPES.find((type) => type === entityValue);
  const from = day(first(params.de));
  const to = day(first(params.ate));
  const filters: AuditFilters = {
    actorId: uuid(first(params.ator)),
    action: action || null,
    entityType: entityType ?? null,
    entityId: uuid(first(params.entidade_id)),
    from,
    to,
  };
  const range =
    from && to && from > to
      ? null
      : {
          from: from ? `${from}T00:00:00.000Z` : null,
          to: to ? nextDay(to) : null,
        };
  return { filters, range, cursor: decodeAuditCursor(first(params.cursor)) };
}

export function encodeAuditCursor(cursor: AuditCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

export function decodeAuditCursor(value: string): AuditCursor | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, 'base64url').toString('utf8'),
    );
    if (!parsed || typeof parsed !== 'object') return null;
    const record = parsed as { occurredAt?: unknown; id?: unknown };
    if (
      typeof record.occurredAt !== 'string' ||
      typeof record.id !== 'string'
    ) {
      return null;
    }
    if (Number.isNaN(Date.parse(record.occurredAt)) || !UUID.test(record.id)) {
      return null;
    }
    return { occurredAt: record.occurredAt, id: record.id };
  } catch {
    return null;
  }
}

export function auditHref(
  filters: AuditFilters,
  cursor: AuditCursor | null,
): string {
  const params = new URLSearchParams();
  if (filters.actorId) params.set('ator', filters.actorId);
  if (filters.action) params.set('acao', filters.action);
  if (filters.entityType) params.set('entidade', filters.entityType);
  if (filters.entityId) params.set('entidade_id', filters.entityId);
  if (filters.from) params.set('de', filters.from);
  if (filters.to) params.set('ate', filters.to);
  if (cursor) params.set('cursor', encodeAuditCursor(cursor));
  const query = params.toString();
  return query ? `/admin/auditoria?${query}` : '/admin/auditoria';
}
