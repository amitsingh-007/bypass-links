import { Toaster } from '@bypass/ui';
import { useHotkeys } from '@mantine/hooks';

function Global() {
  // Prevent extension popup close on Escape click
  useHotkeys([['Escape', (e) => e.preventDefault()]]);

  return <Toaster />;
}

export default Global;
