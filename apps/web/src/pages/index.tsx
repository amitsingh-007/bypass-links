import { api } from '@/utils/api';
import { Container, Global } from '@mantine/core';
import ct from 'countries-and-timezones';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import AppHeader from '../ui/DownloadPage/components/AppHeader';
import Footer from '../ui/DownloadPage/components/Footer';
import MetaTags from '../ui/DownloadPage/components/MetaTags';
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
  meta: any;
}> = async ({ query }) => {
  const { extension, date, version } = await api.extension.latest.query();
  const country = (query.country as string) ?? '';
  const ip = (query.ip as string) ?? '';
  const remoteAddress = (query.remoteAddress as string) ?? '';
  const forwarded = (query.forwarded as string) ?? '';
  const meta = {
    ip,
    remoteAddress,
    forwarded,
  };
  const data = ct.getCountry(country);
  const tz = data?.timezones?.[0] ?? '';
  return {
    props: {
      downloadLink: extension,
      releaseDate: date,
      extVersion: version,
      userTimezone: tz,
      meta,
    },
  };
};

export default function Home({
  downloadLink,
  releaseDate,
  extVersion,
  userTimezone,
  meta,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log(meta);
  return (
    <>
      <div>{meta}</div>
      <br />
      <div>{JSON.stringify(meta)}</div>
      <Global styles={pageStyles} />
      <MetaTags />
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
