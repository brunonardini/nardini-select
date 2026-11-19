import 'server-only';

import { serializeSignedCookie } from 'better-call';

import { getAuth } from './server';

/** Session cookie for Playwright. Uses Better Auth's own signing. */
export async function createTestSession(
  userId: string,
): Promise<{ name: string; value: string }> {
  const auth = await getAuth();
  const ctx = await auth.$context;
  const session = await ctx.internalAdapter.createSession(userId);
  const cookie = ctx.authCookies.sessionToken;
  const serialized = await serializeSignedCookie(
    cookie.name,
    session.token,
    ctx.secret,
    cookie.attributes,
  );
  const pair = serialized.split(';')[0] ?? '';
  const value = decodeURIComponent(pair.slice(pair.indexOf('=') + 1));
  return { name: cookie.name, value };
}
