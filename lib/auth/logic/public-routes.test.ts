import { describe, expect, it } from 'vitest';

import { isPublicAdminPath } from './public-routes';

describe('isPublicAdminPath', () => {
  it('lists the sign-in, legal, invite, and auth endpoints', () => {
    expect(isPublicAdminPath('/admin/entrar')).toBe(true);
    expect(isPublicAdminPath('/admin/termos')).toBe(true);
    expect(isPublicAdminPath('/admin/privacidade')).toBe(true);
    expect(isPublicAdminPath('/admin/convite/abc')).toBe(true);
    expect(isPublicAdminPath('/admin/convite/abc/iniciar')).toBe(true);
    expect(isPublicAdminPath('/api/auth/callback/google')).toBe(true);
  });

  it('does not treat the rest of the admin area as public', () => {
    expect(isPublicAdminPath('/admin')).toBe(false);
    expect(isPublicAdminPath('/admin/termos/aceitar')).toBe(false);
    expect(isPublicAdminPath('/admin/convite')).toBe(false);
    expect(isPublicAdminPath('/admin/convite/abc/iniciar/extra')).toBe(false);
    expect(isPublicAdminPath('/api/auth')).toBe(false);
  });
});
