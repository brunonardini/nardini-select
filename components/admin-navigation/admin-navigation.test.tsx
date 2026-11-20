import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { AdminNavigation } from './admin-navigation';

vi.mock('@/app/fonts', () => ({
  adminActionFont: { variable: 'font-admin-action' },
}));

const media = new EventTarget();
beforeEach(() => vi.stubGlobal('matchMedia', () => media));
afterEach(() => vi.unstubAllGlobals());

it('opens the staff drawer and closes it when the sidebar becomes available', async () => {
  const user = userEvent.setup();
  render(
    <AdminNavigation
      pathname="/admin"
      access="staff"
      name="Ana Martins"
      collapsed={false}
      onToggle={vi.fn()}
      signOutAction={vi.fn()}
    >
      <h1>Início</h1>
    </AdminNavigation>,
  );
  await user.click(screen.getByRole('button', { name: 'Menu' }));
  const dialog = await screen.findByRole('dialog', { name: 'Menu' });
  expect(within(dialog).getByRole('link', { name: 'Início' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  expect(
    within(dialog).queryByRole('link', { name: 'Usuários' }),
  ).not.toBeInTheDocument();
  act(() => {
    media.dispatchEvent(Object.assign(new Event('change'), { matches: false }));
  });
  expect(dialog).toBeInTheDocument();
  act(() => {
    media.dispatchEvent(Object.assign(new Event('change'), { matches: true }));
  });
  expect(
    screen.queryByRole('dialog', { name: 'Menu' }),
  ).not.toBeInTheDocument();
});

it('offers only sign-out while terms are outdated', async () => {
  const user = userEvent.setup();
  render(
    <AdminNavigation
      pathname="/admin/termos/aceitar"
      access="terms"
      name={null}
      collapsed={false}
      onToggle={vi.fn()}
      signOutAction={vi.fn()}
    >
      <h1>Aceite os termos</h1>
    </AdminNavigation>,
  );
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'Nardini Select Admin' }),
  ).toHaveAttribute('href', '/admin/termos/aceitar');
  await user.click(screen.getByRole('button', { name: /Conta de/ }));
  const account = await screen.findByRole('dialog', { name: 'Minha conta' });
  expect(within(account).getByRole('button', { name: 'Sair' })).toBeVisible();
  expect(within(account).queryByText('Perfil')).not.toBeInTheDocument();
});
