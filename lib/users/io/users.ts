import 'server-only';

import type { Transaction } from 'kysely';

import type { DB } from '@/db/schema';
import { ADMIN_ROLE_ID } from '@/db/seeds/ids';
import type { AuthorizedContext } from '@/lib/auth/io/guard';
import { getDatabase } from '@/lib/db/io/client';
import {
  avatarFetchUrl,
  providerPhotoAvailable,
} from '@/lib/users/logic/avatar';
import {
  anonymizedEmail,
  confirmationMatches,
  decideUserChange,
  personName,
  profileChanges,
  profilePhotoChoice,
  userChangeMessage,
  userStateLabel,
  isUuid,
  DISPLAY_NAME_MAX,
  FULL_NAME_MAX,
  type MutationResult,
  type UserChange,
} from '@/lib/users/logic/rules';

export type UserListItem = {
  id: string;
  fullName: string | null;
  displayName: string | null;
  email: string;
  roleId: string | null;
  roleName: string | null;
  state: string;
  invitedAt: string | null;
  registeredAt: string | null;
  lastLoginAt: string | null;
  disabledAt: string | null;
  anonymizedAt: string | null;
  photoSource: string;
  /** A trusted Google photo the avatar route can serve. */
  photo: boolean;
};

export type UserDetail = UserListItem & {
  photoUrl: string | null;
  termsVersion: string | null;
  privacyNoticeVersion: string | null;
};

type UserRow = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string;
  role_id: string | null;
  role_name: string | null;
  invited_at: string | null;
  registered_at: string | null;
  last_login_at: string | null;
  disabled_at: string | null;
  anonymized_at: string | null;
  photo_source: string;
  photo_url: string | null;
  terms_version: string | null;
  privacy_notice_version: string | null;
};

function toListItem(row: UserRow): UserListItem {
  return {
    id: row.id,
    fullName: row.full_name,
    displayName: row.display_name,
    email: row.email,
    roleId: row.role_id,
    roleName: row.role_name,
    state: userStateLabel({
      anonymizedAt: row.anonymized_at,
      disabledAt: row.disabled_at,
      roleId: row.role_id,
      termsVersion: row.terms_version,
      privacyNoticeVersion: row.privacy_notice_version,
    }),
    invitedAt: row.invited_at,
    registeredAt: row.registered_at,
    lastLoginAt: row.last_login_at,
    disabledAt: row.disabled_at,
    anonymizedAt: row.anonymized_at,
    photoSource: row.photo_source,
    photo: providerPhotoAvailable(row.photo_source, row.photo_url),
  };
}

const userColumns = [
  'users.id',
  'users.full_name',
  'users.display_name',
  'users.email',
  'users.role_id',
  'roles.name as role_name',
  'users.invited_at',
  'users.registered_at',
  'users.last_login_at',
  'users.disabled_at',
  'users.anonymized_at',
  'users.photo_source',
  'users.photo_url',
  'users.terms_version',
  'users.privacy_notice_version',
] as const;

function requireViewer(ctx: AuthorizedContext): void {
  if (ctx.viewer.id.length === 0) throw new Error('Missing viewer.');
}

export async function listUsers(
  ctx: AuthorizedContext,
): Promise<UserListItem[]> {
  requireViewer(ctx);
  const db = await getDatabase();
  const rows = await db
    .selectFrom('users')
    .leftJoin('roles', 'roles.id', 'users.role_id')
    .select(userColumns)
    .orderBy('users.created_at', 'asc')
    .execute();
  return rows.map((row) => toListItem(row as UserRow));
}

export async function getUser(
  _ctx: AuthorizedContext,
  id: string,
): Promise<UserDetail | null> {
  const db = await getDatabase();
  const row = await db
    .selectFrom('users')
    .leftJoin('roles', 'roles.id', 'users.role_id')
    .select(userColumns)
    .where('users.id', '=', id)
    .executeTakeFirst();
  if (!row) return null;
  const item = toListItem(row as UserRow);
  return {
    ...item,
    photoUrl: row.photo_url,
    termsVersion: row.terms_version,
    privacyNoticeVersion: row.privacy_notice_version,
  };
}

async function lockActiveAdmins(trx: Transaction<DB>): Promise<number> {
  const rows = await trx
    .selectFrom('users')
    .select('id')
    .where('role_id', '=', ADMIN_ROLE_ID)
    .where('disabled_at', 'is', null)
    .where('anonymized_at', 'is', null)
    .forUpdate()
    .execute();
  return rows.length;
}

async function loadTarget(trx: Transaction<DB>, id: string) {
  return trx
    .selectFrom('users')
    .select([
      'id',
      'full_name',
      'display_name',
      'role_id',
      'disabled_at',
      'anonymized_at',
      'photo_url',
      'photo_source',
    ])
    .where('id', '=', id)
    .forUpdate()
    .executeTakeFirst();
}

