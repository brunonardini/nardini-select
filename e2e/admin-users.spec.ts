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
