import 'server-only';

import type { Transaction } from 'kysely';

import type { DB } from '@/db/schema';
import { ADMIN_ROLE_ID, SYSTEM_ACTOR_ID } from '@/db/seeds/ids';
import { recordAudit } from '@/lib/audit/io/record';
import { openInviteCookie } from '@/lib/auth/io/invitation-cookie';
import { hashInvitationToken } from '@/lib/auth/logic/invitation-token';
import { INVITE_COOKIE_NAME, readCookie } from '@/lib/auth/logic/session';
import {
  decideSignUp,
  type GoogleProfile,
  type SignUpDecision,
  type SignUpInvite,
} from '@/lib/auth/logic/sign-up';
import { invitationValidity } from '@/lib/invitations/logic/rules';
import { PRIVACY_NOTICE_VERSION, TERMS_VERSION } from '@/lib/legal/versions';
import { sql } from 'kysely';

function secret(): string {
  const value = process.env.BETTER_AUTH_SECRET;
  if (!value) throw new Error('BETTER_AUTH_SECRET is not set.');
  return value;
}

async function userCount(trx: Transaction<DB>): Promise<number> {
  await sql`lock table users in share row exclusive mode`.execute(trx);
  const row = await trx
    .selectFrom('users')
    .select((eb) => eb.fn.countAll<string>().as('total'))
    .executeTakeFirstOrThrow();
  return Number(row.total);
}

async function inviteFromCookie(
  trx: Transaction<DB>,
  header: string | null,
  now: Date,
): Promise<{ invite: SignUpInvite; userCount: number }> {
  const raw = readCookie(header, INVITE_COOKIE_NAME);
  if (!raw) {
    return { invite: { kind: 'absent' }, userCount: await userCount(trx) };
  }

  const opened = openInviteCookie(raw, secret());
  if (!opened) return { invite: { kind: 'invalid' }, userCount: 0 };

  const row = await trx
    .selectFrom('invitations')
    .select(['id', 'used_at', 'canceled_at', 'expires_at', 'created_at'])
    .where('token_hash', '=', hashInvitationToken(opened.token))
    .executeTakeFirst();

  if (!row) {
    return {
      invite: {
        kind: 'present',
        id: '',
        status: 'missing',
        createdAt: '',
        termsVersion: opened.termsVersion,
        privacyVersion: opened.privacyVersion,
      },
      userCount: 0,
    };
  }

  return {
    invite: {
      kind: 'present',
      id: row.id,
      status: invitationValidity(
        {
          usedAt: row.used_at,
          canceledAt: row.canceled_at,
          expiresAt: row.expires_at,
        },
        now,
      ),
      createdAt: row.created_at,
      termsVersion: opened.termsVersion,
      privacyVersion: opened.privacyVersion,
    },
    userCount: 0,
  };
}

export async function prepareSignUp(
  trx: Transaction<DB>,
  input: {
    id: string;
    profile: GoogleProfile;
    cookieHeader: string | null;
    now: Date;
  },
): Promise<SignUpDecision> {
  const loaded = await inviteFromCookie(trx, input.cookieHeader, input.now);
  const decision = decideSignUp({
    profile: input.profile,
    invite: loaded.invite,
    userCount: loaded.userCount,
    bootstrapEmail: process.env.BOOTSTRAP_ADMIN_EMAIL ?? null,
    adminRoleId: ADMIN_ROLE_ID,
    currentTermsVersion: TERMS_VERSION,
    currentPrivacyVersion: PRIVACY_NOTICE_VERSION,
    now: input.now,
  });
  if (!decision.ok) return decision;

  if (decision.path === 'invitation') {
    if (loaded.invite.kind !== 'present' || !loaded.invite.id) {
      return { ok: false, error: 'convite_invalido' };
    }
    const consumed = await trx
      .updateTable('invitations')
      .set({
        used_at: input.now.toISOString(),
        used_by_user_id: input.id,
      })
      .where('id', '=', loaded.invite.id)
      .where('used_at', 'is', null)
      .where('canceled_at', 'is', null)
      .where('expires_at', '>', input.now.toISOString())
      .returning('id')
      .execute();
    if (consumed.length === 0) return { ok: false, error: 'convite_invalido' };
  }

  const occurredAt = input.now.toISOString();
  await recordAudit(trx, {
    action: 'user.registered',
    actorId: SYSTEM_ACTOR_ID,
    entityId: input.id,
    metadata: {
      invitation_id:
        decision.path === 'invitation' && loaded.invite.kind === 'present'
          ? loaded.invite.id
          : null,
    },
    occurredAt,
  });
  if (decision.path === 'first_admin') {
    await recordAudit(trx, {
      action: 'bootstrap.claimed',
      actorId: SYSTEM_ACTOR_ID,
      entityId: input.id,
      metadata: {},
      occurredAt,
    });
  }

  return decision;
}
