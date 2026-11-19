import { createHash, randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  constantTimeEqual,
  hashInvitationToken,
  inviteCookieMessage,
  isInvitationToken,
  parseInviteCookie,
} from './invitation-token';

describe('invitation tokens', () => {
  it('accepts a 43-character base64url token', () => {
    const token = randomBytes(32).toString('base64url');
    expect(token).toHaveLength(43);
    expect(isInvitationToken(token)).toBe(true);
    expect(isInvitationToken(`${token}a`)).toBe(false);
    expect(isInvitationToken(token.slice(0, 42))).toBe(false);
    expect(isInvitationToken(`${'a'.repeat(42)}+`)).toBe(false);
  });

  it('hashes with SHA-256 and compares in constant time', () => {
    const token = 'a'.repeat(43);
    const hash = hashInvitationToken(token);
    expect(hash.equals(createHash('sha256').update(token).digest())).toBe(true);
    expect(constantTimeEqual(hash, hashInvitationToken(token))).toBe(true);
    expect(constantTimeEqual(hash, hashInvitationToken('b'.repeat(43)))).toBe(
      false,
    );
    expect(constantTimeEqual(new Uint8Array(), new Uint8Array())).toBe(false);
    expect(constantTimeEqual(hash, hash.subarray(0, 16))).toBe(false);
  });

  it('parses a four-part cookie and rejects the rest', () => {
    const token = 'c'.repeat(43);
    const signature = 'd'.repeat(43);
    expect(
      parseInviteCookie(
        inviteCookieMessage({
          token,
          termsVersion: '2026-11-18',
          privacyVersion: '2026-11-18',
        }) + `.${signature}`,
      ),
    ).toEqual({
      token,
      termsVersion: '2026-11-18',
      privacyVersion: '2026-11-18',
      signature,
    });
    expect(parseInviteCookie('a.b.c')).toBeNull();
    expect(
      parseInviteCookie(`short.2026-11-18.2026-11-18.${signature}`),
    ).toBeNull();
    expect(
      parseInviteCookie(`${token}.2026-11-18.2026-11-18.bad+sig`),
    ).toBeNull();
    expect(parseInviteCookie(`${token}..2026-11-18.${signature}`)).toBeNull();
  });
});
