import { Box, Switch } from "@material-ui/core";
import VisibilityOffTwoToneIcon from "@material-ui/icons/VisibilityOffTwoTone";
import VisibilityTwoToneIcon from "@material-ui/icons/VisibilityTwoTone";
import React, { memo, useEffect, useState } from "react";
import { COLOR } from "../constants/color";
import runtime from "../scripts/chrome/runtime";
import { getOffIconColor, getOnIconColor } from "../utils/color";

export const ToggleHistory = memo(() => {
  const [isHistoryActive, setIsHistoryActive] = useState(false);

  useEffect(() => {
    runtime
      .sendMessage({ isHistoryActive: true })
      .then(({ isHistoryActive }) => {
        setIsHistoryActive(isHistoryActive);
      });
  }, []);

  const handleToggle = (event) => {
    const isActive = event.target.checked;
    const action = isActive ? "startHistoryWatch" : "endHistoryWatch";
    runtime
      .sendMessage({ [action]: true })
      .then(({ isHistoryActionSuccess }) => {
        if (isHistoryActionSuccess) {
          setIsHistoryActive(isActive);
        }
      });
  };

  return (
    <Box display="flex" alignItems="center">
      <VisibilityOffTwoToneIcon htmlColor={getOffIconColor(isHistoryActive)} />
      <Switch
        checked={isHistoryActive}
        onChange={handleToggle}
        color="primary"
        name="historyWatch"
      />
      <VisibilityTwoToneIcon htmlColor={getOnIconColor(isHistoryActive)} />
    </Box>
  );
});
