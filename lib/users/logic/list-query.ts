import { shownPerson } from '@/lib/audit/logic/render';

import { isUuid } from './rules';

export const PAGE_SIZES = [3, 6, 12, 24] as const;
export type PageSize = (typeof PAGE_SIZES)[number];
const DEFAULT_PAGE_SIZE: PageSize = 6;
export const PAGE_SIZE_KEY = 'nardini-select:admin-users:page-size:v1';
const SEARCH_MAX = 100;
export const NO_ROLE = 'sem-papel';

/** Address-bar slug for each state label from `userStateLabel`, in sort order. */
export const STATE_SLUGS = {
  ativo: 'Ativo',
  pendente: 'Pendente',
  termos: 'Termos desatualizados',
  desabilitado: 'Desabilitado',
  anonimizado: 'Anonimizado',
} as const;
type StateSlug = keyof typeof STATE_SLUGS;
const STATE_ORDER: readonly string[] = Object.values(STATE_SLUGS);

const SORT_KEYS = ['pessoa', 'papel', 'estado'] as const;
type SortKey = (typeof SORT_KEYS)[number];
type Direction = 'asc' | 'desc';

export type UserListQuery = {
  search: string;
  state: StateSlug | null;
  role: string | null;
  sort: SortKey;
  direction: Direction;
  page: number;
  pageSize: PageSize;
};

export const DEFAULT_QUERY: UserListQuery = {
  search: '',
  state: null,
  role: null,
  sort: 'pessoa',
  direction: 'asc',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

export type ListedUser = {
  id: string;
  fullName: string | null;
  displayName: string | null;
  email: string;
  roleId: string | null;
  roleName: string | null;
  state: string;
  lastLoginAt: string | null;
  anonymizedAt: string | null;
};

export type UserCard = {
  id: string;
  name: string;
  email: string | null;
  roleName: string | null;
  state: string;
  lastLoginAt: string | null;
};

export type UserPage = {
  items: UserCard[];
  total: number;
  page: number;
  pageSize: PageSize;
};

function text(value: unknown): string {
  if (typeof value === 'number') return String(value);
  return typeof value === 'string' ? value.trim() : '';
}

function positive(value: unknown): number | null {
  const raw = text(value);
  if (!/^\d{1,6}$/.test(raw)) return null;
  const parsed = Number(raw);
  return parsed >= 1 ? parsed : null;
}

/** A stored or requested page size, or null when it is not an allowed value. */
export function pageSizeFrom(value: unknown): PageSize | null {
  const parsed = positive(value);
  return PAGE_SIZES.find((size) => size === parsed) ?? null;
}

function stateFrom(value: unknown): StateSlug | null {
  const raw = text(value);
  return raw in STATE_SLUGS ? (raw as StateSlug) : null;
}

function roleFrom(value: unknown): string | null {
  const raw = text(value);
  if (raw === NO_ROLE) return NO_ROLE;
  return isUuid(raw) ? raw.toLowerCase() : null;
}

/** Validates a request body or address-bar values; invalid values fall back to defaults. */
export function parseUserListQuery(input: unknown): UserListQuery {
  const values =
    typeof input === 'object' && input !== null
      ? (input as Record<string, unknown>)
      : {};
  const sort = text(values.ordem);
  return {
    search: text(values.busca).slice(0, SEARCH_MAX),
    state: stateFrom(values.estado),
    role: roleFrom(values.papel),
    sort: SORT_KEYS.find((key) => key === sort) ?? DEFAULT_QUERY.sort,
    direction: text(values.direcao) === 'desc' ? 'desc' : 'asc',
    page: positive(values.pagina) ?? 1,
    pageSize: pageSizeFrom(values.por_pagina) ?? DEFAULT_PAGE_SIZE,
  };
}

/** Request body for the list endpoint. */
export function listQueryBody(query: UserListQuery): Record<string, string> {
  return {
    ...addressValues(query),
    busca: query.search,
  };
}

/** Values kept in the address bar. The search term is personal data and never goes there. */
export function addressValues(query: UserListQuery): Record<string, string> {
  const values: Record<string, string> = {};
  if (query.state) values.estado = query.state;
  if (query.role) values.papel = query.role;
  if (query.sort !== DEFAULT_QUERY.sort) values.ordem = query.sort;
  if (query.direction !== DEFAULT_QUERY.direction) {
    values.direcao = query.direction;
  }
  if (query.page !== 1) values.pagina = String(query.page);
  values.por_pagina = String(query.pageSize);
  return values;
}

/** Page size for a loading listing: the address bar, then storage, then the default. */
export function initialPageSize(
  fromAddress: string | null,
  fromStorage: string | null,
): PageSize {
  return (
    pageSizeFrom(fromAddress) ?? pageSizeFrom(fromStorage) ?? DEFAULT_PAGE_SIZE
  );
}

/** Lowercase text without accents, for case- and accent-insensitive matching. */
export function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('pt-BR');
}

function matches(user: ListedUser, search: string): boolean {
  if (!search) return true;
  const needle = fold(search);
  const fields = user.anonymizedAt
    ? []
    : [user.displayName, user.fullName, user.email];
  return fields.some((field) => field !== null && fold(field).includes(needle));
}

function inFilters(user: ListedUser, query: UserListQuery): boolean {
  if (query.state && user.state !== STATE_SLUGS[query.state]) return false;
  if (query.role === NO_ROLE) return user.roleId === null;
  if (query.role) return user.roleId === query.role;
  return true;
}

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });

type Row = { user: ListedUser; name: string };

/** Missing values stay last in both directions. */
function compareOptional(
  a: string | null,
  b: string | null,
  sign: number,
): number {
  if (a === null || b === null) {
    if (a === b) return 0;
    return a === null ? 1 : -1;
  }
  return sign * collator.compare(a, b);
}

function primary(a: Row, b: Row, query: UserListQuery): number {
  const sign = query.direction === 'asc' ? 1 : -1;
  if (query.sort === 'estado') {
    return (
      sign *
      (STATE_ORDER.indexOf(a.user.state) - STATE_ORDER.indexOf(b.user.state))
    );
  }
  if (query.sort === 'papel') {
    return compareOptional(a.user.roleName, b.user.roleName, sign);
  }
  return compareOptional(
    a.user.anonymizedAt ? null : a.name,
    b.user.anonymizedAt ? null : b.name,
    sign,
  );
}

function compareRows(a: Row, b: Row, query: UserListQuery): number {
  return (
    primary(a, b, query) ||
    collator.compare(a.name, b.name) ||
    // User IDs are unique, so this settles every remaining tie.
    (a.user.id < b.user.id ? -1 : 1)
  );
}

/** Filters, sorts and slices the team; the page is clamped into range. */
export function selectUserPage(
  users: readonly ListedUser[],
  query: UserListQuery,
): UserPage {
  const rows = users
    .filter((user) => inFilters(user, query) && matches(user, query.search))
    .map((user) => ({ user, name: shownPerson(user) }))
    .sort((a, b) => compareRows(a, b, query));
  const lastPage = Math.max(1, Math.ceil(rows.length / query.pageSize));
  const page = Math.min(query.page, lastPage);
  const start = (page - 1) * query.pageSize;
  return {
    items: rows.slice(start, start + query.pageSize).map(({ user, name }) => ({
      id: user.id,
      name,
      email: user.anonymizedAt ? null : user.email,
      roleName: user.roleName,
      state: user.state,
      lastLoginAt: user.lastLoginAt,
    })),
    total: rows.length,
    page,
    pageSize: query.pageSize,
  };
}
