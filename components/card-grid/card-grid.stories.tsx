import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, type ComponentType } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Avatar } from '@/components/avatar/avatar';
import { Button } from '@/components/button/button';
import { Card, CardPlaceholder } from '@/components/card/card';
import { StatusText } from '@/components/status-text/status-text';

import { CardGrid, CardGridList } from './card-grid';

const people = [
  ['Ana Souza', 'ana.souza@exemplo.com', 'Estoque', 'Ativo'],
  ['Bruno Lima', 'bruno.lima@exemplo.com', 'Caixa', 'Pendente'],
  ['Clara Nunes', 'clara.nunes@exemplo.com', 'Estoque', 'Desabilitado'],
  ['Diego Alves', 'diego.alves@exemplo.com', 'Sem papel', 'Ativo'],
  ['Eva Martins', 'eva.martins@exemplo.com', 'Caixa', 'Termos desatualizados'],
  ['Fábio Cruz', 'fabio.cruz@exemplo.com', 'Estoque', 'Anonimizado'],
] as const;

function cards(
  selected: ReadonlySet<string> = new Set(),
  toggle?: (id: string) => void,
) {
  return people.map(([name, email, role, state]) => (
    <Card
      key={name}
      title={name}
      href={`/admin/usuarios/${name}`}
      leading={<Avatar name={name} />}
      description={email}
      facts={[
        { key: 'role', label: role, value: <StatusText state={state} /> },
        { key: 'access', label: 'Último acesso', value: '20/11/2026' },
      ]}
      selected={selected.has(name)}
      onSelectedChange={
        toggle
          ? (checked) => {
              if (checked !== selected.has(name)) toggle(name);
            }
          : undefined
      }
    />
  ));
}

function frame(width: number | string) {
  return function Frame(Story: ComponentType) {
    return (
      <div style={{ containerType: 'inline-size', width }}>
        <Story />
      </div>
    );
  };
}

function columnCount(list: HTMLElement): number {
  return getComputedStyle(list).gridTemplateColumns.split(' ').filter(Boolean)
    .length;
}

const meta = {
  title: 'DataDisplay/Card Grid',
  component: CardGrid,
  args: {
    children: <CardGridList>{cards()}</CardGridList>,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Listing of cards. One column below 460px of the nearest container, two from 460px and three from 760px. The selection bar and the paginator are optional.',
      },
    },
  },
} satisfies Meta<typeof CardGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {
  decorators: [frame(800)],
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list');
    await expect(within(list).getAllByRole('listitem')).toHaveLength(6);
    await expect(columnCount(list)).toBe(3);
  },
};

export const TwoColumns: Story = {
  decorators: [frame(520)],
  play: async ({ canvasElement }) => {
    await expect(columnCount(within(canvasElement).getByRole('list'))).toBe(2);
  },
};

export const OneColumn: Story = {
  decorators: [frame(390)],
  play: async ({ canvasElement }) => {
    await expect(columnCount(within(canvasElement).getByRole('list'))).toBe(1);
  },
};

const pageSizes = [6, 12, 24];

function SelectionDemo() {
  const [selected, setSelected] = useState<string[]>(['Ana Souza']);
  const ids = people.map(([name]) => name);
  const onPage = ids.filter((id) => selected.includes(id));

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <CardGrid
      selection={{
        pageCount: ids.length,
        selectedOnPage: onPage.length,
        selectedCount: selected.length,
        onSelectPage: (checked) => setSelected(checked ? ids : []),
        onClear: () => setSelected([]),
        action: (
          <Button type="button" variant="secondary">
            Revisar seleção
          </Button>
        ),
      }}
    >
      <CardGridList>{cards(new Set(selected), toggle)}</CardGridList>
    </CardGrid>
  );
}

export const BulkSelection: Story = {
  decorators: [frame(800)],
  render: () => <SelectionDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pageBox = canvas.getByRole('checkbox', { name: 'Selecionar página' });
    await expect(pageBox).toHaveAttribute('aria-checked', 'mixed');
    await expect(canvas.getByText('1 selecionado')).toBeVisible();
    await userEvent.click(pageBox);
    await expect(pageBox).toBeChecked();
    await expect(canvas.getByText('6 selecionados')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Limpar seleção' }),
    );
    await expect(canvas.getByText('Nenhum selecionado')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Selecionar Bruno Lima' }),
    );
    await expect(canvas.getByText('1 selecionado')).toBeVisible();
  },
};

function PaginationDemo() {
  const [page, setPage] = useState(2);
  const [pageSize, setPageSize] = useState(6);
  const total = 24;
  return (
    <CardGrid
      pagination={{
        page,
        pageSize,
        pageSizes,
        total,
        onPage: setPage,
        onPageSize: (size) => {
          setPageSize(size);
          setPage(1);
        },
      }}
    >
      <CardGridList>{cards().slice(0, pageSize === 6 ? 2 : 3)}</CardGridList>
    </CardGrid>
  );
}

export const Pagination: Story = {
  render: () => <PaginationDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('7–12 de 24')).toBeVisible();
    await expect(canvas.getByText('Página 2 de 4')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Próxima página' }),
    );
    await expect(canvas.getByText('Página 3 de 4')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Página anterior' }),
    );
    await expect(canvas.getByText('Página 2 de 4')).toBeVisible();
  },
};

export const Loading: Story = {
  args: {
    busy: true,
    pagination: {
      page: 1,
      pageSize: 6,
      pageSizes,
      total: null,
      onPage: () => {},
      onPageSize: () => {},
    },
    children: (
      <CardGridList hidden>
        {Array.from({ length: 6 }, (_, index) => (
          <CardPlaceholder key={index} />
        ))}
      </CardGridList>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('region', { name: 'Resultados' }),
    ).toHaveAttribute('aria-busy', 'true');
    await expect(
      canvas.getByRole('button', { name: 'Página anterior' }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: 'Próxima página' }),
    ).toBeDisabled();
  },
};
