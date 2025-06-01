import { getExtensionState } from '@helpers/fetchFromStorage';
import { Switch } from '@mantine/core';
import useExtStore from '@store/extension';
import { useEffect, useState } from 'react';
import { getIsExtensionActive, setExtStateInStorage } from '@/utils/common';
import { EExtensionState } from '@/constants';

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
    getExtensionState().then((_extState) => {
      const isActive = getIsExtensionActive(_extState);
      dispatchActionAndSetState(_extState, isActive);
    });
  }, []);

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isActive = event.target.checked;
    const extensionState = isActive
      ? EExtensionState.ACTIVE
      : EExtensionState.INACTIVE;
    setExtStateInStorage(extensionState);
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
