import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/nextjs-vite',
  // next/image loads the site images from public/.
  staticDirs: ['../public'],
  features: {
    // Feeds component docs and props to the MCP docs tools.
    componentsManifest: true,
  },
};

export default config;