async function actedInAudit(
  trx: Transaction<DB>,
  id: string,
): Promise<boolean> {
  const row = await trx
    .selectFrom('audit.events')
    .select('id')
    .where('actor_id', '=', id)
    .limit(1)
    .executeTakeFirst();
  return Boolean(row);
}

async function roleNames(trx: Transaction<DB>, ids: Array<string | null>) {
  const present = ids.filter((id): id is string => Boolean(id));
  if (present.length === 0) return new Map<string, string>();
  const rows = await trx
    .selectFrom('roles')
    .select(['id', 'name'])
    .where('id', 'in', present)
    .execute();
  return new Map(rows.map((row) => [row.id, row.name]));
}

function refusal(
  reason: Parameters<typeof userChangeMessage>[0],
): MutationResult {
  return { ok: false, reason, message: userChangeMessage(reason) };
}

async function applyChange(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  id: string,
  change: UserChange,
): Promise<
  | MutationResult
  | { ok: true; target: NonNullable<Awaited<ReturnType<typeof loadTarget>>> }
> {
  const activeAdminCount = await lockActiveAdmins(trx);
  const target = await loadTarget(trx, id);
  const decision = decideUserChange({
    actorId: ctx.viewer.id,
    target: target
      ? {
          id: target.id,
          roleId: target.role_id,
          disabledAt: target.disabled_at,
          anonymizedAt: target.anonymized_at,
        }
      : null,
    change,
    adminRoleId: ADMIN_ROLE_ID,
    activeAdminCount,
    actedInAudit:
      change.kind === 'delete' ? await actedInAudit(trx, id) : false,
  });
  if (!decision.ok) return refusal(decision.reason);
  if (!target) return refusal('missing');
  return { ok: true, target };
}

async function deleteSessions(trx: Transaction<DB>, id: string): Promise<void> {
  await trx.deleteFrom('sessions').where('user_id', '=', id).execute();
}

export async function updateFullName(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  input: { id: string; fullName: string; now: Date },
): Promise<MutationResult> {
  const fullName = personName(input.fullName, FULL_NAME_MAX);
  if (!fullName) {
    return {
      ok: false,
      reason: 'invalid_name',
      message: 'Informe o nome completo.',
    };
  }
  const applied = await applyChange(ctx, trx, input.id, {
    kind: 'update_full_name',
  });
  if (!applied.ok || !('target' in applied)) return applied;
  if (applied.target.full_name === fullName) return { ok: true };
  const now = input.now.toISOString();
  await trx
    .updateTable('users')
    .set({ full_name: fullName, updated_at: now })
    .where('id', '=', input.id)
    .execute();
  await ctx.audit('user.full_name_updated', input.id, {});
  return { ok: true };
}

export async function changeRole(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  input: { id: string; roleId: string | null; now: Date },
): Promise<MutationResult> {
  if (input.roleId) {
    const role = await trx
      .selectFrom('roles')
      .select('id')
      .where('id', '=', input.roleId)
      .executeTakeFirst();
    if (!role) {
      return {
        ok: false,
        reason: 'role_missing',
        message: 'Papel não encontrado.',
      };
    }
  }
  const applied = await applyChange(ctx, trx, input.id, {
    kind: 'change_role',
    roleId: input.roleId,
  });
  if (!applied.ok || !('target' in applied)) return applied;
  if (applied.target.role_id === input.roleId) return { ok: true };
  const names = await roleNames(trx, [applied.target.role_id, input.roleId]);
  const now = input.now.toISOString();
  await trx
    .updateTable('users')
    .set({ role_id: input.roleId, updated_at: now })
    .where('id', '=', input.id)
    .execute();
  await ctx.audit('user.role_changed', input.id, {
    from_role_id: applied.target.role_id,
    to_role_id: input.roleId,
    from_role_name: applied.target.role_id
      ? (names.get(applied.target.role_id) ?? null)
      : null,
    to_role_name: input.roleId ? (names.get(input.roleId) ?? null) : null,
  });
  return { ok: true };
}

export async function disableUser(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  input: { id: string; now: Date },
): Promise<MutationResult> {
  const applied = await applyChange(ctx, trx, input.id, { kind: 'disable' });
  if (!applied.ok || !('target' in applied)) return applied;
  const now = input.now.toISOString();
  await trx
    .updateTable('users')
    .set({ disabled_at: now, updated_at: now })
    .where('id', '=', input.id)
    .execute();
  await deleteSessions(trx, input.id);
  await ctx.audit('user.disabled', input.id, {});
  return { ok: true };
}

export async function enableUser(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  input: { id: string; now: Date },
): Promise<MutationResult> {
  const applied = await applyChange(ctx, trx, input.id, { kind: 'enable' });
  if (!applied.ok || !('target' in applied)) return applied;
  const now = input.now.toISOString();
  await trx
    .updateTable('users')
    .set({ disabled_at: null, updated_at: now })
    .where('id', '=', input.id)
    .execute();
  await ctx.audit('user.enabled', input.id, {});
  return { ok: true };
}

