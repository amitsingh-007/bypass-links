import { Box, Switch } from "@material-ui/core";
import PowerOffTwoToneIcon from "@material-ui/icons/PowerOffTwoTone";
import PowerTwoToneIcon from "@material-ui/icons/PowerTwoTone";
import React, { memo, useEffect, useState } from "react";
import { EXTENSION_STATE } from "../constants";
import runtime from "../scripts/chrome/runtime";
import { getOffIconColor, getOnIconColor } from "../utils/color";

const isExtActive = (extState) => extState === EXTENSION_STATE.ACTIVE;

export const ToggleExtension = memo(() => {
  const [extState, setExtState] = useState(EXTENSION_STATE.INACTIVE);

  useEffect(() => {
    runtime.sendMessage({ getExtState: true }).then(({ extState }) => {
      setExtState(extState);
    });
  }, []);

  const handleToggle = () => {
    runtime
      .sendMessage({ toggleExtension: true })
      .then(({ extState: toggledExtState }) => {
        setExtState(toggledExtState);
      });
  };

  const isActive = isExtActive(extState);
  return (
    <Box display="flex" alignItems="center">
      <PowerOffTwoToneIcon htmlColor={getOffIconColor(isActive)} />
      <Switch
        checked={isExtActive(extState)}
        onChange={handleToggle}
        color="primary"
        name="extState"
      />
      <PowerTwoToneIcon htmlColor={getOnIconColor(isActive)} />
    </Box>
  );
});
