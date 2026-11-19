import path from 'node:path';
import { pathToFileURL } from 'node:url';

import './e2e/register-server-only';

import { defineConfig, devices } from '@playwright/test';

import { loadLocalEnv, withDatabaseName } from './e2e/database-env';

const port = 3200;
const baseURL = `http://localhost:${port}`;

loadLocalEnv();
const databaseUrl = process.env.DATABASE_URL
  ? withDatabaseName(process.env.DATABASE_URL)
  : undefined;
const authSecret = 'test-secret-at-least-32-characters-long';

process.env.BETTER_AUTH_SECRET = authSecret;
process.env.BETTER_AUTH_URL = baseURL;
process.env.GOOGLE_CLIENT_ID ??= 'test-google-client';
process.env.GOOGLE_CLIENT_SECRET ??= 'test-google-secret';
if (databaseUrl) process.env.DATABASE_URL = databaseUrl;

const serverEnv = {
  ...process.env,
  WHATSAPP_NUMBER: '5511999999999',
  ...(databaseUrl ? { DATABASE_URL: databaseUrl } : {}),
  BETTER_AUTH_URL: baseURL,
  BETTER_AUTH_SECRET: authSecret,
  GOOGLE_CLIENT_ID: 'test-google-client',
  GOOGLE_CLIENT_SECRET: 'test-google-secret',
};

const hook = pathToFileURL(
  path.join(process.cwd(), 'e2e/register-server-only.ts'),
).href;
if (!process.env.NODE_OPTIONS?.includes(hook)) {
  process.env.NODE_OPTIONS = [
    process.env.NODE_OPTIONS,
    '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON',
    `--import ${hook}`,
  ]
    .filter(Boolean)
    .join(' ');
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 4,
  globalSetup: './e2e/global-setup.ts',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [
        ['list'],
        ['junit', { outputFile: 'reports/e2e/junit.xml' }],
        ['html', { open: 'never' }],
      ]
    : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  // Serves an existing production build: `npm run test:e2e` builds first,
  // and in CI the build job does.
  webServer: {
    command: `npm run start -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: serverEnv,
  },
});
