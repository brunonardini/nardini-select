import { describe, expect, it } from 'vitest';

import { beforeSend, beforeSendTransaction, scrubSentryEvent } from './scrub';

describe('scrubSentryEvent', () => {
  it('removes oauth parameters, invitation tokens, cookies, and auth headers', () => {
    const event = scrubSentryEvent({
      user: {
        id: 'user-1',
        email: 'ana@example.com',
        username: 'ana',
        ip_address: '127.0.0.1',
      },
      request: {
        url: 'https://nardiniselect.com.br/admin/convite/abc?code=1&state=2&ok=1',
        query_string: 'code=1&state=2&ok=1',
        cookies: { invite: 'secret' },
        headers: {
          Authorization: 'Bearer secret',
          Cookie: 'invite=secret',
          'X-Request-Id': 'abc',
        },
      },
      breadcrumbs: [
        { data: { url: '/admin/convite/abc?code=1' } },
        { data: {} },
        {},
      ],
    });

    expect(event.user).toEqual({ id: 'user-1' });
    expect(event.request?.url).toBe(
      'https://nardiniselect.com.br/admin/convite/[token]?ok=1',
    );
    expect(event.request?.query_string).toBe('ok=1');
    expect(event.request).not.toHaveProperty('cookies');
    expect(event.request?.headers).toEqual({ 'X-Request-Id': 'abc' });
    expect(event.breadcrumbs?.[0]?.data?.url).toBe('/admin/convite/[token]');
    expect(event.breadcrumbs?.[1]).toEqual({ data: {} });
    expect(event.breadcrumbs?.[2]).toEqual({});
  });

  it('scrubs a query string that starts with a question mark', () => {
    expect(
      scrubSentryEvent({
        request: { query_string: '?code=1&state=2&ok=1' },
      }).request?.query_string,
    ).toBe('ok=1');
  });

  it('leaves an event without a request or user alone', () => {
    expect(scrubSentryEvent({})).toEqual({});
    expect(
      scrubSentryEvent({
        request: { query_string: null },
      }).request,
    ).toEqual({
      url: undefined,
      query_string: null,
      headers: undefined,
    });
  });

  it('scrubs a relative url and a value that is not a url', () => {
    const event = scrubSentryEvent({
      request: { url: 'http://[' },
    });
    expect(event.request?.url).toBe('http://[');
  });

  it('feeds the same scrub to both Sentry hooks', () => {
    const event = { user: { id: 'user-1', email: 'ana@example.com' } };
    expect(beforeSend(event).user).toEqual({ id: 'user-1' });
    expect(beforeSendTransaction(event).user).toEqual({ id: 'user-1' });
  });
});
