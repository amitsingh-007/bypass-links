import { IconButton } from "@material-ui/core";
import TuneTwoToneIcon from "@material-ui/icons/TuneTwoTone";
import { COLOR } from "GlobalConstants/color";
import { ROUTES } from "GlobalConstants/routes";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { memo } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

const ShortcutsPanelButton = memo(() => {
  const isSignedIn = useSelector((state) => state.isSignedIn);
  const history = useHistory();

  const handleShowEditPanel = () => {
    history.push(ROUTES.SHORTCUTS_PANEL);
  };

  return (
    <IconButton
      aria-label="OpenRedirectionsPanel"
      component="span"
      style={getActiveDisabledColor(isSignedIn, COLOR.cyan)}
      onClick={handleShowEditPanel}
      disabled={!isSignedIn}
      title={isSignedIn ? "Open Redirection Edit Panel" : undefined}
    >
      <TuneTwoToneIcon fontSize="large" />
    </IconButton>
  );
});

export default ShortcutsPanelButton;
