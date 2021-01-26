import { IconButton } from "@material-ui/core";
import HistoryTwoToneIcon from "@material-ui/icons/HistoryTwoTone";
import { COLOR } from "GlobalConstants/color";
import { ROUTES } from "GlobalConstants/routes";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { memo } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

export const ManualHistoryPanelButton = memo(() => {
  const isExtensionActive = useSelector((state) => state.isExtensionActive);
  const history = useHistory();

  const handleShowManualHistoryPanel = () => {
    history.push(ROUTES.MANUAL_HISTORY_PANEL);
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
