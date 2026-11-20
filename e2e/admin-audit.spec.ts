import { expect, test } from '@playwright/test';

import {
  ADMIN_ROLE_ID,
  ATENDIMENTO_ROLE_ID,
  sessionCookie,
  setRole,
  setTerms,
  slotUser,
} from './fixtures/auth';

test('audit filters hide events outside the chosen days', async ({
  page,
}, testInfo) => {
  const adminId = slotUser(testInfo.parallelIndex, 'approved');
  await setTerms(adminId, 'current');
  await setRole(adminId, ADMIN_ROLE_ID);
  await page.context().addCookies([await sessionCookie(adminId)]);
  try {
    await page.goto('/admin/auditoria');
    await expect(page.getByRole('listitem').first()).toBeVisible();
    await page.getByLabel('De', { exact: true }).fill('2020-01-01');
    await page.getByLabel('Até', { exact: true }).fill('2020-01-02');
    await page.getByRole('button', { name: 'Filtrar' }).click();
    await expect(page.getByText('Nenhum evento neste filtro.')).toBeVisible();
  } finally {
    await setRole(adminId, ATENDIMENTO_ROLE_ID);
  }
});
