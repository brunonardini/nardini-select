import 'server-only';

import type { Transaction } from 'kysely';

import type { DB } from '@/db/schema';
import type { AuthorizedContext } from '@/lib/auth/io/guard';
import { newId } from '@/lib/auth/io/transaction';
import { getDatabase } from '@/lib/db/io/client';
import {
  canDeleteRole,
  canRenameRole,
  roleName,
  ROLE_IN_USE_MESSAGE,
  ROLE_NAME_MESSAGE,
  ROLE_SYSTEM_MESSAGE,
  ROLE_TAKEN_MESSAGE,
  sameRoleName,
} from '@/lib/roles/logic/rules';
import type { MutationResult } from '@/lib/users/logic/rules';

export type RoleListItem = {
  id: string;
  name: string;
  isSystem: boolean;
  userCount: number;
};

function uniqueViolation(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  if ('code' in error && error.code === '23505') return true;
  if ('cause' in error) return uniqueViolation(error.cause);
  return false;
}

function requireViewer(ctx: AuthorizedContext): void {
  if (ctx.viewer.id.length === 0) throw new Error('Missing viewer.');
}

export async function listRoles(
  ctx: AuthorizedContext,
): Promise<RoleListItem[]> {
  requireViewer(ctx);
  const db = await getDatabase();
  const rows = await db
    .selectFrom('roles')
    .leftJoin('users', 'users.role_id', 'roles.id')
    .select(['roles.id', 'roles.name', 'roles.is_system'])
    .select((eb) => eb.fn.count('users.id').as('user_count'))
    .groupBy(['roles.id', 'roles.name', 'roles.is_system'])
    .orderBy('roles.name', 'asc')
    .execute();
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    isSystem: row.is_system,
    userCount: Number(row.user_count),
  }));
}

export async function getRole(
  _ctx: AuthorizedContext,
  id: string,
): Promise<RoleListItem | null> {
  const roles = await listRoles(_ctx);
  return roles.find((role) => role.id === id) ?? null;
}

async function loadRole(trx: Transaction<DB>, id: string) {
  return trx
    .selectFrom('roles')
    .select(['id', 'name', 'is_system'])
    .where('id', '=', id)
    .forUpdate()
    .executeTakeFirst();
}

async function userCount(trx: Transaction<DB>, id: string): Promise<number> {
  const row = await trx
    .selectFrom('users')
    .select((eb) => eb.fn.countAll<string>().as('total'))
    .where('role_id', '=', id)
    .executeTakeFirstOrThrow();
  return Number(row.total);
}

export async function createRole(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  input: { name: string; now: Date },
): Promise<MutationResult & { id?: string }> {
  const name = roleName(input.name);
  if (!name)
    return { ok: false, reason: 'invalid_name', message: ROLE_NAME_MESSAGE };
  const id = await newId(trx);
  try {
    await trx
      .insertInto('roles')
      .values({
        id,
        name,
        is_system: false,
        created_at: input.now.toISOString(),
        updated_at: input.now.toISOString(),
      })
      .execute();
  } catch (error) {
    if (uniqueViolation(error)) {
      return { ok: false, reason: 'taken', message: ROLE_TAKEN_MESSAGE };
    }
    throw error;
  }
  await ctx.audit('role.created', id, { name });
  return { ok: true, id };
}

export async function renameRole(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  input: { id: string; name: string; now: Date },
): Promise<MutationResult> {
  const name = roleName(input.name);
  if (!name)
    return { ok: false, reason: 'invalid_name', message: ROLE_NAME_MESSAGE };
  const role = await loadRole(trx, input.id);
  if (!role)
    return { ok: false, reason: 'missing', message: 'Papel não encontrado.' };
  if (!canRenameRole({ isSystem: role.is_system })) {
    return { ok: false, reason: 'system', message: ROLE_SYSTEM_MESSAGE };
  }
  if (sameRoleName(role.name, name)) return { ok: true };
  try {
    await trx
      .updateTable('roles')
      .set({ name, updated_at: input.now.toISOString() })
      .where('id', '=', input.id)
      .execute();
  } catch (error) {
    if (uniqueViolation(error)) {
      return { ok: false, reason: 'taken', message: ROLE_TAKEN_MESSAGE };
    }
    throw error;
  }
  await ctx.audit('role.renamed', input.id, {
    name,
    previous_name: role.name,
  });
  return { ok: true };
}

export async function deleteRole(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  input: { id: string },
): Promise<MutationResult> {
  const role = await loadRole(trx, input.id);
  if (!role)
    return { ok: false, reason: 'missing', message: 'Papel não encontrado.' };
  const count = await userCount(trx, input.id);
  if (!canDeleteRole({ isSystem: role.is_system, userCount: count })) {
    return {
      ok: false,
      reason: role.is_system ? 'system' : 'in_use',
      message: role.is_system ? ROLE_SYSTEM_MESSAGE : ROLE_IN_USE_MESSAGE,
    };
  }
  await trx.deleteFrom('roles').where('id', '=', input.id).execute();
  await ctx.audit('role.deleted', input.id, { name: role.name });
  return { ok: true };
}
