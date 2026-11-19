import { describe, expect, it } from 'vitest';

import {
  INVITATION_TTL_MS,
  invitationExpiresAt,
  invitationName,
  invitationPageError,
  invitationValidity,
} from './rules';

const NOW = new Date('2026-11-18T15:00:00.000Z');

describe('invitation rules', () => {
  it('expires a new invitation in thirty minutes', () => {
    expect(invitationExpiresAt(NOW)).toBe(
      new Date(NOW.getTime() + INVITATION_TTL_MS).toISOString(),
    );
  });

  it('checks used, then canceled, then expired', () => {
    expect(
      invitationValidity(
        {
          usedAt: NOW.toISOString(),
          canceledAt: NOW.toISOString(),
          expiresAt: '2026-01-01T00:00:00.000Z',
        },
        NOW,
      ),
    ).toBe('used');
    expect(
      invitationValidity(
        {
          usedAt: null,
          canceledAt: NOW.toISOString(),
          expiresAt: '2026-01-01T00:00:00.000Z',
        },
        NOW,
      ),
    ).toBe('canceled');
    expect(
      invitationValidity(
        {
          usedAt: null,
          canceledAt: null,
          expiresAt: NOW.toISOString(),
        },
        NOW,
      ),
    ).toBe('expired');
    expect(
      invitationValidity(
        { usedAt: null, canceledAt: null, expiresAt: 'not-a-date' },
        NOW,
      ),
    ).toBe('expired');
    expect(
      invitationValidity(
        {
          usedAt: null,
          canceledAt: null,
          expiresAt: '2026-11-18T15:30:00.000Z',
        },
        NOW,
      ),
    ).toBe('valid');
  });

  it('trims the invited name and refuses an empty or long one', () => {
    expect(invitationName('  Ana  ')).toBe('Ana');
    expect(invitationName('   ')).toBeNull();
    expect(invitationName('a'.repeat(201))).toBeNull();
  });

  it('maps a status to the page error', () => {
    expect(invitationPageError('valid')).toBeNull();
    expect(invitationPageError('expired')).toBe('convite_expirado');
    expect(invitationPageError('used')).toBe('convite_invalido');
    expect(invitationPageError('canceled')).toBe('convite_invalido');
  });
});
