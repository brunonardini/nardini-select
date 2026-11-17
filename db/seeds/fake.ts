import { fakerPT_BR as faker } from '@faker-js/faker';
import type { Kysely, Transaction } from 'kysely';

import { toUtcIso } from '../../lib/db/logic/environment.ts';
import type { DB } from '../schema';

import { ADMIN_USER_ID } from './ids.ts';

type Database = Kysely<DB> | Transaction<DB>;

const FAKE_USERS = 8;
const FAKE_EVENTS = 16;
const RANGE_START = new Date('2026-03-16T00:00:00.000Z');
const RANGE_END = new Date('2026-11-16T00:00:00.000Z');

export async function seedFake(db: Database): Promise<void> {
  faker.seed(20261116);
  const createdAt = toUtcIso(RANGE_START);

  const users = Array.from({ length: FAKE_USERS }, (_, index) => {
    const id = faker.string.uuid();
    return {
      id,
      full_name: faker.person.fullName(),
      display_name: faker.person.firstName(),
      email: `fake-${index + 1}@seed.invalid`,
      email_verified: false,
      photo_source: 'none' as const,
      created_at: createdAt,
      updated_at: createdAt,
    };
  });

  await db.insertInto('users').values(users).execute();

  await db
    .insertInto('audit.events')
    .values(
      Array.from({ length: FAKE_EVENTS }, (_, index) => ({
        occurred_at: toUtcIso(
          faker.date.between({ from: RANGE_START, to: RANGE_END }),
        ),
        actor_type: 'user' as const,
        actor_id:
          index % 2 === 0 ? ADMIN_USER_ID : users[index % users.length].id,
        action: 'seed.recorded',
        entity_type: 'user',
        entity_id: users[index % users.length].id,
        metadata: { source: 'seed' },
        metadata_version: 1,
      })),
    )
    .execute();
}
