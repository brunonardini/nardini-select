import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, type ComponentType } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { SelectField } from '@/components/select/select';

import { FiltersAction } from './FiltersAction';
import { OrderByAction } from './OrderByAction';
import { Search } from './Search';
import { Toolbar } from './index';

const onChange = fn();

function frame(width: number) {
  return function Frame(Story: ComponentType) {
    return (
      <div style={{ containerType: 'inline-size', width }}>
        <Story />
      </div>
    );
  };
}

function ListingToolbar() {
  const [value, setValue] = useState('');
  return (
    <Toolbar>
      <Toolbar.Content>
        <Search
          label="Buscar por nome ou e-mail"
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      </Toolbar.Content>
      <Toolbar.Actions>
        <FiltersAction
          label="Filtros"
          title="Filtrar equipe"
          submitLabel="Aplicar filtros"
          clearLabel="Limpar filtros"
          onSubmit={fn()}
          onClear={fn()}
        >
          <SelectField
            label="Estado"
            name="estado"
            defaultValue="todos"
            options={[
              { value: 'todos', label: 'Todos os estados' },
              { value: 'ativo', label: 'Ativo' },
            ]}
          />
        </FiltersAction>
        <OrderByAction
          label="Ordenar"
          title="Ordenar equipe"
          submitLabel="Aplicar ordem"
          onSubmit={fn()}
        >
          <SelectField
            label="Ordenar por"
            name="ordem"
            defaultValue="pessoa"
            options={[
              { value: 'pessoa', label: 'Pessoa' },
              { value: 'papel', label: 'Papel' },
            ]}
          />
        </OrderByAction>
      </Toolbar.Actions>
    </Toolbar>
  );
}

const meta = {
  title: 'Layout/Toolbar/Toolbar',
  component: Toolbar,
  args: { children: null },
  parameters: {
    docs: {
      description: {
        component:
          'Full-width listing bar. Toolbar.Content takes the leftover space and Toolbar.Actions stays as wide as its buttons. Search fills the content. Below 460px of the nearest container, the content takes its own row.',
      },
    },
  },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Search, filters and sort on one row. */
export const Default: Story = {
  decorators: [frame(800)],
  render: () => <ListingToolbar />,
  play: async ({ canvasElement }) => {
    onChange.mockClear();
    const canvas = within(canvasElement);
    const field = canvas.getByRole('searchbox', {
      name: 'Buscar por nome ou e-mail',
    });
    const filters = canvas.getByRole('button', { name: 'Filtros' });
    const content = field.parentElement!.parentElement!.parentElement!;
    const toolbar = content.parentElement!;
    const actions = filters.parentElement!;
    const toolbarWidth = toolbar.getBoundingClientRect().width;
    const contentWidth = content.getBoundingClientRect().width;
    const actionsWidth = actions.getBoundingClientRect().width;
    const fieldWidth = field.getBoundingClientRect().width;

    await userEvent.type(field, 'ana');
    await expect(field).toHaveValue('ana');
    await expect(onChange).toHaveBeenCalled();
    await expect(canvas.getByRole('button', { name: 'Ordenar' })).toBeVisible();
    await expect(toolbarWidth).toBe(800);
    await expect(contentWidth).toBeGreaterThan(actionsWidth);
    await expect(Math.abs(fieldWidth - contentWidth)).toBeLessThan(1);
    await expect(
      Math.abs(toolbarWidth - (contentWidth + actionsWidth + 8)),
    ).toBeLessThan(2);
  },
};

/** Search on its own row when the container is narrower than 460px. */
export const Narrow: Story = {
  decorators: [frame(320)],
  render: () => <ListingToolbar />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('searchbox', {
      name: 'Buscar por nome ou e-mail',
    });
    const filters = canvas.getByRole('button', { name: 'Filtros' });
    const content = field.parentElement!.parentElement!.parentElement!;
    const toolbar = content.parentElement!;
    const actions = filters.parentElement!;

    await expect(toolbar.getBoundingClientRect().width).toBe(320);
    await expect(
      Math.abs(
        content.getBoundingClientRect().width -
          toolbar.getBoundingClientRect().width,
      ),
    ).toBeLessThan(1);
    await expect(actions.getBoundingClientRect().top).toBeGreaterThan(
      content.getBoundingClientRect().top,
    );
    await expect(canvas.getByRole('button', { name: 'Ordenar' })).toBeVisible();
  },
};
