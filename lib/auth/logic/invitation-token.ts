import { createHash, timingSafeEqual } from 'node:crypto';

const TOKEN = /^[A-Za-z0-9_-]{43}$/;

/** 32 bytes, base64url, no padding. */
export function isInvitationToken(value: string): boolean {
  return TOKEN.test(value);
}

/** SHA-256 of the UTF-8 token. The seed uses the same function. */
export function hashInvitationToken(token: string): Buffer {
  return createHash('sha256').update(token).digest();
}

export function constantTimeEqual(
  left: Uint8Array,
  right: Uint8Array,
): boolean {
  if (left.byteLength === 0 || left.byteLength !== right.byteLength) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export type InviteCookieParts = {
  token: string;
  termsVersion: string;
  privacyVersion: string;
  signature: string;
};

export function inviteCookieMessage(parts: {
  token: string;
  termsVersion: string;
  privacyVersion: string;
}): string {
  return `${parts.token}.${parts.termsVersion}.${parts.privacyVersion}`;
}

/** Structure only. The signature is checked where the secret is available. */
export function parseInviteCookie(value: string): InviteCookieParts | null {
  const parts = value.split('.');
  if (parts.length !== 4) return null;
  const [token, termsVersion, privacyVersion, signature] = parts;
  if (!token || !termsVersion || !privacyVersion || !signature) return null;
  if (!isInvitationToken(token)) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(signature)) return null;
  return { token, termsVersion, privacyVersion, signature };
}
