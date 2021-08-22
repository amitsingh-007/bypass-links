import TagFacesTwoToneIcon from "@material-ui/icons/TagFacesTwoTone";
import { ROUTES } from "GlobalConstants/routes";
import { RootState } from "GlobalReducers/rootReducer";
import { memo } from "react";
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
      <TagFacesTwoToneIcon />
    </StyledButton>
  );
});

export default PersonsPanelButton;
