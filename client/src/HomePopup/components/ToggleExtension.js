import { Box, Switch } from "@material-ui/core";
import PowerOffTwoToneIcon from "@material-ui/icons/PowerOffTwoTone";
import PowerTwoToneIcon from "@material-ui/icons/PowerTwoTone";
import { turnOnExtension } from "GlobalActionCreators/index";
import { turnOffExtension } from "GlobalActionCreators/index";
import { EXTENSION_STATE } from "GlobalConstants/index";
import { getOffIconColor, getOnIconColor } from "GlobalUtils/color";
import {
  getExtensionState,
  isExtensionActive,
  setExtStateInStorage,
} from "GlobalUtils/common";
import { memo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const ToggleExtension = memo(() => {
  const dispatch = useDispatch();
  const [extState, setExtState] = useState(EXTENSION_STATE.INACTIVE);

  const dispatchActionAndSetState = (extState, isActive) => {
    setExtState(extState);
    const action = isActive ? turnOnExtension : turnOffExtension;
    dispatch(action());
  };

  useEffect(() => {
    getExtensionState().then((extState) => {
      const isActive = isExtensionActive(extState);
      dispatchActionAndSetState(extState, isActive);
    });
  }, []);

  const handleToggle = (event) => {
    const isActive = event.target.checked;
    const extState = isActive
      ? EXTENSION_STATE.ACTIVE
      : EXTENSION_STATE.INACTIVE;
    setExtStateInStorage(extState);
    dispatchActionAndSetState(extState, isActive);
  };

  const isActive = isExtensionActive(extState);
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <PowerOffTwoToneIcon htmlColor={getOffIconColor(isActive)} />
      <Switch
        checked={isActive}
        onChange={handleToggle}
        color="primary"
        name="extState"
      />
      <PowerTwoToneIcon htmlColor={getOnIconColor(isActive)} />
    </Box>
  );
});

export default ToggleExtension;
