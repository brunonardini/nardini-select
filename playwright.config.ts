import { defineConfig, devices } from '@playwright/test';

const port = 3200;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
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
    env: { WHATSAPP_NUMBER: '5511999999999' },
  },
});
