import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../button/button';
import { Error500 } from './error-500';

describe('Error500', () => {
  it('renders fixed content and the default description without actions', () => {
    const { container } = render(<Error500 />);
    expect(
      screen.getByRole('heading', { name: 'Eu não sei o que aconteceu…' }),
    ).toBeVisible();
    expect(
      screen.getByText('Não conseguimos carregar esta página.'),
    ).toBeVisible();
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    expect(container.querySelector('img')?.getAttribute('src')).toContain(
      'error-500-sofa.webp',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('uses safe custom copy and caller-owned recovery controls', () => {
    const retry = vi.fn();
    render(
      <Error500 description="Não conseguimos conectar ao banco de dados.">
        <Button onClick={retry}>Tentar novamente</Button>
        <Button href="/" variant="secondary">
          Voltar ao site
        </Button>
      </Error500>,
    );
    expect(
      screen.getByText('Não conseguimos conectar ao banco de dados.'),
    ).toBeVisible();
    expect(
      screen.queryByText('Não conseguimos carregar esta página.'),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('link', { name: 'Voltar ao site' }),
    ).toHaveAttribute('href', '/');
  });
});
