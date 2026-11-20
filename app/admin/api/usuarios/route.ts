import { withRoute, type AuthorizedContext } from '@/lib/auth/io/guard';
import { listUsers } from '@/lib/users/io/users';
import {
  parseUserListQuery,
  selectUserPage,
} from '@/lib/users/logic/list-query';

export const runtime = 'nodejs';

/** One page of the team. The query travels in the body so search terms stay out of URLs. */
async function readPage(
  ctx: AuthorizedContext,
  request: Request,
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: 'Bad request' }, { status: 400 });
  }
  const page = selectUserPage(await listUsers(ctx), parseUserListQuery(body));
  return Response.json(page, { headers: { 'Cache-Control': 'no-store' } });
}

export const POST = withRoute(
  { allow: ['active'], adminOnly: true },
  async (ctx, request) => readPage(ctx, request),
);
