'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { withAction } from '@/lib/auth/io/guard';
import {
  anonymizeUser,
  changeRole,
  deleteUser,
  disableUser,
  enableUser,
  updateFullName,
} from '@/lib/users/io/users';
import { isUuid, type MutationResult } from '@/lib/users/logic/rules';

const idSchema = z.object({
  id: z.string(),
  fullName: z.string().optional(),
  roleId: z.string().optional(),
  confirmation: z.string().optional(),
});

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : '';
}

async function run(
  name: string,
  input: z.infer<typeof idSchema>,
  handler: (
    ctx: Parameters<Parameters<typeof withAction>[3]>[0],
    parsed: z.infer<typeof idSchema>,
    trx: Parameters<Parameters<typeof withAction>[3]>[2],
  ) => Promise<MutationResult>,
): Promise<MutationResult> {
  return withAction(
    name,
    { allow: ['active'], adminOnly: true },
    idSchema,
    handler,
  )(input);
}

function finish(
  id: string,
  result: MutationResult,
  next = `/admin/usuarios/${id}`,
): never {
  if (!result.ok) redirect(`/admin/usuarios/${id}?erro=${result.reason}`);
  redirect(next);
}

export async function saveFullName(formData: FormData): Promise<void> {
  const id = text(formData.get('id'));
  if (!isUuid(id)) redirect('/admin/usuarios');
  const result = await run(
    'saveFullName',
    { id, fullName: text(formData.get('full_name')) },
    (ctx, input, trx) =>
      updateFullName(ctx, trx, {
        id: input.id,
        fullName: input.fullName ?? '',
        now: new Date(),
      }),
  );
  finish(id, result);
}

export async function saveRole(formData: FormData): Promise<void> {
  const id = text(formData.get('id'));
  if (!isUuid(id)) redirect('/admin/usuarios');
  const role = text(formData.get('role_id'));
  const result = await run(
    'saveRole',
    { id, roleId: role },
    (ctx, input, trx) =>
      changeRole(ctx, trx, {
        id: input.id,
        roleId: !input.roleId || input.roleId === 'none' ? null : input.roleId,
        now: new Date(),
      }),
  );
  finish(id, result);
}

export async function disableAccount(formData: FormData): Promise<void> {
  const id = text(formData.get('id'));
  if (!isUuid(id)) redirect('/admin/usuarios');
  const result = await run('disableAccount', { id }, (ctx, input, trx) =>
    disableUser(ctx, trx, { id: input.id, now: new Date() }),
  );
  finish(id, result);
}

export async function enableAccount(formData: FormData): Promise<void> {
  const id = text(formData.get('id'));
  if (!isUuid(id)) redirect('/admin/usuarios');
  const result = await run('enableAccount', { id }, (ctx, input, trx) =>
    enableUser(ctx, trx, { id: input.id, now: new Date() }),
  );
  finish(id, result);
}

export async function removeAccount(formData: FormData): Promise<void> {
  const id = text(formData.get('id'));
  if (!isUuid(id)) redirect('/admin/usuarios');
  const result = await run('removeAccount', { id }, (ctx, input, trx) =>
    deleteUser(ctx, trx, { id: input.id }),
  );
  finish(id, result, '/admin/usuarios');
}

export async function anonymizeAccount(formData: FormData): Promise<void> {
  const id = text(formData.get('id'));
  if (!isUuid(id)) redirect('/admin/usuarios');
  const result = await run(
    'anonymizeAccount',
    { id, confirmation: text(formData.get('confirmacao')) },
    (ctx, input, trx) =>
      anonymizeUser(ctx, trx, {
        id: input.id,
        confirmation: input.confirmation ?? '',
        now: new Date(),
      }),
  );
  finish(id, result);
}
