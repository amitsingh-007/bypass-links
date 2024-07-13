import styles from '@/styles/home-page.module.css';
import { Box, Container } from '@mantine/core';
import { Metadata } from 'next';
import AppHeader from '../ui/DownloadPage/components/AppHeader';
import Footer from '../ui/DownloadPage/components/Footer';
import PageHeader from '../ui/DownloadPage/components/PageHeader';
import SalientFeatures from '../ui/DownloadPage/components/SalientFeatures';
import { fetchExtensionData } from './utils';

export const runtime = 'edge';

const title = 'Skip Links, Ads, Timers & ReCaptchas';
const description =
  'Chrome extension to Bypass links to skip ads, links, timers, captchas and private Bookmarks Panel';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: HOST_NAME,
  },
  metadataBase: new URL(HOST_NAME),
  openGraph: {
    title: `Bypass Links - ${title}`,
    description,
    siteName: 'Bypass Links',
    url: '/',
    images: [{ url: '/bypass_link_192.png' }],
  },
};

export default async function Home() {
  const { downloadLink, releaseDate, extVersion } = await fetchExtensionData();

  return (
    <Box className={styles.container}>
      <AppHeader />
      <Container size="xl">
        <PageHeader downloadLink={downloadLink} />
        <SalientFeatures />
      </Container>
      <Footer releaseDate={releaseDate} extVersion={extVersion} />
    </Box>
  );
}
