import { Switch } from '@mantine/core';
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

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isActive = event.target.checked;
    const extensionState = isActive
      ? EExtensionState.ACTIVE
      : EExtensionState.INACTIVE;
    extStateItem.setValue(extensionState);
    dispatchActionAndSetState(extensionState, isActive);
  };

  const isActive = getIsExtensionActive(extState);
  return (
    <Switch
      size="md"
      label="Enable"
      color="teal"
      checked={isActive}
      onChange={handleToggle}
    />
  );
}

export default ToggleExtension;
