import { describe, expect, it } from 'vitest';

import {
  canDeleteRole,
  canRenameRole,
  roleErrorText,
  roleName,
  ROLE_NAME_MAX,
  sameRoleName,
} from './rules';

describe('role rules', () => {
  it('normalizes a short name and rejects a blank or long one', () => {
    expect(roleName('  Caixa   loja ')).toBe('Caixa loja');
    expect(roleName('   ')).toBeNull();
    expect(roleName('a'.repeat(ROLE_NAME_MAX + 1))).toBeNull();
    expect(sameRoleName('Caixa', 'caixa')).toBe(true);
    expect(sameRoleName('Caixa', 'Loja')).toBe(false);
  });

  it('protects the system role and a role that still has users', () => {
    expect(canRenameRole({ isSystem: false })).toBe(true);
    expect(canRenameRole({ isSystem: true })).toBe(false);
    expect(canDeleteRole({ isSystem: false, userCount: 0 })).toBe(true);
    expect(canDeleteRole({ isSystem: false, userCount: 1 })).toBe(false);
    expect(canDeleteRole({ isSystem: true, userCount: 0 })).toBe(false);
    expect(roleErrorText('invalid_name')).toContain('40');
    expect(roleErrorText('system')).toContain('admin');
    expect(roleErrorText('in_use')).toContain('usuários');
    expect(roleErrorText('taken')).toContain('nome');
    expect(roleErrorText('missing')).toBe('Papel não encontrado.');
    expect(roleErrorText(undefined)).toBeNull();
    expect(roleErrorText('nope')).toBeNull();
  });
});
