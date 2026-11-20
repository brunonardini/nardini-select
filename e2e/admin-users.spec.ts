import { expect, test } from '@playwright/test';

import {
  ADMIN_ROLE_ID,
  ATENDIMENTO_ROLE_ID,
  markUserActed,
  removeAuditEvent,
  restoreDisabledUser,
  sessionCookie,
  setDisplayName,
  setPhoto,
  setRole,
  setTerms,
  slotUser,
} from './fixtures/auth';

test('a non-admin cannot open the user list', async ({ page }, testInfo) => {
  const userId = slotUser(testInfo.parallelIndex, 'approved');
  await setTerms(userId, 'current');
  await page.context().addCookies([await sessionCookie(userId)]);
  const response = await page.goto('/admin/usuarios');
  expect(response?.status()).toBe(403);
});

test('assigning a role lets the pending user into the home', async ({
  browser,
}, testInfo) => {
  const slot = testInfo.parallelIndex;
  const adminId = slotUser(slot, 'approved');
  const pendingId = slotUser(slot, 'no-role');
  await setTerms(adminId, 'current');
  await setTerms(pendingId, 'current');
  await setRole(adminId, ADMIN_ROLE_ID);
  await setRole(pendingId, null);
  try {
    const admin = await browser.newContext();
    await admin.addCookies([await sessionCookie(adminId)]);
    const page = await admin.newPage();
    await page.goto(`/admin/usuarios/${pendingId}`);
    await page.getByRole('combobox', { name: 'Papel' }).click();
    await page.getByRole('option', { name: 'atendimento' }).click();
    await page.getByRole('button', { name: 'Salvar papel' }).click();
    await expect(page.getByText('Ativo', { exact: true })).toBeVisible();
    await admin.close();

    const member = await browser.newContext();
    await member.addCookies([await sessionCookie(pendingId)]);
    const home = await member.newPage();
    await home.goto('/admin');
    await expect(
      home.getByRole('heading', { name: /^Olá, worker-/ }),
    ).toBeVisible();
    await member.close();
  } finally {
    await setRole(pendingId, null);
    await setRole(adminId, ATENDIMENTO_ROLE_ID);
  }
});

test('disabling a user ends the session in another browser', async ({
  browser,
}, testInfo) => {
  const slot = testInfo.parallelIndex;
  const adminId = slotUser(slot, 'approved');
  const targetId = slotUser(slot, 'no-role');
  await setTerms(adminId, 'current');
  await setTerms(targetId, 'current');
  await setRole(adminId, ADMIN_ROLE_ID);
  await setRole(targetId, null);
  const other = await browser.newContext();
  const admin = await browser.newContext();
  try {
    await other.addCookies([await sessionCookie(targetId)]);
    const watched = await other.newPage();
    await watched.goto('/admin');
    await admin.addCookies([await sessionCookie(adminId)]);
    const page = await admin.newPage();
    await page.goto(`/admin/usuarios/${targetId}`);
    await page.getByRole('button', { name: 'Desabilitar' }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Desabilitar' })
      .click();
    await expect(page.getByText('Desabilitado', { exact: true })).toBeVisible();
    await watched.goto('/admin');
    await expect(watched).toHaveURL(/\/admin\/entrar$/);
  } finally {
    await setRole(targetId, null);
    await setRole(adminId, ATENDIMENTO_ROLE_ID);
    await other.close();
    await admin.close();
  }
});

test('the profile saves a display name', async ({ page }, testInfo) => {
  const slot = testInfo.parallelIndex;
  const userId = slotUser(slot, 'approved');
  await setTerms(userId, 'current');
  await setDisplayName(userId, `worker-${slot}`);
  await page.context().addCookies([await sessionCookie(userId)]);
  try {
    await page.goto('/admin/perfil');
    await page
      .getByRole('textbox', { name: 'Nome de exibição' })
      .fill(`worker-${slot} perfil`);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('main').getByRole('alert')).toContainText(
      'As alterações foram salvas.',
    );
  } finally {
    await setDisplayName(userId, `worker-${slot}`);
  }
});

test('the avatar route refuses a photo outside Google', async ({
  page,
}, testInfo) => {
  const userId = slotUser(testInfo.parallelIndex, 'approved');
  await setTerms(userId, 'current');
  await setPhoto(userId, 'https://evil.example/a.png', 'provider');
  await page.context().addCookies([await sessionCookie(userId)]);
  try {
    const response = await page.request.get(`/admin/api/avatar/${userId}`);
    expect(response.status()).toBe(404);
  } finally {
    await setPhoto(userId, null, 'none');
  }
});

test('anonymizing asks for the full name and clears the person', async ({
  page,
}, testInfo) => {
  const slot = testInfo.parallelIndex;
  const adminId = slotUser(slot, 'approved');
  const targetId = slotUser(slot, 'disabled');
  const fullName = `worker-${slot} disabled`;
  await setTerms(adminId, 'current');
  await setRole(adminId, ADMIN_ROLE_ID);
  await page.context().addCookies([await sessionCookie(adminId)]);
  try {
    await page.goto(`/admin/usuarios/${targetId}`);
    await page.getByRole('button', { name: 'Anonimizar' }).click();
    const confirm = page
      .getByRole('dialog')
      .getByRole('button', { name: 'Anonimizar' });
    await expect(confirm).toBeDisabled();
    await page
      .getByRole('textbox', { name: new RegExp(fullName) })
      .fill(fullName);
    await expect(confirm).toBeEnabled();
    await confirm.click();
    await expect(
      page.getByRole('heading', { name: 'Usuário removido' }),
    ).toBeVisible();
    await expect(page.getByText('Anonimizado', { exact: true })).toBeVisible();
  } finally {
    await restoreDisabledUser(targetId, slot);
    await setRole(adminId, ATENDIMENTO_ROLE_ID);
  }
});

