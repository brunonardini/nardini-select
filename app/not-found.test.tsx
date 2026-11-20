import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import NotFound, { metadata } from './not-found';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn(), replace: vi.fn() }),
}));

describe('NotFound', () => {
  it('names the missing page and offers a way home', () => {
    expect(metadata.title).toBe('Página não encontrada | Nardini Select');
    render(<NotFound />);
    expect(
      screen.getByRole('heading', { name: 'Procurei em todo canto.' }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Voltar ao início' }),
    ).toHaveAttribute('href', '/');
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeVisible();
  });
});
