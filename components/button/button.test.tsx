import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders a link, not a button, when given an href', () => {
    render(
      <Button href="#loja" target="_blank">
        Visite nossa loja
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Visite nossa loja' });

    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '#loja');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveClass('button', 'button-primary');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a button of type button without an href', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Adicionar</Button>);
    const button = screen.getByRole('button', { name: 'Adicionar' });

    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies the variant and extra classes', () => {
    render(
      <Button variant="outline" className="wide">
        Ver mais
      </Button>,
    );

    expect(screen.getByRole('button')).toHaveClass(
      'button',
      'button-outline',
      'wide',
    );
  });

  it('ignores clicks while disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Adicionar
      </Button>,
    );
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-disabled');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('can stay focusable while disabled', async () => {
    render(
      <Button disabled focusableWhenDisabled>
        Adicionando…
      </Button>,
    );
    const button = screen.getByRole('button');

    await userEvent.tab();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
  it('uses the primary variant and a leading icon', () => {
    render(
      <Button
        variant="primary"
        leadingIcon={<svg aria-hidden="true" data-testid="leading-icon" />}
      >
        Entrar com Google
      </Button>,
    );
    expect(
      screen.getByRole('button', { name: 'Entrar com Google' }),
    ).toHaveClass('button-primary');
    expect(screen.getByTestId('leading-icon')).toBeInTheDocument();
  });

  it.each(['primary', 'secondary', 'outline', 'danger'] as const)(
    'disables the %s action and replaces both icons with paws while loading',
    async (variant) => {
      const onClick = vi.fn();
      const { rerender } = render(
        <Button
          loading
          variant={variant}
          loadingLabel="Conectando ao Google…"
          trailingIcon={<svg aria-hidden="true" data-testid="trailing-icon" />}
          leadingIcon={<svg aria-hidden="true" data-testid="leading-icon" />}
          onClick={onClick}
        >
          Entrar com Google
        </Button>,
      );
      const button = screen.getByRole('button', {
        name: 'Conectando ao Google…',
      });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button.querySelectorAll('svg')).toHaveLength(3);
      expect(screen.queryByTestId('leading-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('trailing-icon')).not.toBeInTheDocument();
      await userEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
      rerender(<Button onClick={onClick}>Entrar com Google</Button>);
      await userEvent.click(
        screen.getByRole('button', { name: 'Entrar com Google' }),
      );
      expect(onClick).toHaveBeenCalledOnce();
    },
  );

  it('provides a default loading label and preserves explicit disabled state', () => {
    const { rerender } = render(
      <Button loading disabled>
        Salvar
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Carregando…' })).toBeDisabled();
    rerender(
      <Button loading={false} disabled>
        Salvar
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });
  it('keeps trailing icons after the label for actions and links', () => {
    render(
      <>
        <Button
          trailingIcon={<svg aria-hidden="true" data-testid="action-tail" />}
        >
          Ver detalhes
        </Button>
        <Button
          href="#loja"
          trailingIcon={<svg aria-hidden="true" data-testid="link-tail" />}
        >
          Visite nossa loja
        </Button>
      </>,
    );
    expect(
      screen.getByRole('button', { name: 'Ver detalhes' }).lastElementChild,
    ).toHaveAttribute('data-testid', 'action-tail');
    expect(
      screen.getByRole('link', { name: 'Visite nossa loja' }).lastElementChild,
    ).toHaveAttribute('data-testid', 'link-tail');
  });
});
