import * as Sentry from '@sentry/nextjs';

/** Keep diagnostics in monitoring, never in recovery UI. */
export function reportPageError(error: unknown) {
  Sentry.captureException(error);
}
