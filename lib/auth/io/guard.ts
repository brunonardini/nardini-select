import 'server-only';

import * as Sentry from '@sentry/nextjs';
import type { Kysely, Transaction } from 'kysely';
import { cookies, headers } from 'next/headers';
import { forbidden, redirect } from 'next/navigation';
import { cache } from 'react';
import type { z } from 'zod';

import type { DB } from '@/db/schema';
import { ADMIN_ROLE_ID } from '@/db/seeds/ids';
import { auditCatalog, type AuditAction } from '@/lib/audit/logic/actions';
import { recordAudit } from '@/lib/audit/io/record';
import {
  decideAccess,
  sessionWithinLimit,
  viewerState,
  type AccessDecision,
  type AccessOptions,
  type Viewer,
} from '@/lib/auth/logic/access';
import { allowsMutationOrigin } from '@/lib/auth/logic/access';
import { SESSION_COOKIE_NAME } from '@/lib/auth/logic/session';
import { getDatabase, transaction } from '@/lib/db/io/client';
import { PRIVACY_NOTICE_VERSION, TERMS_VERSION } from '@/lib/legal/versions';
import { providerPhotoAvailable } from '@/lib/users/logic/avatar';

import { getAuth } from './server';

const authorized = Symbol('AuthorizedContext');

type UserRow = {
  id: string;
  email: string;
  display_name: string | null;
  full_name: string | null;
  photo_source: string;
  photo_url: string | null;
  role_id: string | null;
  terms_version: string | null;
  terms_accepted_at: string | null;
  privacy_notice_version: string | null;
  disabled_at: string | null;
  anonymized_at: string | null;
};

export type AuthorizedContext = {
  readonly [authorized]: true;
  viewer: Viewer;
  audit: (
    action: AuditAction,
    entityId: string | null,
    metadata: unknown,
  ) => Promise<void>;
};

function toViewer(row: UserRow, sessionCreatedAt: string): Viewer {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    fullName: row.full_name,
    photo: providerPhotoAvailable(row.photo_source, row.photo_url),
    roleId: row.role_id,
    isAdmin: row.role_id === ADMIN_ROLE_ID,
    state: viewerState({
      roleId: row.role_id,
      termsVersion: row.terms_version,
      privacyNoticeVersion: row.privacy_notice_version,
      currentTermsVersion: TERMS_VERSION,
      currentPrivacyVersion: PRIVACY_NOTICE_VERSION,
    }),
    termsAcceptedAt: row.terms_accepted_at,
    sessionCreatedAt,
  };
}

function asIso(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString();
  }
  return null;
}

async function loadUser(
  db: Kysely<DB> | Transaction<DB>,
  userId: string,
): Promise<UserRow | undefined> {
  return db
    .selectFrom('users')
    .select([
      'id',
      'email',
      'display_name',
      'full_name',
      'photo_source',
      'photo_url',
      'role_id',
      'terms_version',
      'terms_accepted_at',
      'privacy_notice_version',
      'disabled_at',
      'anonymized_at',
    ])
    .where('id', '=', userId)
    .executeTakeFirst();
}

function createContext(
  viewer: Viewer,
  trx: Transaction<DB> | null,
): AuthorizedContext {
  return {
    [authorized]: true,
    viewer,
    async audit(action, entityId, metadata) {
      if (!trx) {
        throw new Error('Audit writes belong inside an action transaction.');
      }
      if (auditCatalog[action].actor === 'system') {
        throw new Error('System audit events are written by the sign-up flow.');
      }
      await recordAudit(trx, {
        action,
        actorId: viewer.id,
        entityId,
        metadata,
        occurredAt: new Date().toISOString(),
      });
    },
  };
}

function settle(decision: AccessDecision, viewer: Viewer | null): Viewer {
  if (!viewer || decision.kind === 'sign_in') redirect('/admin/entrar');
  if (decision.kind === 'redirect') redirect(decision.to);
  if (decision.kind === 'forbidden') forbidden();
  return viewer;
}

export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (process.env.NEXT_PHASE === 'phase-production-build') return null;
  const jar = await cookies();
  if (!jar.has(SESSION_COOKIE_NAME)) return null;

  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const createdAt = asIso(session.session.createdAt);
  if (!createdAt || !sessionWithinLimit(createdAt, new Date())) return null;

  const row = await loadUser(await getDatabase(), session.user.id);
  if (!row || row.disabled_at || row.anonymized_at) return null;

  const viewer = toViewer(row, createdAt);
  Sentry.setUser({ id: viewer.id });
  return viewer;
});

export async function requirePage(
  options: AccessOptions,
): Promise<AuthorizedContext> {
  const viewer = await getViewer();
  const decision = decideAccess(viewer, options, new Date());
  return createContext(settle(decision, viewer), null);
}

export function withAction<T, R>(
  name: string,
  options: AccessOptions,
  schema: z.ZodType<T>,
  handler: (
    ctx: AuthorizedContext,
    input: T,
    trx: Transaction<DB>,
  ) => Promise<R>,
): (input: unknown) => Promise<R> {
  return async (input) =>
    Sentry.withServerActionInstrumentation(
      name,
      { headers: headers() },
      async () => {
        const parsed = schema.parse(input);
        const viewer = settle(
          decideAccess(await getViewer(), options, new Date()),
          await getViewer(),
        );
        return transaction(async (trx) => {
          const fresh = await loadUser(trx, viewer.id);
          const current = fresh
            ? toViewer(fresh, viewer.sessionCreatedAt)
            : null;
          const decision = decideAccess(current, options, new Date());
          if (decision.kind !== 'allow' || !current) {
            throw new Error('Access changed before the action committed.');
          }
          return handler(createContext(current, trx), parsed, trx);
        });
      },
    );
}

export function withRoute(
  options: AccessOptions,
  handler: (ctx: AuthorizedContext, request: Request) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return async (request) => {
    const siteUrl = process.env.BETTER_AUTH_URL ?? '';
    if (
      !allowsMutationOrigin({
        method: request.method,
        secFetchSite: request.headers.get('sec-fetch-site'),
        origin: request.headers.get('origin'),
        siteUrl,
      })
    ) {
      return Response.json({ message: 'Forbidden' }, { status: 403 });
    }

    const viewer = await getViewer();
    const decision = decideAccess(viewer, options, new Date());
    if (!viewer || decision.kind === 'sign_in') {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (decision.kind !== 'allow') {
      return Response.json({ message: 'Forbidden' }, { status: 403 });
    }
    return handler(createContext(viewer, null), request);
  };
}
