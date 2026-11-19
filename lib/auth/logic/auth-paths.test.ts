import { describe, expect, it } from 'vitest';

import { isEnabledAuthPath, normalizeAuthPath } from './auth-paths';

describe('auth paths', () => {
  it('normalizes the base path and a trailing slash', () => {
    expect(normalizeAuthPath('/api/auth/get-session/')).toBe('/get-session');
    expect(normalizeAuthPath('get-session')).toBe('/get-session');
    expect(normalizeAuthPath('/')).toBe('/');
    expect(normalizeAuthPath('/api/auth')).toBe('/');
  });

  it('allows only social sign-in, the callback, and get-session', () => {
    expect(isEnabledAuthPath('/sign-in/social')).toBe(true);
    expect(isEnabledAuthPath('/api/auth/get-session')).toBe(true);
    expect(isEnabledAuthPath('/callback/google')).toBe(true);
    expect(isEnabledAuthPath('/callback/:id')).toBe(true);
    expect(isEnabledAuthPath('/sign-out')).toBe(false);
    expect(isEnabledAuthPath('/callback')).toBe(false);
    expect(isEnabledAuthPath('/callback/google/extra')).toBe(false);
    expect(isEnabledAuthPath('/reset-password/token')).toBe(false);
  });
});
