const EXACT = new Set(['/admin/entrar', '/admin/termos', '/admin/privacidade']);

/** Paths the proxy lets through without a session cookie. Not a security boundary. */
export function isPublicAdminPath(pathname: string): boolean {
  if (EXACT.has(pathname)) return true;
  if (pathname.startsWith('/api/auth/')) return true;
  return /^\/admin\/convite\/[^/]+(\/iniciar)?$/.test(pathname);
}
