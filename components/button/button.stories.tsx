import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Icon } from '../icon/icon';
import { Button } from './button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Conheça nossa seleção', variant: 'primary' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'outline'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Brand button. With `href` it renders a plain `<a>` (navigation stays a link); without it, Base UI’s `Button` renders a `<button type="button">`.',
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
    children: (
      <>
        Conheça nossa seleção
        <Icon name="down" />
      </>
    ),
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
    children: (
      <>
        Visite nossa loja
        <Icon name="down" />
      </>
    ),
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
