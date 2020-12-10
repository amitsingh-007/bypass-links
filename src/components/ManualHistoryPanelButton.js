import { IconButton } from "@material-ui/core";
import HistoryTwoToneIcon from "@material-ui/icons/HistoryTwoTone";
import React, { memo } from "react";
import { useDispatch } from "react-redux";
import { showManualHistoryPanel } from "../actionCreators";
import { COLOR } from "../constants/color";

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
