'use server';

import { z } from 'zod';

import { withAction } from '@/lib/auth/io/guard';
import { updateProfile } from '@/lib/users/io/users';
import type { MutationResult } from '@/lib/users/logic/rules';

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : '';
}

export async function saveProfile(
  _previous: MutationResult | null,
  formData: FormData,
): Promise<MutationResult> {
  const input = {
    displayName: text(formData.get('display_name')),
    photo: text(formData.get('foto')),
  };
  return withAction(
    'saveProfile',
    { allow: ['pending', 'active'] },
    z.object({ displayName: z.string(), photo: z.string() }),
    async (ctx, parsed, trx) =>
      updateProfile(ctx, trx, { ...parsed, now: new Date() }),
  )(input);
}
