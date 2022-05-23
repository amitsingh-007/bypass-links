import { Box, FormControlLabel } from '@mui/material';
import {
  turnOffExtension,
  turnOnExtension,
} from 'GlobalActionCreators/extension';
import { StyledSwitch } from 'GlobalComponents/StyledComponents';
import { EXTENSION_STATE } from 'GlobalConstants';
import { getExtensionState } from 'GlobalHelpers/fetchFromStorage';
import { isExtensionActive, setExtStateInStorage } from 'GlobalUtils/common';
import { memo, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const ToggleExtension = memo(function ToggleExtension() {
  const dispatch = useDispatch();
  const [extState, setExtState] = useState(EXTENSION_STATE.INACTIVE);

  const dispatchActionAndSetState = (
    extState: EXTENSION_STATE,
    isActive: boolean
  ) => {
    setExtState(extState);
    const action = isActive ? turnOnExtension : turnOffExtension;
    dispatch(action());
  };

  useEffect(() => {
    getExtensionState().then((extState) => {
      const isActive = isExtensionActive(extState);
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

  const isActive = isExtensionActive(extState);
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
