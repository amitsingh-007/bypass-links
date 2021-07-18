import { IconButton } from "@material-ui/core";
import TagFacesTwoToneIcon from "@material-ui/icons/TagFacesTwoTone";
import { COLOR } from "GlobalConstants/color";
import { ROUTES } from "GlobalConstants/routes";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { memo } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { RootState } from "GlobalReducers/rootReducer";

const PersonsPanelButton = memo(function PersonsPanelButton() {
  const history = useHistory();
  const { isSignedIn } = useSelector((state: RootState) => state.root);

  const handleShowPersonsPanel = () => {
    history.push(ROUTES.PERSONS_PANEL);
  };

  return (
    <IconButton
      aria-label="OpenRedirectionsPanel"
      component="span"
      style={getActiveDisabledColor(isSignedIn, COLOR.indigo)}
      onClick={handleShowPersonsPanel}
      disabled={!isSignedIn}
      title={isSignedIn ? "Open Persons Panel" : undefined}
    >
      <TagFacesTwoToneIcon fontSize="large" />
    </IconButton>
  );
});

export default PersonsPanelButton;
