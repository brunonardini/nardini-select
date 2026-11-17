import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import storybook from 'eslint-plugin-storybook';

const databaseIo = {
  group: [
    '@/lib/db/io',
    '@/lib/db/io/**',
    '**/lib/db/io',
    '**/lib/db/io/**',
    '**/db/io',
    '**/db/io/**',
  ],
  message: 'Import the database client only from lib/**/io and db scripts.',
};

const betterAuth = {
  group: ['better-auth', 'better-auth/**'],
  message: 'Import Better Auth only from lib/auth/io.',
};

const testSession = {
  group: ['@/lib/auth/io/test-session', '**/lib/auth/io/test-session'],
  message: 'The test session helper is only for end-to-end tests.',
};

const logicIo = {
  group: [
    '@/lib/**/io',
    '@/lib/**/io/**',
    '../io',
    '../io/**',
    '../../io',
    '../../io/**',
  ],
  message: 'Logic cannot import I/O modules.',
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...storybook.configs['flat/recommended'],
  {
    // CommonJS scripts load modules with require() by design.
    files: ['**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['**/*.{ts,tsx,mts}'],
    ignores: ['lib/**/io/**', 'db/**', 'e2e/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [databaseIo, betterAuth, testSession] },
      ],
    },
  },
  {
    files: ['lib/**/logic/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [databaseIo, betterAuth, testSession, logicIo] },
      ],
    },
  },
  {
    files: ['lib/**/io/**/*.{ts,tsx}'],
    ignores: ['lib/auth/io/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [betterAuth, testSession] },
      ],
    },
  },
  {
    files: ['lib/auth/io/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [testSession] }],
    },
  },
  {
    files: ['db/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [betterAuth, testSession] },
      ],
    },
  },
  {
    files: ['e2e/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [databaseIo, betterAuth] },
      ],
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Installed agent skills and local or generated files:
    '.agents/**',
    '.claude/**',
    '.cursor/**',
    'tmp/**',
    'coverage/**',
    'test-results/**',
    'playwright-report/**',
    'blob-report/**',
    'storybook-static/**',
    'db/schema.d.ts',
  ]),
  // Lint the Storybook config, which starts with a dot.
  globalIgnores(['!.storybook'], 'Include Storybook directory'),
]);

export default eslintConfig;
