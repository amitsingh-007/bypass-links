import { Box, FormControlLabel } from '@mui/material';
import { StyledSwitch } from '@components/StyledComponents';
import { EXTENSION_STATE } from '@constants/index';
import { getExtensionState } from '@helpers/fetchFromStorage';
import useExtStore from '@store/extension';
import { getIsExtensionActive, setExtStateInStorage } from '@/utils/common';
import { memo, useEffect, useState } from 'react';

const ToggleExtension = memo(function ToggleExtension() {
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
    <FormControlLabel
      control={<StyledSwitch checked={isActive} onChange={handleToggle} />}
      label={<Box sx={{ mr: '3px' }}>Enable</Box>}
      labelPlacement="start"
      sx={{ ml: 0, justifyContent: 'space-between' }}
    />
  );
});

export default ToggleExtension;
