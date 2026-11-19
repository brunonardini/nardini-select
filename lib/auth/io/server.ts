import 'server-only';

import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import type { Kysely } from 'kysely';

import type { DB } from '@/db/schema';
import { isEnabledAuthPath } from '@/lib/auth/logic/auth-paths';
import { getDatabase } from '@/lib/db/io/client';

import { prepareSession, rememberProfileImage } from './sign-in';
import { prepareSignUp } from './sign-up';
import {
  bindAuthTransaction,
  currentAuthTransaction,
  newId,
} from './transaction';

const DISABLED_PATHS = [
  '/sign-out',
  '/sign-up/email',
  '/sign-in/email',
  '/list-sessions',
  '/revoke-session',
  '/revoke-sessions',
  '/revoke-other-sessions',
  '/ok',
  '/send-verification-email',
  '/verify-email',
  '/error',
  '/list-accounts',
  '/link-social',
  '/unlink-account',
  '/get-access-token',
  '/refresh-token',
  '/account-info',
  '/update-user',
  '/change-password',
  '/delete-user',
  '/delete-user/callback',
  '/change-email',
  '/update-session',
  '/request-password-reset',
  '/reset-password',
  '/verify-password',
];

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set.`);
  return value;
}

function refusal(code: string): APIError {
  return new APIError('FORBIDDEN', { message: code, code });
}

function text(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

const dateField = {
  type: 'date',
  required: false,
  input: false,
  returned: false,
} as const;

function options(db: Kysely<DB>): BetterAuthOptions {
  return {
    appName: 'Nardini Select',
    secret: required('BETTER_AUTH_SECRET'),
    baseURL: required('BETTER_AUTH_URL'),
    trustedOrigins: [required('BETTER_AUTH_URL')],
    telemetry: { enabled: false },
    emailAndPassword: { enabled: false },
    rateLimit: {
      enabled: true,
      storage: 'memory',
      window: 60,
      max: 1000,
    },
    onAPIError: { errorURL: '/admin/entrar' },
    advanced: {
      useSecureCookies: true,
      database: { generateId: false, validateSchema: false },
    },
    database: {
      db: db as Kysely<never>,
      type: 'postgres',
      transaction: true,
    },
    socialProviders: {
      google: {
        clientId: required('GOOGLE_CLIENT_ID'),
        clientSecret: required('GOOGLE_CLIENT_SECRET'),
      },
    },
    account: {
      modelName: 'user_accounts',
      updateAccountOnSignIn: false,
      storeAccountCookie: false,
      accountLinking: { enabled: false, disableImplicitLinking: true },
      fields: {
        accountId: 'provider_account_id',
        providerId: 'provider_id',
        userId: 'user_id',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
    session: {
      modelName: 'sessions',
      expiresIn: 60 * 60 * 12,
      updateAge: 60 * 60,
      cookieCache: { enabled: false },
      fields: {
        userId: 'user_id',
        expiresAt: 'expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
    verification: {
      modelName: 'verifications',
      fields: {
        expiresAt: 'expires_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    },
    user: {
      modelName: 'users',
      fields: {
        name: 'display_name',
        emailVerified: 'email_verified',
        image: 'photo_url',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      additionalFields: {
        fullName: {
          type: 'string',
          required: false,
          input: false,
          fieldName: 'full_name',
        },
        photoSource: {
          type: 'string',
          required: false,
          input: false,
          defaultValue: 'none',
          fieldName: 'photo_source',
        },
        roleId: {
          type: 'string',
          required: false,
          input: false,
          fieldName: 'role_id',
        },
        invitedAt: { ...dateField, fieldName: 'invited_at' },
        registeredAt: { ...dateField, fieldName: 'registered_at' },
        lastLoginAt: { ...dateField, fieldName: 'last_login_at' },
        disabledAt: { ...dateField, fieldName: 'disabled_at' },
        anonymizedAt: { ...dateField, fieldName: 'anonymized_at' },
        termsVersion: {
          type: 'string',
          required: false,
          input: false,
          returned: false,
          fieldName: 'terms_version',
        },
        termsAcceptedAt: { ...dateField, fieldName: 'terms_accepted_at' },
        privacyNoticeVersion: {
          type: 'string',
          required: false,
          input: false,
          returned: false,
          fieldName: 'privacy_notice_version',
        },
        privacyNoticeAcknowledgedAt: {
          ...dateField,
          fieldName: 'privacy_notice_acknowledged_at',
        },
      },
      validateUserInfo({ user }) {
        const email = text(user.email);
        if (!email) return;
        rememberProfileImage(email, text(user.image));
      },
    },
    disabledPaths: DISABLED_PATHS,
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (!isEnabledAuthPath(ctx.path)) {
          throw new APIError('NOT_FOUND', { message: 'Not Found' });
        }
      }),
    },
    databaseHooks: {
      user: {
        create: {
          async before(user, context) {
            const trx = currentAuthTransaction();
            if (!trx) throw refusal('erro');
            const id = await newId(trx);
            const decision = await prepareSignUp(trx, {
              id,
              profile: {
                email: text(user.email) ?? '',
                emailVerified: user.emailVerified === true,
                name: text(user.name),
                image: text(user.image),
              },
              cookieHeader: context?.request?.headers.get('cookie') ?? null,
              now: new Date(),
            });
            if (!decision.ok) throw refusal(decision.error);
            const fields = decision.fields;
            return {
              data: {
                ...user,
                id,
                name: fields.name,
                image: fields.image,
                emailVerified: true,
                photoSource: fields.photoSource,
                roleId: fields.roleId,
                fullName: null,
                termsVersion: fields.termsVersion,
                termsAcceptedAt: fields.termsAcceptedAt
                  ? new Date(fields.termsAcceptedAt)
                  : null,
                privacyNoticeVersion: fields.privacyNoticeVersion,
                privacyNoticeAcknowledgedAt: fields.privacyNoticeAcknowledgedAt
                  ? new Date(fields.privacyNoticeAcknowledgedAt)
                  : null,
                invitedAt: fields.invitedAt ? new Date(fields.invitedAt) : null,
                registeredAt: new Date(fields.registeredAt),
              },
            };
          },
        },
      },
      session: {
        create: {
          async before(session) {
            const trx = currentAuthTransaction();
            const db = trx ?? (await getDatabase());
            const decision = await prepareSession(db, {
              userId: session.userId,
              now: new Date(),
            });
            if (!decision.ok) throw refusal(decision.error);
            return {
              data: {
                ...session,
                id: session.id || (await newId(db)),
                ipAddress: undefined,
                userAgent: undefined,
              },
            };
          },
        },
      },
      account: {
        create: {
          async before(account) {
            const trx = currentAuthTransaction();
            const db = trx ?? (await getDatabase());
            return {
              data: {
                ...account,
                id: account.id || (await newId(db)),
                accessToken: undefined,
                refreshToken: undefined,
                idToken: undefined,
                accessTokenExpiresAt: undefined,
                refreshTokenExpiresAt: undefined,
                scope: undefined,
                password: undefined,
              },
            };
          },
        },
      },
    },
  };
}

let pending: Promise<ReturnType<typeof betterAuth>> | undefined;

export function getAuth(): Promise<ReturnType<typeof betterAuth>> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Auth cannot start during next build.');
  }
  pending ??= getDatabase()
    .then((db) => betterAuth(options(bindAuthTransaction(db))))
    .catch((error: unknown) => {
      pending = undefined;
      throw error;
    });
  return pending;
}
