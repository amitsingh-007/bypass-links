import { getIsExtensionActive, setExtStateInStorage } from '@/utils/common';
import { EXTENSION_STATE } from '@constants/index';
import { getExtensionState } from '@helpers/fetchFromStorage';
import { Switch, useMantineTheme } from '@mantine/core';
import useExtStore from '@store/extension';
import { memo, useEffect, useState } from 'react';
import { BsCheckLg, BsXLg } from 'react-icons/bs';

const ToggleExtension = memo(function ToggleExtension() {
  const theme = useMantineTheme();
  const turnOnExtension = useExtStore((state) => state.turnOnExtension);
  const turnOffExtension = useExtStore((state) => state.turnOffExtension);
  const [extState, setExtState] = useState(EXTENSION_STATE.INACTIVE);

  const dispatchActionAndSetState = (
    extState: EXTENSION_STATE,
    isActive: boolean
  ) => {
    setExtState(extState);
    const action = isActive ? turnOnExtension : turnOffExtension;
    action();
  };

  useEffect(() => {
    getExtensionState().then((extState) => {
      const isActive = getIsExtensionActive(extState);
      dispatchActionAndSetState(extState, isActive);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isActive = event.target.checked;
    const extState = isActive
      ? EXTENSION_STATE.ACTIVE
      : EXTENSION_STATE.INACTIVE;
    setExtStateInStorage(extState);
    dispatchActionAndSetState(extState, isActive);
  };

  const isActive = getIsExtensionActive(extState);
  return (
    <Switch
      onLabel="ON"
      offLabel="OFF"
      size="md"
      label="Enable"
      labelPosition="left"
      color="teal"
      checked={isActive}
      onChange={handleToggle}
      thumbIcon={
        isActive ? (
          <BsCheckLg
            size={8}
            color={theme.colors.teal[theme.fn.primaryShade()]}
          />
        ) : (
          <BsXLg size={8} color={theme.colors.red[theme.fn.primaryShade()]} />
        )
      }
    />
  );
});

export default ToggleExtension;
