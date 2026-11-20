import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Avatar } from '@/components/avatar/avatar';
import { StatusText } from '@/components/status-text/status-text';

import { Card, CardPlaceholder, type CardFact } from './card';

const facts: CardFact[] = [
  { key: 'role', label: 'Estoque', value: <StatusText state="Ativo" /> },
  { key: 'access', label: 'Último acesso', value: '20/11/2026' },
];

function List({ children }: { children: ReactNode }) {
  return (
    <ul style={{ maxWidth: 360, margin: 0, padding: 0, listStyle: 'none' }}>
      {children}
    </ul>
  );
}

const meta = {
  title: 'DataDisplay/Card',
  component: Card,
  args: {
    title: 'Ana Souza',
    href: '/admin/usuarios/ana',
    leading: <Avatar name="Ana Souza" />,
    description: 'ana.souza@exemplo.com',
    facts,
  },
  decorators: [
    (Story) => (
      <List>
        <Story />
      </List>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'One record in a listing. The title can link to the record. Facts sit below an Argila rule. A selection checkbox appears only when the grid wires onSelectedChange.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Person: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('link', { name: 'Ana Souza' }),
    ).toHaveAttribute('href', '/admin/usuarios/ana');
    await expect(canvas.getByText('ana.souza@exemplo.com')).toBeVisible();
    await expect(canvas.getByText('Estoque')).toBeVisible();
    await expect(canvas.getByText('Ativo')).toBeVisible();
  },
};

export const WithoutEmail: Story = {
  args: {
    title: 'Usuário removido',
    href: '/admin/usuarios/removido',
    leading: <Avatar name={null} />,
    description: undefined,
    facts: [
      {
        key: 'role',
        label: 'Sem papel',
        value: <StatusText state="Anonimizado" />,
      },
      { key: 'access', label: 'Último acesso', value: 'Sem registro' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Sem papel')).toBeVisible();
    await expect(canvas.getByText('Sem registro')).toBeVisible();
    await expect(canvas.queryByText(/@/)).toBeNull();
  },
};

export const LongContent: Story = {
  args: {
    title: 'Maria Helena do Carmo Albuquerque de Souza',
    description: 'maria.helena.do.carmo.albuquerque.de.souza@exemplo.com',
    facts: [
      {
        key: 'role',
        label: 'Termos desatualizados',
        value: <StatusText state="Termos desatualizados" />,
      },
      { key: 'access', label: 'Último acesso', value: 'Sem registro' },
    ],
  },
};

function SelectableCard() {
  const [selected, setSelected] = useState(false);
  return (
    <Card
      title="Ana Souza"
      href="/admin/usuarios/ana"
      leading={<Avatar name="Ana Souza" />}
      description="ana.souza@exemplo.com"
      facts={facts}
      selected={selected}
      onSelectedChange={setSelected}
    />
  );
}

export const Selectable: Story = {
  render: () => <SelectableCard />,
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox', {
      name: 'Selecionar Ana Souza',
    });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(checkbox.closest('li')).toHaveAttribute('data-selected');
  },
};

export const Placeholder: Story = {
  render: () => <CardPlaceholder />,
  decorators: [
    (Story) => (
      <ul
        aria-hidden="true"
        style={{ margin: 0, padding: 0, listStyle: 'none' }}
      >
        <Story />
      </ul>
    ),
  ],
};
