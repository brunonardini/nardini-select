import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';

import { StatusText } from './status-text';

const meta = {
  title: 'DataDisplay/StatusText',
  component: StatusText,
  args: { state: 'Ativo' },
} satisfies Meta<typeof StatusText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Ativo')).toBeVisible();
  },
};

export const Pending: Story = { args: { state: 'Pendente' } };

export const OutdatedTerms: Story = {
  args: { state: 'Termos desatualizados' },
};

export const Disabled: Story = { args: { state: 'Desabilitado' } };

export const Anonymized: Story = { args: { state: 'Anonimizado' } };

/** Every state together, as the user cards show them. */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[
        'Ativo',
        'Pendente',
        'Termos desatualizados',
        'Desabilitado',
        'Anonimizado',
      ].map((state) => (
        <StatusText key={state} state={state} />
      ))}
    </div>
  ),
};
