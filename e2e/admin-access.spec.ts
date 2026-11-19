import { expect, test } from '@playwright/test';

import { INVITE_TOKENS } from '../db/seeds/tokens';

import { sessionCookie, setTerms, slotUser } from './fixtures/auth';

test('an unsigned request to the admin home goes to sign-in', async ({
  page,
}) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/entrar$/);
  await expect(
    page.getByRole('button', { name: 'Entrar com Google' }),
  ).toBeVisible();
});

test('a known sign-in error is shown and an unknown one stays generic', async ({
  page,
}) => {
  await page.goto('/admin/entrar?erro=acesso_negado');
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'Esta conta não tem acesso. Use outra conta Google ou peça um convite ao administrador.',
  );
  await page.goto('/admin/entrar?error=something_else');
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'Não foi possível entrar. Tente de novo.',
  );
});

test('sign-in uses the approved layout and an indeterminate loading state', async ({
  page,
}) => {
  await page.goto('/admin/entrar');
  await expect(
    page.getByRole('heading', { name: 'Por trás de cada escolha.' }),
  ).toBeVisible();
  await expect(
    page.getByText('Acesso restrito para funcionários'),
  ).toBeVisible();
  await expect(
    page.getByText('Nardini Select · Admin', { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText('Uma escolha com assinatura.', { exact: true }),
  ).toHaveCount(0);
  const mobile = (page.viewportSize()?.width ?? 0) <= 700;
  const back = page.getByRole('link', { name: 'Voltar ao site' });
  if (mobile) await expect(back).toBeHidden();
  else await expect(back).toBeVisible();
  const photo = page.locator('picture img');
  await expect(photo).toBeVisible();
  expect(
    await photo.evaluate((image: HTMLImageElement) => image.currentSrc),
  ).toContain(mobile ? 'admin-sign-in-mobile' : 'admin-sign-in-desktop');
  // Hold the provider request so the real pending UI can be inspected.
  await page.route('**/api/auth/sign-in/social', () => Promise.resolve());
  await page.getByRole('button', { name: 'Entrar com Google' }).click();
  const pending = page.getByRole('button', { name: 'Conectando ao Google…' });
  await expect(pending).toBeDisabled();
  await expect(pending).toHaveAttribute('aria-busy', 'true');
  await expect(pending.locator('svg')).toHaveCount(3);
});

test('pending and active sessions see their own home', async ({
  page,
}, testInfo) => {
  const pending = slotUser(testInfo.parallelIndex, 'no-role');
  await page.context().addCookies([await sessionCookie(pending)]);
  await page.goto('/admin');
  await expect(
    page.getByRole('heading', { name: 'Cadastro em aprovação' }),
  ).toBeVisible();

  const active = slotUser(testInfo.parallelIndex, 'approved');
  await setTerms(active, 'current');
  await page.context().clearCookies();
  await page.context().addCookies([await sessionCookie(active)]);
  await page.goto('/admin');
  await expect(
    page.getByRole('heading', { name: /^Olá, worker-/ }),
  ).toBeVisible();
});

test('a pending account cannot open the terms acceptance page', async ({
  page,
}, testInfo) => {
  const pending = slotUser(testInfo.parallelIndex, 'no-role');
  await page.context().addCookies([await sessionCookie(pending)]);
  await page.goto('/admin/termos/aceitar');
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole('heading', { name: 'Cadastro em aprovação' }),
  ).toBeVisible();
});

test('the first acceptance opens the profile and a later one goes home', async ({
  page,
}, testInfo) => {
  const userId = slotUser(testInfo.parallelIndex, 'approved');
  await setTerms(userId, 'none');
  await page.context().addCookies([await sessionCookie(userId)]);
  await page.goto('/admin/termos/aceitar');
  await page
    .getByRole('checkbox', { name: 'Li e aceito os termos de uso' })
    .check();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page).toHaveURL(/\/admin\/perfil$/);
  await expect(
    page.getByText(userId).or(page.getByText(/@seed\.invalid/)),
  ).toBeVisible();

  await setTerms(userId, 'outdated');
  await page.goto('/admin/termos/aceitar');
  await page
    .getByRole('checkbox', { name: 'Li e aceito os termos de uso' })
    .check();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole('heading', { name: /^Olá, worker-/ }),
  ).toBeVisible();
});

