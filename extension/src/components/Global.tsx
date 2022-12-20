import Toast from '@components/Toast';
import { memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreListener from './StoreListener';

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
      <StoreListener />
      <Toast />
    </>
  );
});

export default Global;
