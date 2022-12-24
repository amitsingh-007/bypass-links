import Toast from '@components/Toast';
import { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreListener from './StoreListener';
import { Global as MantineGlobal } from '@mantine/core';
import googleSansFont from '@/fonts/google-sans.woff2';

const styles: React.ComponentProps<typeof MantineGlobal>['styles'] = [
  {
    '@font-face': {
      fontFamily: 'Product Sans',
      src: `url('${googleSansFont}') format("woff2")`,
      fontWeight: 400,
      fontStyle: 'normal',
    },
  },
];

const Global = memo(function Global() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoBack = (event: KeyboardEvent) => {
      const isBackspace = event.key === 'Backspace';
      const isInputElem = (event.target as Element).tagName === 'INPUT';
      if (isBackspace && !isInputElem) {
        navigate(-1);
      }
    };
    document.body.addEventListener('keydown', handleGoBack);
    return () => {
      document.body.removeEventListener('keydown', handleGoBack);
    };
  }, [navigate]);

  return (
    <>
      <MantineGlobal styles={styles} />
      <StoreListener />
      <Toast />
    </>
  );
});

export default Global;
