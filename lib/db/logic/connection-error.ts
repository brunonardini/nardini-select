const connectionCodes = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EHOSTUNREACH',
  'ENETUNREACH',
  '53300',
  '57P01',
  '57P02',
  '57P03',
]);

/** Classify database I/O failures on the server; never return diagnostics. */
export function isDatabaseConnectionError(error: unknown): boolean {
  const pending: unknown[] = [error];
  const seen = new Set<object>();
  while (pending.length) {
    const current = pending.pop();
    if (!current || typeof current !== 'object' || seen.has(current)) continue;
    seen.add(current);
    const failure = current as {
      code?: unknown;
      cause?: unknown;
      errors?: unknown;
    };
    if (
      typeof failure.code === 'string' &&
      (connectionCodes.has(failure.code) ||
        /^08[0-9A-Z]{3}$/.test(failure.code))
    )
      return true;
    pending.push(failure.cause);
    if (Array.isArray(failure.errors)) pending.push(...failure.errors);
  }
  return false;
}
