import * as Sentry from '@sentry/nextjs';

import {
  beforeSend as scrubEvent,
  beforeSendTransaction as scrubTransaction,
} from './lib/sentry/logic/scrub';

Sentry.init({
  // This SDK replaced sendDefaultPii. These switches keep automatic PII off.
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    urlQueryParams: false,
    httpBodies: [],
    databaseQueryData: false,
    stackFrameVariables: false,
  },
  beforeSend(event) {
    return scrubEvent(event);
  },
  beforeSendTransaction(event) {
    return scrubTransaction(event);
  },
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  // nardini-select@X.Y.Z in production. Elsewhere the key is left out (an
  // explicit undefined would override it), so the SDK keeps the release
  // injected at build time: the commit SHA.
  ...(process.env.NEXT_PUBLIC_SENTRY_RELEASE && {
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  }),

  // Capture every trace in development, 10% in production.
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
});
