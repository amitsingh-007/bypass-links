import { fetchApi, IExtension } from '@bypass/shared';
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
  downloadLink: string;
  releaseDate: string;
  extVersion: string;
  country: string;
}> = async ({ query }) => {
  const { extension, date, version } = await fetchApi<IExtension>(
    '/api/extension'
  );
  return {
    props: {
      downloadLink: extension,
      releaseDate: date,
      extVersion: version,
      country: (query.country as string) ?? '',
    },
  };
};

export default function Home({
  downloadLink,
  releaseDate,
  extVersion,
  country,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Global styles={pageStyles} />
      <MetaTags />
      <AppHeader />
      <Container size="xl">
        <PageHeader downloadLink={downloadLink} />
        <SalientFeatures />
      </Container>
      <Footer
        country={country}
        releaseDate={releaseDate}
        extVersion={extVersion}
      />
    </>
  );
}
