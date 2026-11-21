import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button/button';
import { Dialog } from '../dialog/dialog';
import type { Notice } from './notice-queue';
import { ToastHost, ToastProvider, useNotice } from './toast';

const success: Notice = {
  variant: 'success',
  title: 'Link copiado',
  description: 'Envie o link à pessoa convidada.',
};
const warning: Notice = {
  variant: 'warning',
  title: 'Convite perto de expirar',
  description: 'O link vence em menos de 2 minutos.',
};
const danger: Notice = {
  variant: 'danger',
  title: 'Não foi possível copiar',
  description: 'Selecione o link e copie manualmente.',
};
const queued: Notice = {
  variant: 'success',
  title: 'Dados atualizados',
  description: 'As alterações foram salvas.',
};

function Demo({ notices, label }: { notices: Notice[]; label: string }) {
  const notice = useNotice();
  return (
    <Button
      type="button"
      onClick={(event) => {
        for (const entry of notices) notice(entry, event.currentTarget);
      }}
    >
      {label}
    </Button>
  );
}

const meta = {
  title: 'Feedback/Toast',
  component: ToastProvider,
  args: { children: <Demo notices={[success]} label="Copiar" /> },
  parameters: {
    docs: {
      description: {
        component:
          'Bottom-aligned notices with three semantic variants. Success and warning time out. Danger stays until dismissed. A FIFO queue holds overflow, and repeated notices share one card.',
      },
    },
  },
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hidden: Story = {};

export const Visible: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Copiar' }));
    await waitFor(() =>
      expect(
        within(document.body).getByRole('dialog', { name: success.title }),
      ).toBeVisible(),
    );
  },
};

export const Warning: Story = {
  args: { children: <Demo notices={[warning]} label="Verificar convite" /> },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Verificar convite' }),
    );
    await waitFor(() =>
      expect(
        within(document.body).getByRole('dialog', { name: warning.title }),
      ).toBeVisible(),
    );
  },
};

export const Danger: Story = {
  args: { children: <Demo notices={[danger]} label="Copiar" /> },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Copiar' }));
    await waitFor(() =>
      expect(
        within(document.body).getByRole('dialog', { name: danger.title }),
      ).toBeVisible(),
    );
  },
};

export const Stack: Story = {
  args: {
    children: (
      <Demo notices={[success, warning, danger]} label="Mostrar avisos" />
    ),
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Mostrar avisos' }),
    );
    const dialogs = within(document.body).getAllByRole('dialog');
    await expect(dialogs).toHaveLength(3);
    await expect(dialogs[0]).toHaveAccessibleName(success.title);
    await expect(dialogs[1]).toHaveAccessibleName(warning.title);
    await expect(dialogs[2]).toHaveAccessibleName(danger.title);
  },
};

export const Queue: Story = {
  args: {
    children: (
      <Demo notices={[success, warning, danger, queued]} label="Mostrar fila" />
    ),
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Mostrar fila' }));
    const body = within(document.body);
    await expect(
      body.queryByRole('dialog', { name: queued.title }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      body.getByRole('button', { name: 'Fechar: Link copiado' }),
    );
    await waitFor(() =>
      expect(body.getByRole('dialog', { name: queued.title })).toBeVisible(),
    );
  },
};

export const Repeated: Story = {
  args: {
    children: <Demo notices={[success, success]} label="Copiar duas vezes" />,
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Copiar duas vezes' }),
    );
    const card = within(document.body).getByRole('dialog', {
      name: success.title,
    });
    await waitFor(() => expect(within(card).getByText('×2')).toBeVisible());
  },
};

export const LongMessage: Story = {
  args: {
    children: (
      <Demo
        label="Mostrar erro"
        notices={[
          {
            ...danger,
            description:
              'O navegador não conseguiu copiar o link do convite. Selecione o endereço completo no campo Link do convite e copie manualmente antes de enviar à pessoa convidada.',
          },
        ]}
      />
    ),
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Mostrar erro' }));
    await waitFor(() =>
      expect(
        within(document.body).getByRole('dialog', { name: danger.title }),
      ).toBeVisible(),
    );
  },
};

export const KeyboardDismissal: Story = {
  ...Danger,
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Copiar' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{F6}{Tab}');
    const body = within(document.body);
    await expect(
      body.getByRole('dialog', { name: danger.title }),
    ).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
  },
};

export const WithinDialog: Story = {
  args: {
    children: (
      <Dialog
        label="Convidar usuário"
        title="Convidar usuário"
        viewportOverlay={<ToastHost />}
      >
        <Demo notices={[danger]} label="Copiar link" />
      </Dialog>
    ),
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Convidar usuário' }),
    );
    const dialog = within(document.body).getByRole('dialog', {
      name: 'Convidar usuário',
    });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Copiar link' }),
    );
    await waitFor(() =>
      expect(
        within(dialog).getByRole('dialog', { name: danger.title }),
      ).toBeVisible(),
    );
  },
};
