const ENABLED = new Set(['/sign-in/social', '/get-session']);

/** Path relative to the Better Auth base, without a trailing slash. */
export function normalizeAuthPath(path: string): string {
  const trimmed = path.trim();
  const withoutBase = trimmed.startsWith('/api/auth')
    ? trimmed.slice('/api/auth'.length)
    : trimmed;
  const withSlash = withoutBase.startsWith('/')
    ? withoutBase
    : `/${withoutBase}`;
  if (withSlash.length > 1 && withSlash.endsWith('/')) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
}

/**
 * Social sign-in, the OAuth callback, and get-session stay enabled.
 * `disabledPaths` cannot match `/callback/:id`, so the hook uses this too.
 */
export function isEnabledAuthPath(path: string): boolean {
  const normalized = normalizeAuthPath(path);
  if (ENABLED.has(normalized)) return true;
  return /^\/callback\/[^/]+$/.test(normalized);
}
