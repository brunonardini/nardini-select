import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

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

async function scan(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(tags).analyze();
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
