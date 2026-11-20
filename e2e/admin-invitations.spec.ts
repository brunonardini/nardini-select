import { expect, test } from '@playwright/test';

import {
  ADMIN_ROLE_ID,
  ATENDIMENTO_ROLE_ID,
  sessionCookie,
  setRole,
  setTerms,
  slotUser,
} from './fixtures/auth';

test('an admin generates an invitation link', async ({ page }, testInfo) => {
  const slot = testInfo.parallelIndex;
  const adminId = slotUser(slot, 'approved');
  await setTerms(adminId, 'current');
  await setRole(adminId, ADMIN_ROLE_ID);
  await page.context().addCookies([await sessionCookie(adminId)]);
  try {
    await page.goto('/admin/usuarios');
    await page.getByRole('button', { name: 'Convidar usuário' }).click();
    await page
      .getByRole('textbox', { name: 'Nome completo' })
      .fill(`Convidado ${slot}`);
    await page.getByRole('button', { name: 'Gerar link' }).click();
    await expect(
      page.getByText('Esse link expira em 30 minutos.'),
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Link do convite' }),
    ).toHaveValue(/\/admin\/convite\//);
  } finally {
    await setRole(adminId, ATENDIMENTO_ROLE_ID);
  }
});
