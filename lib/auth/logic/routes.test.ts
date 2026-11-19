import { describe, expect, it } from 'vitest';

import { guardedRoutes, publicAdminFiles } from './routes';

describe('route table', () => {
  it('keeps the later admin pages admin-only and the home open to pending users', () => {
    const home = guardedRoutes.find(
      (route) => route.file === 'app/admin/page.tsx',
    );
    expect(home).toMatchObject({
      allow: ['pending', 'active'],
      adminOnly: false,
    });
    expect(
      guardedRoutes.find(
        (route) => route.file === 'app/admin/usuarios/page.tsx',
      ),
    ).toMatchObject({ allow: ['active'], adminOnly: true });
    expect(
      guardedRoutes.find(
        (route) => route.file === 'app/admin/termos/aceitar/page.tsx',
      )?.allow,
    ).toEqual(['terms_outdated']);
  });

  it('does not list the acceptance page as public', () => {
    expect(publicAdminFiles).not.toContain('app/admin/termos/aceitar/page.tsx');
    expect(publicAdminFiles).toContain('app/admin/entrar/page.tsx');
  });
});
