import type { ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Icon } from '../icon/icon';
import { Button } from './button';

const variants = ['primary', 'secondary', 'outline'] as const;
const variantClick = fn();
const leadingClick = fn();
const disabledClick = fn();
const loadingClick = fn();

function VariantRow({
  children,
  surface,
}: {
  children: ReactNode;
  surface?: 'dark';
}) {
  const row = (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {children}
    </div>
  );
  if (surface !== 'dark') return row;
  return (
    <div className="button-surface-dark" style={{ padding: 24 }}>
      {row}
    </div>
  );
}

function variantButtons(
  render: (variant: (typeof variants)[number]) => ReactNode,
  surface?: 'dark',
) {
  return (
    <VariantRow surface={surface}>
      {variants.map((variant) => render(variant))}
    </VariantRow>
  );
}

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
    controls: { disable: true },
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

async function expectThreeVariants(
  canvas: ReturnType<typeof within>,
  role: 'button' | 'link',
  name: string,
) {
  const items = canvas.getAllByRole(role, { name });
  await expect(items).toHaveLength(3);
  await expect(items[0]).toHaveClass('button-primary');
  await expect(items[1]).toHaveClass('button-secondary');
  await expect(items[2]).toHaveClass('button-outline');
  return items;
}

/** The three variants, text only. */
export const Variants: Story = {
  render: () =>
    variantButtons((variant) => (
      <Button key={variant} variant={variant} onClick={variantClick}>
        Adicionar à sacola
      </Button>
    )),
  play: async ({ canvasElement }) => {
    const [primary] = await expectThreeVariants(
      within(canvasElement),
      'button',
      'Adicionar à sacola',
    );
    await userEvent.click(primary);
    await expect(variantClick).toHaveBeenCalledOnce();
  },
};

/** Links that stay in this site, one for each variant. */
export const InternalLinks: Story = {
  name: 'Internal links',
  render: () =>
    variantButtons((variant) => (
      <Button key={variant} variant={variant} href="#selecao">
        Conheça nossa seleção
      </Button>
    )),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const links = await expectThreeVariants(
      canvas,
      'link',
      'Conheça nossa seleção',
    );
    for (const link of links) {
      await expect(link).toHaveAttribute('href', '#selecao');
    }
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await userEvent.tab();
    await expect(links[0]).toHaveFocus();
  },
};

/** Links that open in a new tab, one for each variant. */
export const ExternalLinks: Story = {
  name: 'External links',
  render: () =>
    variantButtons((variant) => (
      <Button
        key={variant}
        variant={variant}
        href="https://www.instagram.com/nardiniselect/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Siga @nardiniselect
        <span className="sr-only"> no Instagram, em uma nova aba</span>
      </Button>
    )),
  play: async ({ canvasElement }) => {
    const links = await expectThreeVariants(
      within(canvasElement),
      'link',
      'Siga @nardiniselect no Instagram, em uma nova aba',
    );
    for (const link of links) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  },
};

/** A decorative icon before the label, on every variant. */
export const LeadingIcon: Story = {
  name: 'Leading icon',
  render: () =>
    variantButtons((variant) => (
      <Button
        key={variant}
        variant={variant}
        leadingIcon={<Icon name="pin" />}
        onClick={leadingClick}
      >
        Encontrar loja
      </Button>
    )),
  play: async ({ canvasElement }) => {
    const buttons = await expectThreeVariants(
      within(canvasElement),
      'button',
      'Encontrar loja',
    );
    for (const button of buttons) {
      await expect(button.querySelectorAll('svg')).toHaveLength(1);
      await expect(button.firstElementChild?.tagName).toBe('svg');
    }
    await userEvent.click(buttons[0]);
    await expect(leadingClick).toHaveBeenCalledOnce();
  },
};

/** A decorative icon after the label, on every variant. */
export const TrailingIcon: Story = {
  name: 'Trailing icon',
  render: () =>
    variantButtons((variant) => (
      <Button
        key={variant}
        variant={variant}
        trailingIcon={<Icon name="down" />}
      >
        Ver detalhes
      </Button>
    )),
  play: async ({ canvasElement }) => {
    const buttons = await expectThreeVariants(
      within(canvasElement),
      'button',
      'Ver detalhes',
    );
    for (const button of buttons) {
      await expect(button.querySelectorAll('svg')).toHaveLength(1);
      await expect(button.lastElementChild?.tagName).toBe('svg');
    }
  },
};

/** Disabled actions, one for each variant. */
export const Disabled: Story = {
  render: () =>
    variantButtons((variant) => (
      <Button key={variant} variant={variant} disabled onClick={disabledClick}>
        Salvar
      </Button>
    )),
  play: async ({ canvasElement }) => {
    const buttons = await expectThreeVariants(
      within(canvasElement),
      'button',
      'Salvar',
    );
    for (const button of buttons) {
      await expect(button).toBeDisabled();
      await userEvent.click(button, { pointerEventsCheck: 0 });
    }
    await expect(disabledClick).not.toHaveBeenCalled();
  },
};

/** Loading replaces the label and any icons with paws, on every variant. */
export const Loading: Story = {
  render: () =>
    variantButtons((variant) => (
      <Button
        key={variant}
        variant={variant}
        loading
        loadingLabel="Carregando…"
        onClick={loadingClick}
      >
        Salvar
      </Button>
    )),
  play: async ({ canvasElement }) => {
    const buttons = await expectThreeVariants(
      within(canvasElement),
      'button',
      'Carregando…',
    );
    for (const button of buttons) {
      await expect(button).toBeDisabled();
      await expect(button).toHaveAttribute('aria-busy', 'true');
      await expect(button.querySelectorAll('svg')).toHaveLength(3);
      await userEvent.click(button, { pointerEventsCheck: 0 });
    }
    await expect(loadingClick).not.toHaveBeenCalled();
  },
};

/** The three variants on a café surface. */
export const DarkBackground: Story = {
  name: 'With dark background',
  render: () =>
    variantButtons(
      (variant) => (
        <Button key={variant} variant={variant}>
          Entrar com Google
        </Button>
      ),
      'dark',
    ),
  play: async ({ canvasElement }) => {
    const [primary] = await expectThreeVariants(
      within(canvasElement),
      'button',
      'Entrar com Google',
    );
    await expect(primary.closest('.button-surface-dark')).not.toBeNull();
  },
};
