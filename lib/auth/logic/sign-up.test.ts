import { describe, expect, it } from 'vitest';

import { decideSignUp, type SignUpInvite } from './sign-up';

type PresentInvite = Extract<SignUpInvite, { kind: 'present' }>;

const NOW = new Date('2026-11-18T15:00:00.000Z');
const PHOTO = 'https://lh3.googleusercontent.com/a/ana';

const base = {
  userCount: 4,
  bootstrapEmail: 'owner@example.com',
  adminRoleId: 'a1d00000-0000-4000-8000-000000000001',
  currentTermsVersion: '2026-11-18',
  currentPrivacyVersion: '2026-11-18',
  now: NOW,
};

function errorCode(decision: { ok: boolean; error?: string }): string {
  if (!('error' in decision) || decision.ok || !decision.error) {
    throw new Error('expected a refusal');
  }
  return decision.error;
}

function invite(
  status: 'valid' | 'used' | 'canceled' | 'expired' | 'missing',
  versions: { termsVersion: string; privacyVersion: string } = {
    termsVersion: '2026-11-18',
    privacyVersion: '2026-11-18',
  },
): PresentInvite {
  return {
    kind: 'present',
    id: 'a1d20000-0000-4000-8000-000000000001',
    status,
    createdAt: '2026-11-18T14:00:00.000Z',
    fullName: 'Ana Silva',
    ...versions,
  };
}

describe('decideSignUp', () => {
  it('refuses a profile without a verified email', () => {
    expect(
      decideSignUp({
        ...base,
        profile: {
          email: '  ',
          emailVerified: true,
          name: 'Ana',
          image: null,
        },
        invite: { kind: 'absent' },
      }),
    ).toEqual({ ok: false, error: 'erro' });

    expect(
      errorCode(
        decideSignUp({
          ...base,
          profile: {
            email: 'ana@example.com',
            emailVerified: false,
            name: 'Ana',
            image: null,
          },
          invite: { kind: 'absent' },
          userCount: 0,
        }),
      ),
    ).toBe('email_nao_verificado');
  });

  it('does not turn a broken invite cookie into the first admin', () => {
    const decision = decideSignUp({
      ...base,
      userCount: 0,
      profile: {
        email: 'owner@example.com',
        emailVerified: true,
        name: 'Owner',
        image: null,
      },
      invite: { kind: 'invalid' },
    });
    expect(decision).toEqual({ ok: false, error: 'convite_invalido' });
  });

  it('refuses an invitation that is missing, used, canceled, or expired', () => {
    const profile = {
      email: 'ana@example.com',
      emailVerified: true,
      name: 'Ana',
      image: null,
    };
    expect(
      decideSignUp({ ...base, profile, invite: invite('missing') }),
    ).toEqual({
      ok: false,
      error: 'convite_invalido',
    });
    expect(
      errorCode(decideSignUp({ ...base, profile, invite: invite('used') })),
    ).toBe('convite_invalido');
    expect(
      errorCode(decideSignUp({ ...base, profile, invite: invite('canceled') })),
    ).toBe('convite_invalido');
    expect(
      errorCode(decideSignUp({ ...base, profile, invite: invite('expired') })),
    ).toBe('convite_expirado');
  });

  it('refuses an invitation accepted under older documents', () => {
    const decision = decideSignUp({
      ...base,
      profile: {
        email: 'ana@example.com',
        emailVerified: true,
        name: 'Ana',
        image: null,
      },
      invite: invite('valid', {
        termsVersion: '2026-01-01',
        privacyVersion: '2026-11-18',
      }),
    });
    expect(decision).toEqual({ ok: false, error: 'termos_obrigatorios' });

    expect(
      errorCode(
        decideSignUp({
          ...base,
          profile: {
            email: 'ana@example.com',
            emailVerified: true,
            name: 'Ana',
            image: null,
          },
          invite: invite('valid', {
            termsVersion: '2026-11-18',
            privacyVersion: '2026-01-01',
          }),
        }),
      ),
    ).toBe('termos_obrigatorios');
  });

  it('creates an invited user with the current documents and no role', () => {
    const decision = decideSignUp({
      ...base,
      profile: {
        email: 'ana@example.com',
        emailVerified: true,
        name: '  ',
        image: 'http://evil.example/a.png',
      },
      invite: invite('valid'),
    });
    expect(decision).toEqual({
      ok: true,
      path: 'invitation',
      fields: {
        name: 'ana',
        fullName: 'Ana Silva',
        image: null,
        photoSource: 'none',
        roleId: null,
        termsVersion: '2026-11-18',
        termsAcceptedAt: NOW.toISOString(),
        privacyNoticeVersion: '2026-11-18',
        privacyNoticeAcknowledgedAt: NOW.toISOString(),
        invitedAt: '2026-11-18T14:00:00.000Z',
        registeredAt: NOW.toISOString(),
      },
    });
  });

  it('claims the first admin only for the configured verified email', () => {
    const decision = decideSignUp({
      ...base,
      userCount: 0,
      bootstrapEmail: '  Owner@Example.com ',
      profile: {
        email: 'owner@example.com',
        emailVerified: true,
        name: 'Owner',
        image: PHOTO,
      },
      invite: { kind: 'absent' },
    });
    expect(decision.ok).toBe(true);
    if (!decision.ok) return;
    expect(decision.path).toBe('first_admin');
    expect(decision.fields.roleId).toBe(base.adminRoleId);
    expect(decision.fields.image).toBe(PHOTO);
    expect(decision.fields.photoSource).toBe('provider');
    expect(decision.fields.termsVersion).toBeNull();
    expect(decision.fields.invitedAt).toBeNull();
    expect(decision.fields.fullName).toBeNull();
  });

  it('copies the invitation full name and refuses a blank one', () => {
    const profile = {
      email: 'ana@example.com',
      emailVerified: true,
      name: 'Ana Google',
      image: null,
    };
    const named = decideSignUp({
      ...base,
      profile,
      invite: { ...invite('valid'), fullName: '  Ana   Silva  ' },
    });
    expect(named.ok).toBe(true);
    if (!named.ok) return;
    expect(named.fields.fullName).toBe('Ana   Silva');
    expect(named.fields.name).toBe('Ana Google');

    expect(
      errorCode(
        decideSignUp({
          ...base,
          profile,
          invite: { ...invite('valid'), fullName: '   ' },
        }),
      ),
    ).toBe('erro');
  });

  it('refuses everyone else', () => {
    const profile = {
      email: 'owner@example.com',
      emailVerified: true,
      name: 'Owner',
      image: null,
    };
    expect(
      errorCode(
        decideSignUp({
          ...base,
          userCount: 1,
          profile,
          invite: { kind: 'absent' },
        }),
      ),
    ).toBe('acesso_negado');
    expect(
      errorCode(
        decideSignUp({
          ...base,
          userCount: 0,
          bootstrapEmail: null,
          profile,
          invite: { kind: 'absent' },
        }),
      ),
    ).toBe('acesso_negado');
    expect(
      errorCode(
        decideSignUp({
          ...base,
          userCount: 0,
          bootstrapEmail: '   ',
          profile,
          invite: { kind: 'absent' },
        }),
      ),
    ).toBe('acesso_negado');
  });
});
