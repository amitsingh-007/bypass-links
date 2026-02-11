import { Switch } from '@bypass/ui';
import useExtStore from '@store/extension';
import { useEffect, useState } from 'react';
import { getIsExtensionActive } from '@/utils/common';
import { EExtensionState } from '@/constants';
import { extStateItem } from '@/storage/items';

function ToggleExtension() {
  const turnOnExtension = useExtStore((state) => state.turnOnExtension);
  const turnOffExtension = useExtStore((state) => state.turnOffExtension);
  const [extState, setExtState] = useState<EExtensionState>(
    EExtensionState.INACTIVE
  );

  const dispatchActionAndSetState = (
    _extState: EExtensionState,
    isActive: boolean
  ) => {
    setExtState(_extState);
    const action = isActive ? turnOnExtension : turnOffExtension;
    action();
  };

  useEffect(() => {
    extStateItem.getValue().then((_extState) => {
      const isActive = getIsExtensionActive(_extState);
      dispatchActionAndSetState(_extState, isActive);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (checked: boolean) => {
    const extensionState = checked
      ? EExtensionState.ACTIVE
      : EExtensionState.INACTIVE;
    extStateItem.setValue(extensionState);
    dispatchActionAndSetState(extensionState, checked);
  };

  const isActive = getIsExtensionActive(extState);
  return (
    <div className="flex items-center gap-2">
      <Switch checked={isActive} onCheckedChange={handleToggle} />
      <span className="text-sm">Enable</span>
    </div>
  );
}

export default ToggleExtension;
