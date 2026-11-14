import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,

  // Capture every trace in development, 10% in production.
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
});
