import { seoConfig } from '@/ui/DownloadPage/constants/seo';
import { getCaller } from '@/utils/caller';
import { Container, Global } from '@mantine/core';
import ct from 'countries-and-timezones';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { NextSeo } from 'next-seo';
import AppHeader from '../ui/DownloadPage/components/AppHeader';
import Footer from '../ui/DownloadPage/components/Footer';
import PageHeader from '../ui/DownloadPage/components/PageHeader';
import SalientFeatures from '../ui/DownloadPage/components/SalientFeatures';

const pageStyles = {
  '*': {
    '::selection': {
      background: '#6850ff',
    },
  },
  body: {
    '> *': {
      background: '#131b21',
    },
  },
};

export const getServerSideProps: GetServerSideProps<{
  downloadLink: string;
  releaseDate: string;
  extVersion: string;
  userTimezone: string;
}> = async (ctx) => {
  const { extension, date, version } = await getCaller(ctx).extension.latest();
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
    <>
      <Global styles={pageStyles} />
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
    </>
  );
}
