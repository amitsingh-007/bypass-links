import { DefaultSeoProps } from 'next-seo';

export const globalSEOConfig = {
  dangerouslySetAllPagesToNoFollow: false,
  themeColor: '#6850ff',
  additionalMetaTags: [
    {
      name: 'application-name',
      content: 'Bypass Links',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
    },
    {
      rel: 'manifest',
      href: '/manifest.webmanifest.json',
    },
  ],
} satisfies DefaultSeoProps;
