import fetchApi from '@common/utils/fetch';
import { Box } from '@mui/material';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import AppHeader from '../ui/DownloadPage/components/AppHeader';
import Footer from '../ui/DownloadPage/components/Footer';
import MetaTags from '../ui/DownloadPage/components/MetaTags';
import PageHeader from '../ui/DownloadPage/components/PageHeader';
import SalientFeatures from '../ui/DownloadPage/components/SalientFeatures';

export const getServerSideProps: GetServerSideProps<{
  downloadLink: string;
}> = async () => {
  const { extension } = await fetchApi('/api/extension');
  return {
    props: {
      downloadLink: extension,
    },
  };
};

export default function Home({
  downloadLink,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <MetaTags />
      <AppHeader />
      <Box sx={{ p: '0 200px' }}>
        <PageHeader downloadLink={downloadLink} />
        <SalientFeatures />
      </Box>
      <Footer />
    </>
  );
}
