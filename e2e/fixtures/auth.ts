import pg from 'pg';

import type { SeedUserState } from '../../db/seeds/ids';
import {
  ADMIN_ROLE_ID,
  ATENDIMENTO_ROLE_ID,
  ESTOQUE_ROLE_ID,
  workerUserId,
} from '../../db/seeds/ids';
import { createTestSession } from '../../lib/auth/io/test-session';
import { withDatabaseName } from '../database-env';

const CURRENT = '2026-11-18';
const ACCEPTED_AT = '2026-06-01T12:00:00.000Z';

export function slotUser(slot: number, state: SeedUserState): string {
  return workerUserId(slot, state);
}

export async function sessionCookie(userId: string) {
  const { name, value } = await createTestSession(userId);
  return {
    name,
    value,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax' as const,
  };
}

/** Current documents, an older accepted version, or no acceptance at all. */
export async function setTerms(
  userId: string,
  mode: 'current' | 'outdated' | 'none',
): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  const client = new pg.Client({ connectionString: withDatabaseName(url) });
  await client.connect();
  try {
    if (mode === 'none') {
      await client.query(
        `update users
            set terms_version = null,
                privacy_notice_version = null,
                terms_accepted_at = null,
                privacy_notice_acknowledged_at = null
          where id = $1`,
        [userId],
      );
      return;
    }
    const version = mode === 'current' ? CURRENT : '2026-01-01';
    await client.query(
      `update users
          set terms_version = $2,
              privacy_notice_version = $2,
              terms_accepted_at = $3,
              privacy_notice_acknowledged_at = $3
        where id = $1`,
      [userId, version, ACCEPTED_AT],
    );
  } finally {
    await client.end();
  }
}

async function withUserDb(
  run: (client: pg.Client) => Promise<void>,
): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  const client = new pg.Client({ connectionString: withDatabaseName(url) });
  await client.connect();
  try {
    await run(client);
  } finally {
    await client.end();
  }
}

export async function setRole(
  userId: string,
  roleId: string | null,
): Promise<void> {
  await withUserDb(async (client) => {
    await client.query(
      'update users set role_id = $2, disabled_at = null where id = $1',
      [userId, roleId],
    );
  });
}

export async function setDisplayName(
  userId: string,
  displayName: string,
): Promise<void> {
  await withUserDb(async (client) => {
    await client.query('update users set display_name = $2 where id = $1', [
      userId,
      displayName,
    ]);
  });
}

export async function setPhoto(
  userId: string,
  photoUrl: string | null,
  photoSource: 'provider' | 'none',
): Promise<void> {
  await withUserDb(async (client) => {
    await client.query(
      'update users set photo_url = $2, photo_source = $3 where id = $1',
      [userId, photoUrl, photoSource],
    );
  });
}

export { ADMIN_ROLE_ID, ATENDIMENTO_ROLE_ID };

async function withMigrationDb(
  run: (client: pg.Client) => Promise<void>,
): Promise<void> {
  const url = process.env.DATABASE_MIGRATION_URL;
  if (!url) throw new Error('DATABASE_MIGRATION_URL is not set.');
  const client = new pg.Client({ connectionString: withDatabaseName(url) });
  await client.connect();
  try {
    await run(client);
  } finally {
    await client.end();
  }
}

/** Records one user action so delete eligibility can be exercised. */
export async function markUserActed(userId: string): Promise<string> {
  let id = '';
  await withMigrationDb(async (client) => {
    const result = await client.query<{ id: string }>(
      `insert into audit.events (
         occurred_at, actor_type, actor_id, action, entity_type,
         entity_id, metadata, metadata_version
       ) values (now(), 'user', $1, 'user.disabled', 'user', $1, '{}', 1)
       returning id`,
      [userId],
    );
    id = result.rows[0]?.id ?? '';
  });
  if (!id) throw new Error('Audit event was not recorded.');
  return id;
}

export async function removeAuditEvent(id: string): Promise<void> {
  await withMigrationDb(async (client) => {
    await client.query('delete from audit.events where id = $1', [id]);
  });
}

/** Puts a worker's disabled seed user back after anonymization. */
export async function restoreDisabledUser(
  userId: string,
  slot: number,
): Promise<void> {
  await withUserDb(async (client) => {
    await client.query(
      `update users
          set full_name = $2,
              display_name = $3,
              email = $4,
              photo_url = null,
              photo_source = 'none',
              role_id = $5,
              anonymized_at = null,
              disabled_at = '2026-07-01T00:00:00.000Z'
        where id = $1`,
      [
        userId,
        `worker-${slot} disabled`,
        `worker-${slot}`,
        `worker-${slot}-disabled@seed.invalid`,
        ESTOQUE_ROLE_ID,
      ],
    );
  });
}
