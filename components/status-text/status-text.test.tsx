import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatusText } from './status-text';

describe('StatusText', () => {
  it.each([
    'Ativo',
    'Pendente',
    'Termos desatualizados',
    'Desabilitado',
    'Anonimizado',
  ])('writes the %s state next to a hidden marker', (state) => {
    const { container } = render(<StatusText state={state} />);
    expect(screen.getByText(state)).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('keeps an unknown state readable', () => {
    render(<StatusText state="Outro" />);
    expect(screen.getByText('Outro')).toBeInTheDocument();
  });
});
