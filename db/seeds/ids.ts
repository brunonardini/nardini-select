/** Fixed ids shared by the migration and the seed. Tests lock the two together. */

export const ADMIN_ROLE_ID = 'a1d00000-0000-4000-8000-000000000001';

export const SYSTEM_ACTOR_ID = 'a1d00000-0000-4000-8000-000000000000';

export const ADMIN_USER_ID = 'a1d00000-0000-4000-8000-000000000010';

export const ATENDIMENTO_ROLE_ID = 'a1d00000-0000-4000-8000-000000000002';

export const ESTOQUE_ROLE_ID = 'a1d00000-0000-4000-8000-000000000003';

export const VALID_INVITATION_ID = 'a1d20000-0000-4000-8000-000000000001';

export const EXPIRED_INVITATION_ID = 'a1d20000-0000-4000-8000-000000000002';

export const CANCELED_INVITATION_ID = 'a1d20000-0000-4000-8000-000000000003';

export const WORKER_SLOTS = [0, 1, 2, 3] as const;

export type SeedUserState = 'no-role' | 'approved' | 'disabled' | 'anonymized';

const STATE_NIBBLE: Record<SeedUserState, string> = {
  'no-role': '1',
  approved: '2',
  disabled: '3',
  anonymized: '4',
};

export function workerUserId(slot: number, state: SeedUserState): string {
  if (!Number.isInteger(slot) || slot < 0 || slot > 3) {
    throw new Error('Worker slot must be 0, 1, 2, or 3.');
  }
  return `a1d1000${slot}-0000-4000-8000-00000000000${STATE_NIBBLE[state]}`;
}
