import { describe, expect, it } from 'vitest';

import {
  addressValues,
  DEFAULT_QUERY,
  fold,
  initialPageSize,
  listQueryBody,
  pageSizeFrom,
  parseUserListQuery,
  selectUserPage,
  type ListedUser,
  type UserListQuery,
} from './list-query';

const ROLE_A = '11111111-1111-4111-8111-111111111111';
const ROLE_B = '22222222-2222-4222-8222-222222222222';

function user(id: string, fields: Partial<ListedUser> = {}): ListedUser {
  return {
    id,
    fullName: null,
    displayName: null,
    email: `${id}@exemplo.com`,
    roleId: null,
    roleName: null,
    state: 'Ativo',
    lastLoginAt: null,
    anonymizedAt: null,
    ...fields,
  };
}

const team = [
  user('u1', {
    fullName: 'Ângela Souza',
    roleId: ROLE_A,
    roleName: 'Estoque',
    lastLoginAt: '2026-11-20T12:00:00.000Z',
  }),
  user('u2', {
    displayName: 'Bruno',
    fullName: 'Bruno Lima',
    roleId: ROLE_B,
    roleName: 'Administrador',
  }),
  user('u3', { fullName: 'Caio Duarte', state: 'Pendente' }),
  user('u4', {
    fullName: 'Débora Reis',
    roleId: ROLE_A,
    roleName: 'Estoque',
    state: 'Desabilitado',
  }),
  user('u5', {
    email: 'anonymized+u5@invalid',
    state: 'Anonimizado',
    anonymizedAt: '2026-11-01T00:00:00.000Z',
  }),
  user('u6', {
    fullName: 'Élio Matos',
    roleId: ROLE_B,
    roleName: 'Administrador',
    state: 'Termos desatualizados',
  }),
];

function query(fields: Partial<UserListQuery> = {}): UserListQuery {
  return { ...DEFAULT_QUERY, pageSize: 24, ...fields };
}

function names(fields: Partial<UserListQuery>): string[] {
  return selectUserPage(team, query(fields)).items.map((item) => item.name);
}

describe('pageSizeFrom', () => {
  it.each([
    ['3', 3],
    [6, 6],
    ['12', 12],
    [' 24 ', 24],
  ])('accepts %s', (value, size) => {
    expect(pageSizeFrom(value)).toBe(size);
  });

  it.each(['5', '0', '-3', 'abc', '', null, undefined, {}, '6.5'])(
    'rejects %s',
    (value) => {
      expect(pageSizeFrom(value)).toBeNull();
    },
  );
});

describe('initialPageSize', () => {
  it('prefers the address bar', () => {
    expect(initialPageSize('12', '24')).toBe(12);
  });

  it('falls back to storage', () => {
    expect(initialPageSize('7', '3')).toBe(3);
    expect(initialPageSize(null, '24')).toBe(24);
  });

  it('defaults to 6', () => {
    expect(initialPageSize(null, 'muitos')).toBe(6);
  });
});

describe('parseUserListQuery', () => {
  it('fills defaults for missing or invalid input', () => {
    expect(parseUserListQuery(null)).toEqual(DEFAULT_QUERY);
    expect(parseUserListQuery('busca')).toEqual(DEFAULT_QUERY);
    expect(
      parseUserListQuery({
        busca: 42,
        estado: 'outro',
        papel: 'admin',
        ordem: 'email',
        direcao: 'up',
        pagina: '0',
        por_pagina: '100',
      }),
    ).toEqual({ ...DEFAULT_QUERY, search: '42' });
  });

  it('reads every valid value', () => {
    expect(
      parseUserListQuery({
        busca: '  ana  ',
        estado: 'termos',
        papel: ROLE_A.toUpperCase(),
        ordem: 'estado',
        direcao: 'desc',
        pagina: '3',
        por_pagina: 12,
      }),
    ).toEqual({
      search: 'ana',
      state: 'termos',
      role: ROLE_A,
      sort: 'estado',
      direction: 'desc',
      page: 3,
      pageSize: 12,
    });
  });

  it('accepts users without a role and limits the search', () => {
    const parsed = parseUserListQuery({
      papel: 'sem-papel',
      busca: 'a'.repeat(150),
    });
    expect(parsed.role).toBe('sem-papel');
    expect(parsed.search).toHaveLength(100);
  });
});

describe('addressValues and listQueryBody', () => {
  it('keeps only the page size for the default query', () => {
    expect(addressValues(DEFAULT_QUERY)).toEqual({ por_pagina: '6' });
  });

  it('never puts the search term in the address bar', () => {
    const changed = query({
      search: 'ana@exemplo.com',
      state: 'ativo',
      role: 'sem-papel',
      sort: 'papel',
      direction: 'desc',
      page: 2,
    });
    expect(addressValues(changed)).toEqual({
      estado: 'ativo',
      papel: 'sem-papel',
      ordem: 'papel',
      direcao: 'desc',
      pagina: '2',
      por_pagina: '24',
    });
    expect(listQueryBody(changed).busca).toBe('ana@exemplo.com');
  });

  it('round-trips through the parser', () => {
    const changed = query({ search: 'x', state: 'pendente', page: 4 });
    expect(parseUserListQuery(listQueryBody(changed))).toEqual(changed);
  });
});

