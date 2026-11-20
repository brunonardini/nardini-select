import { expect, test } from '@playwright/test';

import {
  ADMIN_ROLE_ID,
  ATENDIMENTO_ROLE_ID,
  sessionCookie,
  setRole,
  setTerms,
  slotUser,
} from './fixtures/auth';

test('an admin creates, renames, and deletes a role', async ({
  page,
}, testInfo) => {
  const slot = testInfo.parallelIndex;
  const adminId = slotUser(slot, 'approved');
  const name = `slot ${slot} caixa`;
  await setTerms(adminId, 'current');
  await setRole(adminId, ADMIN_ROLE_ID);
  await page.context().addCookies([await sessionCookie(adminId)]);
  try {
    await page.goto('/admin/papeis');
    await page.getByRole('textbox', { name: 'Nome' }).fill(name);
    await page.getByRole('button', { name: 'Criar papel' }).click();
    await expect(
      page.getByRole('heading', { name, exact: true }),
    ).toBeVisible();
    await page.getByRole('textbox', { name: 'Nome' }).fill(`${name} dois`);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('main').getByRole('alert')).toContainText(
      'O nome foi salvo.',
    );
    await page.getByRole('button', { name: 'Excluir papel' }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Excluir' })
      .click();
    await expect(page).toHaveURL(/\/admin\/papeis$/);
    await expect(page.getByRole('link', { name: `${name} dois` })).toHaveCount(
      0,
    );
  } finally {
    await setRole(adminId, ATENDIMENTO_ROLE_ID);
  }
});
