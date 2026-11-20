# Browser storage

Use `browserStorage` from `io/browser-storage.ts` for every application read, write or removal in local storage. It exposes `getItem(key)`, `setItem(key, value)` and `removeItem(key)` with string values. Namespace and version preference keys and validate values when reading them. Store display preferences and other non-sensitive client data here.

When storage is unavailable or throws, the adapter uses memory for the rest of the current document. Previously observed values remain available in memory. Changes made in memory last through client navigation and disappear on reload. A reload with persistent storage available can restore the last value saved there.

Read browser values after hydration or provide a deterministic server snapshot. The server reads return null and writes have no effect. Keep session, authorization and personal data out of browser storage.
