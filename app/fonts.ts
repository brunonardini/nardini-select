import localFont from 'next/font/local';

// Karvest, the brand typeface (official web export, see DESIGN.md).
// Regular (400) sets supporting text; ExtraBold (800) sets titles and calls.
// Shared by app/layout.tsx and Storybook; the CSS only reads --font-brand.
export const brandFont = localFont({
  src: [
    {
      path: './fonts/Karvest-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Karvest-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-brand',
  display: 'swap',
});
