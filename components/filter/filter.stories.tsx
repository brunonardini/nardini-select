import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SelectField } from '@/components/select/select';

import { Filter } from './filter';

const meta = {
  title: 'DataDisplay/Filter',
  component: Filter,
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
          'Listing filter. The trigger opens a popover; Aplicar submits the fields together and Limpar drops them. The fields themselves belong to the listing.',
      },
    },
  },
} satisfies Meta<typeof Filter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Filtros' }),
    ).toBeVisible();
    await expect(
      within(document.body).queryByRole('heading', { name: 'Filtrar equipe' }),
    ).toBeNull();
  },
};

