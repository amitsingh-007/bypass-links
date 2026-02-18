import { Toaster } from '@bypass/ui';
import { useEventListener } from 'ahooks';
import StoreListener from './StoreListener';

function Global() {
  // Prevent extension popup close on Escape click
  useEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
    }
  });

  return (
    <>
      <StoreListener />
      <Toaster />
    </>
  );
}

export default Global;
