import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { EmptyState } from './empty-state';

const meta = {
  title: 'Layout/EmptyState',
  component: EmptyState,
  args: { title: 'Cadastro em aprovação' },
  parameters: {
    docs: {
      description: {
        component:
          'Quiet block for an admin page that has nothing else to show. Interface text stays in pt-BR.',
      },
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', {
        name: 'Cadastro em aprovação',
      }),
    ).toBeVisible();
  },
};

export const WithDetail: Story = {
  args: {
    title: 'Cadastro em aprovação',
    children: 'Um administrador ainda precisa aprovar o seu acesso.',
  },
};
