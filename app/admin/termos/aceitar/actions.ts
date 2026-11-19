'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { withAction } from '@/lib/auth/io/guard';
import { PRIVACY_NOTICE_VERSION, TERMS_VERSION } from '@/lib/legal/versions';

export async function acceptTerms(formData: FormData): Promise<void> {
  if (formData.get('aceite') !== 'on') {
    redirect('/admin/termos/aceitar?erro=termos_obrigatorios');
  }

  const destination = await withAction(
    'acceptTerms',
    { allow: ['terms_outdated'] },
    z.unknown(),
    async (ctx, _input, trx) => {
      const now = new Date().toISOString();
      const first = ctx.viewer.termsAcceptedAt === null;
      await trx
        .updateTable('users')
        .set({
          terms_version: TERMS_VERSION,
          terms_accepted_at: now,
          privacy_notice_version: PRIVACY_NOTICE_VERSION,
          privacy_notice_acknowledged_at: now,
          updated_at: now,
        })
        .where('id', '=', ctx.viewer.id)
        .execute();
      await ctx.audit('user.terms_accepted', ctx.viewer.id, {
        terms_version: TERMS_VERSION,
        privacy_notice_version: PRIVACY_NOTICE_VERSION,
      });
      return first ? '/admin/perfil' : '/admin';
    },
  )(formData);

  redirect(destination);
}
