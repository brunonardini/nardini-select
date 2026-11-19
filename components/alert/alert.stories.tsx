import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { Alert } from './alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  args: {
    title: 'Aviso',
    children: 'Confira as informações antes de continuar.',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'danger'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Fluid feedback occupying 100% of the parent width. Omitted variant and variant="default" use the neutral Off-white surface. variant="danger" uses the approved pink/red error treatment. The parent owns any max-width and outer spacing; the login content column constrains its danger alert. Uses role="alert", a decorative lock, a summary and recovery guidance.',
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
export const Danger: Story = {
  args: {
    variant: 'danger',
    title: 'Acesso negado',
    children:
      'Esta conta não tem acesso. Use outra conta Google ou peça um convite ao administrador.',
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
