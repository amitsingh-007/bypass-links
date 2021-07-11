import { IconButton } from "@material-ui/core";
import HistoryTwoToneIcon from "@material-ui/icons/HistoryTwoTone";
import { COLOR } from "GlobalConstants/color";
import { ROUTES } from "GlobalConstants/routes";
import { RootState } from "GlobalReducers/rootReducer";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { memo } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

const HistoryPanelButton = memo(() => {
  const history = useHistory();
  const { isExtensionActive } = useSelector(
    (state: RootState) => state.extension
  );

  const handleShowHistoryPanel = () => {
    history.push(ROUTES.HISTORY_PANEL);
  };

  return (
    <IconButton
      aria-label="HistoryPanel"
      component="span"
      style={getActiveDisabledColor(isExtensionActive, COLOR.orange)}
      onClick={handleShowHistoryPanel}
      title="History Control"
      disabled={!isExtensionActive}
    >
      <HistoryTwoToneIcon fontSize="large" />
    </IconButton>
  );
});

export default HistoryPanelButton;
