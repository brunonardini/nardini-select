import { describe, expect, it } from 'vitest';

import { permissionCatalog } from '../catalog';
import { can } from './check';

describe('can', () => {
  const catalog = {
    atendimento: ['orders.read'],
  };

  it('allows a role only the keys in the catalog', () => {
    expect(can({ roleName: 'atendimento' }, 'orders.read', catalog)).toBe(true);
    expect(can({ roleName: 'atendimento' }, 'orders.write', catalog)).toBe(
      false,
    );
    expect(can({ roleName: 'estoque' }, 'orders.read', catalog)).toBe(false);
    expect(can({ roleName: null }, 'orders.read', catalog)).toBe(false);
  });

  it('denies everything while the real catalog is empty', () => {
    expect(can({ roleName: 'admin' }, 'orders.read', permissionCatalog)).toBe(
      false,
    );
  });
});
