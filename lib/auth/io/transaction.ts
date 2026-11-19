import 'server-only';

import { AsyncLocalStorage } from 'node:async_hooks';
import { sql, type Kysely, type Transaction } from 'kysely';

import type { DB } from '@/db/schema';

const current = new AsyncLocalStorage<Transaction<DB>>();

export function currentAuthTransaction(): Transaction<DB> | undefined {
  return current.getStore();
}

/**
 * Better Auth's user hook does not receive the transaction. The hook reads
 * this store, which stays on the same Postgres transaction the adapter opened.
 */
export function bindAuthTransaction(db: Kysely<DB>): Kysely<DB> {
  const start = db.transaction.bind(db);
  db.transaction = () => {
    const builder = start();
    const execute = builder.execute.bind(builder);
    builder.execute = ((callback: (trx: Transaction<DB>) => Promise<unknown>) =>
      execute((trx) =>
        current.run(trx, () => callback(trx)),
      )) as typeof builder.execute;
    return builder;
  };
  return db;
}

export async function newId(db: Kysely<DB> | Transaction<DB>): Promise<string> {
  const generated = await sql<{
    id: string;
  }>`select gen_random_uuid() as id`.execute(db);
  const id = generated.rows[0]?.id;
  if (!id) throw new Error('Could not generate an id.');
  return id;
}
