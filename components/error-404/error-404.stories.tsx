import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '../button/button';
import { Error404 } from './error-404';

const goBack = fn();
const meta = {
  title: 'Components/Error 404',
  component: Error404,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Approved rug photograph and fixed title “Procurei em todo canto.”. Optional description defaults to “Até debaixo do tapete. Mas esta página não foi encontrada.”. Pass recovery controls through children. The parent supplies available height; this component centers within it. Actions stack in narrow containers and become a wrapping row from 600px of container width. app/not-found.tsx uses this as the default not-found UI. Preserve tmp/error-404-proposals/ and its source images.',
      },
    },
  },
  argTypes: {
    description: {
      control: 'text',
      description:
        'Explanation of the missing page; defaults to the approved rug copy.',
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
} satisfies Meta<typeof Error404>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { name: 'Procurei em todo canto.' }),
    ).toBeVisible();
    await expect(
      canvas.getByText(
        'Até debaixo do tapete. Mas esta página não foi encontrada.',
      ),
    ).toBeVisible();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const WithActions: Story = {
  args: {
    children: (
      <>
        <Button href="/">Voltar ao início</Button>
        <Button variant="secondary" onClick={goBack}>
          Voltar
        </Button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Voltar',
      }),
    );
    await expect(goBack).toHaveBeenCalled();
  },
};

export const CustomDescription: Story = {
  args: {
    description:
      'Não encontramos o conteúdo solicitado. Confira o endereço ou volte ao início.',
    children: <Button href="/">Voltar ao início</Button>,
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
          'A narrow embedded content area on desktop retains stacked actions. The parent supplies its available height.',
      },
    },
  },
};

export const PendingActions: Story = {
  args: {
    children: (
      <>
        <Button loading loadingLabel="Voltando ao início…">
          Voltar ao início
        </Button>
        <Button variant="secondary" disabled>
          Voltar
        </Button>
      </>
    ),
  },
};

export const KeyboardFocus: Story = {
  ...WithActions,
  play: async ({ canvasElement }) => {
    const action = within(canvasElement).getByRole('button', {
      name: 'Voltar',
    });
    action.focus();
    await expect(action).toHaveFocus();
  },
};

export const LongDescription: Story = {
  args: {
    description:
      'Procuramos em todos os cantos, mas não encontramos esta página. O endereço pode ter sido digitado incorretamente ou o conteúdo pode ter mudado de lugar. Confira o endereço ou volte ao início para continuar.',
    children: <Button href="/">Voltar ao início</Button>,
  },
};
