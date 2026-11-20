import { describe, expect, it } from 'vitest';

import { ADMIN_ROLE_ID } from '@/db/seeds/ids';
import { TERMS_VERSION } from '@/lib/legal/versions';

import {
  anonymizedEmail,
  avatarInitials,
  confirmationMatches,
  decideUserChange,
  DISPLAY_NAME_MAX,
  FULL_NAME_MAX,
  isActiveAdmin,
  isUuid,
  knownUserChange,
  LAST_ADMIN_MESSAGE,
  mutationErrorText,
  personName,
  profileChanges,
  profilePhotoChoice,
  userChangeMessage,
  userStateLabel,
  type AccountSnapshot,
} from './rules';

const ADMIN = ADMIN_ROLE_ID;
const OTHER = 'a1d00000-0000-4000-8000-000000000002';
const ACTOR = 'a1d10000-0000-4000-8000-000000000099';
const TARGET = 'a1d10000-0000-4000-8000-000000000010';

function account(overrides: Partial<AccountSnapshot> = {}): AccountSnapshot {
  return {
    id: TARGET,
    roleId: OTHER,
    disabledAt: null,
    anonymizedAt: null,
    ...overrides,
  };
}

function decide(
  change: Parameters<typeof decideUserChange>[0]['change'],
  overrides: Partial<Parameters<typeof decideUserChange>[0]> = {},
) {
  return decideUserChange({
    actorId: ACTOR,
    target: account(),
    change,
    adminRoleId: ADMIN,
    activeAdminCount: 2,
    actedInAudit: false,
    ...overrides,
  });
}

describe('user changes', () => {
  it('recognizes an active admin and a uuid', () => {
    expect(isActiveAdmin(account({ roleId: ADMIN }), ADMIN)).toBe(true);
    expect(
      isActiveAdmin(account({ roleId: ADMIN, disabledAt: 'x' }), ADMIN),
    ).toBe(false);
    expect(
      isActiveAdmin(account({ roleId: ADMIN, anonymizedAt: 'x' }), ADMIN),
    ).toBe(false);
    expect(isActiveAdmin(account(), ADMIN)).toBe(false);
    expect(isUuid(TARGET)).toBe(true);
    expect(isUuid('nope')).toBe(false);
  });

  it('refuses a missing, anonymized, or self target', () => {
    expect(decide({ kind: 'disable' }, { target: null })).toEqual({
      ok: false,
      reason: 'missing',
    });
    expect(
      decide(
        { kind: 'enable' },
        { target: account({ anonymizedAt: '2026-01-01T00:00:00.000Z' }) },
      ).ok,
    ).toBe(false);
    expect(decide({ kind: 'disable' }, { actorId: TARGET })).toEqual({
      ok: false,
      reason: 'self',
    });
    expect(decide({ kind: 'update_full_name' }, { actorId: TARGET })).toEqual({
      ok: true,
    });
  });

  it('keeps the last active admin', () => {
    const admin = account({ roleId: ADMIN });
    expect(
      decide({ kind: 'disable' }, { target: admin, activeAdminCount: 1 }),
    ).toEqual({ ok: false, reason: 'last_admin' });
    expect(
      decide(
        { kind: 'change_role', roleId: null },
        { target: admin, activeAdminCount: 1 },
      ),
    ).toEqual({ ok: false, reason: 'last_admin' });
    expect(
      decide(
        { kind: 'change_role', roleId: ADMIN },
        { target: admin, activeAdminCount: 1 },
      ),
    ).toEqual({ ok: true });
    expect(
      decide({ kind: 'disable' }, { target: admin, activeAdminCount: 2 }),
    ).toEqual({ ok: true });
  });

  it('disables, enables, deletes, and anonymizes only from the allowed state', () => {
    expect(decide({ kind: 'disable' })).toEqual({ ok: true });
    expect(
      decide({ kind: 'disable' }, { target: account({ disabledAt: 'x' }) }),
    ).toEqual({ ok: false, reason: 'already_disabled' });
    expect(decide({ kind: 'enable' })).toEqual({
      ok: false,
      reason: 'not_disabled',
    });
    expect(
      decide({ kind: 'enable' }, { target: account({ disabledAt: 'x' }) }),
    ).toEqual({ ok: true });
    expect(decide({ kind: 'delete' })).toEqual({
      ok: false,
      reason: 'still_active',
    });
    expect(
      decide(
        { kind: 'delete' },
        { target: account({ roleId: null }), actedInAudit: true },
      ),
    ).toEqual({ ok: false, reason: 'has_audit' });
    expect(
      decide({ kind: 'delete' }, { target: account({ disabledAt: 'x' }) }),
    ).toEqual({ ok: true });
    expect(decide({ kind: 'anonymize' })).toEqual({
      ok: false,
      reason: 'not_disabled',
    });
    expect(
      decide({ kind: 'anonymize' }, { target: account({ disabledAt: 'x' }) }),
    ).toEqual({ ok: true });
    expect(decide({ kind: 'change_role', roleId: OTHER })).toEqual({
      ok: true,
    });
  });

  it('maps every refusal to fixed Portuguese text', () => {
    const reasons = [
      'missing',
      'self',
      'last_admin',
      'anonymized',
      'already_disabled',
      'not_disabled',
      'still_active',
      'has_audit',
    ] as const;
    for (const reason of reasons) {
      expect(knownUserChange(reason)).toBe(reason);
      expect(userChangeMessage(reason).length).toBeGreaterThan(0);
    }
    expect(userChangeMessage('last_admin')).toBe(LAST_ADMIN_MESSAGE);
    expect(knownUserChange('other')).toBeNull();
    expect(mutationErrorText(undefined)).toBeNull();
    expect(mutationErrorText('last_admin')).toBe(LAST_ADMIN_MESSAGE);
    expect(mutationErrorText('invalid_name')).toBe('Informe o nome completo.');
    expect(mutationErrorText('role_missing')).toBe('Papel não encontrado.');
    expect(mutationErrorText('confirmation')).toContain('nome completo');
    expect(mutationErrorText('photo')).toContain('foto');
    expect(mutationErrorText('display_name')).toContain(
      String(DISPLAY_NAME_MAX),
    );
    expect(mutationErrorText('nope')).toBeNull();
  });
});

