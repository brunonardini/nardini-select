import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { Alert } from './alert';

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  args: {
    title: 'Aviso',
    children: 'Confira as informações antes de continuar.',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'info', 'success', 'warning', 'danger'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Fluid feedback with a short title, supporting text and a decorative icon. The parent controls max-width and outer spacing. Info and success use role="status". Default, warning and danger use role="alert".',
      },
    },
  },
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;

/** No variant: neutral surface, filling the available canvas width. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole('alert');
    await expect(alert).toHaveTextContent('Aviso');
    await expect(alert.getBoundingClientRect().width).toBeCloseTo(
      alert.parentElement!.getBoundingClientRect().width,
      0,
    );
  },
};
export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Convite pendente',
    children:
      'A pessoa convidada pode acessar o painel após aceitar o convite.',
  },
};
export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Perfil atualizado',
    children: 'As alterações foram salvas.',
  },
};
export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Seu convite expira em breve',
    children: 'Aceite o convite para acessar o painel.',
  },
};
export const Danger: Story = {
  args: {
    variant: 'danger',
    title: 'Acesso negado',
    children:
      'Esta conta não tem acesso. Use outra conta Google ou peça um convite ao administrador.',
  },
};
export const OperationalError: Story = {
  args: {
    variant: 'danger',
    icon: 'error',
    title: 'Não foi possível carregar os usuários',
    children: 'Use o botão Tentar novamente para carregar a lista.',
  },
};
/** The component is fluid; only this surrounding example sets a 400px limit. */
export const WithinAContainer: Story = {
  ...Danger,
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};
