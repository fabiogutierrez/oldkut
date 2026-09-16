import { Poppins } from 'next/font/google';

export const wordmarkFont = Poppins({
  subsets: ['latin'],
  weight: ['800', '900'],
  variable: '--font-wordmark',
  display: 'swap',
});
