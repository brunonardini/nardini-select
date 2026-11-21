import { describe, expect, it } from 'vitest';

import {
  MAX_SESSION_AGE_MS,
  allowsMutationOrigin,
  accountAvatarSrc,
  decideAccess,
  sessionWithinLimit,
  viewerState,
  type Viewer,
} from './access';

const NOW = new Date('2026-11-18T15:00:00.000Z');

function viewer(overrides: Partial<Viewer> = {}): Viewer {
  return {
    id: 'a1d00000-0000-4000-8000-000000000010',
    email: 'ana@example.com',
    displayName: 'Ana',
    fullName: 'Ana Silva',
    photo: false,
    roleId: 'a1d00000-0000-4000-8000-000000000002',
    isAdmin: false,
    state: 'active',
    termsAcceptedAt: '2026-11-01T00:00:00.000Z',
    sessionCreatedAt: '2026-11-18T14:00:00.000Z',
    ...overrides,
  };
}

describe('viewerState', () => {
  const current = {
    currentTermsVersion: '2026-11-18',
    currentPrivacyVersion: '2026-11-18',
  };

  it('asks for the documents when either version is missing or old', () => {
    expect(
      viewerState({
        ...current,
        roleId: 'role',
        termsVersion: null,
        privacyNoticeVersion: '2026-11-18',
      }),
    ).toBe('terms_outdated');
    expect(
      viewerState({
        ...current,
        roleId: null,
        termsVersion: '2026-11-18',
        privacyNoticeVersion: '2026-01-01',
      }),
    ).toBe('terms_outdated');
  });

  it('is pending without a role and active with one', () => {
    expect(
      viewerState({
        ...current,
        roleId: null,
        termsVersion: '2026-11-18',
        privacyNoticeVersion: '2026-11-18',
      }),
    ).toBe('pending');
    expect(
      viewerState({
        ...current,
        roleId: 'role',
        termsVersion: '2026-11-18',
        privacyNoticeVersion: '2026-11-18',
      }),
    ).toBe('active');
  });
});

describe('sessionWithinLimit', () => {
  it('allows a session up to seven days old', () => {
    const created = new Date(NOW.getTime() - MAX_SESSION_AGE_MS).toISOString();
    expect(sessionWithinLimit(created, NOW)).toBe(true);
    expect(
      sessionWithinLimit(
        new Date(NOW.getTime() - MAX_SESSION_AGE_MS - 1).toISOString(),
        NOW,
      ),
    ).toBe(false);
    expect(sessionWithinLimit('not-a-date', NOW)).toBe(false);
  });
});

describe('decideAccess', () => {
  it('sends a missing or expired session to sign in', () => {
    expect(decideAccess(null, { allow: ['active'] }, NOW)).toEqual({
      kind: 'sign_in',
    });
    expect(
      decideAccess(
        viewer({
          sessionCreatedAt: new Date(
            NOW.getTime() - MAX_SESSION_AGE_MS - 1,
          ).toISOString(),
        }),
        { allow: ['active'] },
        NOW,
      ),
    ).toEqual({ kind: 'sign_in' });
  });

  it('redirects a viewer whose state is not allowed', () => {
    expect(
      decideAccess(
        viewer({ state: 'terms_outdated' }),
        { allow: ['active'] },
        NOW,
      ),
    ).toEqual({ kind: 'redirect', to: '/admin/termos/aceitar' });
    expect(
      decideAccess(
        viewer({ state: 'pending', roleId: null }),
        { allow: ['active'] },
        NOW,
      ),
    ).toEqual({ kind: 'redirect', to: '/admin' });
    expect(
      decideAccess(viewer({ state: 'active' }), { allow: ['pending'] }, NOW),
    ).toEqual({ kind: 'redirect', to: '/admin' });
  });

  it('forbids a non-admin on an admin-only entry and allows everyone else', () => {
    expect(
      decideAccess(
        viewer({ isAdmin: false }),
        { allow: ['active'], adminOnly: true },
        NOW,
      ),
    ).toEqual({ kind: 'forbidden' });
    expect(
      decideAccess(
        viewer({ isAdmin: true }),
        { allow: ['active'], adminOnly: true },
        NOW,
      ),
    ).toEqual({ kind: 'allow' });
    expect(decideAccess(viewer(), { allow: ['active'] }, NOW)).toEqual({
      kind: 'allow',
    });
  });
});

describe('allowsMutationOrigin', () => {
  const siteUrl = 'https://nardiniselect.com.br';

  it('allows safe methods and same-origin mutations', () => {
    expect(
      allowsMutationOrigin({
        method: 'get',
        secFetchSite: null,
        origin: null,
        siteUrl,
      }),
    ).toBe(true);
    expect(
      allowsMutationOrigin({
        method: 'HEAD',
        secFetchSite: 'cross-site',
        origin: null,
        siteUrl,
      }),
    ).toBe(true);
    expect(
      allowsMutationOrigin({
        method: 'POST',
        secFetchSite: 'same-origin',
        origin: null,
        siteUrl,
      }),
    ).toBe(true);
    expect(
      allowsMutationOrigin({
        method: 'POST',
        secFetchSite: null,
        origin: 'https://nardiniselect.com.br',
        siteUrl,
      }),
    ).toBe(true);
  });

  it('rejects a cross-site mutation', () => {
    expect(
      allowsMutationOrigin({
        method: 'POST',
        secFetchSite: 'cross-site',
        origin: null,
        siteUrl,
      }),
    ).toBe(false);
    expect(
      allowsMutationOrigin({
        method: 'POST',
        secFetchSite: null,
        origin: 'https://evil.example',
        siteUrl,
      }),
    ).toBe(false);
    expect(
      allowsMutationOrigin({
        method: 'POST',
        secFetchSite: null,
        origin: 'not a url',
        siteUrl: 'not a url',
      }),
    ).toBe(false);
  });
});

describe('accountAvatarSrc', () => {
  it('points at the avatar route when a photo can be served', () => {
    const person = viewer({ photo: true });
    expect(accountAvatarSrc(person)).toBe(`/admin/api/avatar/${person.id}`);
    expect(accountAvatarSrc(viewer({ photo: true, state: 'pending' }))).toBe(
      `/admin/api/avatar/${person.id}`,
    );
  });

  it('keeps initials when there is no photo or the terms are outdated', () => {
    expect(accountAvatarSrc(viewer())).toBeNull();
    expect(
      accountAvatarSrc(viewer({ photo: true, state: 'terms_outdated' })),
    ).toBeNull();
  });
});
