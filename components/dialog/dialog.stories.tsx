import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor, within } from 'storybook/test';

import { Button } from '../button/button';

import { Dialog, DialogClose } from './dialog';

const meta = {
  title: 'Feedback/Dialog',
  component: Dialog,
  args: {
    label: 'Abrir aviso',
    title: 'Aviso',
    description: 'Leia antes de continuar.',
    children: (close) => (
      <div className="dialog-actions">
        <DialogClose>Cancelar</DialogClose>
        <Button onClick={close}>Entendi</Button>
      </div>
    ),
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Abrir aviso' });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    const dialog = within(body.getByRole('dialog', { name: 'Aviso' }));
    const close = dialog.getByRole('button', { name: 'Fechar' });
    const cancel = dialog.getByRole('button', { name: 'Cancelar' });
    const primary = dialog.getByRole('button', { name: 'Entendi' });
    await expect(close).toHaveStyle({ width: '36px', height: '36px' });
    const title = dialog.getByRole('heading', { name: 'Aviso' });
    const titleStyle = window.getComputedStyle(title);
    const opticalCenter =
      title.getBoundingClientRect().top +
      Number.parseFloat(titleStyle.lineHeight) / 2 -
      Number.parseFloat(titleStyle.fontSize) / 8;
    const closeBounds = close.getBoundingClientRect();
    await expect(closeBounds.top + closeBounds.height / 2).toBeCloseTo(
      opticalCenter,
      0,
    );
    const primaryBounds = primary.getBoundingClientRect();
    await expect(primaryBounds.left).toBeGreaterThan(
      cancel.getBoundingClientRect().right,
    );
    await expect(primaryBounds.right).toBeCloseTo(
      close.getBoundingClientRect().right,
      0,
    );
    await userEvent.click(close);
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
  },
};
