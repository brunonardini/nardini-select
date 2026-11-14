import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Layout, { metadata, viewport } from './layout';

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
    expect(screen.getByRole('main')).toHaveTextContent('Conteúdo');
  });

  it('describes the store for search engines and link previews', () => {
    expect(metadata.title).toBe('Nardini Select Pet Shop | Resende, RJ');
    expect(metadata.description).toContain('Resende, RJ');
    expect(metadata.openGraph).toMatchObject({
      title: 'Nardini Select Pet Shop',
      locale: 'pt_BR',
      type: 'website',
    });
  });

  it('uses the brand brown for the browser theme color', () => {
    expect(viewport.themeColor).toBe('#542e20');
  });
});
