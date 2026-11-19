import { describe, expect, it } from 'vitest';

import { withRoute } from './guard';

describe('withRoute', () => {
  it('refuses a cross-site mutation before it looks at the session', async () => {
    const route = withRoute({ allow: ['active'] }, async () => {
      return Response.json({ ok: true });
    });
    const response = await route(
      new Request('https://nardiniselect.com.br/admin/api', {
        method: 'POST',
        headers: { origin: 'https://evil.example' },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ message: 'Forbidden' });
  });
});
