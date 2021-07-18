import { IconButton } from "@material-ui/core";
import CollectionsBookmarkTwoToneIcon from "@material-ui/icons/CollectionsBookmarkTwoTone";
import { COLOR } from "GlobalConstants/color";
import { getActiveDisabledColor } from "GlobalUtils/color";
import { getBookmarksPanelUrl } from "SrcPath/BookmarksPanel/utils/url";
import { memo } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { RootState } from "GlobalReducers/rootReducer";

const BookmarksPanelButton = memo(function BookmarksPanelButton() {
  const history = useHistory();
  const { isSignedIn } = useSelector((state: RootState) => state.root);

  const handleShowEditPanel = () => {
    history.push(getBookmarksPanelUrl({}));
  };

  return (
    <IconButton
      aria-label="OpenBookmarsPanel"
      component="span"
      style={getActiveDisabledColor(isSignedIn, COLOR.blue)}
      onClick={handleShowEditPanel}
      disabled={!isSignedIn}
      title={isSignedIn ? "Open Bookmarks Panel" : undefined}
    >
      <CollectionsBookmarkTwoToneIcon fontSize="large" />
    </IconButton>
  );
});

export default BookmarksPanelButton;
