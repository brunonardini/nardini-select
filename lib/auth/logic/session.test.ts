import { describe, expect, it } from 'vitest';

import {
  INVITE_COOKIE_MAX_AGE_SECONDS,
  INVITE_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  readCookie,
} from './session';

describe('session cookies', () => {
  it('uses the secure session cookie and a thirty-minute invite cookie', () => {
    expect(SESSION_COOKIE_NAME).toBe('__Secure-better-auth.session_token');
    expect(INVITE_COOKIE_NAME).toBe('invite');
    expect(INVITE_COOKIE_MAX_AGE_SECONDS).toBe(1800);
  });

  it('reads one cookie and ignores a broken value', () => {
    expect(readCookie(null, 'invite')).toBeNull();
    expect(readCookie('a', 'invite')).toBeNull();
    expect(readCookie('theme=light; invite=abc%2Edef', 'invite')).toBe(
      'abc.def',
    );
    expect(readCookie('invite=%', 'invite')).toBeNull();
    expect(readCookie('other=1', 'invite')).toBeNull();
  });
});
