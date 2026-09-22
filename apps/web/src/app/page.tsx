import { getLatestExtension } from '@bypass/trpc/edge';
import { type Metadata } from 'next';

import AppHeader from './components/AppHeader';
import DownloadCta from './components/DownloadCta';
import Faqs from './components/Faqs';
import Footer from './components/Footer';
import LandingShell from './components/LandingShell';
import PageHeader from './components/PageHeader';
import SalientFeatures from './components/SalientFeatures';
import { clientEnv } from './constants/env/client';

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
    <LandingShell>
      <AppHeader downloadLink={chrome.downloadLink} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4">
        <PageHeader chrome={chrome} />
        <SalientFeatures />
        <Faqs />
        <section className="landing-shadow my-16 flex flex-col items-center gap-6 rounded-xl bg-primary/10 px-6 py-14 text-center">
          <h2 className="max-w-xl text-3xl/tight font-bold lowercase md:text-4xl/tight">
            stop waiting on links
          </h2>
          <DownloadCta
            downloadLink={chrome.downloadLink}
            note="free and open source, for chrome"
          />
        </section>
      </main>
      <Footer releaseDate={chrome.date} extVersion={chrome.version} />
    </LandingShell>
  );
}
