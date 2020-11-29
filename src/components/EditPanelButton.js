import { IconButton } from "@material-ui/core";
import TuneTwoToneIcon from "@material-ui/icons/TuneTwoTone";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { showEditPanel } from "../actionCreator";

export const EditPanelButton = () => {
  const dispatch = useDispatch();
  const isSignedIn = useSelector((state) => state.isSignedIn);

  const handleShowEditPanel = () => {
    dispatch(showEditPanel());
  };

  return (
    <IconButton
      aria-label="SignOut"
      component="span"
      color="primary"
      onClick={handleShowEditPanel}
      disabled={!isSignedIn}
      title={isSignedIn ? "Open Redirection Edit Panel" : undefined}
    >
      <TuneTwoToneIcon fontSize="large" />
    </IconButton>
  );
};
