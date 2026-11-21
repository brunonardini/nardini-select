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
  await page.addInitScript(() => {
    let attempts = 0;
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        async writeText() {
          if (++attempts > 1) throw new Error('Clipboard unavailable');
        },
      },
    });
  });
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
    const invite = page.getByRole('dialog', { name: 'Convidar usuário' });
    const copy = invite.getByRole('button', { name: 'Copiar link' });
    await copy.click();
    await expect(
      invite.getByRole('dialog', { name: 'Link copiado' }),
    ).toBeVisible();
    await expect(copy).toBeFocused();
    await copy.click();
    const failure = invite.getByRole('dialog', {
      name: 'Não foi possível copiar',
    });
    await expect(failure).toHaveAttribute('data-variant', 'danger');
    await failure
      .getByRole('button', { name: 'Fechar: Não foi possível copiar' })
      .focus();
    await page.keyboard.press('Escape');
    await expect(failure).toHaveCount(0);
    await expect(invite).toBeVisible();
    await expect(copy).toBeFocused();
    await copy.click();
    await expect(failure).toBeVisible();
    await invite.getByRole('button', { name: 'Fechar', exact: true }).click();
    await expect(invite).toHaveCount(0);
    await expect(
      page.getByRole('dialog', { name: 'Não foi possível copiar' }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Fechar: Não foi possível copiar' })
      .click();
    await expect(
      page.getByRole('button', { name: 'Convidar usuário' }),
    ).toBeFocused();
    const pending = page.getByRole('button', { name: /Convites pendentes/ });
    await expect(pending).not.toHaveAttribute('aria-busy', 'true');
    await pending.click();
    await expect(page.getByText(`Convidado ${slot}`)).toBeVisible();
  } finally {
    await setRole(adminId, ATENDIMENTO_ROLE_ID);
  }
});
