import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // CommonJS scripts load modules with require() by design.
    files: ['**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
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
  ]),
]);

export default eslintConfig;
