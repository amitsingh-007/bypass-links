import { type Metadata } from 'next';
import { clientEnv } from './constants/env/client';
import AppHeader from './components/AppHeader';
import Footer from './components/Footer';
import PageHeader from './components/PageHeader';
import SalientFeatures from './components/SalientFeatures';
import { fetchExtensionData } from './page.utils';

const title = 'Skip Links, Ads, Timers & ReCaptchas';
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
    <div className="bg-[#131b21]">
      <AppHeader />
      <div className="mx-auto max-w-7xl">
        <PageHeader chrome={chrome} />
        <SalientFeatures />
      </div>
      <Footer releaseDate={chrome.date} extVersion={chrome.version} />
    </div>
  );
}
