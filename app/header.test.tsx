import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Header from './header';

describe('Header', () => {
  it('links each navigation item to its home section', () => {
    render(<Header />);
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });

    expect(nav.querySelectorAll('a')).toHaveLength(4);
    expect(screen.getByRole('link', { name: 'A marca' })).toHaveAttribute(
      'href',
      '#marca',
    );
    expect(screen.getByRole('link', { name: 'Nossa seleção' })).toHaveAttribute(
      'href',
      '#selecao',
    );
    expect(screen.getByRole('link', { name: 'Nossa loja' })).toHaveAttribute(
      'href',
      '#loja',
    );
    expect(
      screen.getByRole('link', { name: 'Fale com a gente' }),
    ).toHaveAttribute('href', '#contato');
  });

  it('opens and closes the mobile menu from the toggle', async () => {
    const user = userEvent.setup();
    render(<Header />);
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'navigation');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Fechar menu');
    expect(screen.getByRole('navigation')).toHaveClass('is-open');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('navigation')).not.toHaveClass('is-open');
  });

  it('closes the menu when a navigation link is chosen', async () => {
    const user = userEvent.setup();
    render(<Header />);
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });

    await user.click(toggle);
    await user.click(screen.getByRole('link', { name: 'Nossa loja' }));

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the menu on Escape and returns focus to the toggle', async () => {
    const user = userEvent.setup();
    render(<Header />);
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });

    await user.click(toggle);
    await user.tab();
    expect(toggle).not.toHaveFocus();

    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });
});
