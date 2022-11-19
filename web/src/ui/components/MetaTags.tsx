import Head from 'next/head';

const MetaTags = ({ titleSuffix }: { titleSuffix: string }) => (
  <Head>
    <title>{`Bypass Links - ${titleSuffix}`}</title>
    <meta name="robots" content="noindex,nofollow" />;
  </Head>
);

export default MetaTags;
