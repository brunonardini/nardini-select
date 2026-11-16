import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import storybook from 'eslint-plugin-storybook';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...storybook.configs['flat/recommended'],
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
    'storybook-static/**',
    // Throwaway M0 investigation. The branch is not merged.
    'spike/**',
  ]),
  // Lint the Storybook config, which starts with a dot.
  globalIgnores(['!.storybook'], 'Include Storybook directory'),
]);

export default eslintConfig;
