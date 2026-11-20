import type { AccessOptions } from './access';

export type GuardedRoute = {
  file: string;
  allow: AccessOptions['allow'];
  adminOnly: boolean;
};

const pendingOrActive = ['pending', 'active'] as const;
const active = ['active'] as const;
const terms = ['terms_outdated'] as const;
const allStates = ['terms_outdated', 'pending', 'active'] as const;

/**
 * B2 route table. Every admin page, action, and route is listed here
 * or in `publicAdminFiles`.
 */
export const guardedRoutes: readonly GuardedRoute[] = [
  { file: 'app/admin/page.tsx', allow: pendingOrActive, adminOnly: false },
  { file: 'app/admin/actions.ts', allow: allStates, adminOnly: false },
  {
    file: 'app/admin/perfil/page.tsx',
    allow: pendingOrActive,
    adminOnly: false,
  },
  {
    file: 'app/admin/perfil/actions.ts',
    allow: pendingOrActive,
    adminOnly: false,
  },
  {
    file: 'app/admin/termos/aceitar/page.tsx',
    allow: terms,
    adminOnly: false,
  },
  {
    file: 'app/admin/termos/aceitar/actions.ts',
    allow: terms,
    adminOnly: false,
  },
  { file: 'app/admin/usuarios/page.tsx', allow: active, adminOnly: true },
  {
    file: 'app/admin/usuarios/[id]/page.tsx',
    allow: active,
    adminOnly: true,
  },
  { file: 'app/admin/usuarios/actions.ts', allow: active, adminOnly: true },
  {
    file: 'app/admin/usuarios/invitation-actions.ts',
    allow: active,
    adminOnly: true,
  },
  { file: 'app/admin/papeis/page.tsx', allow: active, adminOnly: true },
  { file: 'app/admin/papeis/[id]/page.tsx', allow: active, adminOnly: true },
  { file: 'app/admin/papeis/actions.ts', allow: active, adminOnly: true },
  { file: 'app/admin/auditoria/page.tsx', allow: active, adminOnly: true },
  {
    file: 'app/admin/api/avatar/[userId]/route.ts',
    allow: pendingOrActive,
    adminOnly: false,
  },
];

export const publicAdminFiles = [
  'app/admin/entrar/page.tsx',
  'app/admin/convite/[token]/page.tsx',
  'app/admin/convite/[token]/iniciar/route.ts',
  'app/admin/termos/page.tsx',
  'app/admin/privacidade/page.tsx',
] as const;
