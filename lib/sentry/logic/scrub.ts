export type Scrubbable = {
  user?: {
    id?: string;
    email?: string;
    username?: string;
    ip_address?: string;
  };
  request?: {
    url?: string;
    query_string?: string | null;
    cookies?: unknown;
    headers?: Record<string, string | undefined>;
  };
  breadcrumbs?: Array<{ data?: { url?: string } }>;
};

const DROPPED_HEADERS = new Set(['authorization', 'cookie', 'set-cookie']);

/** Drops OAuth `code` and `state`, invitation tokens, cookies, and auth headers. */
function scrubUrl(value: string): string {
  try {
    const absolute = /^https?:\/\//i.test(value);
    const url = new URL(value, 'http://scrub.local');
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    url.pathname = url.pathname.replace(
      /\/admin\/convite\/[^/]+/g,
      '/admin/convite/[token]',
    );
    if (!absolute) return `${url.pathname}${url.search}`;
    return url.toString();
  } catch {
    return value.replace(
      /\/admin\/convite\/[^/?#\s]+/g,
      '/admin/convite/[token]',
    );
  }
}

function scrubQuery(value: string): string {
  const params = new URLSearchParams(
    value.startsWith('?') ? value.slice(1) : value,
  );
  params.delete('code');
  params.delete('state');
  return params.toString();
}

function scrubHeaders(
  headers: Record<string, string | undefined> | undefined,
): Record<string, string | undefined> | undefined {
  if (!headers) return headers;
  const next: Record<string, string | undefined> = {};
  for (const [key, header] of Object.entries(headers)) {
    if (DROPPED_HEADERS.has(key.toLowerCase())) continue;
    next[key] = header;
  }
  return next;
}

function scrubRequest(request: NonNullable<Scrubbable['request']>) {
  return {
    url: request.url ? scrubUrl(request.url) : request.url,
    query_string:
      typeof request.query_string === 'string'
        ? scrubQuery(request.query_string)
        : request.query_string,
    headers: scrubHeaders(request.headers),
  };
}

export function scrubSentryEvent<T extends Scrubbable>(event: T): T {
  return {
    ...event,
    user: event.user ? { id: event.user.id } : event.user,
    request: event.request ? scrubRequest(event.request) : event.request,
    breadcrumbs: event.breadcrumbs?.map((crumb) => {
      if (!crumb.data?.url) return crumb;
      return {
        ...crumb,
        data: { ...crumb.data, url: scrubUrl(crumb.data.url) },
      };
    }),
  };
}

export function beforeSend<T>(event: T): T {
  return scrubSentryEvent(event as Scrubbable) as T;
}

export function beforeSendTransaction<T>(event: T): T {
  return scrubSentryEvent(event as Scrubbable) as T;
}
