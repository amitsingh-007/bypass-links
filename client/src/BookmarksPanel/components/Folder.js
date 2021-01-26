import { Box, Typography } from "@material-ui/core";
import FolderTwoToneIcon from "@material-ui/icons/FolderTwoTone";
import { displayToast } from "GlobalActionCreators/";
import { COLOR } from "GlobalConstants/color";
import { memo } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { getBookmarksPanelUrl } from "../utils";
import withBookmarkRow from "./withBookmarkRow";

const getTitleStyles = (isEmpty) => ({
  flexGrow: "1",
  marginLeft: "8px",
  color: isEmpty ? COLOR.blueGrey.color : "inherit",
});

const Folder = memo(
  ({ name: origName, pos, handleRemove, renderMenu, isEmpty }) => {
    const dispatch = useDispatch();
    const history = useHistory();

    const handleDeleteOptionClick = () => {
      handleRemove(pos, origName);
    };

    const handleFolderOpen = () => {
      if (isEmpty) {
        dispatch(displayToast({ message: "This folder is empty" }));
        return;
      }
      history.push(getBookmarksPanelUrl({ folder: origName }));
    };

    return (
      <>
        <Box
          onDoubleClick={handleFolderOpen}
          sx={{ display: "flex", alignItems: "center", width: "100%" }}
        >
          <FolderTwoToneIcon fontSize="small" htmlColor={COLOR.yellow.color} />
          <Typography noWrap style={getTitleStyles(isEmpty)}>
            {origName}
          </Typography>
        </Box>
        {renderMenu([{ onClick: handleDeleteOptionClick, text: "Delete" }])}
      </>
    );
  }
);

export default withBookmarkRow(Folder);
