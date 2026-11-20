'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { browserStorage } from '@/lib/browser-storage/io/browser-storage';
import {
  addressValues,
  initialPageSize,
  listQueryBody,
  PAGE_SIZE_KEY,
  pageSizeFrom,
  parseUserListQuery,
  type PageSize,
  type UserListQuery,
  type UserPage,
} from '@/lib/users/logic/list-query';

export const SEARCH_DELAY_MS = 700;
export const LIST_ENDPOINT = '/admin/api/usuarios';

type Status = 'loading' | 'ready' | 'error';
type Response = { key: string; page: UserPage } | { key: string; page: null };

export type UserList = {
  query: UserListQuery;
  search: string;
  result: UserPage | null;
  status: Status;
  setSearch: (value: string) => void;
  update: (changes: Partial<Omit<UserListQuery, 'search' | 'page'>>) => void;
  goToPage: (page: number) => void;
  setPageSize: (size: PageSize) => void;
  clearAll: () => void;
  retry: () => void;
};

const subscribe = () => () => {};
const readStoredSize = () => browserStorage.getItem(PAGE_SIZE_KEY);
const serverStoredSize = () => null;
const isClient = () => true;
const isServer = () => false;

/**
 * The address bar wins over the server props: Back can restore a cached
 * render whose props predate the values written with replaceState.
 */
function startingPoint(initialQuery: UserListQuery, sized: boolean) {
  if (typeof window === 'undefined') return { query: initialQuery, sized };
  const values = Object.fromEntries(
    new URLSearchParams(window.location.search),
  );
  return {
    query: { ...parseUserListQuery(values), search: initialQuery.search },
    sized: pageSizeFrom(values.por_pagina) !== null,
  };
}

function writeAddress(query: UserListQuery) {
  const params = new URLSearchParams(addressValues(query)).toString();
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}?${params}`,
  );
}

/**
 * Team listing state. The search term waits 700ms after the last keystroke,
 * newer requests abort older ones, and only address-safe values reach the URL.
 */
export function useUserList(
  initialQuery: UserListQuery,
  pageSizeInAddress: boolean,
): UserList {
  const hydrated = useSyncExternalStore(subscribe, isClient, isServer);
  const storedSize = useSyncExternalStore(
    subscribe,
    readStoredSize,
    serverStoredSize,
  );
  const [start] = useState(() =>
    startingPoint(initialQuery, pageSizeInAddress),
  );
  const [chosen, setChosen] = useState(start.query);
  const [sizeChosen, setSizeChosen] = useState(start.sized);
  const [search, setSearchText] = useState(initialQuery.search);
  const [result, setResult] = useState<Response | null>(null);
  const [attempt, setAttempt] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useMemo(
    () =>
      sizeChosen
        ? chosen
        : { ...chosen, pageSize: initialPageSize(null, storedSize) },
    [chosen, sizeChosen, storedSize],
  );
  const key = `${JSON.stringify(query)}#${attempt}`;

  useEffect(() => {
    if (!hydrated) return;
    const controller = new AbortController();
    fetch(LIST_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listQueryBody(query)),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          window.location.reload();
          return;
        }
        if (!response.ok) throw new Error(`List failed: ${response.status}`);
        const page = (await response.json()) as UserPage;
        setResult({ key, page });
        writeAddress({ ...query, page: page.page });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ key, page: null });
      });
    return () => controller.abort();
  }, [hydrated, query, key]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const setSearch = useCallback((value: string) => {
    setSearchText(value);
    if (timer.current) clearTimeout(timer.current);
    const apply = () =>
      setChosen((current) =>
        current.search === value.trim()
          ? current
          : { ...current, search: value.trim(), page: 1 },
      );
    if (value.trim() === '') apply();
    else timer.current = setTimeout(apply, SEARCH_DELAY_MS);
  }, []);

  const update = useCallback<UserList['update']>((changes) => {
    setChosen((current) => ({ ...current, ...changes, page: 1 }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setChosen((current) => ({ ...current, page }));
  }, []);

  const setPageSize = useCallback((pageSize: PageSize) => {
    browserStorage.setItem(PAGE_SIZE_KEY, String(pageSize));
    setSizeChosen(true);
    setChosen((current) => ({ ...current, pageSize, page: 1 }));
  }, []);

  const clearAll = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setSearchText('');
    setChosen((current) => ({
      ...current,
      search: '',
      state: null,
      role: null,
      page: 1,
    }));
  }, []);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  const settled = result?.key === key;
  const lastPage = result?.page ?? null;
  return {
    query,
    search,
    result: lastPage,
    status: settled ? (result.page ? 'ready' : 'error') : 'loading',
    setSearch,
    update,
    goToPage,
    setPageSize,
    clearAll,
    retry,
  };
}
