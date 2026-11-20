import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { INVITE_TOKENS } from '../db/seeds/tokens';

import { sessionCookie, setRole, setTerms, slotUser } from './fixtures/auth';
import { ADMIN_ROLE_ID, ATENDIMENTO_ROLE_ID } from '../db/seeds/ids';

// WCAG 2.2 level A and AA, plus axe best practices.
const tags = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
  'best-practice',
];

// Base UI's focus guards: visually hidden aria-hidden spans with tabindex=0
// that keep Tab order around open popups and pass focus on at once. axe
// flags them (aria-hidden-focus), so they're the only elements left out;
// the rule still checks the rest of the page. Same in .storybook/preview.tsx.
const baseUiFocusGuards = '[data-base-ui-focus-guard]';

async function scan(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(tags)
    .exclude(baseUiFocusGuards)
    .analyze();
  return results.violations.map(({ id, impact, help, nodes }) => ({
    id,
    impact,
    help,
    targets: nodes.map((node) => node.target.join(' ')),
  }));
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
});

test('home page has no detectable accessibility violations', async ({
  page,
}) => {
  expect(await scan(page)).toEqual([]);
});

test('open mobile menu has no detectable accessibility violations', async ({
  page,
}) => {
  test.skip(
    (page.viewportSize()?.width ?? 0) > 760,
    'The menu toggle only shows on small screens',
  );
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('navigation')).toBeVisible();

  expect(await scan(page)).toEqual([]);
});

test('admin sign-in, invite, terms, and home have no detectable violations', async ({
  page,
}, testInfo) => {
  const slot = testInfo.parallelIndex;
  await page.goto('/admin/entrar');
  expect(await scan(page)).toEqual([]);

  await page.goto('/admin/entrar?erro=acesso_negado');
  expect(await scan(page)).toEqual([]);

  await page.route('**/api/auth/sign-in/social', () => Promise.resolve());
  await page.getByRole('button', { name: 'Entrar com Google' }).click();
  await expect(
    page.getByRole('button', { name: 'Conectando ao Google…' }),
  ).toBeDisabled();
  expect(await scan(page)).toEqual([]);

  await page.goto(`/admin/convite/${INVITE_TOKENS.valid}`);
  expect(await scan(page)).toEqual([]);

  const approved = slotUser(slot, 'approved');
  await setTerms(approved, 'none');
  await page.context().addCookies([await sessionCookie(approved)]);
  await page.goto('/admin/termos/aceitar');
  expect(await scan(page)).toEqual([]);

  await setTerms(approved, 'current');
  await page.goto('/admin');
  expect(await scan(page)).toEqual([]);
  await page.goto('/admin/perfil');
  expect(await scan(page)).toEqual([]);

  await page.context().clearCookies();
  await page
    .context()
    .addCookies([await sessionCookie(slotUser(slot, 'no-role'))]);
  await page.goto('/admin');
  expect(await scan(page)).toEqual([]);
});

test('admin management pages and dialogs have no detectable violations', async ({
  page,
}, testInfo) => {
  const slot = testInfo.parallelIndex;
  const admin = slotUser(slot, 'approved');
  const disabled = slotUser(slot, 'disabled');
  await setTerms(admin, 'current');
  await setRole(admin, ADMIN_ROLE_ID);
  try {
    await page.context().addCookies([await sessionCookie(admin)]);
    await page.goto('/admin/usuarios');
    await page.getByRole('button', { name: 'Convidar usuário' }).click();
    expect(await scan(page)).toEqual([]);
    await page.keyboard.press('Escape');

    await page.goto(`/admin/usuarios/${disabled}`);
    for (const name of ['Habilitar', 'Excluir', 'Anonimizar']) {
      await page.getByRole('button', { name }).click();
      expect(await scan(page)).toEqual([]);
      await page.keyboard.press('Escape');
    }

    await page.goto('/admin/papeis');
    expect(await scan(page)).toEqual([]);
    await page.goto(`/admin/papeis/${ATENDIMENTO_ROLE_ID}`);
    expect(await scan(page)).toEqual([]);
    await page.goto('/admin/auditoria');
    expect(await scan(page)).toEqual([]);
  } finally {
    await setRole(admin, ATENDIMENTO_ROLE_ID);
  }
});
