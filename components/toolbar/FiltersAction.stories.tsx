import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';

import { SelectField } from '@/components/select/select';

import { FiltersAction } from './FiltersAction';

const meta = {
  title: 'Layout/Toolbar/Filters Action',
  component: FiltersAction,
  args: {
    label: 'Filtros',
    title: 'Filtrar equipe',
    submitLabel: 'Aplicar filtros',
    clearLabel: 'Limpar filtros',
    onSubmit: fn(),
    onClear: fn(),
    children: (
      <>
        <SelectField
          label="Estado"
          name="estado"
          defaultValue="todos"
          options={[
            { value: 'todos', label: 'Todos os estados' },
            { value: 'ativo', label: 'Ativo' },
            { value: 'pendente', label: 'Pendente' },
          ]}
        />
        <SelectField
          label="Papel"
          name="papel"
          defaultValue="todos"
          options={[
            { value: 'todos', label: 'Todos os papéis' },
            { value: 'sem-papel', label: 'Sem papel' },
            { value: 'estoque', label: 'Estoque' },
          ]}
        />
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Filter popover. Aplicar submits the fields together and Limpar drops them. The fields belong to the listing.',
      },
    },
  },
} satisfies Meta<typeof FiltersAction>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Trigger only. The panel stays closed. */
export const Closed: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Filtros' }),
    ).toBeVisible();
    await expect(
      within(document.body).queryByRole('heading', { name: 'Filtrar equipe' }),
    ).toBeNull();
  },
};

/** Panel open, with the fields and both actions. */
export const Open: Story = {
  args: { defaultOpen: true },
  play: async () => {
    const body = within(document.body);
    await expect(
      body.getByRole('heading', { name: 'Filtrar equipe' }),
    ).toBeVisible();
    await expect(body.getByRole('combobox', { name: 'Estado' })).toBeVisible();
    await expect(
      body.getByRole('button', { name: 'Aplicar filtros' }),
    ).toBeVisible();
    await expect(
      body.getByRole('button', { name: 'Limpar filtros' }),
    ).toBeVisible();
  },
};
