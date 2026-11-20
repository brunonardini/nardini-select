import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Card } from '@/components/card/card';

import { CardGrid, CardGridList, type CardGridPagination } from './card-grid';

const pageSizes = [3, 6, 12, 24];

function pagination(
  overrides: Partial<CardGridPagination> = {},
): CardGridPagination {
  return {
    page: 1,
    pageSize: 6,
    pageSizes,
    total: 24,
    onPage: vi.fn(),
    onPageSize: vi.fn(),
    ...overrides,
  };
}

function person(name: string) {
  return <Card key={name} title={name} href={`/pessoas/${name}`} />;
}

describe('CardGrid', () => {
  it('lists the cards', () => {
    render(
      <CardGrid>
        <CardGridList>
          {person('Ana')}
          {person('Bruno')}
        </CardGridList>
      </CardGrid>,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(
      screen.queryByRole('group', { name: 'Seleção' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: 'Paginação' }),
    ).not.toBeInTheDocument();
  });

  it('hides a loading list and marks the results busy', () => {
    render(
      <CardGrid busy>
        <CardGridList hidden>
          <Card title="—" />
        </CardGridList>
      </CardGrid>,
    );
    expect(screen.getByRole('region', { name: 'Resultados' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByRole('list', { hidden: true })).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('selects the page, shows a partial count, and clears', async () => {
    const user = userEvent.setup();
    const onSelectPage = vi.fn();
    const onClear = vi.fn();
    const { rerender } = render(
      <CardGrid
        selection={{
          pageCount: 3,
          selectedOnPage: 1,
          selectedCount: 4,
          onSelectPage,
          onClear,
          action: <button type="button">Revisar seleção</button>,
        }}
      >
        <CardGridList>{person('Ana')}</CardGridList>
      </CardGrid>,
    );
    const pageBox = screen.getByRole('checkbox', { name: 'Selecionar página' });
    expect(pageBox).toHaveAttribute('aria-checked', 'mixed');
    expect(screen.getByText('4 selecionados')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Revisar seleção' }),
    ).toBeVisible();
    await user.click(pageBox);
    expect(onSelectPage).toHaveBeenCalledWith(true);

    rerender(
      <CardGrid
        selection={{
          pageCount: 3,
          selectedOnPage: 3,
          selectedCount: 3,
          onSelectPage,
          onClear,
        }}
      >
        <CardGridList>{person('Ana')}</CardGridList>
      </CardGrid>,
    );
    expect(
      screen.getByRole('checkbox', { name: 'Selecionar página' }),
    ).toBeChecked();
    expect(screen.getByText('3 selecionados')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Limpar seleção' }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('names a single selection and an empty page', async () => {
    const user = userEvent.setup();
    const onSelectPage = vi.fn();
    const { rerender } = render(
      <CardGrid
        selection={{
          pageCount: 2,
          selectedOnPage: 1,
          selectedCount: 1,
          onSelectPage,
          onClear: vi.fn(),
        }}
      >
        <CardGridList>{person('Ana')}</CardGridList>
      </CardGrid>,
    );
    expect(screen.getByText('1 selecionado')).toBeVisible();

    rerender(
      <CardGrid
        selection={{
          pageCount: 0,
          selectedOnPage: 0,
          selectedCount: 0,
          onSelectPage,
          onClear: vi.fn(),
        }}
      >
        <CardGridList>{null}</CardGridList>
      </CardGrid>,
    );
    expect(screen.getByText('Nenhum selecionado')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Limpar seleção' }),
    ).not.toBeInTheDocument();
    const pageBox = screen.getByRole('checkbox', { name: 'Selecionar página' });
    expect(pageBox).toHaveAttribute('aria-disabled', 'true');
    await user.click(pageBox);
    expect(onSelectPage).not.toHaveBeenCalled();
  });

  it('pages through a known total and changes the page size', async () => {
    const user = userEvent.setup();
    const onPage = vi.fn();
    const onPageSize = vi.fn();
    render(
      <CardGrid pagination={pagination({ page: 2, onPage, onPageSize })}>
        <CardGridList>{person('Ana')}</CardGridList>
      </CardGrid>,
    );
    expect(screen.getByText('7–12 de 24')).toBeVisible();
    expect(screen.getByText('Página 2 de 4')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(onPage).toHaveBeenCalledWith(3);
    await user.click(screen.getByRole('button', { name: 'Página anterior' }));
    expect(onPage).toHaveBeenCalledWith(1);
    await user.click(screen.getByRole('combobox', { name: 'Por página' }));
    await user.click(await screen.findByRole('option', { name: '12' }));
    expect(onPageSize).toHaveBeenCalledWith(12);
  });

  it('disables both arrows on the only page and while the total is unknown', () => {
    const { rerender } = render(
      <CardGrid pagination={pagination({ total: 2, pageSize: 6 })}>
        <CardGridList>{person('Ana')}</CardGridList>
      </CardGrid>,
    );
    expect(screen.getByText('1–2 de 2')).toBeVisible();
    expect(screen.getByText('Página 1 de 1')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Página anterior' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Próxima página' }),
    ).toBeDisabled();

    rerender(
      <CardGrid pagination={pagination({ total: null })}>
        <CardGridList>{person('Ana')}</CardGridList>
      </CardGrid>,
    );
    const region = screen.getByRole('region', { name: 'Resultados' });
    expect(within(region).getByRole('link', { name: 'Ana' })).toBeVisible();
    expect(screen.getAllByText('–')).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: 'Próxima página' }),
    ).toBeDisabled();
  });

  it('ignores a page size that is already selected', async () => {
    const user = userEvent.setup();
    const onPageSize = vi.fn();
    render(
      <CardGrid pagination={pagination({ onPageSize })}>
        <CardGridList>{person('Ana')}</CardGridList>
      </CardGrid>,
    );
    await user.click(screen.getByRole('combobox', { name: 'Por página' }));
    await user.click(await screen.findByRole('option', { name: '6' }));
    expect(onPageSize).not.toHaveBeenCalled();
  });
});
