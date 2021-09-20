import { SvgIcon } from "@mui/material";
import { ROUTES } from "GlobalConstants/routes";
import { RootState } from "GlobalReducers/rootReducer";
import { memo } from "react";
import { GoFileSymlinkFile } from "react-icons/go";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import StyledButton from "./StyledButton";

const ShortcutsPanelButton = memo(function ShortcutsPanelButton() {
  const { isSignedIn } = useSelector((state: RootState) => state.root);
  const history = useHistory();

  const handleOpenShortcutsPanel = () => {
    history.push(ROUTES.SHORTCUTS_PANEL);
  };

  return (
    <StyledButton
      showSuccessColor={isSignedIn}
      isDisabled={!isSignedIn}
      onClick={handleOpenShortcutsPanel}
      color="secondary"
    >
      <SvgIcon>
        <GoFileSymlinkFile />
      </SvgIcon>
    </StyledButton>
  );
});

export default ShortcutsPanelButton;
