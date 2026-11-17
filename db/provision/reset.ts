import { isSeedDatabase } from '../../lib/db/logic/environment.ts';
import { readRoleSections, requiredEnv, withClient } from './sql.ts';

const sections = readRoleSections();
const connectionString = requiredEnv('DATABASE_MIGRATION_URL');

await withClient(connectionString, async (client) => {
  const current = await client.query<{ name: string }>(
    'SELECT current_database() AS name',
  );
  const name = current.rows[0]?.name;
  if (!name || !isSeedDatabase(name)) {
    throw new Error(`Refusing to reset ${name ?? 'an unknown database'}.`);
  }

  await client.query('DROP SCHEMA IF EXISTS public CASCADE');
  await client.query('DROP SCHEMA IF EXISTS audit CASCADE');
  await client.query('CREATE SCHEMA public');
  await client.query('CREATE SCHEMA audit');
  await client.query(sections['schema-grants']);
});

console.log('Reset public and audit.');
