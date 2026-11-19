import { getAuth } from '@/lib/auth/io/server';

export const runtime = 'nodejs';

async function handle(request: Request): Promise<Response> {
  const auth = await getAuth();
  return auth.handler(request);
}

export const GET = handle;
export const POST = handle;
