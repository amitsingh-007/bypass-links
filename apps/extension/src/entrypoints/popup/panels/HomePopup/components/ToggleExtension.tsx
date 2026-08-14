import { Switch } from '@bypass/ui';
import { useEffect } from 'react';

import { EExtensionState } from '@/constants';
import { extStateItem } from '@/storage/items';
import { getIsExtensionActive } from '@/utils/common';
import useExtStore from '@store/extension';

function ToggleExtension() {
  const isActive = useExtStore((state) => state.isExtensionActive);
  const setIsExtensionActive = useExtStore(
    (state) => state.setIsExtensionActive
  );

  useEffect(() => {
    extStateItem.getValue().then((extState) => {
      setIsExtensionActive(getIsExtensionActive(extState));
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
        aria-label="Enable"
        data-testid="toggle-extension-switch"
        onCheckedChange={handleToggle}
      />
      <span className="text-sm">Enable</span>
    </div>
  );
}

export default ToggleExtension;
