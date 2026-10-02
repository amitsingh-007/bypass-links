import { Switch } from '@bypass/ui';
import { toast } from 'sonner';

import { EExtensionState } from '@/constants';
import { useExtensionState } from '@/storage/hooks';
import { extStateItem } from '@/storage/items';

const handleToggle = async (checked: boolean) => {
  try {
    await extStateItem.setValue(
      checked ? EExtensionState.ACTIVE : EExtensionState.INACTIVE
    );
  } catch (error) {
    console.error('Could not update the extension state', error);
    toast.error('Could not update the extension state');
  }
};

function ToggleExtension() {
  const isActive = useExtensionState() === EExtensionState.ACTIVE;

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
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
