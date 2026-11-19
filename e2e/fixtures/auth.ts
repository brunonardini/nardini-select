import pg from 'pg';

import type { SeedUserState } from '../../db/seeds/ids';
import { workerUserId } from '../../db/seeds/ids';
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
