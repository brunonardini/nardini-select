'use server';

import { z } from 'zod';

import { withAction } from '@/lib/auth/io/guard';
import {
  cancelInvitation,
  createInvitation,
  renewInvitation,
} from '@/lib/invitations/io/invitations';
import { invitationName } from '@/lib/invitations/logic/rules';
import { isUuid } from '@/lib/users/logic/rules';

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : '';
}

function failed(error: unknown): { ok: false; message: string } | null {
  if (error instanceof Error && error.message.startsWith('Invitation')) {
    return { ok: false, message: 'Este convite não pode ser alterado.' };
  }
  return null;
}

export async function createInvite(
  _previous:
    { ok: true; token: string } | { ok: false; message: string } | null,
  formData: FormData,
) {
  const fullName = text(formData.get('full_name'));
  if (!invitationName(fullName)) {
    return { ok: false as const, message: 'Informe o nome completo.' };
  }
  return withAction(
    'createInvite',
    { allow: ['active'], adminOnly: true },
    z.object({ fullName: z.string() }),
    async (ctx, input, trx) => {
      const created = await createInvitation(ctx, trx, {
        fullName: input.fullName,
        now: new Date(),
      });
      return { ok: true as const, token: created.token };
    },
  )({ fullName });
}

export async function renewInvite(
  _previous:
    { ok: true; token: string } | { ok: false; message: string } | null,
  formData: FormData,
) {
  const id = text(formData.get('id'));
  if (!isUuid(id)) {
    return { ok: false as const, message: 'Convite não encontrado.' };
  }
  try {
    return await withAction(
      'renewInvite',
      { allow: ['active'], adminOnly: true },
      z.object({ id: z.string() }),
      async (ctx, input, trx) => {
        const created = await renewInvitation(ctx, trx, {
          id: input.id,
          now: new Date(),
        });
        return { ok: true as const, token: created.token };
      },
    )({ id });
  } catch (error) {
    const result = failed(error);
    if (result) return result;
    throw error;
  }
}

export async function cancelInvite(
  _previous: { ok: true } | { ok: false; message: string } | null,
  formData: FormData,
) {
  const id = text(formData.get('id'));
  if (!isUuid(id)) {
    return { ok: false as const, message: 'Convite não encontrado.' };
  }
  try {
    await withAction(
      'cancelInvite',
      { allow: ['active'], adminOnly: true },
      z.object({ id: z.string() }),
      async (ctx, input, trx) => {
        await cancelInvitation(ctx, trx, { id: input.id, now: new Date() });
        return { ok: true as const };
      },
    )({ id });
    return { ok: true as const };
  } catch (error) {
    const result = failed(error);
    if (result) return result;
    throw error;
  }
}
