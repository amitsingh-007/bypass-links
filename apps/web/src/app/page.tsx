import { Box, Container } from '@mantine/core';
import { Metadata } from 'next';
import AppHeader from './components/AppHeader';
import Footer from './components/Footer';
import PageHeader from './components/PageHeader';
import SalientFeatures from './components/SalientFeatures';
import styles from './page.module.css';
import { fetchExtensionData } from './page.utils';

const title = 'Skip Links, Ads, Timers & ReCaptchas';
const description =
  'Web extension to Bypass links to skip ads, links, timers, captchas and private Bookmarks Panel';

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
  const { chrome, firefox } = await fetchExtensionData();

  return (
    <Box className={styles.container}>
      <AppHeader />
      <Container size="xl">
        <PageHeader chrome={chrome} firefox={firefox} />
        <SalientFeatures />
      </Container>
      <Footer releaseDate={chrome.date} extVersion={chrome.version} />
    </Box>
  );
}
