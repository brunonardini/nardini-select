import { describe, expect, it } from 'vitest';

import { retentionCutoffs } from './cutoffs';

describe('retentionCutoffs', () => {
  it('moves the audit cutoff six calendar months back and keeps the clock time', () => {
    const now = new Date('2026-11-20T06:00:00.123Z');
    expect(retentionCutoffs(now)).toEqual({
      audit: '2026-05-20T06:00:00.123Z',
      invitations: '2026-11-13T06:00:00.123Z',
    });
    expect(now.toISOString()).toBe('2026-11-20T06:00:00.123Z');
  });

  it('crosses a year boundary without clamping a day that exists', () => {
    expect(retentionCutoffs(new Date('2026-01-15T12:00:00.000Z')).audit).toBe(
      '2025-07-15T12:00:00.000Z',
    );
  });

  it('clamps a month-end day that the target month does not have', () => {
    expect(retentionCutoffs(new Date('2026-03-31T00:00:00.000Z')).audit).toBe(
      '2025-09-30T00:00:00.000Z',
    );
    expect(retentionCutoffs(new Date('2026-05-31T23:59:59.000Z')).audit).toBe(
      '2025-11-30T23:59:59.000Z',
    );
    expect(retentionCutoffs(new Date('2026-08-31T23:30:00.000Z')).audit).toBe(
      '2026-02-28T23:30:00.000Z',
    );
  });

  it('keeps 29 February when the target year is a leap year', () => {
    expect(retentionCutoffs(new Date('2024-08-31T23:30:00.000Z')).audit).toBe(
      '2024-02-29T23:30:00.000Z',
    );
  });

  it('rejects an invalid instant', () => {
    expect(() => retentionCutoffs(new Date('not-a-date'))).toThrow(
      'Invalid date.',
    );
  });
});
