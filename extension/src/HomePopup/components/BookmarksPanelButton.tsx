import { SvgIcon } from "@mui/material";
import { RootState } from "GlobalReducers/rootReducer";
import { memo } from "react";
import { RiBookMarkFill } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getBookmarksPanelUrl } from "SrcPath/BookmarksPanel/utils/url";
import StyledButton from "./StyledButton";

const BookmarksPanelButton = memo(function BookmarksPanelButton() {
  const history = useHistory();
  const { isSignedIn } = useSelector((state: RootState) => state.root);

  const handleShowEditPanel = () => {
    history.push(getBookmarksPanelUrl({}));
  };

  return (
    <StyledButton
      showSuccessColor={isSignedIn}
      isDisabled={!isSignedIn}
      onClick={handleShowEditPanel}
    >
      <SvgIcon>
        <RiBookMarkFill />
      </SvgIcon>
    </StyledButton>
  );
});

export default BookmarksPanelButton;
