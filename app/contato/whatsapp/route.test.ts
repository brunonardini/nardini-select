// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

describe('GET /contato/whatsapp', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('redirects to WhatsApp with the configured number and a greeting', () => {
    vi.stubEnv('WHATSAPP_NUMBER', '5511999999999');

    const response = GET();

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get('location') ?? '');
    expect(location.origin + location.pathname).toBe(
      'https://wa.me/5511999999999',
    );
    expect(location.searchParams.get('text')).toBe(
      'Olá! Conheci a Nardini Select pelo site e gostaria de saber mais sobre a seleção de vocês.',
    );
  });
});
