import { retentionCutoffs } from '../../lib/retention/logic/cutoffs.ts';

import { requiredEnv, withClient } from '../provision/sql.ts';

const url = requiredEnv('AUDIT_MAINTAINER_URL');
const cutoffs = retentionCutoffs(new Date());

function deletedRows(rowCount: number | null): number {
  if (rowCount === null) {
    throw new Error('Postgres did not report how many rows were deleted.');
  }
  return rowCount;
}

await withClient(url, async (client) => {
  await client.query('BEGIN');
  try {
    await client.query("SET LOCAL lock_timeout = '3s'");
    await client.query("SET LOCAL statement_timeout = '15s'");
    const audit = await client.query(
      'DELETE FROM audit.events WHERE occurred_at < $1::timestamptz',
      [cutoffs.audit],
    );
    const invitations = await client.query(
      'DELETE FROM invitations WHERE created_at < $1::timestamptz',
      [cutoffs.invitations],
    );
    await client.query('COMMIT');
    console.log('Retention complete! Summary:');
    console.log(`- Deleted ${deletedRows(audit.rowCount)} audit events.`);
    console.log(`- Deleted ${deletedRows(invitations.rowCount)} invitations.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
});
