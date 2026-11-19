import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';

// Netlify sets CONTEXT at build time (production, deploy-preview,
// branch-deploy), so deploy previews don't report as production.
const environment = process.env.CONTEXT ?? process.env.NODE_ENV;

// Set only by the CircleCI release job (nardini-select@X.Y.Z). Netlify deploy
// previews don't have it, so their release stays the built commit SHA.
const versionRelease = process.env.SENTRY_RELEASE;

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'Referrer-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return ['/admin', '/admin/:path*', '/api/auth/:path*'].map((source) => ({
      source,
      headers: securityHeaders,
    }));
  },
  env: {
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: environment,
    ...(versionRelease && { NEXT_PUBLIC_SENTRY_RELEASE: versionRelease }),
  },
};

export default withSentryConfig(nextConfig, {
  org: 'bruno-nardini',
  project: 'nardini-select',

  // Uploads source maps for readable production stack traces. Without the
  // token (local builds, CI), the build still succeeds and skips the upload.
  // Client source maps are deleted after the upload, so they're never served.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,

  release: {
    // Without SENTRY_RELEASE, the SDK names the release after the git commit.
    name: versionRelease,
    setCommits: { auto: true, ignoreMissing: true, ignoreEmpty: true },
    // Record a deploy only for versioned production releases.
    deploy: versionRelease ? { env: environment ?? 'production' } : false,
  },

  // Only print source map upload logs in CI.
  silent: !process.env.CI,
});
