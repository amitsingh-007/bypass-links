import { Switch } from '@bypass/ui';
import { useEffect } from 'react';

import { EExtensionState } from '@/constants';
import { extStateItem } from '@/storage/items';
import useExtStore from '@store/extension';

function ToggleExtension() {
  const isActive = useExtStore((state) => state.isExtensionActive);
  const setIsExtensionActive = useExtStore(
    (state) => state.setIsExtensionActive
  );

  useEffect(() => {
    extStateItem.getValue().then((extState) => {
      setIsExtensionActive(extState === EExtensionState.ACTIVE);
    });
  }, [setIsExtensionActive]);

  const handleToggle = (checked: boolean) => {
    extStateItem.setValue(
      checked ? EExtensionState.ACTIVE : EExtensionState.INACTIVE
    );
    setIsExtensionActive(checked);
  };

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
