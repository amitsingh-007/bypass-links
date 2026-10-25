import { Switch } from '@bypass/ui';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { EExtensionState } from '@/constants';
import { useExtensionState } from '@/storage/hooks';
import { extStateItem } from '@/storage/items';
import useFirebaseStore, {
  firebaseAuthReady,
} from '@/store/firebase/useFirebaseStore';
import useProgressStore from '@/store/progress';

import { signOut } from '../utils/authentication';

function ToggleExtension() {
  const isActive = useExtensionState() === EExtensionState.ACTIVE;
  const isLoading = useProgressStore((state) => state.isLoading);
  const startLoading = useProgressStore((state) => state.startLoading);
  const stopLoading = useProgressStore((state) => state.stopLoading);
  const [isPending, startTransition] = useTransition();
  const handleToggle = (checked: boolean) => {
    const isTurningOff = !checked;
    startTransition(async () => {
      startLoading();
      try {
        if (isTurningOff) {
          await firebaseAuthReady;
          const { isSignedIn } = useFirebaseStore.getState();
          if (isSignedIn) {
            const isSignedOutSuccess = await signOut();
            if (!isSignedOutSuccess) {
              toast.error('Error while logging out');
              return;
            }
          }
        }
        await extStateItem.setValue(
          checked ? EExtensionState.ACTIVE : EExtensionState.INACTIVE
        );
      } catch (error) {
        console.error('Could not update the extension state', error);
        toast.error('Could not update the extension state');
      } finally {
        stopLoading();
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        disabled={isPending || isLoading}
        aria-labelledby="toggle-extension-label"
        data-testid="toggle-extension-switch"
        onCheckedChange={handleToggle}
      />
      <span id="toggle-extension-label" className="text-sm">
        Enable
      </span>
    </div>
  );
}

export default ToggleExtension;
