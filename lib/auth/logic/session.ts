/** Forced by `useSecureCookies`, including on http://localhost. */
export const SESSION_COOKIE_NAME = '__Secure-better-auth.session_token';

export const INVITE_COOKIE_NAME = 'invite';

export const INVITE_COOKIE_MAX_AGE_SECONDS = 30 * 60;

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}
