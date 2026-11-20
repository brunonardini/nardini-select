import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Dialog, DialogClose } from './dialog';

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  args: {
    label: 'Abrir aviso',
    title: 'Aviso',
    description: 'Leia antes de continuar.',
    children: <DialogClose>Fechar</DialogClose>,
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Abrir aviso' }),
    );
    const dialog = within(document.body).getByRole('dialog');
    await expect(dialog).toHaveAttribute('data-open');
    await expect(
      within(dialog).getByRole('heading', { name: 'Aviso' }),
    ).toBeInTheDocument();
  },
};
