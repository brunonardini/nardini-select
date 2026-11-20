import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { browserStorage } from '@/lib/browser-storage/io/browser-storage';
import { AdminShell } from './admin-shell';

const router = vi.hoisted(() => ({ pathname: '/admin' }));
vi.mock('next/navigation', () => ({ usePathname: () => router.pathname }));
vi.mock('@/app/fonts', () => ({
  adminActionFont: { variable: 'font-admin-action' },
}));

beforeEach(() => {
  router.pathname = '/admin';
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => vi.unstubAllGlobals());

it('loads the saved preference and writes only on toggle', () => {
  const read = vi.spyOn(browserStorage, 'getItem').mockReturnValue('collapsed');
  const write = vi
    .spyOn(browserStorage, 'setItem')
    .mockImplementation(() => {});
  try {
    const { unmount } = render(
      <AdminShell
        access="administrator"
        name="Ana Martins"
        signOutAction={vi.fn()}
      >
        <h1>Início</h1>
      </AdminShell>,
    );
    expect(read).toHaveBeenCalledWith('nardini-select:admin-nav:v1');
    expect(write).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('button', { name: 'Expandir menu lateral' }),
    );
    expect(write).toHaveBeenLastCalledWith(
      'nardini-select:admin-nav:v1',
      'expanded',
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Recolher menu lateral' }),
    );
    expect(write).toHaveBeenLastCalledWith(
      'nardini-select:admin-nav:v1',
      'collapsed',
    );
    unmount();
  } finally {
    read.mockRestore();
    write.mockRestore();
  }
});

it('keeps public and signed-out pages outside the private shell', () => {
  router.pathname = '/admin/privacidade';
  const { rerender } = render(
    <AdminShell access="staff" name="Ana" signOutAction={vi.fn()}>
      Privacidade
    </AdminShell>,
  );
  expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  router.pathname = '/admin';
  rerender(
    <AdminShell access={null} name={null} signOutAction={vi.fn()}>
      Admin
    </AdminShell>,
  );
  expect(screen.queryByRole('banner')).not.toBeInTheDocument();
});

it('preserves the active section on a detail route', () => {
  router.pathname = '/admin/usuarios/equipe';
  render(
    <AdminShell access="administrator" name="Ana" signOutAction={vi.fn()}>
      Usuário
    </AdminShell>,
  );
  const nav = within(screen.getByRole('navigation', { name: 'Administração' }));
  expect(nav.getByRole('link', { name: 'Usuários' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  expect(nav.getByRole('link', { name: 'Início' })).not.toHaveAttribute(
    'aria-current',
  );
});
