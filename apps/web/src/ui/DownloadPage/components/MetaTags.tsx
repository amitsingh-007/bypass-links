import Head from 'next/head';
import { useRouter } from 'next/router';

const MetaTags = () => {
  const router = useRouter();

  return (
    <Head>
      <meta
        name="description"
        content="Chrome extension to Bypass links to skip ads, links, timers, captchas and private Bookmarks Panel"
      />
      <link rel="canonical" href={`${HOST_NAME}${router.pathname}`} />
      <title>Bypass Links - Skip Links, Ads, Timers & Recaptchas</title>
    </Head>
  );
};

export default MetaTags;
