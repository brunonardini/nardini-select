import { Lexend } from 'next/font/google';

// Stand-in for Kanesty, the brand typeface, until a web license is in place.
// Swap this for next/font/local with the Kanesty files; the CSS only reads
// the --font-brand variable. Shared by app/layout.tsx and Storybook.
export const brandFont = Lexend({
  subsets: ['latin'],
  weight: ['400', '800'],
  variable: '--font-brand',
  display: 'swap',
});
