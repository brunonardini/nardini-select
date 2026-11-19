import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Icon } from '../icon/icon';
import { Button } from './button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Conheça nossa seleção', variant: 'primary' },
  argTypes: {
    loading: { control: 'boolean' },
    loadingLabel: { control: 'text' },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'outline'],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Brand button with primary, secondary and outline variants. leadingIcon and trailingIcon place decorative icons before or after the label, for actions and native links. All action variants share loading/loadingLabel: three infinite paw pulses replace both icons, aria-busy is set, and the action is disabled. Primary colors follow the surrounding surface context, not a route-specific variant. With `href` it renders a plain `<a>` (navigation stays a link); without it, Base UI’s `Button` renders a `<button type="button">`.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Link styled as the filled button, as in the hero. */
export const PrimaryLink: Story = {
  args: {
    href: '#selecao',
    children: 'Conheça nossa seleção',
    trailingIcon: <Icon name="down" />,
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    await expect(link).toHaveAttribute('href', '#selecao');
  },
};

/** Link styled as the outline button, as in the hero. */
export const OutlineLink: Story = {
  args: {
    variant: 'outline',
    href: '#loja',
    children: 'Visite nossa loja',
    trailingIcon: <Icon name="down" />,
  },
};

/** External link that opens in a new tab, with the hint for screen readers. */
export const ExternalLink: Story = {
  args: {
    href: 'https://www.instagram.com/nardiniselect/',
    target: '_blank',
    rel: 'noopener noreferrer',
    children: (
      <>
        Siga @nardiniselect
        <span className="sr-only"> no Instagram, em uma nova aba</span>
      </>
    ),
  },
};

/** A real action renders Base UI’s Button. */
export const Action: Story = {
  args: { children: 'Adicionar à sacola', onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Adicionar à sacola',
    });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const OutlineAction: Story = {
  args: { variant: 'outline', children: 'Ver detalhes', onClick: fn() },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Ver detalhes' }),
    );
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

/** Keyboard focus shows the café outline. */
export const Focused: Story = {
  args: { href: '#selecao', children: 'Conheça nossa seleção' },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('link')).toHaveFocus();
  },
};

export const Disabled: Story = {
  args: { children: 'Adicionar à sacola', disabled: true, onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** Stays in the tab order while disabled, for loading states. */
export const DisabledFocusable: Story = {
  args: {
    variant: 'outline',
    children: 'Adicionando…',
    disabled: true,
    focusableWhenDisabled: true,
  },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const button = within(canvasElement).getByRole('button');
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
  },
};

/** Any decorative icon can lead the label; Google is only the login's choice. */
export const LeadingIcon: Story = {
  args: {
    children: 'Encontrar loja',
    leadingIcon: <Icon name="pin" />,
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Encontrar loja' }),
    );
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
/** The home keeps its arrow after the label through trailingIcon. */
export const TrailingIcon: Story = { ...PrimaryLink };
export const SecondaryLink: Story = {
  args: {
    variant: 'secondary',
    href: '/',
    children: 'Voltar ao site',
    leadingIcon: <Icon name="left" />,
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Voltar ao site' }),
    ).toHaveAttribute('href', '/');
  },
};
export const SecondaryAction: Story = {
  ...Action,
  args: { variant: 'secondary', children: 'Voltar', onClick: fn() },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Voltar' }),
    );
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
/** Primary stays primary on dark surfaces; only inherited contrast tokens change. */
export const PrimaryOnDark: Story = {
  args: {
    children: 'Entrar com Google',
    leadingIcon: <Icon name="google" />,
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div className="button-surface-dark" style={{ padding: 24 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Entrar com Google' }),
    );
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    loadingLabel: 'Carregando…',
    children: 'Salvar',
    leadingIcon: <Icon name="pin" />,
    trailingIcon: <Icon name="down" />,
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Carregando…',
    });
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button.querySelectorAll('svg')).toHaveLength(3);
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const LoadingSecondary: Story = {
  ...Loading,
  args: { ...Loading.args, variant: 'secondary' },
};
export const LoadingOutline: Story = {
  ...Loading,
  args: { ...Loading.args, variant: 'outline' },
};
export const LoadingOnDark: Story = {
  ...Loading,
  decorators: PrimaryOnDark.decorators,
  globals: { viewport: { value: 'mobile' } },
};
export const SecondaryFocused: Story = {
  args: { variant: 'secondary', children: 'Voltar ao site', href: '/' },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('link')).toHaveFocus();
  },
};
export const SecondaryDisabled: Story = {
  ...Disabled,
  args: { ...Disabled.args, variant: 'secondary' },
};
