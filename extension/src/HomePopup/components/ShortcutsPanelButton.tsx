import { IconButton } from "@material-ui/core";
import TuneTwoToneIcon from "@material-ui/icons/TuneTwoTone";
import { COLOR } from "GlobalConstants/color";
import { ROUTES } from "GlobalConstants/routes";
import { RootState } from "GlobalReducers/rootReducer";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { memo } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

const ShortcutsPanelButton = memo(function ShortcutsPanelButton() {
  const { isSignedIn } = useSelector((state: RootState) => state.root);
  const history = useHistory();

  const handleOpenShortcutsPanel = () => {
    history.push(ROUTES.SHORTCUTS_PANEL);
  };

  return (
    <IconButton
      aria-label="OpenShortcutsPanel"
      component="span"
      style={getActiveDisabledColor(isSignedIn, COLOR.cyan)}
      onClick={handleOpenShortcutsPanel}
      disabled={!isSignedIn}
      title={isSignedIn ? "Open Shortcuts Panel" : undefined}
    >
      <TuneTwoToneIcon fontSize="large" />
    </IconButton>
  );
});

export default ShortcutsPanelButton;
