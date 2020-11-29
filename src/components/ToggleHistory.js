import { Box, Switch } from "@material-ui/core";
import React, { memo, useEffect, useState } from "react";
import runtime from "../scripts/chrome/runtime";
import VisibilityOffTwoToneIcon from "@material-ui/icons/VisibilityOffTwoTone";
import VisibilityTwoToneIcon from "@material-ui/icons/VisibilityTwoTone";

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
    <Box display="flex" alignItems="items">
      <VisibilityOffTwoToneIcon fontSize="large" />
      <Switch
        checked={isHistoryActive}
        onChange={handleToggle}
        color="primary"
        name="historyWatch"
      />
      <VisibilityTwoToneIcon fontSize="large" />
    </Box>
  );
});
