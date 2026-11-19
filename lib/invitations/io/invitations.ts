import 'server-only';

import type { Transaction } from 'kysely';

import type { DB } from '@/db/schema';
import type { AuthorizedContext } from '@/lib/auth/io/guard';
import { generateInvitationToken } from '@/lib/auth/io/invitation-token';
import { newId } from '@/lib/auth/io/transaction';
import {
  hashInvitationToken,
  isInvitationToken,
} from '@/lib/auth/logic/invitation-token';
import { getDatabase } from '@/lib/db/io/client';
import {
  invitationExpiresAt,
  invitationName,
  invitationValidity,
  type InvitationValidity,
} from '@/lib/invitations/logic/rules';

export type InvitationView = {
  id: string;
  fullName: string;
  expiresAt: string;
  createdAt: string;
  validity: InvitationValidity;
};

export async function findInvitationByToken(
  token: string,
  now = new Date(),
): Promise<InvitationView | null> {
  if (!isInvitationToken(token)) return null;
  const db = await getDatabase();
  const row = await db
    .selectFrom('invitations')
    .select([
      'id',
      'full_name',
      'expires_at',
      'created_at',
      'used_at',
      'canceled_at',
    ])
    .where('token_hash', '=', hashInvitationToken(token))
    .executeTakeFirst();
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    validity: invitationValidity(
      {
        usedAt: row.used_at,
        canceledAt: row.canceled_at,
        expiresAt: row.expires_at,
      },
      now,
    ),
  };
}

async function insertInvitation(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  fullName: string,
  now: Date,
): Promise<{ id: string; token: string; expiresAt: string }> {
  const id = await newId(trx);
  const token = generateInvitationToken();
  const expiresAt = invitationExpiresAt(now);
  await trx
    .insertInto('invitations')
    .values({
      id,
      full_name: fullName,
      token_hash: hashInvitationToken(token),
      expires_at: expiresAt,
      created_by: ctx.viewer.id,
      created_at: now.toISOString(),
    })
    .execute();
  await ctx.audit('invitation.created', id, {});
  return { id, token, expiresAt };
}

export async function createInvitation(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  input: { fullName: string; now: Date },
): Promise<{ id: string; token: string; expiresAt: string }> {
  const fullName = invitationName(input.fullName);
  if (!fullName) throw new Error('Invalid invitation name.');
  return insertInvitation(ctx, trx, fullName, input.now);
}

export async function cancelInvitation(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  input: { id: string; now: Date },
): Promise<void> {
  const row = await trx
    .selectFrom('invitations')
    .select(['id', 'used_at', 'canceled_at', 'expires_at'])
    .where('id', '=', input.id)
    .executeTakeFirst();
  if (
    !row ||
    invitationValidity(
      {
        usedAt: row.used_at,
        canceledAt: row.canceled_at,
        expiresAt: row.expires_at,
      },
      input.now,
    ) !== 'valid'
  ) {
    throw new Error('Invitation cannot be canceled.');
  }

  const canceled = await trx
    .updateTable('invitations')
    .set({ canceled_at: input.now.toISOString() })
    .where('id', '=', input.id)
    .where('used_at', 'is', null)
    .where('canceled_at', 'is', null)
    .returning('id')
    .execute();
  if (canceled.length === 0) throw new Error('Invitation cannot be canceled.');
  await ctx.audit('invitation.canceled', input.id, {});
}

export async function renewInvitation(
  ctx: AuthorizedContext,
  trx: Transaction<DB>,
  input: { id: string; now: Date },
): Promise<{ id: string; token: string; expiresAt: string }> {
  const row = await trx
    .selectFrom('invitations')
    .select(['full_name', 'used_at', 'canceled_at', 'expires_at'])
    .where('id', '=', input.id)
    .executeTakeFirst();
  if (!row) throw new Error('Invitation cannot be renewed.');
  await cancelInvitation(ctx, trx, input);
  return insertInvitation(ctx, trx, row.full_name, input.now);
}

export async function listPendingInvitations(
  _ctx: AuthorizedContext,
  trx: Transaction<DB>,
  now: Date,
): Promise<InvitationView[]> {
  const rows = await trx
    .selectFrom('invitations')
    .select(['id', 'full_name', 'expires_at', 'created_at'])
    .where('used_at', 'is', null)
    .where('canceled_at', 'is', null)
    .where('expires_at', '>', now.toISOString())
    .orderBy('created_at', 'desc')
    .execute();
  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    validity: 'valid',
  }));
}
