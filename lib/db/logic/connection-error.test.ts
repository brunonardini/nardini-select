import { describe, expect, it } from 'vitest';
import { isDatabaseConnectionError } from './connection-error';

describe('isDatabaseConnectionError', () => {
  it.each([
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    'EHOSTUNREACH',
    'ENETUNREACH',
    '53300',
    '57P01',
    '57P02',
    '57P03',
    '08001',
    '08006',
    '08P01',
  ])('recognizes connection code %s', (code) => {
    expect(isDatabaseConnectionError({ code })).toBe(true);
  });
  it('finds wrapped and aggregate connection failures', () => {
    const cause = Object.assign(new Error('private host'), {
      code: 'ECONNREFUSED',
    });
    expect(isDatabaseConnectionError(new Error('wrapped', { cause }))).toBe(
      true,
    );
    expect(
      isDatabaseConnectionError(
        new AggregateError([new Error('other'), cause]),
      ),
    ).toBe(true);
  });
  it.each([
    null,
    undefined,
    false,
    0,
    'ECONNREFUSED',
    new Error('SQL failed'),
    { code: 8006 },
    { code: '23505' },
    { code: '42P01' },
    { code: '08000-extra' },
    { errors: 'not an array' },
  ])('keeps unrelated failures generic: %s', (error) => {
    expect(isDatabaseConnectionError(error)).toBe(false);
  });
  it('terminates for cyclic and repeated causes', () => {
    const failure: { cause?: unknown; errors: unknown[] } = { errors: [] };
    failure.cause = failure;
    failure.errors.push(failure);
    expect(isDatabaseConnectionError(failure)).toBe(false);
  });
});
