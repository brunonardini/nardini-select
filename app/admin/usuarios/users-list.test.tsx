import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_QUERY,
  type UserCard,
  type UserPage,
} from '@/lib/users/logic/list-query';

import { UsersList } from './users-list';

const ROLE = '11111111-1111-4111-8111-111111111111';

function card(index: number, fields: Partial<UserCard> = {}): UserCard {
  return {
    id: `u${index}`,
    name: `Pessoa ${index}`,
    email: `pessoa${index}@exemplo.com`,
    roleName: 'Estoque',
    state: 'Ativo',
    lastLoginAt: '2026-11-20T12:00:00.000Z',
    ...fields,
  };
}

const fetchMock = vi.fn<typeof fetch>();

function respondWith(page: UserPage, status = 200) {
  fetchMock.mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify(page), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
}

function lastBody() {
  return JSON.parse(String(fetchMock.mock.calls.at(-1)?.[1]?.body));
}

function renderList() {
  return render(
    <UsersList
      roles={[{ id: ROLE, name: 'Estoque' }]}
      initialQuery={DEFAULT_QUERY}
      pageSizeInAddress={false}
    />,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/admin/usuarios');
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UsersList', () => {
  it('shows one placeholder per slot until the first page arrives', () => {
    fetchMock.mockImplementation(() => new Promise<Response>(() => {}));
    const { container } = renderList();
    expect(
      container.querySelectorAll('ul[aria-hidden="true"] li'),
    ).toHaveLength(6);
    expect(screen.getByRole('heading', { name: /Equipe/ })).toHaveTextContent(
      'carregando',
    );
    expect(screen.getByRole('region', { name: 'Resultados' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(
      screen.getByRole('button', { name: 'Página anterior' }),
    ).toBeDisabled();
  });

  it('renders person cards with role, state and last access', async () => {
    respondWith({
      items: [
        card(1),
        card(2, {
          name: 'Usuário removido',
          email: null,
          roleName: null,
          state: 'Anonimizado',
          lastLoginAt: null,
        }),
      ],
      total: 2,
      page: 1,
      pageSize: 6,
    });
    renderList();
    const link = await screen.findByRole('link', { name: 'Pessoa 1' });
    expect(link).toHaveAttribute('href', '/admin/usuarios/u1');
    const first = link.closest('li') as HTMLElement;
    expect(within(first).getByText('pessoa1@exemplo.com')).toBeVisible();
    expect(within(first).getByText('Estoque')).toBeVisible();
    expect(within(first).getByText('Ativo')).toBeVisible();
    const removed = screen
      .getByRole('link', { name: 'Usuário removido' })
      .closest('li') as HTMLElement;
    expect(within(removed).getByText('Sem papel')).toBeVisible();
    expect(within(removed).getByText('Sem registro')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent(
      '2 pessoas encontradas',
    );
    expect(screen.getByText('1–2 de 2')).toBeVisible();
    expect(screen.getByText('Página 1 de 1')).toBeVisible();
  });

  it('announces a single result', async () => {
    respondWith({ items: [card(1)], total: 1, page: 1, pageSize: 6 });
    renderList();
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        '1 pessoa encontrada',
      ),
    );
  });

  it('moves between pages and focuses the results', async () => {
    const user = userEvent.setup();
    respondWith({
      items: [1, 2, 3, 4, 5, 6].map((index) => card(index)),
      total: 8,
      page: 1,
      pageSize: 6,
    });
    renderList();
    const next = await screen.findByRole('button', { name: 'Próxima página' });
    expect(screen.getByText('Página 1 de 2')).toBeVisible();
    respondWith({
      items: [card(7), card(8)],
      total: 8,
      page: 2,
      pageSize: 6,
    });
    await user.click(next);
    expect(await screen.findByText('7–8 de 8')).toBeVisible();
    expect(screen.getByRole('region', { name: 'Resultados' })).toHaveFocus();
    expect(lastBody().pagina).toBe('2');
    expect(
      screen.getByRole('button', { name: 'Próxima página' }),
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Página anterior' }));
    await waitFor(() => expect(lastBody().pagina).toBeUndefined());
  });

  it('offers to clear an empty search', async () => {
    const user = userEvent.setup();
    respondWith({ items: [], total: 0, page: 1, pageSize: 6 });
    renderList();
    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar por nome ou e-mail' }),
      'zz',
    );
    expect(
      await screen.findByText('Nenhum resultado', { selector: 'strong' }),
    ).toBeVisible();
    expect(screen.getByText('0–0 de 0')).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: 'Limpar busca e filtros' }),
    );
    expect(
      screen.getByRole('searchbox', { name: 'Buscar por nome ou e-mail' }),
    ).toHaveValue('');
  });

  it('shows the error with a retry', async () => {
    const user = userEvent.setup();
    respondWith({ items: [], total: 0, page: 1, pageSize: 6 }, 500);
    renderList();
    expect(
      await screen.findByText('Não foi possível carregar os usuários'),
    ).toBeVisible();
    respondWith({ items: [card(1)], total: 1, page: 1, pageSize: 6 });
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('link', { name: 'Pessoa 1' })).toBeVisible();
  });

  it('applies filters from the filter panel', async () => {
    const user = userEvent.setup();
    respondWith({ items: [card(1)], total: 1, page: 1, pageSize: 6 });
    renderList();
    await screen.findByRole('link', { name: 'Pessoa 1' });
    await user.click(screen.getByRole('button', { name: 'Filtros' }));
    await user.click(await screen.findByRole('combobox', { name: 'Papel' }));
    await user.click(await screen.findByRole('option', { name: 'Sem papel' }));
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }));
    await waitFor(() => expect(lastBody().papel).toBe('sem-papel'));
    await user.click(screen.getByRole('button', { name: 'Filtros' }));
    await user.click(
      await screen.findByRole('button', { name: 'Limpar filtros' }),
    );
    await waitFor(() => expect(lastBody().papel).toBeUndefined());
  });

  it('applies a sort order', async () => {
    const user = userEvent.setup();
    respondWith({ items: [card(1)], total: 1, page: 1, pageSize: 6 });
    renderList();
    await screen.findByRole('link', { name: 'Pessoa 1' });
    await user.click(screen.getByRole('button', { name: 'Ordenar' }));
    await user.click(await screen.findByRole('combobox', { name: 'Direção' }));
    await user.click(
      await screen.findByRole('option', { name: 'Decrescente' }),
    );
    await user.click(screen.getByRole('button', { name: 'Aplicar ordem' }));
    await waitFor(() => expect(lastBody().direcao).toBe('desc'));
  });

  it('changes the page size', async () => {
    const user = userEvent.setup();
    respondWith({ items: [card(1)], total: 1, page: 1, pageSize: 6 });
    renderList();
    await screen.findByRole('link', { name: 'Pessoa 1' });
    await user.click(screen.getByRole('combobox', { name: 'Por página' }));
    await user.click(await screen.findByRole('option', { name: '3' }));
    await waitFor(() => expect(lastBody().por_pagina).toBe('3'));
    await waitFor(() =>
      expect(screen.getByRole('region', { name: 'Resultados' })).toHaveFocus(),
    );
  });
});
