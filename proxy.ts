import { NextResponse, type NextRequest } from 'next/server';

import { isPublicAdminPath } from '@/lib/auth/logic/public-routes';
import { SESSION_COOKIE_NAME } from '@/lib/auth/logic/session';

/**
 * Sends an unsigned admin request to the sign-in page. This is not the
 * security boundary: the guard checks the session row.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicAdminPath(pathname)) return NextResponse.next();
  if (request.cookies.has(SESSION_COOKIE_NAME)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/admin/entrar';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
