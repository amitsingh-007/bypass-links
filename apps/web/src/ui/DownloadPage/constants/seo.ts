import { DefaultSeoProps } from 'next-seo';

const title = 'Bypass Links - Skip Links, Ads, Timers & ReCaptchas';
const description =
  'Chrome extension to Bypass links to skip ads, links, timers, captchas and private Bookmarks Panel';

export const seoConfig = {
  title,
  description,
  canonical: HOST_NAME,
  openGraph: {
    url: HOST_NAME,
    title,
    description,
    images: [{ url: `${HOST_NAME}/bypass_link_192.png` }],
    siteName: 'Bypass Links',
  },
} satisfies DefaultSeoProps;
