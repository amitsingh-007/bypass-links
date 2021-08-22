import { SvgIcon } from "@material-ui/core";
import { ROUTES } from "GlobalConstants/routes";
import { RootState } from "GlobalReducers/rootReducer";
import { memo } from "react";
import { FaUserTag } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import StyledButton from "./StyledButton";

const PersonsPanelButton = memo(function PersonsPanelButton() {
  const history = useHistory();
  const { isSignedIn } = useSelector((state: RootState) => state.root);

  const handleShowPersonsPanel = () => {
    history.push(ROUTES.PERSONS_PANEL);
  };

  return (
    <StyledButton
      showSuccessColor={isSignedIn}
      isDisabled={!isSignedIn}
      onClick={handleShowPersonsPanel}
    >
      <SvgIcon>
        <FaUserTag />
      </SvgIcon>
    </StyledButton>
  );
});

export default PersonsPanelButton;
