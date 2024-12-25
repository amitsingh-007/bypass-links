import Toast from '@components/Toast';
import { useWindowEvent } from '@mantine/hooks';
import StoreListener from './StoreListener';

const Global = () => {
  // Prevent extension popup close on Escape click
  useWindowEvent('keydown', (e) => e.key === 'Escape' && e.preventDefault());

  return (
    <>
      <StoreListener />
      <Toast />
    </>
  );
};

export default Global;
