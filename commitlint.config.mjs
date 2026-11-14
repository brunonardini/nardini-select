/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // AGENTS.md: the header (type, scope, and description) fits in 72 characters.
    'header-max-length': [2, 'always', 72],
  },
};
