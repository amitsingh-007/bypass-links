import { IconButton } from "@material-ui/core";
import TagFacesTwoToneIcon from "@material-ui/icons/TagFacesTwoTone";
import { COLOR } from "GlobalConstants/color";
import { ROUTES } from "GlobalConstants/routes";
import { getActiveDisabledColor } from "GlobalUtils/color";
import React, { memo } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";

const TaggingPanelButton = memo(() => {
  const isSignedIn = useSelector((state) => state.isSignedIn);
  const history = useHistory();

  const handleShowTaggingPanel = () => {
    history.push(ROUTES.TAGGING_PANEL);
  };

  return (
    <IconButton
      aria-label="OpenRedirectionsPanel"
      component="span"
      style={getActiveDisabledColor(isSignedIn, COLOR.indigo)}
      onClick={handleShowTaggingPanel}
      disabled={!isSignedIn}
      title={isSignedIn ? "Open Tagging Panel" : undefined}
    >
      <TagFacesTwoToneIcon fontSize="large" />
    </IconButton>
  );
});

export default TaggingPanelButton;
