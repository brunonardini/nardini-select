import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Coverage is global in Vitest; `npm run test:coverage` runs it for the
    // unit project only.
    coverage: {
      provider: 'v8',
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.stories.{ts,tsx}',
        'lib/**/io/**',
        'lib/permissions/catalog.ts',
        'db/**',
        'app/**/page.tsx',
        'app/**/layout.tsx',
        'app/**/*actions.ts',
        'app/**/route.ts',
        'proxy.ts',
      ],
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      // CI fails when unit test coverage drops below 90%.
      // Pure logic stays fully covered.
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
        'lib/**/logic/**': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
    projects: [
      {
        resolve: {
          alias: [
            {
              find: 'server-only',
              replacement: path.join(dirname, 'test/server-only.ts'),
            },
            { find: /^@\//, replacement: `${dirname}/` },
          ],
        },
        plugins: [react()],
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['{app,components,lib,db}/**/*.test.{ts,tsx}'],
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        // Pre-bundle Base UI entries the new stories import, so Vite does
        // not reload the browser tests the first time it sees them.
        optimizeDeps: {
          include: [
            '@base-ui/react/dialog',
            '@base-ui/react/field',
            '@base-ui/react/select',
            '@base-ui/react/toast',
          ],
        },
        plugins: [
          // Runs every story as a test in Chromium, with the a11y checks.
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            storybookScript: 'npm run storybook -- --no-open',
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
