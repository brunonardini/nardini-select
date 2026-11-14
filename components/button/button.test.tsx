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
});
