import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  ADMIN_ROLE_ID,
  WORKER_SLOTS,
  workerUserId,
  type SeedUserState,
} from './ids';

const STATES: SeedUserState[] = [
  'no-role',
  'approved',
  'disabled',
  'anonymized',
];

describe('seed ids', () => {
  it('uses the admin role id inserted by the migration', () => {
    const sql = readFileSync(
      path.join(process.cwd(), 'db/migrations/20261116120000_create_roles.sql'),
      'utf8',
    );
    expect(sql).toContain(ADMIN_ROLE_ID);
  });

  it('gives every worker slot a distinct user id per state', () => {
    const ids = WORKER_SLOTS.flatMap((slot) =>
      STATES.map((state) => workerUserId(slot, state)),
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('a1d10000-0000-4000-8000-000000000001');
    expect(ids).toContain('a1d10003-0000-4000-8000-000000000004');
  });

  it('rejects a worker slot outside the Playwright cap', () => {
    expect(() => workerUserId(4, 'approved')).toThrow(
      'Worker slot must be 0, 1, 2, or 3.',
    );
  });
});