describe('profile and labels', () => {
  it('accepts a trimmed name inside the limit', () => {
    expect(personName('  Ana   Silva ', DISPLAY_NAME_MAX)).toBe('Ana Silva');
    expect(personName('   ', DISPLAY_NAME_MAX)).toBeNull();
    expect(personName('a'.repeat(FULL_NAME_MAX + 1), FULL_NAME_MAX)).toBeNull();
  });

  it('keeps a stored Google photo available after choosing none', () => {
    const url = 'https://lh3.googleusercontent.com/a/photo';
    expect(profilePhotoChoice('none', url)).toBe('none');
    expect(profilePhotoChoice('provider', url)).toBe('provider');
    expect(profilePhotoChoice('provider', null)).toBeNull();
    expect(profilePhotoChoice('provider', 'https://evil.example/a.png')).toBe(
      null,
    );
    expect(profilePhotoChoice('other', url)).toBeNull();
  });

  it('lists only the profile fields that changed', () => {
    expect(
      profileChanges({
        displayName: 'Ana',
        previousDisplayName: 'Ana',
        photo: 'none',
        previousPhoto: 'none',
      }),
    ).toEqual([]);
    expect(
      profileChanges({
        displayName: 'Ana Costa',
        previousDisplayName: null,
        photo: 'provider',
        previousPhoto: 'none',
      }),
    ).toEqual(['display_name', 'photo_source']);
    expect(
      profileChanges({
        displayName: ' ',
        previousDisplayName: 'Ana',
        photo: 'none',
        previousPhoto: 'none',
      }),
    ).toBeNull();
  });

  it('builds initials, the anonymized mailbox, and the state label', () => {
    expect(avatarInitials(null)).toBe('?');
    expect(avatarInitials('  ')).toBe('?');
    expect(avatarInitials('ana')).toBe('A');
    expect(avatarInitials('ana silva costa')).toBe('AS');
    expect(confirmationMatches('Ana', 'Ana')).toBe(true);
    expect(confirmationMatches('Ana', '')).toBe(false);
    expect(confirmationMatches('ana', 'Ana')).toBe(false);
    expect(anonymizedEmail(TARGET)).toBe(`anonymized+${TARGET}@invalid`);
    const base = {
      anonymizedAt: null,
      disabledAt: null,
      roleId: OTHER,
      termsVersion: TERMS_VERSION,
      privacyNoticeVersion: TERMS_VERSION,
    };
    expect(userStateLabel({ ...base, anonymizedAt: 'x' })).toBe('Anonimizado');
    expect(userStateLabel({ ...base, disabledAt: 'x' })).toBe('Desabilitado');
    expect(userStateLabel({ ...base, termsVersion: 'old' })).toBe(
      'Termos desatualizados',
    );
    expect(userStateLabel({ ...base, privacyNoticeVersion: null })).toBe(
      'Termos desatualizados',
    );
    expect(userStateLabel({ ...base, roleId: null })).toBe('Pendente');
    expect(userStateLabel(base)).toBe('Ativo');
  });
});
