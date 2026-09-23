import { type Metadata, type Viewport } from 'next';

export const ROOT_VIEWPORT: Viewport = {
  themeColor: '#6d33d2',
};

export const ROOT_METADATA: Metadata = {
  title: {
    template: 'Bypass Links - %s',
    default: 'Bypass Links',
  },
  keywords: ['Bypass Links', 'Bookmarks panel', 'URL shortcuts'],
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

export const NOINDEX_ROBOTS: Metadata['robots'] = {
  follow: false,
  index: false,
};
