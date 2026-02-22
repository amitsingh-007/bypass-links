import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { type ReactNode } from 'react';
import { type Metadata, type Viewport } from 'next';
import { Manrope } from 'next/font/google';
import clsx from 'clsx';
import './layout.css';
import AppProviders from './provider/AppProviders';

// eslint-disable-next-line new-cap
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

// Initialize dayjs with timezone plugin; timzone plugin requires utc plugin
dayjs.extend(utc);
dayjs.extend(timezone);

export const viewport: Viewport = {
  themeColor: '#6468f0',
};

export const metadata: Metadata = {
  title: {
    template: 'Bypass Links - %s', // NOTE: Not working
    default: 'Bypass Links',
  },
  keywords: ['Bypass Links', 'Link bypasser', 'Bookmarks panel'],
  applicationName: 'Bypass Links',
  manifest: '/manifest.webmanifest.json',
  icons: {
    icon: '/bypass_link_192.png',
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
    <html lang="en" className={clsx('dark', manrope.variable)}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

export default RootLayout;
