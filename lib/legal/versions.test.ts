import { describe, expect, it } from 'vitest';

import { PRIVACY_NOTICE_VERSION, TERMS_VERSION } from './versions';

describe('legal versions', () => {
  it('publishes a date version for both documents', () => {
    expect(TERMS_VERSION).toBe('2026-11-18');
    expect(PRIVACY_NOTICE_VERSION).toBe(TERMS_VERSION);
  });
});
