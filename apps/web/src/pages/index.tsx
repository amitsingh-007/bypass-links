import styles from '@/styles/home-page.module.css';
import { seoConfig } from '@/ui/DownloadPage/constants/seo';
// import { getCaller } from '@/utils/caller';
import { Box, Container } from '@mantine/core';
import ct from 'countries-and-timezones';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { NextSeo } from 'next-seo';
import { getLatestExtension } from '@bypass/trpc/edge';
import AppHeader from '../ui/DownloadPage/components/AppHeader';
import Footer from '../ui/DownloadPage/components/Footer';
import PageHeader from '../ui/DownloadPage/components/PageHeader';
import SalientFeatures from '../ui/DownloadPage/components/SalientFeatures';

export const config = {
  runtime: 'experimental-edge',
};

export const getServerSideProps: GetServerSideProps<{
  downloadLink: string;
  releaseDate: string;
  extVersion: string;
  userTimezone: string;
}> = async (ctx) => {
  const { extension, date, version } = await getLatestExtension();
  const country = (ctx.query.country as string) ?? '';
  const data = ct.getCountry(country);
  const tz = data?.timezones?.[0] ?? '';
  return {
    props: {
      downloadLink: extension,
      releaseDate: date,
      extVersion: version,
      userTimezone: tz,
    },
  };
};

export default function Home({
  downloadLink,
  releaseDate,
  extVersion,
  userTimezone,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Box className={styles.container}>
      <NextSeo {...seoConfig} />
      <AppHeader />
      <Container size="xl">
        <PageHeader downloadLink={downloadLink} />
        <SalientFeatures />
      </Container>
      <Footer
        timezone={userTimezone}
        releaseDate={releaseDate}
        extVersion={extVersion}
      />
    </Box>
  );
}
