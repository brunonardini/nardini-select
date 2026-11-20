import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';

import { SelectField } from '@/components/select/select';

import { OrderByAction } from './OrderByAction';

const meta = {
  title: 'Layout/Toolbar/Order By Action',
  component: OrderByAction,
  args: {
    label: 'Ordenar',
    title: 'Ordenar equipe',
    submitLabel: 'Aplicar ordem',
    onSubmit: fn(),
    children: (
      <>
        <SelectField
          label="Ordenar por"
          name="ordem"
          defaultValue="pessoa"
          options={[
            { value: 'pessoa', label: 'Pessoa' },
            { value: 'papel', label: 'Papel' },
            { value: 'estado', label: 'Estado' },
          ]}
        />
        <SelectField
          label="Direção"
          name="direcao"
          defaultValue="asc"
          options={[
            { value: 'asc', label: 'Crescente' },
            { value: 'desc', label: 'Decrescente' },
          ]}
        />
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Sort popover. Aplicar submits the fields together. The fields belong to the listing.',
      },
    },
  },
} satisfies Meta<typeof OrderByAction>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Trigger only. The panel stays closed. */
export const Closed: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Ordenar' }),
    ).toBeVisible();
    await expect(
      within(document.body).queryByRole('heading', { name: 'Ordenar equipe' }),
    ).toBeNull();
  },
};

/** Panel open, with the sort fields and the apply action. */
export const Open: Story = {
  args: { defaultOpen: true },
  play: async () => {
    const body = within(document.body);
    await expect(
      body.getByRole('heading', { name: 'Ordenar equipe' }),
    ).toBeVisible();
    await expect(
      body.getByRole('combobox', { name: 'Ordenar por' }),
    ).toBeVisible();
    await expect(
      body.getByRole('button', { name: 'Aplicar ordem' }),
    ).toBeVisible();
  },
};
