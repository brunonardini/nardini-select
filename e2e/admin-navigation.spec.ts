import { expect, test } from '@playwright/test';

import { sessionCookie, slotUser } from './fixtures/auth';

test.beforeEach(async ({ page }, testInfo) => {
  await page
    .context()
    .addCookies([
      await sessionCookie(slotUser(testInfo.parallelIndex, 'approved')),
    ]);
});

test('restores collapsed and expanded preferences after reload', async ({
  page,
}) => {
  test.skip(
    test.info().project.name === 'mobile',
    'The rail is a wide-screen control',
  );
  await page.goto('/admin');
  const collapse = page.getByRole('button', { name: 'Recolher menu lateral' });
  const expand = page.getByRole('button', { name: 'Expandir menu lateral' });
  await collapse.click();
  await page.reload();
  await expect(expand).toHaveAttribute('aria-expanded', 'false');
  await page.setViewportSize({ width: 834, height: 1194 });
  await expect(expand).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Administração' }),
  ).toHaveCSS('width', '72px');
  await expand.click();
  await page.reload();
  await expect(collapse).toHaveAttribute('aria-expanded', 'true');
});

test('uses document memory when the storage getter throws', async ({
  page,
}) => {
  test.skip(
    test.info().project.name === 'mobile',
    'The rail is a wide-screen control',
  );
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    });
  });
  await page.goto('/admin/perfil');
  const collapse = page.getByRole('button', { name: 'Recolher menu lateral' });
  const expand = page.getByRole('button', { name: 'Expandir menu lateral' });
  await collapse.click();
  await page.getByRole('link', { name: 'Início', exact: true }).click();
  await expect(page).toHaveURL('/admin');
  await expect(expand).toBeVisible();
  await page.reload();
  await expect(collapse).toBeVisible();
});

test('centers the signature and returns drawer focus on mobile', async ({
  page,
}) => {
  test.skip(
    test.info().project.name !== 'mobile',
    'The drawer is a mobile control',
  );
  await page.goto('/admin');
  const brand = await page
    .getByRole('link', { name: 'Nardini Select Admin' })
    .boundingBox();
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  expect(brand!.x + brand!.width / 2).toBeCloseTo(
    page.viewportSize()!.width / 2,
    0,
  );
  await menu.click();
  const drawer = page.getByRole('dialog', { name: 'Menu' });
  await expect(drawer.getByRole('link', { name: 'Início' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(drawer.getByRole('link', { name: 'Usuários' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await page.getByRole('button', { name: /Conta de/ }).click();
  await page.getByText('Perfil', { exact: true }).click();
  await expect(page).toHaveURL('/admin/perfil');
});
