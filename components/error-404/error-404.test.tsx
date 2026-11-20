import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../button/button';
import { Error404 } from './error-404';

describe('Error404', () => {
  it('renders the fixed rug photo, title and default description without controls', () => {
    const { container } = render(<Error404 />);
    expect(
      screen.getByRole('heading', { name: 'Procurei em todo canto.' }),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Até debaixo do tapete. Mas esta página não foi encontrada.',
      ),
    ).toBeVisible();
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    expect(container.querySelector('img')?.getAttribute('src')).toContain(
      'error-404-rug.webp',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
  it('customizes the description and delegates recovery to the caller', () => {
    const goBack = vi.fn();
    render(
      <Error404 description="Não encontramos o conteúdo solicitado.">
        <Button href="/">Voltar ao início</Button>
        <Button variant="secondary" onClick={goBack}>
          Voltar
        </Button>
      </Error404>,
    );
    expect(
      screen.getByText('Não encontramos o conteúdo solicitado.'),
    ).toBeVisible();
    expect(
      screen.queryByText(
        'Até debaixo do tapete. Mas esta página não foi encontrada.',
      ),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(goBack).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('link', { name: 'Voltar ao início' }),
    ).toHaveAttribute('href', '/');
  });
});
