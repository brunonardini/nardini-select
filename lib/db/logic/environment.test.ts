import { describe, expect, it } from 'vitest';

import {
  expectedDatabaseName,
  isSeedDatabase,
  postgresTimestamptzToIso,
  toUtcIso,
} from './environment';

describe('expectedDatabaseName', () => {
  it('checks only the production context', () => {
    expect(expectedDatabaseName('production')).toBe('nardini_prod');
    expect(expectedDatabaseName('deploy-preview')).toBeNull();
    expect(expectedDatabaseName('development')).toBeNull();
    expect(expectedDatabaseName('Production')).toBeNull();
    expect(expectedDatabaseName('')).toBeNull();
    expect(expectedDatabaseName(undefined)).toBeNull();
  });
});

describe('isSeedDatabase', () => {
  it('allows the fake-data databases', () => {
    expect(isSeedDatabase('nardini_dev')).toBe(true);
    expect(isSeedDatabase('nardini_test')).toBe(true);
    expect(isSeedDatabase('nardini_stg')).toBe(true);
  });

  it('refuses production and unknown names', () => {
    expect(isSeedDatabase('nardini_prod')).toBe(false);
    expect(isSeedDatabase('postgres')).toBe(false);
    expect(isSeedDatabase('')).toBe(false);
  });
});

describe('toUtcIso', () => {
  it('formats a date as UTC ISO 8601', () => {
    expect(toUtcIso(new Date('2026-11-16T15:04:05.006Z'))).toBe(
      '2026-11-16T15:04:05.006Z',
    );
  });

  it('rejects an invalid date', () => {
    expect(() => toUtcIso(new Date('not-a-date'))).toThrow('Invalid date.');
  });
});

describe('postgresTimestamptzToIso', () => {
  it('converts a Postgres timestamptz string', () => {
    expect(postgresTimestamptzToIso('2026-11-16 12:00:00+00')).toBe(
      '2026-11-16T12:00:00.000Z',
    );
  });

  it('rejects a value that is not a timestamp', () => {
    expect(() => postgresTimestamptzToIso('yesterday')).toThrow(
      'Invalid date.',
    );
  });
});
