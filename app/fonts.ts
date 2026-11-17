import localFont from 'next/font/local';
import { Montserrat } from 'next/font/google';

// Montserrat sets the text (400 and 800). It is the body and label typeface.
// Shared by app/layout.tsx and Storybook; the CSS only reads --font-brand.
export const brandFont = Montserrat({
  subsets: ['latin'],
  weight: ['400', '800'],
  variable: '--font-brand',
  display: 'swap',
});

// Karvest ExtraBold (official web export, see DESIGN.md) sets headings only:
// h1, h2 and h3. Other Karvest weights stay in app/fonts/ until a design uses them.
export const displayFont = localFont({
  src: [
    {
      path: './fonts/Karvest-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-display',
  display: 'swap',
});
