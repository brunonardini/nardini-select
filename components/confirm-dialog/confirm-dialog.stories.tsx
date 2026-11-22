import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ConfirmDialog } from './confirm-dialog';

const meta = {
  title: 'Feedback/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    label: 'Excluir',
    title: 'Excluir papel',
    description: 'Esta ação não pode ser desfeita.',
    confirmLabel: 'Excluir',
    fields: { id: '1' },
    action: fn(),
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Excluir' }),
    );
    const dialog = within(document.body).getByRole('dialog');
    await expect(dialog).toHaveAttribute('data-open');
    await expect(
      within(dialog).getByRole('heading', { name: 'Excluir papel' }),
    ).toBeInTheDocument();
  },
};

export const TypedConfirmation: Story = {
  args: {
    label: 'Anonimizar',
    title: 'Anonimizar usuário',
    description: 'O nome, o e-mail e a foto são apagados.',
    confirmLabel: 'Anonimizar',
    expectedText: 'Ana Silva',
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Anonimizar' }),
    );
    const confirm = within(document.body).getByRole('button', {
      name: 'Anonimizar',
    });
    await expect(confirm).toBeDisabled();
    await userEvent.type(
      within(document.body).getByRole('textbox'),
      'Ana Silva',
    );
    await expect(confirm).toBeEnabled();
  },
};

export const DeleteConfirmation: Story = {
  args: {
    intent: 'delete',
    label: 'Excluir papel',
    confirmLabel: 'Excluir papel definitivamente',
    description: 'O papel será removido. Esta ação não pode ser desfeita.',
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Excluir papel' });
    const body = within(canvasElement.ownerDocument.body);
    await expect(trigger).toHaveClass('button-danger-subdued');
    await userEvent.click(trigger);
    const dialog = within(body.getByRole('dialog', { name: 'Excluir papel' }));
    await waitFor(() =>
      expect(dialog.getByRole('button', { name: 'Cancelar' })).toHaveFocus(),
    );
    await expect(
      dialog.getByRole('button', { name: 'Excluir papel definitivamente' }),
    ).toHaveClass('button-danger');
    await userEvent.click(
      dialog.getByRole('button', { name: 'Fechar confirmação' }),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
  },
};
