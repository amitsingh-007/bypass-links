// !NOTE: maintain below order of css
import '@mantine/core/styles.css';
import './layout.css';
import { ColorSchemeScript } from '@mantine/core';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { ReactNode } from 'react';
import { Metadata, Viewport } from 'next';
import AppProviders from './provider/AppProviders';

// Initialize dayjs with timezone plugin; timzone plugin requires utc plugin
dayjs.extend(utc);
dayjs.extend(timezone);

export const viewport: Viewport = {
  themeColor: '#6850ff',
};

export const metadata: Metadata = {
  title: {
    template: 'Bypass Links - %s', // Not working
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

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <ColorSchemeScript defaultColorScheme="dark" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@100;200;300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
};

export default RootLayout;
