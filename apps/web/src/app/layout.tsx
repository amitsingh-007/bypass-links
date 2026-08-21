import { cn } from '@bypass/ui/lib/utils';
import { type Metadata, type Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { type ReactNode } from 'react';

import './layout.css';
import AppProviders from './provider/AppProviders';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const viewport: Viewport = {
  themeColor: '#6d33d2',
};

export const metadata: Metadata = {
  title: {
    template: 'Bypass Links - %s',
    default: 'Bypass Links',
  },
  keywords: ['Bypass Links', 'Link bypasser', 'Bookmarks panel'],
  applicationName: 'Bypass Links',
  manifest: '/manifest.webmanifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/bypass_link_192.png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  robots: {
    follow: true,
    index: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en',
    title: 'Bypass Links',
  },
};

function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={cn('dark', manrope.variable)}>
      <body className="font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

export default RootLayout;
