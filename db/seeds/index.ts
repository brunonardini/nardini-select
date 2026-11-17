import { Kysely, PostgresDialect, sql } from 'kysely';
import pg from 'pg';

import {
  isSeedDatabase,
  postgresTimestamptzToIso,
} from '../../lib/db/logic/environment.ts';
import type { DB } from '../schema';

import { seedFake } from './fake.ts';
import { seedFixed } from './fixed.ts';

const TIMESTAMPTZ_OID = 1184;

pg.types.setTypeParser(TIMESTAMPTZ_OID, postgresTimestamptzToIso);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set.');
}

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({ connectionString, max: 1 }),
  }),
});

try {
  const current = await sql<{
    current_database: string;
  }>`select current_database()`.execute(db);
  const name = current.rows[0]?.current_database;
  if (!name || !isSeedDatabase(name)) {
    throw new Error(`Refusing to seed ${name ?? 'an unknown database'}.`);
  }

  await db.transaction().execute(async (trx) => {
    await seedFixed(trx);
    await seedFake(trx);
  });

  console.log(`Seeded ${name}.`);
} finally {
  await db.destroy();
}
