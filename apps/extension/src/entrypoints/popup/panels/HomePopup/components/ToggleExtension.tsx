import { Switch } from '@bypass/ui';
import { useTransition } from 'react';

import { EExtensionState } from '@/constants';
import { useExtensionState } from '@/storage/hooks';
import { extStateItem } from '@/storage/items';

function ToggleExtension() {
  const isActive = useExtensionState() === EExtensionState.ACTIVE;
  const [isPending, startTransition] = useTransition();
  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      await extStateItem.setValue(
        checked ? EExtensionState.ACTIVE : EExtensionState.INACTIVE
      );
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        disabled={isPending}
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
