import { describe, expect, it } from 'vitest';

import {
  PRIVACY_NOTICE_VERSION,
  TERMS_VERSION,
  legalVersionDate,
} from './versions';

describe('legal versions', () => {
  it('publishes a date version for both documents', () => {
    expect(TERMS_VERSION).toBe('2026-11-20');
    expect(PRIVACY_NOTICE_VERSION).toBe(TERMS_VERSION);
    expect(legalVersionDate(TERMS_VERSION)).toBe('20 de novembro de 2026');
  });
});

describe('legalVersionDate', () => {
  it('formats the first day of a month without a leading zero', () => {
    expect(legalVersionDate('2026-01-01')).toBe('1 de janeiro de 2026');
  });

  it('rejects a version that is not a real calendar day', () => {
    expect(() => legalVersionDate('18/11/2026')).toThrow(
      'Invalid legal version.',
    );
    expect(() => legalVersionDate('2026-02-31')).toThrow(
      'Invalid legal version.',
    );
    expect(() => legalVersionDate('2026-13-01')).toThrow(
      'Invalid legal version.',
    );
  });
});