describe('fold', () => {
  it('drops accents and case', () => {
    expect(fold('ÂNGELA Élio ç')).toBe('angela elio c');
  });
});

describe('selectUserPage', () => {
  it('sorts by person name in pt-BR order with anonymized people last', () => {
    expect(names({})).toEqual([
      'Ângela Souza',
      'Bruno',
      'Caio Duarte',
      'Débora Reis',
      'Élio Matos',
      'Usuário removido',
    ]);
    expect(names({ direction: 'desc' })).toEqual([
      'Élio Matos',
      'Débora Reis',
      'Caio Duarte',
      'Bruno',
      'Ângela Souza',
      'Usuário removido',
    ]);
  });

  it('sorts by role with people without a role last', () => {
    expect(names({ sort: 'papel' })).toEqual([
      'Bruno',
      'Élio Matos',
      'Ângela Souza',
      'Débora Reis',
      'Caio Duarte',
      'Usuário removido',
    ]);
    expect(names({ sort: 'papel', direction: 'desc' })).toEqual([
      'Ângela Souza',
      'Débora Reis',
      'Bruno',
      'Élio Matos',
      'Caio Duarte',
      'Usuário removido',
    ]);
  });

  it('sorts by state in lifecycle order', () => {
    expect(names({ sort: 'estado' })).toEqual([
      'Ângela Souza',
      'Bruno',
      'Caio Duarte',
      'Élio Matos',
      'Débora Reis',
      'Usuário removido',
    ]);
    expect(names({ sort: 'estado', direction: 'desc' })[0]).toBe(
      'Usuário removido',
    );
  });

  it('breaks ties by name and then by id', () => {
    const twins = [
      user('b', { fullName: 'Ana' }),
      user('a', { fullName: 'Ana' }),
      user('c', { fullName: 'ana' }),
    ];
    expect(selectUserPage(twins, query()).items.map((item) => item.id)).toEqual(
      ['a', 'b', 'c'],
    );
    expect(
      selectUserPage(
        [
          user('z', { anonymizedAt: 'x', state: 'Anonimizado' }),
          user('y', { anonymizedAt: 'x', state: 'Anonimizado' }),
        ],
        query(),
      ).items.map((item) => item.id),
    ).toEqual(['y', 'z']);
  });

  it('searches names and emails ignoring case and accents', () => {
    expect(names({ search: 'angela' })).toEqual(['Ângela Souza']);
    expect(names({ search: 'LIMA' })).toEqual(['Bruno']);
    expect(names({ search: 'u3@exemplo' })).toEqual(['Caio Duarte']);
    expect(names({ search: 'ninguém' })).toEqual([]);
  });

  it('never matches the placeholder email of anonymized people', () => {
    expect(names({ search: 'invalid' })).toEqual([]);
    expect(names({ search: 'anonymized' })).toEqual([]);
  });

  it('filters by state and role', () => {
    expect(names({ state: 'pendente' })).toEqual(['Caio Duarte']);
    expect(names({ state: 'termos' })).toEqual(['Élio Matos']);
    expect(names({ role: ROLE_A })).toEqual(['Ângela Souza', 'Débora Reis']);
    expect(names({ role: 'sem-papel' })).toEqual([
      'Caio Duarte',
      'Usuário removido',
    ]);
    expect(names({ role: '33333333-3333-4333-8333-333333333333' })).toEqual([]);
  });

  it('returns only card fields and hides the anonymized email', () => {
    const page = selectUserPage(team, query());
    expect(page.items[0]).toEqual({
      id: 'u1',
      name: 'Ângela Souza',
      email: 'u1@exemplo.com',
      roleName: 'Estoque',
      state: 'Ativo',
      lastLoginAt: '2026-11-20T12:00:00.000Z',
    });
    expect(page.items[5].email).toBeNull();
  });

  it('pages with a partial last page', () => {
    const first = selectUserPage(team, query({ pageSize: 3 }));
    expect(first).toMatchObject({ total: 6, page: 1, pageSize: 3 });
    expect(first.items).toHaveLength(3);
    const last = selectUserPage(team, query({ pageSize: 12, page: 1 }));
    expect(last.items).toHaveLength(6);
    const second = selectUserPage(
      team.slice(0, 5),
      query({ pageSize: 3, page: 2 }),
    );
    expect(second.items.map((item) => item.id)).toEqual(['u4', 'u5']);
  });

  it('clamps a page past the end to the last page', () => {
    expect(selectUserPage(team, query({ pageSize: 3, page: 9 })).page).toBe(2);
    expect(selectUserPage([], query({ page: 4 }))).toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: 24,
    });
  });
});
