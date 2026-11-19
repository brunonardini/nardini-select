import { z } from 'zod';

const uuid = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );

const empty = z.object({}).strict();

/**
 * Metadata holds ids, enums, and named labels only. Free text about a person
 * is not accepted. `admin` is stored as actor type `user` (the acting admin).
 */
export const auditCatalog = {
  'bootstrap.claimed': {
    actor: 'system',
    entity: 'user',
    version: 1,
    metadata: empty,
  },
  'user.registered': {
    actor: 'system',
    entity: 'user',
    version: 1,
    metadata: z.object({ invitation_id: uuid.nullable() }).strict(),
  },
  'user.terms_accepted': {
    actor: 'user',
    entity: 'user',
    version: 1,
    metadata: z
      .object({
        terms_version: z.string().min(1),
        privacy_notice_version: z.string().min(1),
      })
      .strict(),
  },
  'user.profile_updated': {
    actor: 'user',
    entity: 'user',
    version: 1,
    metadata: z
      .object({
        fields: z.array(z.enum(['display_name', 'photo_source'])).min(1),
      })
      .strict(),
  },
  'user.full_name_updated': {
    actor: 'admin',
    entity: 'user',
    version: 1,
    metadata: empty,
  },
  'user.role_changed': {
    actor: 'admin',
    entity: 'user',
    version: 1,
    metadata: z
      .object({
        from_role_id: uuid.nullable(),
        to_role_id: uuid.nullable(),
        from_role_name: z.string().nullable(),
        to_role_name: z.string().nullable(),
      })
      .strict(),
  },
  'user.disabled': {
    actor: 'admin',
    entity: 'user',
    version: 1,
    metadata: empty,
  },
  'user.enabled': {
    actor: 'admin',
    entity: 'user',
    version: 1,
    metadata: empty,
  },
  'user.deleted': {
    actor: 'admin',
    entity: 'user',
    version: 1,
    metadata: empty,
  },
  'user.anonymized': {
    actor: 'admin',
    entity: 'user',
    version: 1,
    metadata: empty,
  },
  'invitation.created': {
    actor: 'admin',
    entity: 'invitation',
    version: 1,
    metadata: empty,
  },
  'invitation.canceled': {
    actor: 'admin',
    entity: 'invitation',
    version: 1,
    metadata: empty,
  },
  'role.created': {
    actor: 'admin',
    entity: 'role',
    version: 1,
    metadata: z.object({ name: z.string().min(1) }).strict(),
  },
  'role.renamed': {
    actor: 'admin',
    entity: 'role',
    version: 1,
    metadata: z
      .object({
        name: z.string().min(1),
        previous_name: z.string().min(1),
      })
      .strict(),
  },
  'role.deleted': {
    actor: 'admin',
    entity: 'role',
    version: 1,
    metadata: z.object({ name: z.string().min(1) }).strict(),
  },
} as const;

export type AuditAction = keyof typeof auditCatalog;

export type AuditActor = (typeof auditCatalog)[AuditAction]['actor'];

export function storedActorType(actor: AuditActor): 'user' | 'system' {
  return actor === 'system' ? 'system' : 'user';
}

export function parseAuditMetadata(
  action: AuditAction,
  metadata: unknown,
): Record<string, unknown> {
  return auditCatalog[action].metadata.parse(metadata) as Record<
    string,
    unknown
  >;
}
