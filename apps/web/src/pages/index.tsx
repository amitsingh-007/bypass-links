import { api } from '@/utils/api';
import { Container, Global } from '@mantine/core';
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
  country: string;
}> = async ({ query }) => {
  return {
    props: {
      country: (query.country as string) ?? '',
    },
  };
};

export default function Home({
  country,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: latestExtension } = api.extension.latest.useQuery();

  if (!latestExtension || !country) {
    return null;
  }

  return (
    <>
      <Global styles={pageStyles} />
      <MetaTags />
      <AppHeader />
      <Container size="xl">
        <PageHeader downloadLink={latestExtension.extension} />
        <SalientFeatures />
      </Container>
      <Footer
        country={country}
        releaseDate={latestExtension.date}
        extVersion={latestExtension.version}
      />
    </>
  );
}