export async function deleteUser(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  input: { id: string },
): Promise<MutationResult> {
  const applied = await applyChange(ctx, trx, input.id, { kind: 'delete' });
  if (!applied.ok || !('target' in applied)) return applied;
  await deleteSessions(trx, input.id);
  await ctx.audit('user.deleted', input.id, {});
  await trx.deleteFrom('users').where('id', '=', input.id).execute();
  return { ok: true };
}

export async function anonymizeUser(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  input: { id: string; confirmation: string; now: Date },
): Promise<MutationResult> {
  const applied = await applyChange(ctx, trx, input.id, { kind: 'anonymize' });
  if (!applied.ok || !('target' in applied)) return applied;
  const expected = applied.target.full_name?.trim() ?? '';
  if (!confirmationMatches(input.confirmation, expected)) {
    return {
      ok: false,
      reason: 'confirmation',
      message: 'Digite o nome completo para confirmar.',
    };
  }
  const now = input.now.toISOString();
  await trx
    .updateTable('users')
    .set({
      full_name: null,
      display_name: null,
      email: anonymizedEmail(input.id),
      photo_url: null,
      photo_source: 'none',
      anonymized_at: now,
      updated_at: now,
    })
    .where('id', '=', input.id)
    .execute();
  await trx
    .updateTable('invitations')
    .set({ full_name: '' })
    .where('used_by_user_id', '=', input.id)
    .execute();
  await trx
    .deleteFrom('user_accounts')
    .where('user_id', '=', input.id)
    .execute();
  await deleteSessions(trx, input.id);
  await ctx.audit('user.anonymized', input.id, {});
  return { ok: true };
}

export async function updateProfile(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  input: { displayName: string; photo: string; now: Date },
): Promise<MutationResult> {
  const current = await loadTarget(trx, ctx.viewer.id);
  if (!current || current.anonymized_at) {
    return {
      ok: false,
      reason: 'missing',
      message: 'Usuário não encontrado.',
    };
  }
  const photo = profilePhotoChoice(input.photo, current.photo_url);
  if (!photo) {
    return {
      ok: false,
      reason: 'photo',
      message: 'Escolha a foto do Google ou nenhuma.',
    };
  }
  const fields = profileChanges({
    displayName: input.displayName,
    previousDisplayName: current.display_name,
    photo,
    previousPhoto: current.photo_source,
  });
  if (!fields) {
    return {
      ok: false,
      reason: 'display_name',
      message: `Informe um nome de exibição de até ${DISPLAY_NAME_MAX} caracteres.`,
    };
  }
  if (fields.length === 0) return { ok: true };
  const name = personName(input.displayName, DISPLAY_NAME_MAX);
  if (!name) {
    return {
      ok: false,
      reason: 'display_name',
      message: 'Informe o nome de exibição.',
    };
  }
  const now = input.now.toISOString();
  await trx
    .updateTable('users')
    .set({
      display_name: fields.includes('display_name')
        ? name
        : current.display_name,
      photo_source: photo,
      updated_at: now,
    })
    .where('id', '=', ctx.viewer.id)
    .execute();
  await ctx.audit('user.profile_updated', ctx.viewer.id, { fields });
  return { ok: true };
}

export function viewerCanChange(
  actorId: string,
  target: UserDetail,
  change: UserChange,
  activeAdminCount: number,
  actedInAudit: boolean,
): boolean {
  return decideUserChange({
    actorId,
    target: {
      id: target.id,
      roleId: target.roleId,
      disabledAt: target.disabledAt,
      anonymizedAt: target.anonymizedAt,
    },
    change,
    adminRoleId: ADMIN_ROLE_ID,
    activeAdminCount,
    actedInAudit,
  }).ok;
}

export async function countActiveAdmins(
  ctx: AuthorizedContext,
): Promise<number> {
  requireViewer(ctx);
  const db = await getDatabase();
  const rows = await db
    .selectFrom('users')
    .select('id')
    .where('role_id', '=', ADMIN_ROLE_ID)
    .where('disabled_at', 'is', null)
    .where('anonymized_at', 'is', null)
    .execute();
  return rows.length;
}

export async function userHasActed(
  _ctx: AuthorizedContext,
  id: string,
): Promise<boolean> {
  const db = await getDatabase();
  const row = await db
    .selectFrom('audit.events')
    .select('id')
    .where('actor_id', '=', id)
    .limit(1)
    .executeTakeFirst();
  return Boolean(row);
}

export function hasStoredGooglePhoto(url: string | null): boolean {
  return profilePhotoChoice('provider', url) === 'provider';
}

/** Trusted Google photo URL for the avatar proxy, or null when none may be fetched. */
export async function avatarSource(
  ctx: AuthorizedContext,
  id: string,
): Promise<string | null> {
  requireViewer(ctx);
  if (!isUuid(id)) return null;
  const db = await getDatabase();
  const user = await db
    .selectFrom('users')
    .select(['photo_url', 'photo_source'])
    .where('id', '=', id)
    .executeTakeFirst();
  if (user?.photo_source !== 'provider') return null;
  return avatarFetchUrl(user.photo_url);
}
