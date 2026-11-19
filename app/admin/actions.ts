'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { withAction } from '@/lib/auth/io/guard';
import { getAuth } from '@/lib/auth/io/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/logic/session';

const states = ['terms_outdated', 'pending', 'active'] as const;

export async function signOut(input: unknown): Promise<void> {
  await withAction('signOut', { allow: states }, z.unknown(), async (ctx) => {
    const auth = await getAuth();
    const context = await auth.$context;
    await context.internalAdapter.deleteUserSessions(ctx.viewer.id);
  })(input);

  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  redirect('/admin/entrar');
}
