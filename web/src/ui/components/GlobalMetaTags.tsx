import Head from 'next/head';

const GlobalMetaTags = (): JSX.Element => {
  return (
    <Head>
      <meta name="theme-color" content="#6850ff" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.webmanifest.json" />
    </Head>
  );
};

export default GlobalMetaTags;
