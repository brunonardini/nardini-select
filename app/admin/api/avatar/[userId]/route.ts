import { withRoute, type AuthorizedContext } from '@/lib/auth/io/guard';
import { avatarSource } from '@/lib/users/io/users';
import {
  AVATAR_TIMEOUT_MS,
  avatarBytesAllowed,
} from '@/lib/users/logic/avatar';

export const runtime = 'nodejs';

function missing(): Response {
  return new Response(null, { status: 404 });
}

async function readAvatar(
  ctx: AuthorizedContext,
  request: Request,
): Promise<Response> {
  const id = new URL(request.url).pathname.split('/').pop() ?? '';
  const source = await avatarSource(ctx, id);
  if (!source) return missing();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AVATAR_TIMEOUT_MS);
  try {
    const response = await fetch(source, {
      redirect: 'manual',
      signal: controller.signal,
    });
    if (response.status >= 300 && response.status < 400) return missing();
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (
      !avatarBytesAllowed({
        status: response.status,
        redirected: response.redirected,
        contentType: response.headers.get('content-type'),
        size: bytes.byteLength,
      })
    ) {
      return missing();
    }
    const type = response.headers.get('content-type')?.split(';')[0]?.trim();
    return new Response(bytes, {
      headers: {
        'Content-Type': type || 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return missing();
  } finally {
    clearTimeout(timer);
  }
}

export const GET = withRoute(
  { allow: ['pending', 'active'] },
  async (ctx, request) => readAvatar(ctx, request),
);
