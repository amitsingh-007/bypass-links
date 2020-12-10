import { IconButton } from "@material-ui/core";
import HistoryTwoToneIcon from "@material-ui/icons/HistoryTwoTone";
import { showManualHistoryPanel } from "GlobalActionCreators/";
import { COLOR } from "GlobalConstants/color";
import React, { memo } from "react";
import { useDispatch } from "react-redux";

export const ManualHistoryPanelButton = memo(() => {
  const dispatch = useDispatch();

  const handleShowManualHistoryPanel = () => {
    dispatch(showManualHistoryPanel());
  };

  return (
    <IconButton
      aria-label="ManualHistoryPanel"
      component="span"
      style={COLOR.yellow}
      onClick={handleShowManualHistoryPanel}
      title="Manual History Control"
    >
      <HistoryTwoToneIcon fontSize="large" />
    </IconButton>
  );
});
