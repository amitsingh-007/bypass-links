import { Box, Switch } from "@material-ui/core";
import React, { memo, useEffect, useState } from "react";
import { EXTENSION_STATE } from "../constants";
import runtime from "../scripts/chrome/runtime";
import PowerTwoToneIcon from "@material-ui/icons/PowerTwoTone";
import PowerOffTwoToneIcon from "@material-ui/icons/PowerOffTwoTone";

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

  return (
    <Box display="flex" alignItems="items">
      <PowerOffTwoToneIcon fontSize="large" />
      <Switch
        checked={isExtActive(extState)}
        onChange={handleToggle}
        color="primary"
        name="extState"
      />
      <PowerTwoToneIcon fontSize="large" />
    </Box>
  );
});
