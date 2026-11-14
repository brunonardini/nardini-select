import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  it('shows the logo linking to the top and the main navigation', () => {
    render(<SiteHeader />);

    expect(
      screen.getByRole('link', { name: 'Nardini Select — início' }),
    ).toHaveAttribute('href', '#inicio');
    expect(
      screen.getByRole('navigation', { name: 'Navegação principal' }),
    ).toBeInTheDocument();
  });
});
