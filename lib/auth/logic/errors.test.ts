import { describe, expect, it } from 'vitest';

import { SIGN_IN_ERRORS, signInErrorText } from './errors';

describe('signInErrorText', () => {
  it('returns nothing when the page has no error', () => {
    expect(signInErrorText(null)).toBeNull();
    expect(signInErrorText(undefined)).toBeNull();
    expect(signInErrorText('')).toBeNull();
  });

  it('uses the fixed text for each known code', () => {
    for (const code of Object.keys(SIGN_IN_ERRORS)) {
      expect(signInErrorText(code)).toBe(
        SIGN_IN_ERRORS[code as keyof typeof SIGN_IN_ERRORS],
      );
    }
  });

  it('hides unknown codes behind the generic text', () => {
    expect(signInErrorText('access_denied')).toBe(SIGN_IN_ERRORS.erro);
    expect(signInErrorText('server_error')).toBe(SIGN_IN_ERRORS.erro);
  });
});
