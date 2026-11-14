import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MainNavigation } from './main-navigation';

const sections = [
  ['A marca', '#marca'],
  ['Nossa seleção', '#selecao'],
  ['Nossa loja', '#loja'],
  ['Fale com a gente', '#contato'],
] as const;

function renderNavigation() {
  render(
    <header>
      <MainNavigation />
    </header>,
  );
  return {
    user: userEvent.setup(),
    nav: screen.getByRole('navigation', { name: 'Navegação principal' }),
    toggle: screen.getByRole('button', { name: 'Abrir menu' }),
  };
}

const panel = () =>
  document.querySelector<HTMLElement>('.navigation-panel-links');

describe('MainNavigation', () => {
  it('links each inline item to its home section', () => {
    const { nav } = renderNavigation();

    // The menu panel isn't mounted while closed: only the inline links show.
    expect(within(nav).getAllByRole('link')).toHaveLength(4);
    for (const [name, href] of sections) {
      expect(within(nav).getByRole('link', { name })).toHaveAttribute(
        'href',
        href,
      );
    }
  });

  it('still opens the menu when it is not inside a header', async () => {
    // The panel anchors to the header's bottom edge, or to nothing when
    // there is no header.
    render(<MainNavigation />);
    const user = userEvent.setup();
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(panel()).toBeInTheDocument();
  });

  it('opens and closes the menu panel from the toggle', async () => {
    const { user, toggle } = renderNavigation();

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Fechar menu');
    expect(toggle).toHaveClass('is-open');
    expect(panel()).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAccessibleName('Abrir menu');
  });

  it('keeps the menu panel inside the navigation landmark', async () => {
    const { user, nav, toggle } = renderNavigation();

    await user.click(toggle);

    expect(nav).toContainElement(panel());
    for (const [name, href] of sections) {
      expect(within(panel()!).getByRole('link', { name })).toHaveAttribute(
        'href',
        href,
      );
    }
  });

  it('does not open the menu on hover', async () => {
    const { user, toggle } = renderNavigation();

    await user.hover(toggle);
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it.each(sections.map(([name]) => name))(
    'closes the menu when the %s link is chosen',
    async (name) => {
      const { user, toggle } = renderNavigation();

      await user.click(toggle);
      await user.click(within(panel()!).getByRole('link', { name }));

      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    },
  );

  it('closes the menu on Escape and returns focus to the toggle', async () => {
    const { user, toggle } = renderNavigation();

    await user.click(toggle);
    within(panel()!).getByRole('link', { name: 'A marca' }).focus();
    expect(toggle).not.toHaveFocus();

    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('closes the menu on a click outside it', async () => {
    const { user, toggle } = renderNavigation();

    await user.click(toggle);
    await user.click(document.body);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
