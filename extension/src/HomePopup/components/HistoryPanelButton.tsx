import { SvgIcon } from "@material-ui/core";
import { ROUTES } from "GlobalConstants/routes";
import { RootState } from "GlobalReducers/rootReducer";
import { memo } from "react";
import { RiHistoryFill } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import StyledButton from "./StyledButton";

const HistoryPanelButton = memo(function HistoryPanelButton() {
  const history = useHistory();
  const { isExtensionActive } = useSelector(
    (state: RootState) => state.extension
  );

  const handleShowHistoryPanel = () => {
    history.push(ROUTES.HISTORY_PANEL);
  };

  return (
    <StyledButton
      showSuccessColor={isExtensionActive}
      isDisabled={!isExtensionActive}
      onClick={handleShowHistoryPanel}
    >
      <SvgIcon>
        <RiHistoryFill />
      </SvgIcon>
    </StyledButton>
  );
});

export default HistoryPanelButton;
