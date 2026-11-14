import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: {
    // Netlify sets CONTEXT at build time (production, deploy-preview,
    // branch-deploy), so deploy previews don't report as production.
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.CONTEXT ?? process.env.NODE_ENV,
  },
};

export default withSentryConfig(nextConfig, {
  org: 'bruno-nardini',
  project: 'nardini-select',

  // Uploads source maps for readable production stack traces. Without the
  // token (local builds, CI), the build still succeeds and skips the upload.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,

  // Only print source map upload logs in CI.
  silent: !process.env.CI,
});
