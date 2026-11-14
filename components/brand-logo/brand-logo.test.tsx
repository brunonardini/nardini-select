import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrandLogo } from './brand-logo';

describe('BrandLogo', () => {
  it('links the logo to the top of the page with the given name', () => {
    render(
      <BrandLogo label="Voltar ao início" sizes="200px" className="brand" />,
    );
    const link = screen.getByRole('link', { name: 'Voltar ao início' });

    expect(link).toHaveAttribute('href', '#inicio');
    expect(link).toHaveClass('brand');
    expect(screen.getByRole('img', { name: 'Nardini Select' })).toHaveAttribute(
      'sizes',
      '200px',
    );
  });
});
