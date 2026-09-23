import { getLatestExtension } from '@bypass/trpc/edge';
import { type Metadata } from 'next';

import { clientEnv } from '@app/constants/env/client';

import AppHeader from './components/AppHeader';
import DownloadBand from './components/DownloadBand';
import Faqs from './components/Faqs';
import Footer from './components/Footer';
import FreeSection from './components/FreeSection';
import PageHeader from './components/PageHeader';
import SalientFeatures from './components/SalientFeatures';

const title = 'Bypass Links';
const description =
  'Web extension to Bypass links to skip ads, links, timers, captchas and private Bookmarks Panel';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: clientEnv.NEXT_PUBLIC_HOST_NAME,
  },
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_HOST_NAME),
  openGraph: {
    title: `Bypass Links - ${title}`,
    description,
    siteName: 'Bypass Links',
    url: '/',
    images: [{ url: '/bypass_link_192.png' }],
  },
};

export default async function Home() {
  const { chrome } = await getLatestExtension();

  return (
    <>
      <AppHeader />
      <main>
        <PageHeader downloadLink={chrome.downloadLink} />
        <SalientFeatures />
        <FreeSection downloadLink={chrome.downloadLink} />
        <Faqs />
        <DownloadBand downloadLink={chrome.downloadLink} />
      </main>
      <Footer releaseDate={chrome.date} extVersion={chrome.version} />
    </>
  );
}
