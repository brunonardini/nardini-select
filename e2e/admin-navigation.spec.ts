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

test('shows a dismissible tooltip on the sidebar toggle', async ({ page }) => {
  test.skip(
    test.info().project.name === 'mobile',
    'The rail is a wide-screen control',
  );
  await page.goto('/admin');
  const toggle = page.getByRole('button', { name: 'Recolher menu lateral' });
  const tooltip = page.getByRole('tooltip');
  await expect(
    page.getByRole('button', { name: 'Menu', exact: true }),
  ).toHaveCount(0);
  for (const width of [1440, 834]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 1194 });
    await toggle.hover();
    await expect(tooltip).toHaveText('Recolher menu lateral');
    await tooltip.hover();
    await expect(tooltip).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await page.mouse.move(0, 0);
  }

  await page.reload();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(toggle).toBeFocused();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await expect(toggle).toBeFocused();
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
  const close = drawer.getByRole('button', { name: 'Fechar menu' });
  await expect(close).toHaveCSS('width', '44px');
  await close.click();
  await expect(menu).toBeFocused();
  await menu.click();
  await close.focus();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await page.getByRole('button', { name: /Conta de/ }).click();
  await page.getByText('Perfil', { exact: true }).click();
  await expect(page).toHaveURL('/admin/perfil');
});
