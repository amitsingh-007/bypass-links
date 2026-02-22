import { type Metadata } from 'next';
import { clientEnv } from './constants/env/client';
import AppHeader from './components/AppHeader';
import Footer from './components/Footer';
import PageHeader from './components/PageHeader';
import SalientFeatures from './components/SalientFeatures';
import { fetchExtensionData } from './page.utils';

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
  const { chrome } = await fetchExtensionData();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4">
        <PageHeader chrome={chrome} />
        <SalientFeatures />
      </main>
      <Footer releaseDate={chrome.date} extVersion={chrome.version} />
    </div>
  );
}
