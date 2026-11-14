import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from './page';

describe('Home', () => {
  it('has a single main heading with the hero promise', () => {
    render(<Home />);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(
      'Mais bem-estar começa com boas escolhas.',
    );
  });

  it('renders the five home sections in order', () => {
    const { container } = render(<Home />);

    const ids = [...container.querySelectorAll('main > section')].map(
      (section) => section.id,
    );
    expect(ids).toEqual(['inicio', 'marca', 'selecao', 'loja', 'contato']);
  });

  it('offers skip navigation to the main content', () => {
    render(<Home />);

    expect(
      screen.getByRole('link', { name: 'Pular para o conteúdo' }),
    ).toHaveAttribute('href', '#conteudo');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'conteudo');
  });

  it('presents the three curation pillars', () => {
    render(<Home />);

    for (const title of [
      'Seleção Criteriosa',
      'Bem-Estar e Desenvolvimento',
      'Experiência Premium',
    ]) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    }
  });

  it('links directions to the store address on Google Maps', () => {
    render(<Home />);

    const directions = screen.getByRole('link', {
      name: /^Como chegar.*Google Maps/,
    });
    const url = new URL(directions.getAttribute('href') ?? '');
    expect(url.hostname).toBe('www.google.com');
    expect(url.searchParams.get('destination')).toBe(
      'Avenida Riachuelo, 350, Liberdade, Resende, RJ, 27521-171',
    );
  });

  it('routes WhatsApp contact through the server redirect', () => {
    render(<Home />);

    const contact = within(
      screen.getByRole('region', { name: 'Vamos conversar?' }),
    );
    expect(
      contact.getByRole('link', { name: /^Fale com a gente.*WhatsApp/ }),
    ).toHaveAttribute('href', '/contato/whatsapp');
    expect(
      contact.getByRole('link', { name: /^Siga @nardiniselect.*Instagram/ }),
    ).toHaveAttribute('href', 'https://www.instagram.com/nardiniselect/');
  });

  it('uses the official brand seal, not a redrawn copy', () => {
    render(<Home />);

    expect(
      screen.getByRole('img', { name: 'Selo Nardini Select' }),
    ).toHaveAttribute('src', expect.stringContaining('selo.png'));
  });

  it('speaks about dogs, not pets, as the brand voice asks', () => {
    const { container } = render(<Home />);

    expect(container.textContent).not.toMatch(/\bpets?\b|pet shop/i);
    expect(container.textContent).toContain(
      'Curadoria especializada para cães',
    );
  });

  it('never shows a phone number', () => {
    const { container } = render(<Home />);

    expect(container.textContent).not.toMatch(/\(?\d{2}\)?\s?9?\d{4}-?\d{4}/);
  });

  it('opens every new-tab link without exposing the opener', () => {
    const { container } = render(<Home />);

    const newTabLinks = container.querySelectorAll('a[target="_blank"]');
    expect(newTabLinks.length).toBeGreaterThan(0);
    for (const link of newTabLinks) {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('gives every image an alt attribute', () => {
    const { container } = render(<Home />);

    for (const image of container.querySelectorAll('img')) {
      expect(image).toHaveAttribute('alt');
    }
  });
});
