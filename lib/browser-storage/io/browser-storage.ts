type Operation = { kind: 'get' | 'remove' } | { kind: 'set'; value: string };

let memory: Map<string, string> | undefined;
let useMemory = false;

function access(key: string, operation: Operation) {
  if (typeof window === 'undefined') return null;

  memory ??= new Map();
  if (!useMemory) {
    try {
      const storage = window.localStorage;
      if (!storage) throw new Error('Local storage is unavailable');
      if (operation.kind === 'get') {
        const value = storage.getItem(key);
        if (value === null) memory.delete(key);
        else memory.set(key, value);
      } else if (operation.kind === 'set') {
        storage.setItem(key, operation.value);
      } else {
        storage.removeItem(key);
      }
    } catch {
      useMemory = true;
    }
  }

  if (operation.kind === 'set') memory.set(key, operation.value);
  if (operation.kind === 'remove') memory.delete(key);
  return memory.get(key) ?? null;
}

export const browserStorage = {
  getItem(key: string) {
    return access(key, { kind: 'get' });
  },
  setItem(key: string, value: string) {
    access(key, { kind: 'set', value });
  },
  removeItem(key: string) {
    access(key, { kind: 'remove' });
  },
};
