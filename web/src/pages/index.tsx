import fetchApi from '@common/utils/fetch';
import { Container, GlobalStyles } from '@mui/material';
import { GlobalStylesProps, Theme } from '@mui/system';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import AppHeader from '../ui/DownloadPage/components/AppHeader';
import Footer from '../ui/DownloadPage/components/Footer';
import MetaTags from '../ui/DownloadPage/components/MetaTags';
import PageHeader from '../ui/DownloadPage/components/PageHeader';
import SalientFeatures from '../ui/DownloadPage/components/SalientFeatures';
import { IExtension } from '@common/interfaces/api';

const globalStyles: GlobalStylesProps<Theme>['styles'] = {
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
}> = async () => {
  const { extension, date, version } = await fetchApi<IExtension>(
    '/api/extension'
  );
  return {
    props: {
      downloadLink: extension,
      releaseDate: date,
      extVersion: version,
    },
  };
};

export default function Home({
  downloadLink,
  releaseDate,
  extVersion,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <GlobalStyles styles={globalStyles} />
      <MetaTags />
      <AppHeader />
      <Container maxWidth="xl">
        <PageHeader downloadLink={downloadLink} />
        <SalientFeatures />
      </Container>
      <Footer releaseDate={releaseDate} extVersion={extVersion} />
    </>
  );
}
