import { act, renderHook, waitFor } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_QUERY,
  PAGE_SIZE_KEY,
  type UserPage,
} from '@/lib/users/logic/list-query';

import { LIST_ENDPOINT, SEARCH_DELAY_MS, useUserList } from './use-user-list';

const page: UserPage = { items: [], total: 0, page: 1, pageSize: 6 };

function respond(body: UserPage = page, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

const fetchMock = vi.fn<typeof fetch>();

function sentBodies() {
  return fetchMock.mock.calls.map(([, init]) => JSON.parse(String(init?.body)));
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/admin/usuarios');
  fetchMock.mockReset();
  fetchMock.mockImplementation(() => respond());
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useUserList', () => {
  it('posts the first query with the default page size', async () => {
    const { result } = renderHook(() => useUserList(DEFAULT_QUERY, false));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(LIST_ENDPOINT);
    expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');
    expect(sentBodies()[0]).toMatchObject({ busca: '', por_pagina: '6' });
    expect(window.location.search).toBe('?por_pagina=6');
  });

  it('reads the stored page size when the address has none', async () => {
    window.localStorage.setItem(PAGE_SIZE_KEY, '12');
    const { result } = renderHook(() => useUserList(DEFAULT_QUERY, false));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.query.pageSize).toBe(12);
    expect(sentBodies()[0].por_pagina).toBe('12');
  });

  it('lets the address bar win over storage', async () => {
    window.localStorage.setItem(PAGE_SIZE_KEY, '12');
    window.history.replaceState(null, '', '/admin/usuarios?por_pagina=3');
    const { result } = renderHook(() =>
      useUserList({ ...DEFAULT_QUERY, pageSize: 3 }, true),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(sentBodies()[0].por_pagina).toBe('3');
  });

  it('restores the address bar over stale server props', async () => {
    window.history.replaceState(
      null,
      '',
      '/admin/usuarios?pagina=2&por_pagina=3&estado=ativo&busca=ana',
    );
    const { result } = renderHook(() => useUserList(DEFAULT_QUERY, false));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(sentBodies()[0]).toMatchObject({
      pagina: '2',
      por_pagina: '3',
      estado: 'ativo',
      busca: '',
    });
  });

  it('ignores an unknown stored size', async () => {
    window.localStorage.setItem(PAGE_SIZE_KEY, '50');
    const { result } = renderHook(() => useUserList(DEFAULT_QUERY, false));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.query.pageSize).toBe(6);
  });

  it('waits 700ms after the last keystroke before searching', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { result } = renderHook(() => useUserList(DEFAULT_QUERY, false));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    act(() => result.current.setSearch('a'));
    act(() => vi.advanceTimersByTime(300));
    act(() => result.current.setSearch('an'));
    act(() => vi.advanceTimersByTime(300));
    act(() => result.current.setSearch('ana'));
    act(() => vi.advanceTimersByTime(SEARCH_DELAY_MS - 1));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current.search).toBe('ana');
    act(() => vi.advanceTimersByTime(1));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(sentBodies()[1]).toMatchObject({ busca: 'ana' });
    expect(window.location.search).not.toContain('ana');
  });

  it('searches at once when the field is cleared', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { result } = renderHook(() =>
      useUserList({ ...DEFAULT_QUERY, search: 'ana' }, false),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    act(() => result.current.setSearch('anab'));
    act(() => result.current.setSearch('  '));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(sentBodies()[1].busca).toBe('');
    act(() => vi.advanceTimersByTime(SEARCH_DELAY_MS));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not request again for the same search', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { result } = renderHook(() => useUserList(DEFAULT_QUERY, false));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    act(() => result.current.setSearch('ana'));
    act(() => vi.advanceTimersByTime(SEARCH_DELAY_MS));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    act(() => result.current.setSearch('ana '));
    act(() => vi.advanceTimersByTime(SEARCH_DELAY_MS));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('aborts a request that a newer one replaces', async () => {
    fetchMock.mockImplementationOnce((_input, init) => {
      return new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        const abort = () =>
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        if (!signal) return;
        if (signal.aborted) {
          abort();
          return;
        }
        signal.addEventListener('abort', abort, { once: true });
      });
    });
    const { result } = renderHook(() => useUserList(DEFAULT_QUERY, false));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    act(() => result.current.goToPage(2));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(sentBodies()[1].pagina).toBe('2');
  });

  it('resets to page one on filter changes and keeps the returned page', async () => {
    fetchMock.mockImplementation(() => respond({ ...page, page: 3 }));
    window.history.replaceState(null, '', '/admin/usuarios?pagina=9');
    const { result } = renderHook(() =>
      useUserList({ ...DEFAULT_QUERY, page: 9 }, false),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.result?.page).toBe(3);
    expect(window.location.search).toContain('pagina=3');
    act(() => result.current.update({ state: 'pendente' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(sentBodies()[1]).toMatchObject({ estado: 'pendente' });
    expect(sentBodies()[1].pagina).toBeUndefined();
  });

  it('saves a new page size and returns to page one', async () => {
    window.history.replaceState(null, '', '/admin/usuarios?pagina=2');
    const { result } = renderHook(() =>
      useUserList({ ...DEFAULT_QUERY, page: 2 }, false),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    act(() => result.current.setPageSize(24));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(window.localStorage.getItem(PAGE_SIZE_KEY)).toBe('24');
    expect(sentBodies()[0].pagina).toBe('2');
    expect(sentBodies()[1]).toMatchObject({ por_pagina: '24' });
    expect(sentBodies()[1].pagina).toBeUndefined();
  });

  it('clears the search and filters together', async () => {
    window.history.replaceState(
      null,
      '',
      '/admin/usuarios?estado=ativo&papel=sem-papel',
    );
    const { result } = renderHook(() =>
      useUserList(
        { ...DEFAULT_QUERY, search: 'x', state: 'ativo', role: 'sem-papel' },
        false,
      ),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    act(() => result.current.clearAll());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(result.current.search).toBe('');
    expect(sentBodies()[1]).toMatchObject({ busca: '' });
    expect(sentBodies()[1].estado).toBeUndefined();
    expect(sentBodies()[1].papel).toBeUndefined();
  });

  it('shows an error and retries the same query', async () => {
    fetchMock.mockImplementationOnce(() => respond(page, 500));
    const { result } = renderHook(() => useUserList(DEFAULT_QUERY, false));
    await waitFor(() => expect(result.current.status).toBe('error'));
    act(() => result.current.retry());
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(sentBodies()[1]).toEqual(sentBodies()[0]);
  });

  it('treats a network failure as an error', async () => {
    fetchMock.mockImplementationOnce(() => Promise.reject(new TypeError()));
    const { result } = renderHook(() => useUserList(DEFAULT_QUERY, false));
    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it.each([401, 403])('reloads the page on %s', async (status) => {
    const reload = vi.fn();
    const original = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...original, pathname: '/admin/usuarios', reload },
    });
    try {
      fetchMock.mockImplementationOnce(() => respond(page, status));
      const { result } = renderHook(() => useUserList(DEFAULT_QUERY, false));
      await waitFor(() => expect(reload).toHaveBeenCalled());
      expect(result.current.status).toBe('loading');
    } finally {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: original,
      });
    }
  });

  it('skips the first fetch until the list has hydrated', async () => {
    function Probe() {
      const list = useUserList(DEFAULT_QUERY, false);
      return <p>{list.status}</p>;
    }
    const html = renderToString(<Probe />);
    const container = document.createElement('div');
    document.body.append(container);
    container.innerHTML = html;
    fetchMock.mockClear();
    const root = hydrateRoot(container, <Probe />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    root.unmount();
    container.remove();
  });

  it('cancels a pending search when it unmounts', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { result, unmount } = renderHook(() =>
      useUserList(DEFAULT_QUERY, false),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    act(() => result.current.setSearch('ana'));
    unmount();
    act(() => vi.advanceTimersByTime(SEARCH_DELAY_MS));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
