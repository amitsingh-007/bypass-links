import { IconButton } from "@material-ui/core";
import HistoryTwoToneIcon from "@material-ui/icons/HistoryTwoTone";
import { showManualHistoryPanel } from "GlobalActionCreators/";
import { COLOR } from "GlobalConstants/color";
import { getActiveDisabledColor } from "GlobalUtils/color";
import React, { memo } from "react";
import { useDispatch, useSelector } from "react-redux";

export const ManualHistoryPanelButton = memo(() => {
  const dispatch = useDispatch();
  const isExtensionActive = useSelector((state) => state.isExtensionActive);

  const handleShowManualHistoryPanel = () => {
    dispatch(showManualHistoryPanel());
  };

  return (
    <IconButton
      aria-label="ManualHistoryPanel"
      component="span"
      style={getActiveDisabledColor(isExtensionActive, COLOR.orange)}
      onClick={handleShowManualHistoryPanel}
      title="Manual History Control"
      disabled={!isExtensionActive}
    >
      <HistoryTwoToneIcon fontSize="large" />
    </IconButton>
  );
});
