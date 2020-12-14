import { IconButton } from "@material-ui/core";
import TuneTwoToneIcon from "@material-ui/icons/TuneTwoTone";
import { showEditPanel } from "GlobalActionCreators/";
import { COLOR } from "GlobalConstants/color";
import { getActiveDisabledColor } from "GlobalUtils/color";
import React, { memo } from "react";
import { useDispatch, useSelector } from "react-redux";

export const EditPanelButton = memo(() => {
  const dispatch = useDispatch();
  const isSignedIn = useSelector((state) => state.isSignedIn);

  const handleShowEditPanel = () => {
    dispatch(showEditPanel());
  };

  return (
    <IconButton
      aria-label="SignOut"
      component="span"
      style={getActiveDisabledColor(isSignedIn, COLOR.blue)}
      onClick={handleShowEditPanel}
      disabled={!isSignedIn}
      title={isSignedIn ? "Open Redirection Edit Panel" : undefined}
    >
      <TuneTwoToneIcon fontSize="large" />
    </IconButton>
  );
});
