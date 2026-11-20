import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { ToastProvider, useNotice } from './toast';

function Demo() {
  const notice = useNotice();
  return (
    <button
      type="button"
      onClick={() => notice('Link copiado', 'Válido por 30 minutos.')}
    >
      Copiar
    </button>
  );
}

const meta = {
  title: 'Components/Toast',
  component: ToastProvider,
  args: { children: null },
  render: () => (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  ),
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hidden: Story = {};

export const Visible: Story = {
  play: async () => {
    await userEvent.click(
      within(document.body).getByRole('button', { name: 'Copiar' }),
    );
    await expect(
      within(document.body).getByRole('dialog', { name: 'Link copiado' }),
    ).toBeInTheDocument();
  },
};
