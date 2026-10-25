import { Dialog, DialogContent, DialogTitle, Toaster } from '@bypass/ui';
import { useHotkeys } from '@mantine/hooks';

import useFirebaseStore from '@/store/firebase/useFirebaseStore';

function Global() {
  const authError = useFirebaseStore((state) => state.authError);
  // Prevent extension popup close on Escape click
  useHotkeys([['Escape', (e) => e.preventDefault()]]);

  return (
    <>
      <Toaster position="bottom-left" />
      <Dialog open={authError}>
        <DialogContent showCloseButton={false}>
          <DialogTitle>We couldn't verify your session.</DialogTitle>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Global;
