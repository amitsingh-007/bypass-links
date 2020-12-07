import { Box, Switch } from "@material-ui/core";
import PowerOffTwoToneIcon from "@material-ui/icons/PowerOffTwoTone";
import PowerTwoToneIcon from "@material-ui/icons/PowerTwoTone";
import React, { memo, useEffect, useState } from "react";
import { EXTENSION_STATE } from "../constants";
import { getOffIconColor, getOnIconColor } from "../utils/color";
import {
  getExtensionState,
  isExtensionActive,
  setExtStateInStorage,
} from "../utils/common";

export const ToggleExtension = memo(() => {
  const [extState, setExtState] = useState(EXTENSION_STATE.INACTIVE);

  useEffect(() => {
    getExtensionState().then((extState) => {
      setExtState(extState);
    });
  }, []);

  const handleToggle = () => {
    const newExtensionState = isExtensionActive(extState)
      ? EXTENSION_STATE.INACTIVE
      : EXTENSION_STATE.ACTIVE;
    setExtStateInStorage(newExtensionState);
    setExtState(newExtensionState);
  };

  const isActive = isExtensionActive(extState);
  return (
    <Box display="flex" alignItems="center">
      <PowerOffTwoToneIcon htmlColor={getOffIconColor(isActive)} />
      <Switch
        checked={isExtensionActive(extState)}
        onChange={handleToggle}
        color="primary"
        name="extState"
      />
      <PowerTwoToneIcon htmlColor={getOnIconColor(isActive)} />
    </Box>
  );
});
