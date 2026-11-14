import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Layout, { metadata, viewport } from './layout';

// next/font only runs inside the Next.js compiler.
vi.mock('next/font/google', () => ({
  Lexend: () => ({ variable: 'font-brand' }),
}));

describe('Layout', () => {
  it('renders the page in Portuguese', () => {
    // Layout renders its own <html>, so mount it into the document.
    render(
      <Layout params={Promise.resolve({})}>
        <main>Conteúdo</main>
      </Layout>,
      { container: document },
    );

    expect(document.documentElement).toHaveAttribute('lang', 'pt-BR');
    expect(document.documentElement).toHaveClass('font-brand');
    expect(screen.getByRole('main')).toHaveTextContent('Conteúdo');
  });

  it('describes the store for search engines and link previews', () => {
    expect(metadata.title).toBe(
      'Nardini Select | Curadoria especializada para cães em Resende, RJ',
    );
    expect(metadata.description).toContain('Resende, RJ');
    expect(metadata.openGraph).toMatchObject({
      title: 'Nardini Select',
      locale: 'pt_BR',
      type: 'website',
    });
  });

  it('uses Café Profundo for the browser theme color', () => {
    expect(viewport.themeColor).toBe('#522e24');
  });
});
