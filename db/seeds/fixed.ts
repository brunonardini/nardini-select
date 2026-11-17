import type { Kysely, Transaction } from 'kysely';

import type { DB } from '../schema';

import {
  ADMIN_ROLE_ID,
  ADMIN_USER_ID,
  ATENDIMENTO_ROLE_ID,
  CANCELED_INVITATION_ID,
  ESTOQUE_ROLE_ID,
  EXPIRED_INVITATION_ID,
  SYSTEM_ACTOR_ID,
  VALID_INVITATION_ID,
  WORKER_SLOTS,
  workerUserId,
} from './ids.ts';

type Database = Kysely<DB> | Transaction<DB>;

const CREATED_AT = '2026-06-01T12:00:00.000Z';
const LATER = '2026-11-01T12:00:00.000Z';

function tokenHash(byte: number): Buffer {
  return Buffer.alloc(32, byte);
}

export async function seedFixed(db: Database): Promise<void> {
  await db
    .insertInto('roles')
    .values([
      {
        id: ATENDIMENTO_ROLE_ID,
        name: 'atendimento',
        is_system: false,
        created_at: CREATED_AT,
        updated_at: CREATED_AT,
      },
      {
        id: ESTOQUE_ROLE_ID,
        name: 'estoque',
        is_system: false,
        created_at: CREATED_AT,
        updated_at: CREATED_AT,
      },
    ])
    .execute();

  await db
    .insertInto('users')
    .values({
      id: ADMIN_USER_ID,
      full_name: 'Seed Admin',
      display_name: 'Admin',
      email: 'admin@example.com',
      email_verified: true,
      photo_source: 'none',
      role_id: ADMIN_ROLE_ID,
      registered_at: CREATED_AT,
      created_at: CREATED_AT,
      updated_at: CREATED_AT,
    })
    .execute();

  await db
    .insertInto('users')
    .values(
      WORKER_SLOTS.flatMap((slot) => {
        const prefix = `worker-${slot}`;
        return [
          {
            id: workerUserId(slot, 'no-role'),
            full_name: `${prefix} no role`,
            display_name: prefix,
            email: `${prefix}-no-role@seed.invalid`,
            email_verified: false,
            photo_source: 'none' as const,
            role_id: null,
            created_at: CREATED_AT,
            updated_at: CREATED_AT,
          },
          {
            id: workerUserId(slot, 'approved'),
            full_name: `${prefix} approved`,
            display_name: prefix,
            email: `${prefix}-approved@seed.invalid`,
            email_verified: true,
            photo_source: 'none' as const,
            role_id: ATENDIMENTO_ROLE_ID,
            registered_at: CREATED_AT,
            created_at: CREATED_AT,
            updated_at: CREATED_AT,
          },
          {
            id: workerUserId(slot, 'disabled'),
            full_name: `${prefix} disabled`,
            display_name: prefix,
            email: `${prefix}-disabled@seed.invalid`,
            email_verified: true,
            photo_source: 'none' as const,
            role_id: ESTOQUE_ROLE_ID,
            registered_at: CREATED_AT,
            disabled_at: LATER,
            created_at: CREATED_AT,
            updated_at: LATER,
          },
          {
            id: workerUserId(slot, 'anonymized'),
            full_name: null,
            display_name: null,
            email: `anonymized+${workerUserId(slot, 'anonymized')}@invalid`,
            email_verified: false,
            photo_url: null,
            photo_source: 'none' as const,
            role_id: null,
            anonymized_at: LATER,
            created_at: CREATED_AT,
            updated_at: LATER,
          },
        ];
      }),
    )
    .execute();

  await db
    .insertInto('invitations')
    .values([
      {
        id: VALID_INVITATION_ID,
        full_name: 'Valid invite',
        token_hash: tokenHash(1),
        expires_at: '2027-01-01T00:00:00.000Z',
        created_by: ADMIN_USER_ID,
        created_at: CREATED_AT,
      },
      {
        id: EXPIRED_INVITATION_ID,
        full_name: 'Expired invite',
        token_hash: tokenHash(2),
        expires_at: '2026-01-01T00:00:00.000Z',
        created_by: ADMIN_USER_ID,
        created_at: CREATED_AT,
      },
      {
        id: CANCELED_INVITATION_ID,
        full_name: 'Canceled invite',
        token_hash: tokenHash(3),
        expires_at: '2026-12-01T00:00:00.000Z',
        created_by: ADMIN_USER_ID,
        created_at: CREATED_AT,
        canceled_at: LATER,
      },
    ])
    .execute();

  await db
    .insertInto('audit.events')
    .values({
      occurred_at: CREATED_AT,
      actor_type: 'system',
      actor_id: SYSTEM_ACTOR_ID,
      action: 'seed.fixed',
      entity_type: 'user',
      entity_id: ADMIN_USER_ID,
      metadata: { source: 'seed' },
      metadata_version: 1,
    })
    .execute();
}