test('a user who already acted cannot be deleted', async ({
  page,
}, testInfo) => {
  const slot = testInfo.parallelIndex;
  const adminId = slotUser(slot, 'approved');
  const targetId = slotUser(slot, 'disabled');
  await setTerms(adminId, 'current');
  await setRole(adminId, ADMIN_ROLE_ID);
  await page.context().addCookies([await sessionCookie(adminId)]);
  let eventId = '';
  try {
    await page.goto(`/admin/usuarios/${targetId}`);
    await expect(page.getByRole('button', { name: 'Excluir' })).toBeVisible();
    eventId = await markUserActed(targetId);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Excluir' })).toHaveCount(0);
  } finally {
    if (eventId) await removeAuditEvent(eventId);
    await setRole(adminId, ATENDIMENTO_ROLE_ID);
  }
});

test.describe('user listing', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const adminId = slotUser(testInfo.parallelIndex, 'approved');
    await setTerms(adminId, 'current');
    await setRole(adminId, ADMIN_ROLE_ID);
    await page.context().addCookies([await sessionCookie(adminId)]);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await page.context().clearCookies();
    await setRole(
      slotUser(testInfo.parallelIndex, 'approved'),
      ATENDIMENTO_ROLE_ID,
    );
  });

  test('searches without accents or case, filters and sorts', async ({
    page,
  }, testInfo) => {
    const slot = testInfo.parallelIndex;
    const search = page.getByRole('searchbox', {
      name: 'Buscar por nome ou e-mail',
    });
    const cards = page
      .getByRole('region', { name: 'Resultados' })
      .getByRole('listitem');
    await page.goto('/admin/usuarios');
    await search.fill(`WÓRKER-${slot}-`);
    await expect(cards).toHaveCount(3);
    await expect(page).not.toHaveURL(/busca|worker/i);

    await page.getByRole('button', { name: 'Ordenar' }).click();
    await page.getByRole('combobox', { name: 'Ordenar por' }).click();
    await page.getByRole('option', { name: 'Estado' }).click();
    await page.getByRole('combobox', { name: 'Direção' }).click();
    await page.getByRole('option', { name: 'Decrescente' }).click();
    await page.getByRole('button', { name: 'Aplicar ordem' }).click();
    await expect(cards.first()).toContainText('Desabilitado');
    await expect(page).toHaveURL(/ordem=estado&direcao=desc/);

    await page.getByRole('button', { name: 'Filtros' }).click();
    await page.getByRole('combobox', { name: 'Estado' }).click();
    await page.getByRole('option', { name: 'Pendente' }).click();
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText(
      `worker-${slot}-no-role@seed.invalid`,
    );

    await search.fill('ninguém-com-esse-nome');
    await expect(
      page.getByText('Nenhum resultado', { exact: true }).last(),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Limpar busca e filtros' }).click();
    await expect(search).toHaveValue('');
    await expect(page).not.toHaveURL(/estado=/);
  });

  test('remembers the page size and restores the list after Back', async ({
    page,
  }) => {
    const cards = page
      .getByRole('region', { name: 'Resultados' })
      .getByRole('listitem');
    await page.goto('/admin/usuarios');
    await expect(cards).toHaveCount(6);
    await page.getByRole('combobox', { name: 'Por página' }).click();
    await page.getByRole('option', { name: '3', exact: true }).click();
    await expect(cards).toHaveCount(3);
    await expect(page).toHaveURL(/por_pagina=3/);

    await page.goto('/admin/usuarios');
    await expect(cards).toHaveCount(3);
    await expect(page.getByRole('combobox', { name: 'Por página' })).toHaveText(
      '3',
    );

    await page.getByRole('button', { name: 'Próxima página' }).click();
    await expect(page).toHaveURL(/pagina=2/);
    await cards.first().getByRole('link').click();
    await expect(page).toHaveURL(/\/admin\/usuarios\/[0-9a-f-]{36}$/);
    await page.goBack();
    await expect(page).toHaveURL(/pagina=2/);
    await expect(page.getByText(/^Página 2 de \d+$/)).toBeVisible();
  });

  test('offers a retry when the team cannot load', async ({ page }) => {
    await page.route('**/admin/api/usuarios', (route) =>
      route.fulfill({ status: 500, body: '{}' }),
    );
    await page.goto('/admin/usuarios');
    await expect(
      page.getByText('Não foi possível carregar os usuários'),
    ).toBeVisible();
    await page.unroute('**/admin/api/usuarios');
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(
      page
        .getByRole('region', { name: 'Resultados' })
        .getByRole('link')
        .first(),
    ).toBeVisible();
  });

  test('refuses the list endpoint to a non-admin', async ({
    page,
  }, testInfo) => {
    await setRole(
      slotUser(testInfo.parallelIndex, 'approved'),
      ATENDIMENTO_ROLE_ID,
    );
    const response = await page.request.post('/admin/api/usuarios', {
      data: {},
    });
    expect(response.status()).toBe(403);
  });
});
