import { expect, test, type Page } from '@playwright/test';

const sections = ['inicio', 'marca', 'selecao', 'loja', 'contato'];
const isMobile = (page: Page) => (page.viewportSize()?.width ?? 0) <= 760;

async function openMenuIfMobile(page: Page) {
  if (isMobile(page)) {
    await page.getByRole('button', { name: 'Abrir menu' }).click();
  }
}

let pageErrors: string[] = [];

test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/');
});

test.afterEach(() => {
  expect(pageErrors, 'uncaught errors in the page').toEqual([]);
});

test('renders five sections, each at least one viewport tall', async ({
  page,
}) => {
  const viewportHeight = page.viewportSize()!.height;

  const ids = await page
    .locator('main > section')
    .evaluateAll((elements) => elements.map((element) => element.id));
  expect(ids).toEqual(sections);

  for (const id of sections) {
    const box = await page.locator(`#${id}`).boundingBox();
    expect(box!.height, `#${id} height`).toBeGreaterThanOrEqual(viewportHeight);
  }
});

test('has no horizontal overflow or broken images', async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);

  const broken = await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach((image) => (image.loading = 'eager'));
    await Promise.all(images.map((image) => image.decode().catch(() => {})));
    return images
      .filter((image) => !image.naturalWidth)
      .map((image) => image.src);
  });
  expect(broken).toEqual([]);
});

test('never shows the store phone number', async ({ page }) => {
  await expect(page.locator('body')).not.toContainText(
    /\(?\d{2}\)?\s?9?\d{4}-?\d{4}/,
  );
});

test('hero actions scroll to the selection and the store', async ({ page }) => {
  await page.getByRole('link', { name: 'Conheça nossa seleção' }).click();
  await expect(page).toHaveURL(/#selecao$/);
  await expect(
    page.getByRole('heading', { name: /Uma curadoria/ }),
  ).toBeInViewport();

  await page.getByRole('link', { name: 'Visite nossa loja' }).click();
  await expect(page).toHaveURL(/#loja$/);
  await expect(
    page.getByRole('heading', { name: /Estamos em/ }),
  ).toBeInViewport();
});

test('header contact link scrolls to the contact section', async ({ page }) => {
  await openMenuIfMobile(page);
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Fale com a gente' })
    .click();

  await expect(page).toHaveURL(/#contato$/);
  await expect(
    page.getByRole('heading', { name: 'Vamos conversar?' }),
  ).toBeInViewport();
});

test('mobile menu closes after navigating and on Escape', async ({ page }) => {
  test.skip(!isMobile(page), 'The menu toggle only shows on small screens');
  const toggle = page.getByRole('button', { name: 'Abrir menu' });

  await toggle.click();
  const navigation = page.getByRole('navigation');
  await expect(
    navigation.getByRole('link', { name: 'Nossa loja' }),
  ).toBeVisible();
  await navigation.getByRole('link', { name: 'Nossa loja' }).click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await page.evaluate(() => window.scrollTo(0, 0));
  await toggle.click();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('header links fit the café panel or move into the menu', async ({
  page,
}) => {
  test.skip(isMobile(page), 'Checks the desktop widths');
  const toggle = page.getByRole('button', { name: 'Abrir menu' });
  const firstLink = page.getByRole('link', { name: 'A marca' });

  // At 1281px and above the links show inline, inside the café panel.
  await page.setViewportSize({ width: 1281, height: 900 });
  await expect(toggle).toBeHidden();
  const link = await firstLink.boundingBox();
  const panel = await page.locator('.hero-panel').boundingBox();
  expect(link!.x).toBeGreaterThanOrEqual(panel!.x);

  // Narrower, they would spill onto the off-white side: the toggle takes over.
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(firstLink).toBeHidden();
  await toggle.click();
  await expect(firstLink).toBeVisible();
});

test('contact links open WhatsApp and Instagram in a new tab', async ({
  page,
}) => {
  const whatsapp = page.getByRole('link', {
    name: 'Fale com a gente pelo WhatsApp, em uma nova aba',
  });
  await expect(whatsapp).toHaveAttribute('href', '/contato/whatsapp');
  await expect(whatsapp).toHaveAttribute('target', '_blank');

  const instagram = page.getByRole('link', {
    name: 'Siga @nardiniselect no Instagram, em uma nova aba',
  });
  await expect(instagram).toHaveAttribute(
    'href',
    'https://www.instagram.com/nardiniselect/',
  );
});

test('WhatsApp route redirects to wa.me with a greeting', async ({
  request,
}) => {
  const response = await request.get('/contato/whatsapp', { maxRedirects: 0 });

  expect(response.status()).toBe(307);
  const location = new URL(response.headers().location);
  expect(location.origin + location.pathname).toBe(
    'https://wa.me/5511999999999',
  );
  expect(location.searchParams.get('text')).toMatch(/^Olá! Conheci a Nardini/);
});
