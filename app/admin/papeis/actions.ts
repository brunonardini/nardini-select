'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { withAction } from '@/lib/auth/io/guard';
import { createRole, deleteRole, renameRole } from '@/lib/roles/io/roles';
import { isUuid, type MutationResult } from '@/lib/users/logic/rules';

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : '';
}

export async function saveNewRole(
  _previous: MutationResult | null,
  formData: FormData,
): Promise<MutationResult> {
  const result = await withAction(
    'saveNewRole',
    { allow: ['active'], adminOnly: true },
    z.object({ name: z.string() }),
    async (ctx, input, trx) =>
      createRole(ctx, trx, { name: input.name, now: new Date() }),
  )({ name: text(formData.get('name')) });
  if (!result.ok || !result.id) return result;
  redirect(`/admin/papeis/${result.id}`);
}

export async function saveRoleName(
  _previous: MutationResult | null,
  formData: FormData,
): Promise<MutationResult> {
  const id = text(formData.get('id'));
  if (!isUuid(id))
    return { ok: false, reason: 'missing', message: 'Papel não encontrado.' };
  return withAction(
    'saveRoleName',
    { allow: ['active'], adminOnly: true },
    z.object({ id: z.string(), name: z.string() }),
    async (ctx, input, trx) =>
      renameRole(ctx, trx, {
        id: input.id,
        name: input.name,
        now: new Date(),
      }),
  )({ id, name: text(formData.get('name')) });
}

export async function removeRole(formData: FormData): Promise<void> {
  const id = text(formData.get('id'));
  if (!isUuid(id)) redirect('/admin/papeis');
  const result = await withAction(
    'removeRole',
    { allow: ['active'], adminOnly: true },
    z.object({ id: z.string() }),
    async (ctx, input, trx) => deleteRole(ctx, trx, { id: input.id }),
  )({ id });
  if (!result.ok) redirect(`/admin/papeis/${id}?erro=${result.reason}`);
  redirect('/admin/papeis');
}
