import Toast from '@components/Toast';
import { useWindowEvent } from '@mantine/hooks';
import StoreListener from './StoreListener';
import { NavigationProgress } from '@mantine/nprogress';
import '@mantine/nprogress/styles.css';

const Global = () => {
  // Prevent extension popup close on Escape click
  useWindowEvent('keydown', (e) => e.key === 'Escape' && e.preventDefault());

  return (
    <>
      <StoreListener />
      <Toast />
      <NavigationProgress size={6} />
    </>
  );
};

export default Global;
