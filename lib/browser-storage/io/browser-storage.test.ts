import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const key = 'test:preference';

beforeEach(() => {
  window.localStorage.clear();
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('browserStorage', () => {
  it('stores, reads and removes persistent values', async () => {
    const { browserStorage } = await import('./browser-storage');
    browserStorage.setItem(key, 'collapsed');
    expect(window.localStorage.getItem(key)).toBe('collapsed');
    expect(browserStorage.getItem(key)).toBe('collapsed');
    browserStorage.removeItem(key);
    expect(browserStorage.getItem(key)).toBeNull();
  });

  it.each(['missing', 'denied'] as const)(
    'uses document memory when storage is %s',
    async (failure) => {
      const getter = vi.spyOn(window, 'localStorage', 'get');
      if (failure === 'denied')
        getter.mockImplementation(() => {
          throw new DOMException('Denied', 'SecurityError');
        });
      else getter.mockReturnValue(undefined as unknown as Storage);
      const { browserStorage } = await import('./browser-storage');
      expect(browserStorage.getItem(key)).toBeNull();
      browserStorage.setItem(key, 'collapsed');
      expect(browserStorage.getItem(key)).toBe('collapsed');
      browserStorage.removeItem(key);
      expect(browserStorage.getItem(key)).toBeNull();
      expect(getter).toHaveBeenCalledTimes(1);
    },
  );

  it('mirrors observed values and forgets values removed from storage', async () => {
    const { browserStorage } = await import('./browser-storage');
    window.localStorage.setItem(key, 'collapsed');
    window.localStorage.setItem('removed', 'value');
    expect(browserStorage.getItem(key)).toBe('collapsed');
    expect(browserStorage.getItem('removed')).toBe('value');
    window.localStorage.removeItem('removed');
    expect(browserStorage.getItem('removed')).toBeNull();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException();
    });
    expect(browserStorage.getItem(key)).toBe('collapsed');
    expect(browserStorage.getItem('removed')).toBeNull();
  });

  it('keeps a write denied by the persistent backend in memory', async () => {
    const { browserStorage } = await import('./browser-storage');
    browserStorage.setItem(key, 'expanded');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });
    browserStorage.setItem(key, 'collapsed');
    expect(browserStorage.getItem(key)).toBe('collapsed');
    expect(window.localStorage.getItem(key)).toBe('expanded');
  });

  it('forgets a value in memory when persistent removal fails', async () => {
    const { browserStorage } = await import('./browser-storage');
    browserStorage.setItem(key, 'collapsed');
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException();
    });
    browserStorage.removeItem(key);
    expect(browserStorage.getItem(key)).toBeNull();
  });

  it('reads no value and retains no state on the server', async () => {
    const { browserStorage } = await import('./browser-storage');
    const browser = window;
    vi.stubGlobal('window', undefined);
    browserStorage.setItem(key, 'collapsed');
    expect(browserStorage.getItem(key)).toBeNull();
    vi.stubGlobal('window', browser);
    expect(browserStorage.getItem(key)).toBeNull();
  });
});