test('signing out in one tab ends the session in the other', async ({
  browser,
}, testInfo) => {
  const userId = slotUser(testInfo.parallelIndex, 'approved');
  await setTerms(userId, 'current');
  const cookie = await sessionCookie(userId);
  const first = await browser.newContext();
  const second = await browser.newContext();
  await first.addCookies([cookie]);
  await second.addCookies([cookie]);
  const pageA = await first.newPage();
  const pageB = await second.newPage();
  await pageA.goto('/admin');
  await pageB.goto('/admin');
  await pageA.getByRole('banner').getByRole('button', { name: 'Sair' }).click();
  await expect(pageA).toHaveURL(/\/admin\/entrar$/);
  await pageB.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(pageB).toHaveURL(/\/admin\/entrar$/);
  await first.close();
  await second.close();
});

test('a broken, expired, canceled, or used invite does not start sign-in', async ({
  page,
}) => {
  await page.goto('/admin/convite/not-a-token');
  await expect(page.getByRole('main').getByRole('alert')).toHaveText(
    'Este convite não é válido.',
  );

  await page.goto(`/admin/convite/${INVITE_TOKENS.expired}`);
  await expect(page.getByRole('main').getByRole('alert')).toHaveText(
    'Este convite expirou.',
  );

  await page.goto(`/admin/convite/${INVITE_TOKENS.canceled}`);
  await expect(page.getByRole('main').getByRole('alert')).toHaveText(
    'Este convite não é válido.',
  );

  await page.goto(`/admin/convite/${INVITE_TOKENS.used}`);
  await expect(page.getByRole('main').getByRole('alert')).toHaveText(
    'Este convite não é válido.',
  );
});

test('the valid invite stays closed until the terms are accepted', async ({
  page,
  request,
}) => {
  await page.goto(`/admin/convite/${INVITE_TOKENS.valid}`);
  await expect(page.getByText('Valid invite')).toBeVisible();
  const button = page.getByRole('button', { name: 'Entrar com Google' });
  await expect(button).toBeDisabled();
  await page
    .getByRole('checkbox', { name: 'Li e aceito os termos de uso' })
    .check();
  await expect(button).toBeEnabled();

  const refused = await request.post(
    `/admin/convite/${INVITE_TOKENS.valid}/iniciar`,
    {
      form: { aceite: 'off' },
      headers: { origin: 'http://localhost:3200' },
    },
  );
  expect(refused.url()).toContain('erro=termos_obrigatorios');
  await expect(refused).toBeOK();
});

test('admin responses send the frame and referrer headers', async ({
  request,
}) => {
  for (const path of ['/admin/entrar', '/api/auth/get-session']) {
    const response = await request.get(path);
    const headers = response.headers();
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['content-security-policy']).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers['referrer-policy']).toBe('same-origin');
  }
});
test('desktop photo keeps the entire head inside short and wide windows', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  for (const viewport of [
    { width: 1254, height: 592 },
    { width: 1024, height: 600 },
    { width: 1440, height: 900 },
    { width: 1920, height: 540 },
    { width: 2560, height: 600 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/admin/entrar');
    const bounds = await page
      .locator('picture img')
      .evaluate((image: HTMLImageElement) => {
        const box = image.getBoundingClientRect();
        const position = getComputedStyle(image)
          .objectPosition.split(' ')
          .map(parseFloat);
        const scale = Math.max(box.width / 1024, box.height / 1536);
        const x = box.x + ((box.width - 1024 * scale) * position[0]) / 100;
        const y = box.y + ((box.height - 1536 * scale) * position[1]) / 100;
        // Head and ears in the approved source photograph (1024x1536).
        return {
          left: x + 335 * scale,
          right: x + 670 * scale,
          top: y + 345 * scale,
          bottom: y + 580 * scale,
          clipLeft: box.left,
          clipRight: box.right,
          clipBottom: box.bottom,
        };
      });
    expect(
      bounds.top,
      `${viewport.width}x${viewport.height}: head top`,
    ).toBeGreaterThanOrEqual(0);
    expect(bounds.bottom).toBeLessThanOrEqual(
      Math.min(bounds.clipBottom, viewport.height),
    );
    expect(bounds.left).toBeGreaterThanOrEqual(bounds.clipLeft);
    expect(bounds.right).toBeLessThanOrEqual(bounds.clipRight);
  }
});
