import { Toaster } from '@bypass/ui';
import { useHotkeys } from '@mantine/hooks';
import StoreListener from './StoreListener';

function Global() {
  // Prevent extension popup close on Escape click
  useHotkeys([['Escape', (e) => e.preventDefault()]]);

  return (
    <>
      <StoreListener />
      <Toaster />
    </>
  );
}

export default Global;
