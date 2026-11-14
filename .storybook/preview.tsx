import type { Preview } from '@storybook/nextjs-vite';
import { brandFont } from '../app/fonts';
import '../app/globals.css';

// Same <html> setup as app/layout.tsx: page language and brand font.
document.documentElement.lang = 'pt-BR';
document.documentElement.classList.add(brandFont.variable);

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    // .root mirrors app/layout.tsx (Base UI portal isolation). <main> gives
    // every story a landmark, so the region rule can stay on, as in E2E.
    (Story) => (
      <div className="root">
        <main>
          <Story />
        </main>
      </div>
    ),
  ],
  parameters: {
    // The two E2E projects (playwright.config.ts) plus the width where the
    // header switches to the menu toggle.
    viewport: {
      options: {
        desktop: {
          name: 'Desktop (1440×900)',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
        narrowDesktop: {
          name: 'Narrow desktop (1200×900)',
          styles: { width: '1200px', height: '900px' },
          type: 'desktop',
        },
        mobile: {
          name: 'Mobile, Pixel 7 (412×915)',
          styles: { width: '412px', height: '915px' },
          type: 'mobile',
        },
      },
    },
    a11y: {
      // A violation fails the story test, like e2e/accessibility.spec.ts.
      test: 'error',
      // Storybook turns the region rule off by default; the E2E scan keeps it.
      config: { rules: [{ id: 'region', enabled: true }] },
      // WCAG 2.2 level A and AA, plus axe best practices.
      options: {
        runOnly: [
          'wcag2a',
          'wcag2aa',
          'wcag21a',
          'wcag21aa',
          'wcag22a',
          'wcag22aa',
          'best-practice',
        ],
      },
    },
  },
};

export default preview;
