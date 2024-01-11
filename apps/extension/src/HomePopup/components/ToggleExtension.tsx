import { getIsExtensionActive, setExtStateInStorage } from '@/utils/common';
import { EXTENSION_STATE, IExtensionState } from '@constants/index';
import { getExtensionState } from '@helpers/fetchFromStorage';
import { Switch, useMantineTheme } from '@mantine/core';
import useExtStore from '@store/extension';
import { memo, useEffect, useState } from 'react';
import { BsCheckLg, BsXLg } from 'react-icons/bs';

const ToggleExtension = memo(function ToggleExtension() {
  const theme = useMantineTheme();
  const turnOnExtension = useExtStore((state) => state.turnOnExtension);
  const turnOffExtension = useExtStore((state) => state.turnOffExtension);
  const [extState, setExtState] = useState<IExtensionState>(
    EXTENSION_STATE.INACTIVE
  );

  const dispatchActionAndSetState = (
    _extState: IExtensionState,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isActive = event.target.checked;
    const extensionState = isActive
      ? EXTENSION_STATE.ACTIVE
      : EXTENSION_STATE.INACTIVE;
    setExtStateInStorage(extensionState);
    dispatchActionAndSetState(extensionState, isActive);
  };

  const isActive = getIsExtensionActive(extState);
  return (
    <Switch
      onLabel="ON"
      offLabel="OFF"
      size="md"
      label="Enable"
      color="teal"
      checked={isActive}
      onChange={handleToggle}
      thumbIcon={
        isActive ? (
          <BsCheckLg size={10} color={theme.colors.teal[6]} strokeWidth={2} />
        ) : (
          <BsXLg size={8} color={theme.colors.red[6]} strokeWidth={2} />
        )
      }
    />
  );
});

export default ToggleExtension;
