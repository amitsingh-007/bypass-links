import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from 'next-themes';
import { type ReactNode } from 'react';

import { manrope } from '@app/constants/font';
import { ROOT_METADATA, ROOT_VIEWPORT } from '@app/constants/metadata';

import './layout.css';

export const viewport = ROOT_VIEWPORT;
export const metadata = ROOT_METADATA;

function LandingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={manrope.variable}>
      <body className="font-sans leading-relaxed">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

export default LandingLayout;
