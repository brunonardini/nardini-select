/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // AGENTS.md: the header (type, scope, and description) fits in 72 characters.
    'header-max-length': [2, 'always', 72],
  },
};

export default config;
