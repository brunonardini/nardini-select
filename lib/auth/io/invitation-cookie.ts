import 'server-only';

import { createHmac } from 'node:crypto';

import {
  constantTimeEqual,
  inviteCookieMessage,
  parseInviteCookie,
  type InviteCookieParts,
} from '@/lib/auth/logic/invitation-token';
import {
  INVITE_COOKIE_MAX_AGE_SECONDS,
  INVITE_COOKIE_NAME,
} from '@/lib/auth/logic/session';

function signature(message: string, secret: string): string {
  return createHmac('sha256', secret).update(message).digest('base64url');
}

export function sealInviteCookie(
  parts: {
    token: string;
    termsVersion: string;
    privacyVersion: string;
  },
  secret: string,
): string {
  const message = inviteCookieMessage(parts);
  return `${message}.${signature(message, secret)}`;
}

export function openInviteCookie(
  value: string,
  secret: string,
): InviteCookieParts | null {
  const parsed = parseInviteCookie(value);
  if (!parsed) return null;
  const expected = signature(inviteCookieMessage(parsed), secret);
  const matches = constantTimeEqual(
    Buffer.from(parsed.signature),
    Buffer.from(expected),
  );
  if (!matches) return null;
  return parsed;
}

export function inviteCookieHeader(value: string): string {
  const encoded = encodeURIComponent(value);
  return `${INVITE_COOKIE_NAME}=${encoded}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${INVITE_COOKIE_MAX_AGE_SECONDS}`;
}
