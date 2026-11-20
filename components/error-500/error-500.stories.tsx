import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '../button/button';
import { Error500 } from './error-500';

const retry = fn();
const meta = {
  title: 'Components/Error 500',
  component: Error500,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Fixed sofa photograph and title. Customize only description (default: “Não conseguimos carregar esta página.”) and children for recovery controls. The parent provides available height; the component centers within it. Actions stack in narrow containers and become a wrapping row at 600px of container width, even when embedded in a wide desktop page. Never pass raw exception messages. Preserve tmp/error-proposals/ unless the owner explicitly requests deletion.',
      },
    },
  },
  argTypes: {
    description: {
      control: 'text',
      description:
        'Safe user-facing explanation. Defaults to Não conseguimos carregar esta página.',
    },
    children: {
      control: false,
      description:
        'Caller-owned recovery controls, normally shared Button components.',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100svh', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Error500>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { name: 'Eu não sei o que aconteceu…' }),
    ).toBeVisible();
    await expect(
      canvas.getByText('Não conseguimos carregar esta página.'),
    ).toBeVisible();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const WithActions: Story = {
  args: {
    children: (
      <>
        <Button onClick={retry}>Tentar novamente</Button>
        <Button variant="secondary" href="/">
          Voltar ao site
        </Button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Tentar novamente' }),
    );
    await expect(retry).toHaveBeenCalled();
  },
};

export const DatabaseUnavailable: Story = {
  args: {
    description: 'Não conseguimos conectar ao banco de dados.',
    children: (
      <>
        <Button href="/admin">Tentar novamente</Button>
        <Button variant="secondary" href="/">
          Voltar ao site
        </Button>
      </>
    ),
  },
};

export const Mobile: Story = {
  ...WithActions,
  globals: { viewport: { value: 'mobile', isRotated: false } },
};

export const ConstrainedContainer: Story = {
  ...WithActions,
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          width: 360,
          maxWidth: '100%',
          minHeight: 700,
          margin: 'auto',
          background: 'var(--off-white)',
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'An embedded 360px content area on a desktop. Actions remain stacked because the container, not the viewport, controls layout.',
      },
    },
  },
};

export const PendingActions: Story = {
  args: {
    children: (
      <>
        <Button loading loadingLabel="Tentando novamente…">
          Tentar novamente
        </Button>
        <Button variant="secondary" disabled>
          Voltar ao site
        </Button>
      </>
    ),
  },
};

export const KeyboardFocus: Story = {
  ...WithActions,
  play: async ({ canvasElement }) => {
    const action = within(canvasElement).getByRole('button', {
      name: 'Tentar novamente',
    });
    action.focus();
    await expect(action).toHaveFocus();
  },
};

export const LongDescription: Story = {
  args: {
    description:
      'Não conseguimos carregar as informações solicitadas neste momento. Aguarde um instante e tente novamente. Se o problema continuar, volte ao site e retorne a esta página mais tarde.',
    children: <Button href="/admin">Tentar novamente</Button>,
  },
};
