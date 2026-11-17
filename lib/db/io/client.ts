import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { Kysely, PostgresDialect, sql, type Transaction } from 'kysely';
import pg from 'pg';

import type { DB } from '@/db/schema';
import {
  expectedDatabaseName,
  postgresTimestamptzToIso,
} from '@/lib/db/logic/environment';

const TIMESTAMPTZ_OID = 1184;
const POOL_MAX = 3;

pg.types.setTypeParser(TIMESTAMPTZ_OID, postgresTimestamptzToIso);

let database: Promise<Kysely<DB>> | undefined;

function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  return url;
}

async function connect(): Promise<Kysely<DB>> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('The database client cannot connect during next build.');
  }

  const pool = new pg.Pool({ connectionString: databaseUrl(), max: POOL_MAX });
  const db = new Kysely<DB>({ dialect: new PostgresDialect({ pool }) });
  const expected = expectedDatabaseName(process.env.CONTEXT);
  if (!expected) return db;

  let name: string | undefined;
  try {
    const current = await sql<{
      current_database: string;
    }>`select current_database()`.execute(db);
    name = current.rows[0]?.current_database;
  } catch (error) {
    await pool.end();
    throw error;
  }

  if (name !== expected) {
    const error = new Error(
      `Connected to ${name ?? 'an unknown database'}, expected ${expected}.`,
    );
    Sentry.captureException(error);
    await pool.end();
    throw error;
  }

  return db;
}

export function getDatabase(): Promise<Kysely<DB>> {
  database ??= connect().catch((error: unknown) => {
    database = undefined;
    throw error;
  });
  return database;
}

export async function transaction<T>(
  fn: (trx: Transaction<DB>) => Promise<T>,
): Promise<T> {
  const db = await getDatabase();
  return db.transaction().execute(fn);
}
